---
name: clean-code
description: Use when refactoring, reviewing, or cleaning up TypeScript, JavaScript, HTML, or CSS code. Trigger on requests like "refactor", "clean up", "improve this", or "code review".
---

# Clean Code

When reviewing or refactoring code, check for these issues and fix them:

## The Essentials

- **Single responsibility** — each function does one thing only.
- **Meaningful names** — `calculateTotal` not `calc`; `isLoading` not `flag`.
- **No magic values** — `const MAX_RETRIES = 3` not a bare `3`.
- **Early returns** — flatten nested `if/else` with guard clauses.
- **No dead code** — delete commented-out code, unused variables, and unreachable blocks.
- **Handle errors** — never leave an empty `catch` block.

## Quick Examples

```ts
// Ruim
function p(u: any) {
  if (u) {
    if (u.active) {
      return u.firstName + ' ' + u.lastName;
    }
  }
  return '';
}

// Bom
function formatUserName(user: User): string {
  if (!user?.active) return '';
  return `${user.firstName} ${user.lastName}`;
}
```

```css
/* Ruim */
.card { padding: 16px; color: #2563eb; }
.header { color: #2563eb; }

/* Bom */
:root { --color-primary: #2563eb; --space-4: 1rem; }
.card { padding: var(--space-4); color: var(--color-primary); }
.header { color: var(--color-primary); }
```

## Before finishing, confirm:
- [ ] No `any` types
- [ ] No magic numbers or strings
- [ ] No commented-out code
- [ ] All errors are handled
- [ ] Names clearly describe intent
