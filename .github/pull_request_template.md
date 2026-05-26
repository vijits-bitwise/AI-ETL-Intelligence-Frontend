# Pull Request — SpecKit Workflow Compliance

## Spec Reference

**This PR implements:** [`docs/specs/<issue-number>-<slug>.md`](<paste-spec-link-here>)

**GitHub Issue:** #<issue-number>

**Branch:** `speckit/<issue-number>-<slug>`

---

## Checklist: Spec Compliance

Before merging, verify this PR:

- [ ] **Spec file exists** — `docs/specs/<N>-<slug>.md` is committed to `main` before this PR
- [ ] **Spec reviewed** — `/review "docs/specs/<N-slug>.md"` passed all sections (A–J)
- [ ] **Files match Section I** — Only files listed in spec's Section I were modified
- [ ] **API contract** — If `api_spec_change=true`, `docs/api-spec.yaml` is updated first
- [ ] **Interfaces synced** — TypeScript interfaces in `utils/api.ts` match `docs/api-spec.yaml`
- [ ] **Components updated** — All components from spec Section E are changed
- [ ] **Pages updated** — All pages from spec Section F are changed
- [ ] **Integration doc updated** — `docs/GITHUB-SPECKIT.md` reflects new component/field mappings (if needed)

---

## Test Coverage

- [ ] All test cases from spec Section H pass (Given/When/Then format)
- [ ] No regressions in other features (tested locally with `npm run dev`)
- [ ] Linting passes (`npm run lint`)

---

## Reviewers

**SpecKit Review:** This PR implements spec #<issue-number>. Reviewers should validate:

1. Code matches the spec exactly (Section I file list, component behavior, page routes)
2. No files outside Section I were modified
3. All acceptance criteria (Section H) are met

**Spec Review (before PR):** Run `/review "docs/specs/<N-slug>.md"` to validate the spec structure before reviewing code.

---

## Description

<!-- Optional: describe what this PR does, how it works, and why -->

---

## Deployment Notes

<!-- Any deployment concerns, breaking changes, or infrastructure updates? -->
