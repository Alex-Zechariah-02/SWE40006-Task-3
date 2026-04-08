import type { Page } from "@playwright/test";

export function installPageErrorGuard(page: Page) {
  const pageErrors: Error[] = [];
  page.on("pageerror", (err) => {
    pageErrors.push(err);
  });

  return {
    reset() {
      pageErrors.length = 0;
    },
    assertNoPageErrors() {
      if (pageErrors.length === 0) return;
      const rendered = pageErrors
        .slice(0, 3)
        .map((e) => e.message)
        .join(" | ");
      throw new Error(`Page errors observed: ${rendered}`);
    },
  };
}
