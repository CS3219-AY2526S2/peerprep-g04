import React, { useRef, useEffect, useState } from 'react';
import Editor from "@monaco-editor/react";
import * as Y from "yjs";
import { WebrtcProvider } from "y-webrtc";
import { MonacoBinding } from "y-monaco";

const SUPPORTED_LANGUAGES = [
  { label: 'JavaScript', value: 'javascript' },
  { label: 'Python', value: 'python' },
  { label: 'Java (not supported yet)', value: 'java' },
  { label: 'C++ (not supported yet)', value: 'cpp' },
  { label: 'Go (not supported yet)', value: 'go' }
];

export default function CollaborativeEditor({ sessionId, wsRef }) {
  const [language, setLanguage] = useState('javascript');
  const [output, setOutput] = useState(''); 
  const [isRunning, setIsRunning] = useState(false);

  const editorRef = useRef(null);
  const providerRef = useRef(null);
  const docRef = useRef(null);
  const bindingRef = useRef(null);
  const lastSavedCode = useRef('');


  const pyodideRef = useRef(null);

  function handleEditorDidMount(editor, monaco) {
    editorRef.current = editor;
    const ydoc = new Y.Doc();
    docRef.current = ydoc;

    const provider = new WebrtcProvider(sessionId, ydoc, {
      signaling: ['ws://localhost:4444']
    });
    providerRef.current = provider;

    const yText = ydoc.getText("monaco");
    bindingRef.current = new MonacoBinding(
      yText,
      editorRef.current.getModel(),
      new Set([editorRef.current]),
      provider.awareness
    );
  }

  const handleLanguageChange = (e) => {
    const newLang = e.target.value;
    setLanguage(newLang);
    if (providerRef.current) {
      providerRef.current.awareness.setLocalStateField('language', newLang);
    }
  };


  const handleRunCode = async () => {
    if (!editorRef.current) return;
    const code = editorRef.current.getValue();
    setOutput('Running...\n');
    setIsRunning(true);

    try {
      if (language === 'javascript') {
        runJavaScript(code);
      } else if (language === 'python') {
        await runPython(code);
      } else {
      }
    } catch (error) {
      setOutput((prev) => prev + `\nError: ${error.message || error}`);
    } finally {
      setIsRunning(false);
    }
  };


  const runJavaScript = (code) => {
    let currentOutput = '';

    const originalLog = console.log;
    console.log = (...args) => {
      const msg = args.map(arg => typeof arg === 'object' ? JSON.stringify(arg) : String(arg)).join(' ');
      currentOutput += msg + '\n';
      originalLog(...args); 
    };

    try {

      const run = new Function(code);
      run();
      setOutput(currentOutput || 'Code executed successfully with no output.');
    } catch (err) {
      setOutput(currentOutput + `\nRuntime Error: ${err.toString()}`);
    } finally {

      console.log = originalLog;
    }
  };

  const runPython = async (code) => {
    let currentOutput = '';
    
    if (!pyodideRef.current) {
      setOutput('Initializing Python WebAssembly environment (first run only, takes a few seconds)...\n');
      if (!window.loadPyodide) {
        await new Promise((resolve, reject) => {
          const script = document.createElement('script');
          script.src = "https://cdn.jsdelivr.net/pyodide/v0.27.0/full/pyodide.js";
          script.onload = resolve;
          script.onerror = reject;
          document.body.appendChild(script);
        });
      }
      
      // 初始化 Pyodide 并重定向标准输出
      pyodideRef.current = await window.loadPyodide({
        stdout: (text) => { currentOutput += text + '\n'; },
        stderr: (text) => { currentOutput += 'Error: ' + text + '\n'; }
      });
    }

    try {
      await pyodideRef.current.runPythonAsync(code);
      setOutput(currentOutput || 'Code executed successfully with no output.');
    } catch (err) {
      setOutput(currentOutput + `\n${err.toString()}`);
    }
  };

  // send code to server every 5 seconds if it has changed
  useEffect(() => {
    const timer = setInterval(() => {
      if (docRef.current && wsRef && wsRef.current?.readyState === WebSocket.OPEN) {
        const currentCode = docRef.current.getText("monaco").toString();
        if (currentCode !== lastSavedCode.current) {
          const payload = { type: "CODE_SAVE", code: currentCode, language: language };
          wsRef.current.send(JSON.stringify(payload));
          lastSavedCode.current = currentCode;
        }
      }
    }, 5000);
    return () => clearInterval(timer);
  }, [wsRef, language]);

  useEffect(() => {
    return () => {
      if (bindingRef.current) bindingRef.current.destroy();
      if (providerRef.current) providerRef.current.destroy();
      if (docRef.current) docRef.current.destroy();
    };
  }, []);

  return (
    <div style={{ height: '100%', width: '100%', display: 'flex', flexDirection: 'column' }}>
      {}
      <div style={{ 
        padding: '8px 16px', background: '#1e1e1e', borderBottom: '1px solid #333',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ color: '#ccc', fontSize: '14px' }}>Language:</span>
          <select 
            value={language} onChange={handleLanguageChange}
            style={{ background: '#333', color: '#fff', border: '1px solid #555', borderRadius: '4px', padding: '4px 8px', outline: 'none' }}
          >
            {SUPPORTED_LANGUAGES.map(lang => (
              <option key={lang.value} value={lang.value}>{lang.label}</option>
            ))}
          </select>
        </div>
        
        {/* run button */}
        <button 
          onClick={handleRunCode} 
          disabled={isRunning}
          style={{
            background: isRunning ? '#555' : '#4CAF50', color: 'white', border: 'none', 
            padding: '6px 16px', borderRadius: '4px', cursor: isRunning ? 'not-allowed' : 'pointer',
            fontWeight: 'bold'
          }}
        >
          {isRunning ? 'Running...' : '▶ Run Code'}
        </button>
      </div>

      {/* */}
      <div style={{ height: '60vh', border: '1px solid #333', borderBottom: 'none' }}>
        <Editor
          height="100%" width="100%" theme="vs-dark" language={language}
          onMount={handleEditorDidMount}
          options={{ minimap: { enabled: false }, fontSize: 15, wordWrap: "on" }}
        />
      </div>

      {/* terminal output */}
      <div style={{ 
        height: '25vh', background: '#000', color: '#00ff00', 
        padding: '10px', overflowY: 'auto', fontFamily: 'monospace',
        border: '1px solid #333', borderRadius: '0 0 8px 8px'
      }}>
        <div style={{ color: '#888', marginBottom: '8px', borderBottom: '1px solid #333', paddingBottom: '4px' }}>
          Terminal Output
        </div>
        <pre style={{ margin: 0, whiteSpace: 'pre-wrap' }}>{output}</pre>
      </div>
    </div>
  );
}