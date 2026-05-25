# /generate-tests — Test Generation from Spec

You are generating **executable UI tests** from an approved spec.

These tests are written as Playwright end-to-end tests. They require:
- The Next.js dev server running at `http://localhost:3000` (run `npm run dev`)
- The backend API running at `http://127.0.0.1:8000` (run `uvicorn main:app --port 8000`)

No mocks. No fixtures. The real backend must be running and the real SQL Server data is the test data.

---

## Step 1 — Read the Spec

Read the spec file at `$ARGUMENTS` completely.
Focus on:
- **Section H** — Test Cases (TC-1 through TC-N)
- **Section B** — Problem Statement (to understand what "correct" looks like)
- **Section A** — Metadata (for the spec_id and issue_ref)

---

## Step 2 — Verify Field Paths

Read `utils/api.ts` to confirm that every field path used in the spec's Section H assertions
exists in `AnalysisResponse` (or in the new interfaces defined in Section C if `api_spec_change=true`).

If any field path in Section H does not exist in the TypeScript interfaces, stop and report:
> "Section H TC-<N> references field `<path>` which does not exist in AnalysisResponse. The spec may need correction."

Do not proceed until this is resolved.

---

## Step 3 — Check for Playwright

Check if `@playwright/test` is installed:

```bash
npm list @playwright/test --depth=0
```

If not installed, output:
> "Playwright is not installed. Run `npm install --save-dev @playwright/test` and `npx playwright install chromium` before running the tests."

Then continue generating the test file regardless — the human can install Playwright separately.

---

## Step 4 — Generate the Test File

Create the file `tests/spec_<spec_id>.spec.ts` with this structure:

```typescript
/**
 * UI integration tests for spec: docs/specs/<spec_id>.md
 * Issue: <issue_ref>
 *
 * Run with:
 *   npx playwright test tests/spec_<spec_id>.spec.ts
 *
 * Prerequisites:
 *   - npm run dev            (Terminal 1 — Next.js at http://localhost:3000)
 *   - uvicorn main:app --port 8000  (Terminal 2 — backend API)
 *
 * Note: These tests use real backend data. Do not run against production.
 */
import { test, expect } from '@playwright/test';

const BASE_URL = 'http://localhost:3000';

// ── TC-1 ─────────────────────────────────────────────────────────────────────

test('TC-1: <description from spec>', async ({ page }) => {
  /**
   * TC-1 (from spec Section H)
   * Given: <Given text from spec>
   * When:  form is submitted
   * Then:  <Then text from spec>
   * Covers: <acceptance criterion from spec>
   */
  await page.goto(BASE_URL);

  // Fill the form
  await page.fill('[data-testid="incident-no"]', '<from spec TC-1 Given>');
  await page.fill('[data-testid="short-description"]', '<from spec TC-1 Given>');
  await page.fill('[data-testid="long-description"]', '<from spec TC-1 Given>');
  await page.click('[data-testid="submit-btn"]');

  // Wait for results page
  await page.waitForURL(/\/result/, { timeout: 60_000 });

  // Assert from spec TC-1 Then:
  await expect(page.locator('[data-testid="root-cause-category"]')).toHaveText('<expected from spec>');
});

// ── TC-2 ─────────────────────────────────────────────────────────────────────

// (repeat pattern for each TC-N in spec Section H)
```

Write one `test()` per TC-N from spec Section H. Use the exact field paths and expected
values from the spec — do not invent assertions not in the spec.

**Important selector note:** If the target component does not have `data-testid` attributes,
use the most specific stable selector available (role, aria-label, or text content).
Add a comment noting that `data-testid` attributes should be added to the component for stability.

---

## Step 5 — Manual Test Checklist

After generating the test file, also output a manual test checklist for each TC-N:

```
Manual Test Checklist for spec <spec_id>:

TC-1 — <description>
  [ ] Open http://localhost:3000
  [ ] Fill: incident_no = "<value>", short_description = "<value>", long_description = "<value>"
  [ ] Click Submit
  [ ] Wait for results page to load
  [ ] Verify: <assertion from spec TC-1 Then>

TC-2 — <description>
  [ ] ...
```

---

## Step 6 — Coverage Mapping

After generating the test file and checklist, output a coverage table:

```
Coverage Report:
| Acceptance Criterion (from spec Section B) | Test Function | Covered |
|---------------------------------------------|---------------|---------|
| <criterion 1>                               | TC-1          | Yes     |
| <criterion 2>                               | TC-2          | Yes     |
```

If any acceptance criterion from Section B has no corresponding test, flag it:
> "WARNING: Criterion '<text>' has no test case in spec Section H. Consider updating the spec."

Do not add extra test cases beyond what Section H defines — that is a spec change, not a test generation task.
