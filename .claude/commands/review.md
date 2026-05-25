# /review — Reviewer Pass (Spec Compliance Validation)

You are the **REVIEWER**. Your job is **spec compliance validation**, not code style review.

Do NOT suggest refactors, renames, or improvements.
Do NOT comment on code style, accessibility, test coverage philosophy, or general best practices.
Only check whether the implementation matches the spec exactly — binary PASS or FAIL per section.

---

## Step 1 — Read the Spec

Read the spec file at `$ARGUMENTS` completely.

---

## Step 2 — Read the Implementation

Run `git diff main HEAD` to see all changes introduced by this branch.
Also read the full current state of every file listed in spec Section I.

---

## Step 3 — Compliance Review

For each non-empty spec section, evaluate and report PASS or FAIL.

---

### Section C — API Contract Change

**Check:** Does `doc/api-spec.yaml` exactly reflect the diff shown in Section C?

- PASS: Every path, field name, type, and required flag in the Section C diff is present in `api-spec.yaml`.
- FAIL: Any field, type, path, or status code described in Section C is absent from or different in `api-spec.yaml`.

**Check:** Does `utils/api.ts` exactly reflect the TypeScript interface diff in Section C?

- PASS: Every interface field added/removed/retyped in Section C is reflected in `utils/api.ts`.
- FAIL: Any TypeScript interface field in Section C diff is missing, extra, or has the wrong type in `utils/api.ts`.

If `api_spec_change = false`: Mark both as PASS (no check needed).

---

### Section D — TypeScript Interface Changes

**Check:** Does `utils/api.ts` reflect every interface change in Section D?

- PASS: Every new field exists with the correct TypeScript type and optional/required flag.
- FAIL: Any field in Section D is missing, has wrong type, or wrong optional flag.

If Section D says "No TypeScript interface changes": Mark as PASS.

---

### Section E — Component Specification

For each component described in Section E:

**Rendering scope:**
- PASS: The component accesses exactly the fields listed in "Fields rendered" — no more, no fewer.
- FAIL: Any extra field accessed that is not in Section E, or any listed field not accessed.

**Fallback behaviour:**
- PASS: Undefined or empty fields are handled without throwing a runtime error.
- FAIL: A field access with no null/undefined guard that Section E marks as having fallback behaviour.

**Conditional logic:**
- PASS: The conditional rendering uses exactly the condition described in Section E.
- FAIL: The condition differs in any way from what Section E specifies.

**New component (if added):**
- PASS: File exists at the path specified in Section E AND it is imported in the parent specified in Section E.
- FAIL: Either the file is missing or the import is absent from the parent.

---

### Section F — Page / Route Changes

For each page described in Section F:

**localStorage key:**
- PASS: The exact key string from Section F is used in both the write and read sides.
- FAIL: Key string differs, or only one side was updated.

**Navigation:**
- PASS: The `router.push()` or `<Link>` call matches the route or query params from Section F.
- FAIL: Any deviation from the specified route or params.

If Section F says "No page or route changes": Mark as PASS.

---

### Section I — File Scope

**Check:** Does the git diff touch only files listed in Section I?

- PASS: Every changed file appears in Section I. No file outside Section I was modified.
- FAIL: Any file in the diff that is NOT in Section I.

Note: `doc/GITHUB-SPECKIT.md` should always be in Section I when the component list or data flow changes. Flag if it was modified without being in Section I, or needed but absent from Section I.

---

## Step 4 — Output Review Report

Print the following report:

```
REVIEW RESULT: PASS / FAIL
Spec: <spec_id>
Branch diff: git diff main HEAD

Per-Section Compliance:
| Section | Result | Notes |
|---------|--------|-------|
| C — API Contract Change      | PASS/FAIL | <specific field or type if FAIL> |
| D — TypeScript Interfaces    | PASS/FAIL | <specific interface field if FAIL> |
| E — Component Specification  | PASS/FAIL | <specific component and violation if FAIL> |
| F — Page / Route Changes     | PASS/FAIL | <key name or route if FAIL> |
| I — File Scope               | PASS/FAIL | <extra file name if FAIL> |

Overall: PASS (all sections pass) / FAIL (<N> section(s) failing)
```

If any section is FAIL:
- State the exact line, field, or function name that fails.
- State exactly what the spec requires in that location.
- Do NOT suggest a fix — point the human to the spec section and let `/implement` handle the correction.
