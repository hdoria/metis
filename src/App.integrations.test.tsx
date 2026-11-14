import "./App.testUtils";
import { act, fireEvent, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import App from "./App";
import {
	AI_AGENTS_ONBOARDING_DISMISSED_STORAGE_NAME,
	CLAUDE_CODE_ONBOARDING_DISMISSED_STORAGE_NAME,
	createMockUpdaterResult,
	createSettings,
	mockCommandResults,
	render,
	SLOW_APP_READY_TIMEOUT_MS,
} from "./App.testUtils";
import { useUpdater } from "./hooks/useUpdater";
import type { Settings } from "./types";
import { streamAiAgent } from "./utils/streamAiAgent";

describe("App.integrations", () => {
	it("explains unavailable updates from the build label outside the desktop runtime", async () => {
        const checkForUpdates = vi.fn(async () => ({ kind: "up-to-date" as const }));
        vi.mocked(useUpdater).mockReturnValue(createMockUpdaterResult(checkForUpdates));
        render(<App />);
        await screen.findByText("All Notes");
        fireEvent.click(screen.getByTestId("status-build-number"));
        expect(await screen.findByText("Automatic updates are not configured for this build.")).toBeInTheDocument();
        expect(checkForUpdates).not.toHaveBeenCalled();
        expect(screen.queryByTestId("update-banner")).not.toBeInTheDocument();
    });

    it("explains unavailable updates without checking a service from menu commands", async () => {
        const checkForUpdates = vi.fn(async () => ({ kind: "up-to-date" as const }));
        vi.mocked(useUpdater).mockReturnValue(createMockUpdaterResult(checkForUpdates));
        render(<App />);
        await screen.findByText("All Notes");
        act(() => window.__metislegacyTest?.dispatchBrowserMenuCommand?.("app-check-for-updates"));
        expect(await screen.findByText("Automatic updates are not configured for this build.")).toBeInTheDocument();
        expect(checkForUpdates).not.toHaveBeenCalled();
    });

	it("shows the external AI setup dialog from the menu when AI onboarding is active", async () => {
		localStorage.removeItem(AI_AGENTS_ONBOARDING_DISMISSED_STORAGE_NAME);
		localStorage.removeItem(CLAUDE_CODE_ONBOARDING_DISMISSED_STORAGE_NAME);
		mockCommandResults.get_ai_agents_status = {
			claude_code: { installed: true, version: "2.1.90" },
			codex: { installed: true, version: "0.122.0-alpha.1" },
			opencode: { installed: false, version: null },
			pi: { installed: false, version: null },
			antigravity: { installed: false, version: null },
		};
		mockCommandResults.check_mcp_status = "installed";

		render(<App />);

		await waitFor(
			() => {
				expect(screen.getByText("AI is ready")).toBeInTheDocument();
			},
			{ timeout: SLOW_APP_READY_TIMEOUT_MS },
		);

		await waitFor(() => {
			expect(typeof window.__metislegacyTest?.dispatchBrowserMenuCommand).toBe(
				"function",
			);
		});

		act(() => {
			window.__metislegacyTest?.dispatchBrowserMenuCommand?.("vault-install-mcp");
		});

		await waitFor(() => {
			expect(screen.getByText("Manage External AI Tools")).toBeInTheDocument();
		});
		expect(screen.getByTestId("mcp-setup-dialog")).toBeInTheDocument();
		expect(screen.queryByText("AI is ready")).not.toBeInTheDocument();
	});

	it("routes right-panel AI chat messages to the selected default agent", async () => {
		mockCommandResults.get_settings = createSettings({
			auto_advance_inbox_after_organize: null,
			default_ai_agent: "codex",
		});
		mockCommandResults.get_ai_agents_status = {
			claude_code: { installed: true, version: "2.1.90" },
			codex: { installed: true, version: "0.122.0-alpha.1" },
			opencode: { installed: false, version: null },
			pi: { installed: false, version: null },
			antigravity: { installed: false, version: null },
		};

		render(<App />);

		await screen.findByText("All Notes");
		fireEvent.keyDown(window, {
			key: "l",
			code: "KeyL",
			metaKey: true,
			shiftKey: true,
		});

		const input = await screen.findByTestId("agent-input");
		await waitFor(() => {
			expect(input).toHaveAttribute("aria-placeholder", "Ask Codex");
		});

		input.textContent = "Summarize the active vault";
		fireEvent.input(input);
		fireEvent.click(screen.getByTestId("agent-send"));

		await waitFor(() => {
			expect(streamAiAgent).toHaveBeenCalledWith(
				expect.objectContaining({
					agent: "codex",
				}),
			);
		});
	});

	it("waits for saved AI agent settings before sending right-panel messages", async () => {
		let resolveSettings: ((settings: Settings) => void) | null = null;
		mockCommandResults.get_settings = () =>
			new Promise((resolve) => {
				resolveSettings = resolve;
			});
		mockCommandResults.get_ai_agents_status = {
			claude_code: { installed: true, version: "2.1.90" },
			codex: { installed: true, version: "0.122.0-alpha.1" },
			opencode: { installed: false, version: null },
			pi: { installed: false, version: null },
			antigravity: { installed: false, version: null },
		};

		render(<App />);

		await screen.findByText("All Notes");
		fireEvent.keyDown(window, {
			key: "l",
			code: "KeyL",
			metaKey: true,
			shiftKey: true,
		});

		const input = await screen.findByTestId("agent-input");
		fireEvent.click(screen.getByTestId("agent-send"));

		await act(async () => {
			await Promise.resolve();
		});
		expect(streamAiAgent).not.toHaveBeenCalled();

		await act(async () => {
			resolveSettings?.(
				createSettings({
					auto_advance_inbox_after_organize: null,
					default_ai_agent: "codex",
				}),
			);
		});

		await waitFor(() => {
			expect(input).toHaveAttribute("aria-placeholder", "Ask Codex");
		});

		input.textContent = "Summarize the active vault";
		fireEvent.input(input);
		fireEvent.click(screen.getByTestId("agent-send"));

		await waitFor(() => {
			expect(streamAiAgent).toHaveBeenCalledWith(
				expect.objectContaining({
					agent: "codex",
				}),
			);
		});
	});
});
