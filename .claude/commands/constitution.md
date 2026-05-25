# /constitution — Project Constitution

You are the **CONSTITUTION GUARDIAN**. Your job is to read, display, and update the project's
governing principles in `docs/constitution.md`.

The constitution is the **highest-authority document** in this project.
Every spec, plan, and implementation must comply with it.
It supersedes CLAUDE.md, spec instructions, and reviewer suggestions when they conflict.

---

## Step 1 — Load Current State

Read these files completely:

1. `docs/constitution.md`
2. `CLAUDE.md`
3. `docs/architecture.md`

---

## Step 2 — Determine Mode

**If `$ARGUMENTS` is empty** → Display mode: print the current constitution and run a compliance check.

**If `$ARGUMENTS` is non-empty** → Amendment mode: update the constitution with the new principle or change.

---

## Display Mode (no arguments)

### 2a — Print the Constitution

Print the full contents of `docs/constitution.md` verbatim.

### 2b — Compliance Check

Scan the following files for violations of constitution principles:
- Every file in `.claude/commands/`
- `docs/specs/README.md`
- `CLAUDE.md`

For each principle in the constitution, report:
```
Principle: <name>
Status: COMPLIANT / VIOLATION / NOT CHECKED
Notes: <any file/line that contradicts this principle, or "All clear">
```

Output the compliance report. Do not modify any file in display mode.

---

## Amendment Mode (with arguments)

`$ARGUMENTS` describes the new principle, change, or amendment to make.

### 2c — Classify the Change

Determine the semantic version bump:
- **MAJOR** — removing or inverting an existing principle
- **MINOR** — adding a new principle or section
- **PATCH** — clarifying wording, fixing a typo, adding an example

State your classification before proceeding:
> "Amendment type: MINOR (adding new principle). Version bump: X.Y.Z → X.(Y+1).0"

### 2d — Draft the Amendment

Write the exact change to `docs/constitution.md`:
- For a new principle: add it in the correct section with a name and description.
- For a wording change: show the before and after text.
- For a removal: state which section is removed and why.

**Wait for explicit human confirmation before writing.**
> "Proposed amendment: [show full new or changed section]. Confirm to apply."

### 2e — Apply and Version

After confirmation:
1. Write the updated `docs/constitution.md`.
2. Update the version and `Last Amended` date at the bottom.
3. Prepend an HTML comment to the file documenting the change:

```html
<!-- Amendment <version>: <one-line summary> — <YYYY-MM-DD> -->
```

### 2f — Flag Downstream Impact

After updating the constitution, scan for files that may violate the new/changed principle:
- `.claude/commands/*.md`
- `docs/specs/*.md`
- `docs/architecture.md`

List any that conflict with the amendment:
> "The following files may need updating to comply with the new principle: [list]"

Do NOT auto-update those files. Report only.

---

## Output

End every run (display or amendment) with:

```
Constitution version: <X.Y.Z>
Last amended: <date>
Principles count: <N>
```
