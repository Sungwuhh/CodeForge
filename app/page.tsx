'use client';

import { useMemo, useRef, useState } from 'react';
import {
  Play, Save, Share2, Send, ChevronDown, Plus, Folder, FileCode2,
  Sparkles, Terminal, Bug, Check, X, RotateCcw, Square
} from 'lucide-react';

const starter = `# Build something.

def greet(name):
    message = f"Hello, {name}!"
    return message

print(greet("developer"))`;

const modes = ['Explain', 'Fix', 'Complete', 'Modify', 'Generate'];
const files = [['main.py','py'],['README.md','md'],['script.js','js'],['index.html','html'],['styles.css','css']];

type RunMessage = {
  type: 'ready' | 'result' | 'error';
  stdout?: string;
  stderr?: string;
  error?: string;
};

export default function Home() {
  const [code, setCode] = useState(starter);
  const [output, setOutput] = useState('✓ Python runner ready. Press Run to execute your code.');
  const [mode, setMode] = useState('Explain');
  const [prompt, setPrompt] = useState('');
  const [suggestion, setSuggestion] = useState(false);
  const [running, setRunning] = useState(false);
  const [runtimeReady, setRuntimeReady] = useState(false);
  const workerRef = useRef<Worker | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const lines = useMemo(
    () => Array.from({ length: Math.max(1, code.split('\n').length) }, (_, i) => i + 1),
    [code]
  );

  function stopRunner() {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = null;
    workerRef.current?.terminate();
    workerRef.current = null;
    setRunning(false);
    setRuntimeReady(false);
  }

  function run() {
    if (running) {
      stopRunner();
      setOutput('■ Execution stopped.');
      return;
    }

    setRunning(true);
    setRuntimeReady(false);
    setOutput('⏳ Starting Python 3 runtime...\\n\\nThe first run downloads Pyodide and may take a little longer.');

    const worker = new Worker('/pyodide-worker.mjs', { type: 'module' });
    workerRef.current = worker;

    worker.onmessage = (event: MessageEvent<RunMessage>) => {
      const data = event.data;

      if (data.type === 'ready') {
        setRuntimeReady(true);
        setOutput('⏳ Python runtime loaded. Running your program...');
        worker.postMessage({ type: 'run', code });
        return;
      }

      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
      worker.terminate();
      workerRef.current = null;
      setRunning(false);

      if (data.type === 'result') {
        const stdout = data.stdout || '';
        const stderr = data.stderr || '';
        if (stderr) {
          setOutput(`✗ Runtime error\\n\\n${stderr}${stdout ? `\\n${stdout}` : ''}`);
        } else {
          setOutput(`✓ Program finished\\n\\n${stdout || '(no output)'}\\n\\nPython 3 • client-side runner`);
        }
      } else {
        setOutput(`✗ Runner error\\n\\n${data.error || 'Unknown error'}`);
      }
    };

    worker.onerror = (event) => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
      worker.terminate();
      workerRef.current = null;
      setRunning(false);
      setOutput(`✗ Python runner failed\\n\\n${event.message || 'The worker could not start.'}`);
    };

    timeoutRef.current = setTimeout(() => {
      worker.terminate();
      workerRef.current = null;
      setRunning(false);
      setRuntimeReady(false);
      setOutput('✗ Execution stopped\\n\\nYour program ran longer than the 6-second MVP limit.');
    }, 6000);
  }

  function ask() {
    if (!prompt.trim()) return;
    setSuggestion(true);
    setPrompt('');
  }

  return (
    <div className="app">
      <header className="top">
        <div className="brand">Code<span>Forge</span></div>
        <div className="workspace-pill">Workspace / starter-project</div>
        <div className="spacer" />
        <button className="btn"><Share2 size={15}/>Share</button>
        <button className="btn"><Save size={15}/>Save</button>
        <button className="run" onClick={run}>
          {running ? <Square size={14} fill="currentColor"/> : <Play size={15} fill="currentColor"/>}
          {running ? 'Stop' : 'Run'}
        </button>
      </header>

      <div className="layout">
        <aside className="sidebar">
          <div className="section-title">Explorer <Plus size={14}/></div>
          {files.map(([name,type],i) => (
            <div className={'file '+(i===0?'active':'')} key={name}>
              <span className={'dot '+type}/><span>{name}</span>
            </div>
          ))}
          <div className="section-title lang-title">Languages</div>
          {['🐍 Python','🟨 JavaScript','🔷 TypeScript','⚡ C++'].map(x =>
            <div className="file language" key={x}>{x}</div>
          )}
          <div className="project-card">
            <Folder size={16}/>
            <div><b>Starter project</b><small>5 files</small></div>
          </div>
        </aside>

        <main className="workspace">
          <div className="tabs">
            <div className="tab active"><FileCode2 size={14}/>main.py <X size={13}/></div>
            <div className="tab">script.js</div>
          </div>

          <div className="editor">
            <div className="nums">{lines.map(n => <div key={n}>{n}</div>)}</div>
            <textarea
              value={code}
              onChange={e => setCode(e.target.value)}
              spellCheck={false}
              aria-label="Python code editor"
            />
          </div>

          <div className="console">
            <div className="console-head">
              <b><Terminal size={14}/>OUTPUT</b>
              <span>TERMINAL</span>
              <span><Bug size={13}/>PROBLEMS</span>
              <span className="console-lang">Python 3 <ChevronDown size={13}/></span>
            </div>
            <pre className={output.startsWith('✓') ? 'success' : output.startsWith('✗') ? 'error' : ''}>
              {output}
            </pre>
          </div>
        </main>

        <aside className="ai">
          <div className="ai-head">
            <div className="ai-title"><Sparkles size={17}/>Forge AI</div>
            <div className="ai-sub">Your coding assistant, under your control.</div>
          </div>

          <div className="modes">
            {modes.map(m =>
              <button className={'mode '+(mode===m?'active':'')} onClick={() => setMode(m)} key={m}>{m}</button>
            )}
          </div>

          <div className="chat">
            <div className="msg">
              I can read the selected code and propose a change. I won't silently rewrite your project.
            </div>
            {suggestion ? (
              <div className="msg ai-msg">
                <b>Suggested change</b>
                <p>In <code>main.py</code>, I can work within your selected-file permission and propose a patch for the requested task.</p>
                <div className="diff">
                  <span className="minus">- current implementation</span>
                  <span className="plus">+ proposed implementation</span>
                </div>
                <div className="actions">
                  <button onClick={() => setSuggestion(false)}><Check size={14}/>Accept</button>
                  <button onClick={() => setSuggestion(false)}><X size={14}/>Reject</button>
                  <button><RotateCcw size={14}/>Revise</button>
                </div>
              </div>
            ) : (
              <div className="msg ai-msg">
                <b>Suggested:</b><br/>Turn <code>greet()</code> into a reusable function with a default name.
              </div>
            )}
          </div>

          <div className="permissions">
            <div className="perm"><span>Read selected file</span><span className="on">ON</span></div>
            <div className="perm"><span>Edit selected file</span><span className="on">ON</span></div>
            <div className="perm"><span>Project-wide edits</span><span>OFF</span></div>
            <div className="perm"><span>Run commands</span><span>OFF</span></div>
          </div>

          <div className="prompt">
            <input
              value={prompt}
              onChange={e => setPrompt(e.target.value)}
              onKeyDown={e => e.key==='Enter' && ask()}
              placeholder={`Ask Forge AI to ${mode.toLowerCase()}...`}
            />
            <button onClick={ask}><Send size={15}/></button>
          </div>
        </aside>
      </div>

      <footer className="status">
        <span className="ok">● Connected</span>
        <span>Python runner: {running ? (runtimeReady ? 'running' : 'loading') : 'Pyodide'}</span>
        <span>Ln 2, Col 1</span>
        <span className="status-right">CodeForge MVP • TypeScript</span>
      </footer>
    </div>
  );
}
