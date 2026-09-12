# CodeForge MVP

A Next.js + React + TypeScript prototype for a browser coding platform with a controlled AI coding assistant.

## Run locally

```bash
npm install
npm run dev
```

Open http://localhost:3000.

## Current MVP
- Responsive IDE-style interface
- Editable Python starter code
- Demo Run output
- Language/file explorer UI
- Forge AI modes and controlled-edit interaction prototype
- Accept/reject/revise patch UI

## Next engineering steps
1. Add Monaco Editor.
2. Add authentication and persistent projects.
3. Add isolated code execution for Python, JavaScript and C++.
4. Add real AI API integration with scoped file/region permissions and diffs.
5. Add project storage and collaboration.


## Python runner

The Run button now executes Python in a browser Web Worker using Pyodide 0.27.2. Pyodide is loaded from the jsDelivr CDN on the first run.

This is an MVP client-side runner, not the final CodeForge security sandbox. It is suitable for basic Python execution and keeps the UI responsive by using a Web Worker. A production CodeForge runner should eventually move untrusted execution to an isolated server/container with strict CPU, memory, filesystem, process, and network limits.
