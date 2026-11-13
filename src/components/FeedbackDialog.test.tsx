import {
	fireEvent,
	render as rtlRender,
	screen,
	waitFor,
} from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import {
	METIS_GITHUB_CONTRIBUTING_URL,
	METIS_GITHUB_ISSUES_URL,
	METIS_GITHUB_PULL_REQUESTS_URL,
	METIS_PRODUCT_BOARD_URL,
} from "../constants/feedback";
import {
	APP_COMMAND_EVENT_NAME,
	APP_COMMAND_IDS,
} from "../hooks/appCommandDispatcher";
import { rememberFeedbackDialogOpener } from "../lib/feedbackDialogOpener";
import { FeedbackDialog } from "./FeedbackDialog";
import { TooltipProvider } from "./ui/tooltip";

const { trackEvent } = vi.hoisted(() => ({
	trackEvent: vi.fn(),
}));

vi.mock("../lib/telemetry", () => ({
	trackEvent,
}));

vi.mock("../utils/url", () => ({
	openExternalUrl: vi.fn().mockResolvedValue(undefined),
}));

const { openExternalUrl } = (await import(
	"../utils/url"
)) as typeof import("../utils/url") & {
	openExternalUrl: ReturnType<typeof vi.fn>;
};

function render(ui: Parameters<typeof rtlRender>[0]) {
	return rtlRender(ui, { wrapper: TooltipProvider });
}

const CONTRIBUTION_BUTTON_ACTIONS = [
 { buttonLabel: "Open Product Board", action: "feature_requests", url: METIS_PRODUCT_BOARD_URL },
 { buttonLabel: "Open PRs", action: "pull_requests", url: METIS_GITHUB_PULL_REQUESTS_URL },
 { buttonLabel: "Open Guide", action: "contributing_guide", url: METIS_GITHUB_CONTRIBUTING_URL },
 { buttonLabel: "Open Issues", action: "issues", url: METIS_GITHUB_ISSUES_URL },
] as const;

function clickContributionActions() {
	for (const { buttonLabel } of CONTRIBUTION_BUTTON_ACTIONS) {
		fireEvent.click(screen.getByRole("button", { name: buttonLabel }));
	}
}

function expectContributionActionsTracked() {
	for (const [
		index,
		{ action, url },
	] of CONTRIBUTION_BUTTON_ACTIONS.entries()) {
		expect(trackEvent).toHaveBeenNthCalledWith(
			index + 1,
			"contribution_action_clicked",
			{ action, surface: "contribute_dialog", url },
		);
	}
}

function expectContributionUrlsOpened() {
	for (const [index, { url }] of CONTRIBUTION_BUTTON_ACTIONS.entries()) {
		expect(openExternalUrl).toHaveBeenNthCalledWith(index + 1, url);
	}
}

