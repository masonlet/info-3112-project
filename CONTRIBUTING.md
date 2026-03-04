# Contributing

## Branch Protection & PRs
- **No Direct Pushes:** All changes must be made on a feature branch and submitted via Pull request.
- **Approvals:** Every PR **should** be reviewed by at least one team member before merging.
- **Branch Scope:** Each branch must represent a single focused change (one feature, fix, or refactor). Keep PRs small and purpose-driven.

## Quality Standards
Before submitting a PR, please ensure:
1. Your code passes linting: `npm run lint`
2. All tests pass: `npm run test`
3. The project build successfully: `npm run build`

## Automated Checks
Our CI pipeline (GitHub Actions) will automatically run these checks on every PR.
