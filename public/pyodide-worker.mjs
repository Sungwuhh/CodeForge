import { loadPyodide } from "https://cdn.jsdelivr.net/pyodide/v0.27.2/full/pyodide.mjs";

let pyodidePromise = loadPyodide({
  indexURL: "https://cdn.jsdelivr.net/pyodide/v0.27.2/full/"
});

self.postMessage({ type: "ready" });

self.onmessage = async (event) => {
  if (event.data?.type !== "run") return;

  try {
    const pyodide = await pyodidePromise;
    let stdout = "";
    let stderr = "";

    pyodide.setStdout({
      batched: (text) => { stdout += text + "\n"; }
    });
    pyodide.setStderr({
      batched: (text) => { stderr += text + "\n"; }
    });

    await pyodide.runPythonAsync(event.data.code);

    self.postMessage({
      type: "result",
      stdout: stdout.trimEnd(),
      stderr: stderr.trimEnd()
    });
  } catch (error) {
    self.postMessage({
      type: "result",
      stdout: "",
      stderr: error?.message || String(error)
    });
  }
};
