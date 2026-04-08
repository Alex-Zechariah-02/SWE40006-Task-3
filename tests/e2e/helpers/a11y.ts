import type { Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

export async function expectNoA11yViolations(page: Page, opts?: { include?: string[]; exclude?: string[] }) {
  let builder = new AxeBuilder({ page })
    // keep this actionable and low-noise for the course submission scope
    .disableRules([
      "color-contrast",
      "landmark-one-main",
      "page-has-heading-one",
    ]);

  for (const selector of opts?.include ?? []) {
    builder = builder.include(selector);
  }
  for (const selector of opts?.exclude ?? []) {
    builder = builder.exclude(selector);
  }

  const results = await builder.analyze();
  if (results.violations.length > 0) {
    const top = results.violations[0];
    const nodes = top?.nodes?.slice(0, 3).map((n) => n.target?.join(",")).join(" | ");
    throw new Error(`A11y violations: count=${results.violations.length} top=${top.id} nodes=${nodes ?? ""}`);
  }
}

