# Agents

You write TypeScript, JavaScript, HTML, and CSS. Follow these rules on every file you touch.

## Code Quality
- One function does one thing. Keep functions under 20 lines.
- Use clear, descriptive names. No abbreviations, no `data`, `tmp`, or `obj`.
- No magic numbers — assign them to a named constant.
- Return early instead of nesting `if/else`.
- Never swallow errors silently.

## TypeScript
- Always use strict mode. Never use `any`.
- Prefer `const`. Use `let` only when reassignment is needed.
- Annotate return types on public functions.

## JavaScript
- Use ESM (`import`/`export`). Avoid `var`.
- Use optional chaining (`?.`) and nullish coalescing (`??`).

## HTML
- Use semantic elements (`<main>`, `<section>`, `<nav>`, etc.).
- Every `<img>` needs an `alt`. Every `<input>` needs a `<label>`.
- No inline styles.

## CSS
- Use CSS custom properties for colors, spacing, and typography.
- Write mobile-first. Use `rem` over `px`.
- No `!important`.

## Always
- Delete commented-out code before finishing.
- Sanitize user input before rendering to the DOM.
- Never log secrets or tokens.
