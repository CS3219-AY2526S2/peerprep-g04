import { useState } from "react";

export const languages = Object.freeze({
  javascript: 'javascript',
  python: 'python',
});

export function useCodeExecution() {
  const [lang, setLang] = useState(languages.javascript);

  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [outputErr, setOutputErr] = useState(false);
  const [output, setOutput] = useState('');
  
  function runJavascript(code) {
    const logs = [];
    const originalLog = console.log;
    console.log = (...args) => {
      const message = args
        .map(arg => (typeof arg === 'object' ? JSON.stringify(arg) : String(arg)))
        .join(' ');
      
      logs.push(message);
    };

    try {
      eval(code); 
      setOutputErr(false);
      setOutput(logs.join('\n')); 
    } catch (err) {
      setOutputErr(true);
      setOutput(err.message);
    } finally {
      setOpen(true);
      console.log = originalLog;
    }
  }

  function runCode(code) {
    switch (lang) {
      case languages.javascript:
        runJavascript(code);
        break;
    }
  } 

  return {
    lang,
    setLang,
    open,
    setOpen,
    loading,
    output,
    outputErr,
    runCode,
  }
}