describe("FeedbackDialog", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		Object.defineProperty(window.navigator, "clipboard", {
			configurable: true,
			value: {
				writeText: vi.fn().mockResolvedValue(undefined),
			},
		});
	});

	it("renders only the fork's contribution paths", () => {
    render(<FeedbackDialog open onClose={vi.fn()} buildNumber="b281" releaseChannel="alpha" />);
    expect(screen.getByText("Contribute to Métis")).toBeInTheDocument();
    expect(screen.getByText("Feature requests")).toBeInTheDocument();
    expect(screen.getByText("Contribute code")).toBeInTheDocument();
    expect(screen.getByText("Report a bug")).toBeInTheDocument();
    expect(screen.queryByText("Sponsors")).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /newsletter/i })).not.toBeInTheDocument();
  });

	it("localizes the contribution dialog", () => {
		render(
			<FeedbackDialog
				open={true}
				onClose={vi.fn()}
				buildNumber="b281"
				locale="zh-CN"
				releaseChannel="alpha"
			/>,
		);

		expect(screen.getByText("参与 Métis 贡献")).toBeInTheDocument();
		expect(screen.getByText("功能请求")).toBeInTheDocument();
		expect(
			screen.getByRole("button", { name: "打开产品看板" }),
		).toBeInTheDocument();
		expect(
			screen.getByRole("button", { name: "复制诊断" }),
		).toBeInTheDocument();
		expect(screen.queryByText("Contribute to Métis")).not.toBeInTheDocument();
		expect(screen.queryByText("Feature requests")).not.toBeInTheDocument();
	});

	it("focuses the primary CTA when opened", async () => {
		render(
			<FeedbackDialog
				open={true}
				onClose={vi.fn()}
				buildNumber="b281"
				releaseChannel={null}
			/>,
		);
		const cta = screen.getByRole("button", { name: "Open Product Board" });
		await waitFor(() => expect(cta).toHaveFocus());
	});

	it("opens the expected contribution links without closing the modal", async () => {
		const onClose = vi.fn();
		render(
			<FeedbackDialog
				open={true}
				onClose={onClose}
				buildNumber="b281"
				releaseChannel={null}
			/>,
		);

		clickContributionActions();
		expectContributionActionsTracked();
		await waitFor(() =>
			expect(openExternalUrl).toHaveBeenCalledTimes(
				CONTRIBUTION_BUTTON_ACTIONS.length,
			),
		);
		expectContributionUrlsOpened();
		expect(onClose).not.toHaveBeenCalled();
		expect(screen.getByTestId("feedback-dialog")).toBeInTheDocument();
	});

	it("copies a sanitized diagnostic bundle", async () => {
		const writeText = vi.fn().mockResolvedValue(undefined);
		Object.defineProperty(window.navigator, "clipboard", {
			configurable: true,
			value: { writeText },
		});

		render(
			<FeedbackDialog
				open={true}
				onClose={vi.fn()}
				buildNumber="b281"
				releaseChannel="alpha"
			/>,
		);

		fireEvent.click(screen.getByRole("button", { name: "Copy Diagnostics" }));

		expect(trackEvent).toHaveBeenCalledWith("contribution_action_clicked", {
			action: "copy_diagnostics",
			surface: "contribute_dialog",
		});
		await waitFor(() => expect(writeText).toHaveBeenCalledTimes(1));
		expect(writeText.mock.calls[0]?.[0]).toContain(
			"Métis sanitized diagnostics",
		);
		expect(writeText.mock.calls[0]?.[0]).toContain("Build: b281");
		expect(writeText.mock.calls[0]?.[0]).toContain("Release channel: alpha");
		expect(screen.getByText("Diagnostics copied.")).toBeInTheDocument();
	});

	it("shows a fallback message when a contribution link cannot be opened", async () => {
		openExternalUrl.mockRejectedValueOnce(new Error("blocked"));

		render(
			<FeedbackDialog
				open={true}
				onClose={vi.fn()}
				buildNumber="b281"
				releaseChannel={null}
			/>,
		);
		fireEvent.click(screen.getByRole("button", { name: "Open Product Board" }));

		expect(
			await screen.findByText(/couldn’t open Product Board automatically/i),
		).toBeInTheDocument();
		expect(screen.getByText(METIS_PRODUCT_BOARD_URL)).toBeInTheDocument();
	});

	it("closes with Escape and the top-right Close control", () => {
		const onClose = vi.fn();
		render(
			<FeedbackDialog
				open={true}
				onClose={onClose}
				buildNumber="b281"
				releaseChannel={null}
			/>,
		);
		fireEvent.keyDown(document, { key: "Escape" });
		expect(onClose).toHaveBeenCalledOnce();
		onClose.mockClear();
		fireEvent.click(screen.getByRole("button", { name: "Close" }));
		expect(onClose).toHaveBeenCalledOnce();
	});

	it("reopens the command palette after closing when launched from it", () => {
		vi.useFakeTimers();

		const opener = document.createElement("input");
		opener.setAttribute("placeholder", "Type a command...");
		document.body.appendChild(opener);
		rememberFeedbackDialogOpener(opener);

		const onClose = vi.fn();
		const handleReopen = vi.fn();
		window.addEventListener(APP_COMMAND_EVENT_NAME, handleReopen);

		const { rerender } = render(
			<FeedbackDialog
				open={false}
				onClose={onClose}
				buildNumber="b281"
				releaseChannel={null}
			/>,
		);

		rerender(
			<FeedbackDialog
				open={true}
				onClose={onClose}
				buildNumber="b281"
				releaseChannel={null}
			/>,
		);
		fireEvent.click(screen.getByRole("button", { name: "Close" }));
		vi.advanceTimersByTime(100);

		expect(onClose).toHaveBeenCalledOnce();
		expect(handleReopen).toHaveBeenCalledTimes(1);
		expect(handleReopen.mock.calls[0]?.[0]).toMatchObject({
			detail: APP_COMMAND_IDS.viewCommandPalette,
		});

		window.removeEventListener(APP_COMMAND_EVENT_NAME, handleReopen);
		opener.remove();
		vi.useRealTimers();
	});
});
