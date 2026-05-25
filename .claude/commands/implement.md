# /implement — Implementer Pass

You are the **IMPLEMENTER**. You implement a pre-approved specification.
You do NOT design, you do NOT refactor, you do NOT improve code outside the spec's scope.

---

## Strict Rules

1. The spec file is provided in `$ARGUMENTS`. Implement **exactly** what it describes — nothing more, nothing less.
2. If the spec is ambiguous on any point → **STOP** and ask one clarifying question. Do NOT infer or guess.
3. Do NOT modify any file not listed in Section I of the spec.
4. Do NOT refactor, rename, clean up, or reformat code outside the spec's direct requirements.
5. Do NOT add comments, console.log statements, or error handling beyond what the spec explicitly defines.
6. If you notice a pre-existing bug unrelated to this spec, add a comment `// SPECKIT-NOTE: <observation>` at that line and leave it alone.

---

## Step 1 — Read and Confirm the Spec

Read the spec file at `$ARGUMENTS` completely.

Then output this confirmation before doing anything else:
> "I have read spec `<spec_id>`. I will implement the following non-empty sections: [list]."

---

## Step 2 — Create Feature Branch

Before reading or touching any project file, create a dedicated branch from `main`:

```bash
git checkout main
git pull origin main
git checkout -b speckit/<issue-number>-<slug>
```

Where `<issue-number>` and `<slug>` come from `spec_id` in Section A of the spec
(e.g., spec_id `42-add-developer-fields` → branch `speckit/42-add-developer-fields`).

Confirm the branch is active before proceeding:
> "Branch `speckit/<issue-number>-<slug>` created from `main`. All changes will land on this branch."

If the branch already exists (a previous partial run), check it out instead:
```bash
git checkout speckit/<issue-number>-<slug>
```

---

## Step 3 — Read Current Implementations

Before writing a single line of code, read every file listed in Section I of the spec.
Do not read files outside Section I — they are not your concern for this change.

---

## Step 4 — Implement in Dependency Order

Follow this exact sequence. Skip any step where the corresponding spec section is empty or says "No changes."

**Step 4.1 — doc/api-spec.yaml** (only if `api_spec_change = true` in Section A)
Apply the YAML diff from Section C exactly. No other changes to this file.
Do not proceed to Step 4.2 until this file is saved.

**Step 4.2 — utils/api.ts** (Section C TypeScript diff and/or Section D)
- Apply the TypeScript interface diff from Section C exactly.
- Add, remove, or retype fields in the affected interfaces to match Section D.
- Do NOT rename existing interfaces or restructure the file — only change the fields specified.
- The TypeScript interfaces must mirror `doc/api-spec.yaml` — verify alignment after both files are changed.

**Step 4.3 — components/** (Section E)
For each component listed in Section E:
- Implement exactly the before→after behaviour described.
- Render exactly the fields listed in "Fields rendered" — no extra fields, no missing fields.
- Apply the conditional logic exactly as stated.
- Add only the Tailwind classes listed in "Tailwind classes added" — no extra styling changes.
- Implement the fallback behaviour for undefined/empty fields.

For new components:
- Create the file at the path specified in Section E.
- Define the props interface exactly as specified.
- Import and render it in the parent component/page specified in Section E.

**Step 4.4 — app/** (Section F)
For each page listed in Section F:
- Implement the data flow change as described.
- If the localStorage key changes: update the write and read sides consistently, using the exact key string from Section F.
- If navigation changes: update the `router.push()` or `<Link>` call to match the new route or query params.
- Do NOT change any other part of the page outside what Section F specifies.

**Step 4.5 — doc/GITHUB-SPECKIT.md** (Section G)
Update only the sections listed in Section G. Do not rewrite, reformat, or restructure the file.

---

## Step 5 — Self-Review Checklist

After completing all changes, output this checklist with a clear PASS or FAIL for each item:

```
[ ] Section C YAML diff is exactly reflected in doc/api-spec.yaml (skip if api_spec_change=false)
[ ] Section C TypeScript diff is exactly reflected in utils/api.ts (skip if api_spec_change=false)
[ ] Section D interface fields exist in utils/api.ts with correct TypeScript types
[ ] Section E — each component renders exactly the fields listed, no extras, no missing
[ ] Section E — fallback behaviour implemented for undefined/empty fields
[ ] Section F — localStorage key name matches Section F exactly (if changed)
[ ] No file outside Section I was modified
```

If any item is FAIL, fix it immediately and re-output the checklist with all items passing before continuing.

---

## Step 6 — Output PR Description Block

Print the following block exactly. The human will paste it into the GitHub PR description.

```
## Spec Reference
- Spec file: docs/specs/<spec_id>.md
- Issue: #<issue_number>
- Spec status at merge: APPROVED

## Changes Made (per spec Section I)
| File | Change |
|------|--------|
<rows from Section I>

## Test Cases (from spec Section H)
<list TC-1 through TC-N in abbreviated form: TC-N: Given X, Then Y>

## Spec Compliance
- [ ] Implemented exactly Section I — no additional files changed
- [ ] Section H test cases verified manually
- [ ] doc/api-spec.yaml updated before code (if applicable)
- [ ] All changes committed to branch speckit/<issue-number>-<slug>
```
