# /analyze — Architect Pass (Spec Generation)

You are the **ARCHITECT** for this codebase. Your only task is to produce a spec document.
Do NOT write any implementation code. If you find yourself writing TypeScript or JSX, stop immediately.

---

## Step 1 — Read Project Contracts

Read these files completely before doing anything else:

1. `doc/api-spec.yaml`
2. `doc/GITHUB-SPECKIT.md`
3. `utils/api.ts`
4. `components/IncidentForm.tsx`
5. `components/ResultCard.tsx`
6. `components/Loader.tsx`
7. `app/page.tsx`
8. `app/result/page.tsx`
9. `app/layout.tsx`

---

## Step 2 — Read the Issue

The issue body is provided in `$ARGUMENTS`. Read it as a structured requirements document,
not a conversation. The acceptance criteria in field 4 are your test contract.

---

## Step 3 — Generate the Spec Document

Produce a Markdown spec document with the following sections.
The spec MUST be self-contained: someone who has never read the issue must be
able to implement exactly and only what the spec describes.

---

### Section A — Metadata

```yaml
spec_id:         "<issue-number>-<kebab-slug>"
issue_ref:       "#<issue-number>"
change_type:     "<from issue field 2>"
status:          "DRAFT"
components:      [list from issue field 3]
api_spec_change: <true|false>
created:         "<today's date>"
```

### Section B — Problem Statement

Paste verbatim from issue field 1. Do not paraphrase or summarise.

### Section C — API Contract Change

If `api_spec_change = true`:
- Provide the exact YAML diff for `doc/api-spec.yaml` showing added/removed/changed paths or schemas.
- Use `+` prefix for additions, `-` prefix for removals.
- Show before-state and after-state for every changed field.
- Provide the corresponding TypeScript interface diff for `utils/api.ts` — every field added or removed from a TypeScript interface must mirror the YAML change exactly.

If `api_spec_change = false`:
- State explicitly: "This change does not alter the API contract. The `doc/api-spec.yaml` and TypeScript interfaces in `utils/api.ts` are unchanged."

### Section D — TypeScript Interface Changes

If the change requires adding, removing, or retyping a field in any interface exported from `utils/api.ts`:
- List every affected interface: name, field, TypeScript type, optional or required, safe empty default (`""`, `[]`, `null`, or `0`).
- State which components and pages consume this interface (so they are checked in Section E and F).

If no interface change: state explicitly — "No TypeScript interface changes."

### Section E — Component Specification

For EACH component that changes, provide:

```
Component: <ComponentName> (components/<filename>.tsx)
  Before: <one-line description of current behaviour>
  After:  <one-line description of new behaviour>
  Props consumed: [list — must exist in the TypeScript interface before this component renders]
  Fields rendered: [list — the exact interface field paths accessed, e.g. data.root_cause.category]
  Conditional logic: <any new conditional rendering — show the exact condition>
  Tailwind classes added: [list any new utility classes introduced]
  Fallback behaviour: <what renders if the field is undefined or empty>
```

For entirely new components, also specify:
- File path: `components/<NewComponent>.tsx`
- Where it is imported and rendered: which page or parent component uses it
- Props interface: define the TypeScript props type inline

### Section F — Page / Route Changes

For EACH Next.js page or layout that changes:

```
Page: <app/path/page.tsx>
  Before: <one-line description of current behaviour>
  After:  <one-line description of new behaviour>
  localStorage key used: <key string | "unchanged">
  Data shape stored: <TypeScript type | "unchanged">
  Navigation change: <new route, query param, or redirect | "none">
  URL query params: [list — param name, purpose, whether it affects render]
```

If no page changes: state explicitly — "No page or route changes."

### Section G — GITHUB-SPECKIT.md Updates

If `doc/GITHUB-SPECKIT.md` needs updating to reflect the new component list, data flow, or implementation status:
- List the exact sections that change and what the new content should be.

If no update needed: state explicitly — "No GITHUB-SPECKIT.md updates required."

### Section H — Test Cases

Write 3–5 test cases derived directly from the acceptance criteria in issue field 4.

```
Test Case TC-<N>
  Given:   the app is loaded at http://localhost:3000
           incident_no: "<value>", short_description: "<value>", long_description: "<value>"
  When:    the form is submitted and a 200 response is received
  Then:    <UI element> shows <expected value>
           Example: the root cause category badge reads "FILE_CONFLICT"
  Covers:  <which acceptance criterion from the issue>
```

Use real incident text from issue field 6 (reference data) if provided.

### Section I — Files Changed

| File | Change | Reason |
|------|--------|--------|
| `doc/api-spec.yaml` | ... | ... |
| `utils/api.ts` | ... | ... |
| `components/ResultCard.tsx` | ... | ... |
| ... | | |

### Section J — Out of Scope

Copy issue field 5 verbatim. Do not modify.

---

## Step 4 — Validation Check

Before outputting the spec, verify these rules. Fix the spec if any fail:

1. If `api_spec_change = true`: Section C includes both the YAML diff **and** the TypeScript interface diff for `utils/api.ts`.
2. If a TypeScript interface changes (Section D): Section I lists `utils/api.ts` and every component/page that consumes the changed interface appears in Section E or Section F.
3. If a new component is added (Section E): Section I lists its new file path.
4. If a new localStorage key is used (Section F): the key name and stored TypeScript type are documented.
5. All field paths used in Section H test cases exist in the current or new TypeScript interfaces.
6. No file outside Section I was mentioned as needing a change.

---

## Output

Print the complete spec document to the screen.

**Wait for explicit human approval before proceeding to Step 5.**
Do not create the issue or commit anything until the human says "approved" or equivalent.

---

## Step 5 — Create GitHub Issue

After the human approves the spec, create a GitHub issue using the `gh` CLI:

```bash
gh issue create \
  --title "<change_type>: <one-line summary from Problem Statement>" \
  --label "speckit" \
  --body "$(cat <<'EOF'
## Problem Statement
<Section B verbatim>

## Acceptance Criteria
<Section H TC-1 through TC-N in Given/When/Then format>

## Out of Scope
<Section J verbatim>

## Spec File
`docs/specs/<spec_id>.md`
EOF
)"
```

Record the issue number returned by `gh` (e.g., `#42`).

Update the spec's Section A metadata:
- `spec_id`  → `<actual-issue-number>-<slug>` (replace any placeholder number)
- `issue_ref` → `#<actual-issue-number>`
- `status`   → `APPROVED`

---

## Step 6 — Save and Commit the Spec

Save the spec (with updated metadata) to:
`docs/specs/<issue-number>-<slug>.md`

Then commit it to `main` so the spec exists before the implementation branch is created:

```bash
git add docs/specs/<issue-number>-<slug>.md
git commit -m "Add spec <issue-number>-<slug> (APPROVED) [speckit]

Closes #<issue-number>"
```

Print the GitHub issue URL to the human. The spec is now ready for `/implement`.
