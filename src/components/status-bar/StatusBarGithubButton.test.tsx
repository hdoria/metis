import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { METIS_GITHUB_URL } from "../../constants/feedback";
import { StatusBar } from "../StatusBar";

const { openExternalUrl, trackEvent } = vi.hoisted(() => ({
	openExternalUrl: vi.fn(),
	trackEvent: vi.fn(),
}));

vi.mock("../../utils/url", () => ({ openExternalUrl }));
vi.mock("../../lib/telemetry", () => ({ trackEvent }));

describe("StatusBar GitHub button", () => {
	beforeEach(() => {
		openExternalUrl.mockClear();
		trackEvent.mockClear();
	});

	it("renders an accessible button with a tooltip and opens the shared GitHub invite", async () => {
		render(
			<StatusBar
				noteCount={0}
				vaultPath="/tmp/vault"
				vaults={[]}
				onSwitchVault={vi.fn()}
			/>,
		);

		const button = screen.getByRole("button", {
			name: "GitHub",
		});
		expect(button).toBeInTheDocument();
		fireEvent.focus(button);
		expect(await screen.findByRole("tooltip")).toHaveTextContent(
			"GitHub",
		);

		fireEvent.click(button);

		expect(openExternalUrl).toHaveBeenCalledWith(METIS_GITHUB_URL);
		expect(trackEvent).toHaveBeenCalledWith("contribution_action_clicked", {
			action: "github",
			surface: "status_bar",
		});
	});
});
