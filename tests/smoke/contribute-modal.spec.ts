import { expect, type Page, test } from "@playwright/test";
import { executeCommand, openCommandPalette } from "./helpers";

interface ContributionAction {
	activation: "Enter" | "Space";
	label: string;
	url: string;
}

const CONTRIBUTION_ACTIONS: ContributionAction[] = [
  { activation: "Enter", label: "Open Product Board", url: "https://github.com/hdoria/metis/issues" },
  { activation: "Enter", label: "Open PRs", url: "https://github.com/hdoria/metis/pulls" },
  { activation: "Space", label: "Open Guide", url: "https://github.com/hdoria/metis/blob/main/CONTRIBUTING.md" },
  { activation: "Enter", label: "Open Issues", url: "https://github.com/hdoria/metis/issues" },
];

async function expectOpenedUrl(page: Page, url: string): Promise<void> {
	await expect
		.poll(async () =>
			page.evaluate(
				() =>
					(window as typeof window & { __metisOpenedUrls: string[] })
						.__metisOpenedUrls,
			),
		)
		.toContain(url);
}

test.describe("Contribute modal", () => {
	test.beforeEach(async ({ page }) => {
		await page.addInitScript(() => {
			const openedUrls: string[] = [];
			Object.defineProperty(window, "__metisOpenedUrls", {
				configurable: true,
				value: openedUrls,
			});
			window.open = ((url?: string | URL | undefined) => {
				openedUrls.push(String(url ?? ""));
				return null;
			}) as typeof window.open;

			const copiedBundles: string[] = [];
			Object.defineProperty(window, "__metisCopiedBundles", {
				configurable: true,
				value: copiedBundles,
			});
			Object.defineProperty(navigator, "clipboard", {
				configurable: true,
				value: {
					writeText: async (text: string) => {
						copiedBundles.push(text);
					},
				},
			});
		});

		await page.goto("/", { waitUntil: "domcontentloaded" });
		await expect(page.locator('[data-testid="sidebar-top-nav"]')).toBeVisible({
			timeout: 10_000,
		});
	});

	test("Cmd+K opens Contribute, keyboard actions work, and Escape restores the opener @smoke", async ({
		page,
	}) => {
		await openCommandPalette(page);
		await executeCommand(page, "Contribute");

		await expect(page.getByTestId("feedback-dialog")).toBeVisible();
		await expect(
			page.getByRole("heading", { name: "Contribute to Métis" }),
		).toBeVisible();
		await expect(
			page.getByRole("button", { name: "Open Product Board" }),
		).toBeFocused();

		for (const [index, action] of CONTRIBUTION_ACTIONS.entries()) {
			if (index > 0) await page.keyboard.press("Tab");
			await expect(
				page.getByRole("button", { name: action.label }),
			).toBeFocused();
			await page.keyboard.press(action.activation);
			await expectOpenedUrl(page, action.url);
		}

		await page.keyboard.press("Tab");
		await expect(
			page.getByRole("button", { name: "Copy Diagnostics" }),
		).toBeFocused();
		await page.keyboard.press("Space");
		await expect
			.poll(async () =>
				page.evaluate(
					() =>
						(window as typeof window & { __metisCopiedBundles: string[] })
							.__metisCopiedBundles.length,
				),
			)
			.toBe(1);

		await page.keyboard.press("Escape");
		await expect(page.getByTestId("feedback-dialog")).not.toBeVisible();
		await expect(
			page.locator('input[placeholder="Type a command..."]'),
		).toBeVisible();
		await expect(
			page.locator('input[placeholder="Type a command..."]'),
		).toBeFocused();
	});
});
