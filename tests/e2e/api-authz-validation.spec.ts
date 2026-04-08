import { test, expect } from "@playwright/test";
import { loginAsE2E } from "./helpers/auth";

test("api authz: private endpoints reject signed-out requests", async ({
  request,
}) => {
  const privateWrites: Array<Promise<unknown>> = [];

  privateWrites.push(
    (async () => {
      const res = await request.post("/api/opportunities", { data: {} });
      expect(res.status()).toBe(401);
    })()
  );

  privateWrites.push(
    (async () => {
      const res = await request.post("/api/applications", { data: {} });
      expect(res.status()).toBe(401);
    })()
  );

  privateWrites.push(
    (async () => {
      const res = await request.post("/api/companies", { data: {} });
      expect(res.status()).toBe(401);
    })()
  );

  privateWrites.push(
    (async () => {
      const res = await request.post("/api/contacts", { data: {} });
      expect(res.status()).toBe(401);
    })()
  );

  privateWrites.push(
    (async () => {
      const res = await request.post("/api/actions", { data: {} });
      expect(res.status()).toBe(401);
    })()
  );

  privateWrites.push(
    (async () => {
      const res = await request.post("/api/interviews", { data: {} });
      expect(res.status()).toBe(401);
    })()
  );

  privateWrites.push(
    (async () => {
      const res = await request.post("/api/applications/does-not-exist/offer", {
        data: {},
      });
      expect(res.status()).toBe(401);
    })()
  );

  privateWrites.push(
    (async () => {
      const res = await request.post(
        "/api/applications/does-not-exist/rejection",
        { data: {} }
      );
      expect(res.status()).toBe(401);
    })()
  );

  await Promise.all(privateWrites);
});

test("api validation: signed-in endpoints return 400 field errors on bad input", async ({
  page,
}) => {
  await loginAsE2E(page, { nextPath: "/app" });

  // Public search is public, but should still validate its input.
  const searchInvalid = await page.request.post("/api/search/opportunities", {
    data: { query: "hi" },
  });
  expect(searchInvalid.status()).toBe(400);

  const companyInvalid = await page.request.post("/api/companies", {
    data: { name: "", website: "not-a-url" },
  });
  expect(companyInvalid.status()).toBe(400);
  const companyJson = (await companyInvalid.json()) as {
    error?: { fields?: unknown };
  };
  expect(typeof companyJson.error?.fields).toBe("object");

  const contactInvalid = await page.request.post("/api/contacts", {
    data: { companyId: "", name: "", email: "not-an-email" },
  });
  expect(contactInvalid.status()).toBe(400);

  const actionInvalid = await page.request.post("/api/actions", {
    data: { title: "", priority: "High", status: "Open" },
  });
  expect(actionInvalid.status()).toBe(400);

  const interviewInvalid = await page.request.post("/api/interviews", {
    data: { applicationId: "", interviewType: "TechnicalInterview", status: "" },
  });
  expect(interviewInvalid.status()).toBe(400);

  const convertInvalid = await page.request.post("/api/applications", {
    data: { opportunityId: "", priority: "Medium" },
  });
  expect(convertInvalid.status()).toBe(400);
});
