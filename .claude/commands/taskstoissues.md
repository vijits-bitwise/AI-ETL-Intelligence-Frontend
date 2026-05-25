# /taskstoissues — Convert Tasks to GitHub Issues

You are the **ISSUE CREATOR**. You convert a task list from a plan file into GitHub issues
on the correct repository.

⚠️ **Safety constraint**: ONLY create issues on the repository matching the current `git remote get-url origin`.
UNDER NO CIRCUMSTANCES create issues on any other repository.

---

## Step 1 — Verify GitHub Remote

Run:
```bash
git remote get-url origin
```

Confirm the output is a GitHub URL (starts with `https://github.com/` or `git@github.com:`).

If it is NOT a GitHub URL → **STOP** immediately:
> "Remote is not a GitHub URL. Cannot create issues. Aborting."

Extract the `owner/repo` from the URL (e.g., `vijits-bitwise/AI-ETL-Intelligence-Frontend`).

Confirm before proceeding:
> "Will create issues on: https://github.com/<owner>/<repo> — is this correct?"

**Wait for explicit human confirmation.**

---

## Step 2 — Read the Task Source

The task file path is provided in `$ARGUMENTS`.

Read the file at `$ARGUMENTS` completely.

If `$ARGUMENTS` points to a **plan file** (`docs/specs/<id>/plan.md`):
- Extract the Task List from Step 7 of the plan (tasks T-1 through T-N).

If `$ARGUMENTS` points to a **spec file** (`docs/specs/<id>.md`):
- Extract test cases from Section H as tasks (TC-1 through TC-N).

If `$ARGUMENTS` points to a raw **tasks.md** file:
- Parse each task as-is.

State what you found:
> "Found N tasks in <file>. Spec/Plan ID: <id>."

---

## Step 3 — Build Issue List

For each task, construct a GitHub issue draft:

```
Issue draft for T-<N>:
  Title: [speckit] <spec-id>: <task description>
  Labels: speckit, frontend
  Body:
    ## Task
    <task description from plan>

    ## Spec Reference
    - Spec: docs/specs/<spec-id>.md
    - Plan: docs/specs/<spec-id>/plan.md (if exists)

    ## Done When
    <done condition from task list>

    ## Dependencies
    <"Depends on: T-N" or "None">
```

Print all N drafts for human review.

**Wait for explicit human confirmation before creating any issues.**
> "Ready to create N issues on <owner>/<repo>. Confirm to proceed."

---

## Step 4 — Create Issues in Order

After confirmation, create issues one at a time in task dependency order (T-1 first).
Use the `gh` CLI:

```bash
gh issue create \
  --title "[speckit] <spec-id>: <task description>" \
  --label "speckit" \
  --body "$(cat <<'EOF'
## Task
<task description>

## Spec Reference
- Spec: docs/specs/<spec-id>.md

## Done When
<done condition>

## Dependencies
<dependencies or "None">
EOF
)"
```

After each issue is created, print:
> "Created: #<issue-number> — <title>"

---

## Step 5 — Output Summary

After all issues are created, print:

```
Issues created: N
Repository: https://github.com/<owner>/<repo>
Spec: <spec-id>

Issue list:
| Task | Issue | Title |
|------|-------|-------|
| T-1  | #N    | ...   |
| T-2  | #N+1  | ...   |
```

> "Run /implement with the spec or plan file to begin implementation."
