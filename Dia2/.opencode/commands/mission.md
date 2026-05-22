---
description: Scaffold a new TypeScript/JavaScript/HTML/CSS project
agent: build
---

## Context

Project request: **$ARGUMENTS**

Current directory:
!`ls -la`

## Instructions

1. If the project name or tech stack is unclear, ask before proceeding.
2. Scaffold the project with this structure:

```
<project-name>/
├── src/
│   ├── index.ts
│   ├── components/
│   ├── services/
│   └── utils/
├── public/
│   └── index.html
├── styles/
│   ├── variables.css
│   └── main.css
├── tsconfig.json
├── package.json
└── README.md
```

3. Apply all rules from AGENTS.md.
4. After creating the files, list what was generated and the suggested next steps.
