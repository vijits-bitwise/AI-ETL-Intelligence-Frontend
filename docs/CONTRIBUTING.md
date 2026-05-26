# Contributing Guide

Welcome! This project uses **spec-driven development** — all changes start with a structured problem statement before any code is written.

---

## Spec-Driven Workflow Overview

```
Issue Created
    ↓
/analyze command generates spec
    ↓
Human approves spec + GitHub issue created
    ↓
/plan command designs implementation
    ↓
/implement command creates feature branch
    ↓
Code implemented (only Section I files)
    ↓
/review command validates against spec
    ↓
PR opened with spec reference
    ↓
Merge to main
```

---

## Getting Started: Submit a Feature or Bug Fix

### 1. Create a GitHub Issue

Open a new issue using the **SpecKit template**:

- **Problem Statement** — describe the issue or feature in detail
- **Change Type** — `feature`, `fix`, `refactor`, or `docs`
- **Affected Components** — which files will change
- **Acceptance Criteria** — 3–5 test cases in Given/When/Then format
- **Out of Scope** — what this issue does NOT cover
- **Reference Data** — examples, screenshots, links to context

See `.github/issue_templates/speckit.yaml` for the full template.

### 2. Run `/analyze` to Generate the Spec

In Claude Code, run:
```
/analyze "<your-problem-statement>"
```

This generates a spec document (`docs/specs/<issue-number>-<slug>.md`) with:
- **Metadata** — issue number, components, API changes
- **Problem Statement** — verbatim from your issue
- **API Contract Changes** — if the backend API changes
- **TypeScript Interfaces** — if data models change
- **Component Specifications** — per-component changes
- **Page/Route Changes** — per-page changes
- **Test Cases** — derived from acceptance criteria
- **Files Changed** — complete list of modified files (Section I)

### 3. Approve the Spec

Review the generated spec. If it looks good, respond in Claude with "approved" or similar. This triggers:
- GitHub issue creation (if not already created)
- Spec file committed to `docs/specs/`
- Issue linked to the spec

**DO NOT proceed to code until the spec is approved.**

---

## Implementing the Spec

### 4. Run `/plan` to Design Implementation

In Claude Code, run:
```
/plan "docs/specs/<issue-number>-<slug>.md"
```

This produces a technical plan with:
- Research and design decisions
- Ordered task list
- Critical file paths
- Verification steps

### 5. Run `/implement` to Create the Feature Branch

In Claude Code, run:
```
/implement "docs/specs/<issue-number>-<slug>.md"
```

This:
- Creates a new branch: `speckit/<issue-number>-<slug>`
- Modifies ONLY the files listed in spec Section I
- Enforces implementation order (API spec → interfaces → components → pages → integration doc)

### 6. Code Review: Run `/review` Before Opening PR

In Claude Code, run:
```
/review "docs/specs/<issue-number>-<slug>.md"
```

This validates that:
- All files match Section I (no extra files modified)
- Components match Section E (behavior, props, rendering)
- Pages match Section F (navigation, localStorage, routes)
- API changes match Section C (if applicable)
- Integration doc is updated (if applicable)

**If `/review` passes:** Open a PR.
**If `/review` fails:** Fix the issues and run `/review` again.

---

## Opening a Pull Request

### 7. Use the PR Template

When you open a PR, use the template at `.github/pull_request_template.md`. It includes:
- Link to the spec file (`docs/specs/<N-slug>.md`)
- Checklist to verify spec compliance
- Test case references
- Reviewer guidance

**Required PR checklist items:**
- [ ] Spec exists and is committed to `main`
- [ ] `/review` passed all sections
- [ ] Only Section I files were modified
- [ ] All test cases from spec Section H pass
- [ ] Linting passes (`npm run lint`)

---

## Key Commands

| Command | When to Run | Output |
|---------|------------|--------|
| `/analyze "<requirement>"` | **First** — when you have an idea or bug report | Generates a spec document + GitHub issue |
| `/plan "docs/specs/N.md"` | After spec is **APPROVED** | Technical implementation plan |
| `/implement "docs/specs/N.md"` | After `/plan` is reviewed | Creates feature branch + implements Section I |
| `/review "docs/specs/N.md"` | After code is written, **before PR** | Validates spec compliance (PASS/FAIL per section) |
| `/constitution` | Anytime — to read/update principles | Displays governing principles |
| `/generate-tests "docs/specs/N.md"` | After spec → generates Playwright tests | Test code derived from Section H |
| `/taskstoissues "docs/specs/N/plan.md"` | Optional — to split plan into GitHub issues | Creates issues per task in plan |

---

## Project Structure

```
docs/
├── constitution.md                # 8 governing principles (read before any feature)
├── architecture.md                # System design, data flow, tech stack
├── data-model.md                  # TypeScript interface reference
├── component-guide.md             # Component inventory, Tailwind patterns
├── GITHUB-SPECKIT.md              # Frontend-to-backend API mapping
├── api-spec.yaml                  # OpenAPI 3.0.3 backend contract
├── CONTRIBUTING.md                # This file
└── specs/                         # Feature specs (one per GitHub issue)
    ├── README.md                  # Spec template reference
    └── N-slug.md                  # Example: 1-add-escalation-path.md
```

---

## Important Files

| File | Purpose |
|------|---------|
| `CLAUDE.md` | Project instructions & workflow (read first) |
| `docs/constitution.md` | 8 principles governing all changes |
| `docs/GITHUB-SPECKIT.md` | API request/response → component mapping |
| `docs/api-spec.yaml` | Backend contract (source of truth) |
| `.claude/commands/` | All 7 SpecKit commands (do not edit) |
| `.github/` | GitHub issue template + PR template |

---

## Common Questions

### Q: Can I skip the spec and just open a PR?
**A:** No. The spec is required before any code is written. It serves as the acceptance criteria and review contract.

### Q: What if the spec is wrong or incomplete?
**A:** Ask for clarification in the issue or reach out to the team. Specs are living documents — update Section B or Section J if needed, then reapprove.

### Q: What if I need to modify files outside Section I?
**A:** That means the spec was incomplete. Run `/review` to see what's out of scope, then either:
1. Add those files to the spec (reapprove), or
2. Remove those changes from your implementation

### Q: How do I update the spec after starting implementation?
**A:** Stop and reapprove the spec first. Implementation must always match the approved spec exactly.

### Q: What if the API spec changes during implementation?
**A:** Update `docs/api-spec.yaml` first, then update `utils/api.ts` to match. Run `/review` to validate.

---

## Debugging SpecKit Workflow

### Issue: `/analyze` is not generating a spec
- Verify your problem statement has all 6 required fields (from `.github/issue_templates/speckit.yaml`)
- Check that the issue is labeled `speckit` + `needs-spec`

### Issue: `/implement` says "files don't match Section I"
- Run `/review` to see what's out of scope
- Check that you're only modifying files listed in Section I

### Issue: I modified extra files accidentally
- Revert those changes (don't commit them)
- Run `/review` again before opening the PR

### Issue: The spec says to change `docs/api-spec.yaml` but I don't see it
- The file is at `docs/api-spec.yaml` (not in `doc/` anymore)
- Always update `utils/api.ts` after updating the YAML

---

## More Info

- **SpecKit Architecture**: See `docs/architecture.md`
- **Data Models**: See `docs/data-model.md`
- **Component Patterns**: See `docs/component-guide.md`
- **Project Principles**: See `docs/constitution.md`
- **Backend API Contract**: See `docs/GITHUB-SPECKIT.md`

**Questions?** Open an issue or check the repo docs.

Happy contributing! 🚀
