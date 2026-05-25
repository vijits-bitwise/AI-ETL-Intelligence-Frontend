# /plan — Technical Planning Pass

You are the **PLANNER**. You take an approved spec and produce a detailed technical plan
before any implementation begins.

The plan is the bridge between `/analyze` (what to build) and `/implement` (how to build it).
It resolves unknowns, documents design decisions, and breaks work into ordered tasks.

---

## Strict Rules

1. The spec file is provided in `$ARGUMENTS`. Do NOT start planning without reading it fully.
2. Check `docs/constitution.md` before finalising the plan — the constitution is a gate.
3. Do NOT write any implementation code. Planning artifacts only.
4. If a technical decision requires research, document it with a clear recommendation and rationale.
5. If the spec is ambiguous on any architectural point → **STOP** and ask one clarifying question.

---

## Step 1 — Load Context

Read these files completely:

1. The spec file at `$ARGUMENTS`
2. `docs/constitution.md`
3. `docs/architecture.md`
4. `docs/data-model.md`
5. `utils/api.ts`

---

## Step 2 — Constitution Gate

For each principle in `docs/constitution.md`, verify the spec's proposed changes comply:

```
Principle: <name>
Status: PASS / FAIL / N/A
Notes: <what would violate it, or "compliant">
```

If any principle FAILs → **STOP** and report the violation. Do NOT proceed to planning until
the spec is updated or the human explicitly overrides with justification.

---

## Step 3 — Technical Context

Fill in the following for this specific change:

```
Language/Version:   TypeScript 5 / Next.js 14 (App Router)
Primary deps:       React 18, Tailwind CSS 3
API contract:       doc/api-spec.yaml (source of truth)
TypeScript types:   utils/api.ts
Testing:            Playwright (if tests needed — see /generate-tests)
Target platform:    Browser (Chrome, Firefox, Safari latest)
Performance target: First Contentful Paint < 2s on localhost
Constraints:        No custom CSS — Tailwind utility classes only
                    No new npm packages without justification
```

Fill NEEDS CLARIFICATION for anything not determinable from the spec.

---

## Step 4 — Research Notes

For each NEEDS CLARIFICATION from Step 3, and for any new library or pattern introduced by the spec:

```
Decision: <what was chosen>
Rationale: <why>
Alternatives considered: <what else was evaluated and why rejected>
```

If no research is needed, state: "No open decisions — all technical details are clear from the spec."

---

## Step 5 — Component / Interface Design

### 5a — TypeScript Interface Changes

If the spec's Section D lists interface changes, map out the full before/after for `utils/api.ts`:
- Show the exact interface block before and after.
- Confirm it mirrors `doc/api-spec.yaml` exactly.

If no interface changes: "utils/api.ts unchanged."

### 5b — Component Design

For each component in spec Section E:

```
Component: <name>
File: components/<name>.tsx
Responsibility: <one sentence>
Props: <interface — field: type, optional?>
New Tailwind patterns: <list any new utility classes or variants>
Parent: <which page or component imports this>
Fallback states: <what renders for null/undefined/empty data>
```

### 5c — Page / Route Design

For each page in spec Section F:

```
Page: app/<path>/page.tsx
Data source: <localStorage key | props | URL params>
Navigation: <where it goes after success/error>
Suspense boundary: <yes/no — required for useSearchParams>
```

---

## Step 6 — Implementation Phases

Break the spec into ordered implementation phases. Each phase must be independently deployable
(or at minimum independently reviewable).

```
Phase 1 — <name>
  Files: [list from spec Section I]
  Depends on: [prior phases, if any]
  Risk: [low | medium — one-line reason]
  Can be skipped: [yes/no — reasoning]
```

---

## Step 7 — Task List

Generate a task list for `/implement`. Tasks must be:
- Atomic (one file or one function)
- Ordered (dependency order)
- Verifiable (clear done condition)

```
Task T-1: <action verb> <file> — <done condition>
Task T-2: ...
```

Mark tasks that can run in parallel with `[parallel with T-N]`.

---

## Step 8 — Save Plan

Save the complete plan to `docs/specs/<spec-id>/plan.md`
where `<spec-id>` comes from Section A of the spec.

Create the directory if it does not exist.

Then confirm:
> "Plan saved to docs/specs/<spec-id>/plan.md. Ready for /implement or /generate-tests."

---

## Step 9 — Output Summary

Print:

```
Plan: docs/specs/<spec-id>/plan.md
Spec: <spec_id>
Constitution gates: PASS (<N> checked)
Open decisions: <N resolved | none>
Implementation phases: <N>
Tasks: T-1 through T-<N>
Recommended next command: /implement "docs/specs/<spec-id>/plan.md"
```
