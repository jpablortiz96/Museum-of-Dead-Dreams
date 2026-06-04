import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const appRoot = path.resolve(__dirname, "..");
const repoRoot = path.resolve(appRoot, "..");
const screenshotDir = path.join(repoRoot, "assets", "readme", "screenshots");

const baseUrl = process.env.MODD_SCREENSHOT_BASE_URL ?? "http://localhost:3000";
const githubUsername = process.env.MODD_SCREENSHOT_USER ?? process.argv[2] ?? "jpablortiz96";

async function ensureDir(directoryPath) {
  await fs.mkdir(directoryPath, { recursive: true });
}

async function waitForStableUi(page, delayMs = 1200) {
  await page.waitForTimeout(delayMs);
}

async function waitForCuratorAnswer(page) {
  const answerSignals = [
    page.getByText("Evidence Used"),
    page.getByText("Copilot Curator", { exact: true }),
    page.getByText("Fallback"),
  ];

  await Promise.race(
    answerSignals.map((locator) =>
      locator.waitFor({
        state: "visible",
        timeout: 20000,
      })
    )
  ).catch(() => undefined);

  await page.waitForTimeout(1500);
}

async function waitForRevivalPlan(page) {
  const dialog = page.locator('[role="dialog"]');
  await dialog.waitFor({ state: "visible", timeout: 10000 });

  await Promise.race([
    dialog.getByText("Resurrection Score").waitFor({ state: "visible", timeout: 20000 }),
    dialog.getByText("The Autopsy").waitFor({ state: "visible", timeout: 20000 }),
    dialog.getByText("Template Fallback").waitFor({ state: "visible", timeout: 20000 }),
  ]).catch(() => undefined);

  await page.waitForTimeout(1200);
  return dialog;
}

async function main() {
  await ensureDir(screenshotDir);

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1600, height: 1180 },
    colorScheme: "dark",
    deviceScaleFactor: 1.5,
  });
  const page = await context.newPage();

  try {
    await page.goto(baseUrl, { waitUntil: "networkidle", timeout: 30000 });
    await waitForStableUi(page, 2500);

    await page.screenshot({
      path: path.join(screenshotDir, "01-welcome-screen.png"),
      fullPage: false,
    });

    await page.getByPlaceholder("github username").fill(githubUsername);
    await page.getByRole("button", { name: "Enter Museum" }).click();

    await page.getByText(`Excavating ${githubUsername}'s repos`).waitFor({
      state: "visible",
      timeout: 15000,
    });
    await waitForStableUi(page, 1200);

    await page.screenshot({
      path: path.join(screenshotDir, "02-loading-graveyard.png"),
      fullPage: false,
    });

    await page.getByText("Share My Graveyard").waitFor({
      state: "visible",
      timeout: 40000,
    });
    await waitForStableUi(page, 4600);

    await page.screenshot({
      path: path.join(screenshotDir, "03-museum-hall.png"),
      fullPage: false,
    });

    await page.locator("button", { hasText: "Enter Exhibit" }).first().click();
    await page.getByText("The Story").waitFor({ state: "visible", timeout: 15000 });
    await waitForStableUi(page, 1600);

    await page.screenshot({
      path: path.join(screenshotDir, "04-exhibit-room.png"),
      fullPage: false,
    });

    const copilotPanel = page.locator(".copilot-panel").first();
    await copilotPanel.scrollIntoViewIfNeeded();
    await page.getByText("Ask Copilot about this project").click();
    await page.getByRole("button", { name: "Why did this project probably die?" }).click();
    await waitForCuratorAnswer(page);

    await copilotPanel.screenshot({
      path: path.join(screenshotDir, "05-copilot-curator.png"),
    });

    await page.locator("button", { hasText: "View Revival Plan" }).click();
    const revivalDialog = await waitForRevivalPlan(page);

    await revivalDialog.screenshot({
      path: path.join(screenshotDir, "06-revival-plan.png"),
    });

    await revivalDialog.getByRole("button", { name: "Commit To Resurrection Bay" }).click();
    await page.waitForTimeout(1000);
    await page.keyboard.press("Escape");

    await page.getByRole("button", { name: "Return to the Hall" }).click();
    await page.getByText("Share My Graveyard").waitFor({
      state: "visible",
      timeout: 15000,
    });
    await waitForStableUi(page, 1200);

    await page.getByRole("button", { name: "Enter Resurrection Bay" }).click();
    await page.getByText("Through the Gates of Rebirth").waitFor({
      state: "visible",
      timeout: 15000,
    });
    await page.evaluate(() => window.scrollTo(0, 0));
    await waitForStableUi(page, 5200);

    await page.screenshot({
      path: path.join(screenshotDir, "07-resurrection-bay.png"),
      fullPage: false,
    });
  } finally {
    await context.close();
    await browser.close();
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
