import { test, expect } from "@playwright/test";
import { loginAsE2E } from "./helpers/auth";

test("dialogs: tall modals stay inside viewport and remain usable", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 700 });
  await loginAsE2E(page, { nextPath: "/app/opportunities" });

  await expect(page.getByRole("heading", { name: "Opportunities" })).toBeVisible();
  const trigger = page.getByRole("button", { name: "New Opportunity" });
  await expect(trigger).toBeVisible();
  await trigger.click();

  const dialog = page.getByRole("dialog", { name: "New Opportunity" });
  await expect(dialog).toBeVisible();

  // The dialog should be constrained to the viewport (scroll inside, not off-screen).
  const box = await dialog.boundingBox();
  expect(box).not.toBeNull();
  if (!box) return;

  expect(box.y).toBeGreaterThanOrEqual(0);
  expect(box.y + box.height).toBeLessThanOrEqual(700.5);

  const createButton = dialog.getByRole("button", { name: "Create Opportunity" });
  await expect(createButton).toBeVisible();

  // Even on small viewports, the primary action should be reachable by scrolling.
  await createButton.scrollIntoViewIfNeeded();
  await expect(createButton).toBeInViewport();
});
