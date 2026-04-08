import { useState } from "react";
import axios from 'axios';
import { toast } from "react-toastify";

export const languages = Object.freeze({
  javascript: 'javascript',
  python: 'python',
});

export const lang_to_id = Object.freeze({
  javascript: 93, // Node.js 18.15.0
  python: 92,     // Python 3.11.2
});

const judge0_api = axios.create({
  baseURL: 'https://ce.judge0.com',
  headers: {
    'Content-type': 'application/json',
  }
});

// base64 encoding to prevent 422
function encodeBase64(str) {
  if (!str) return null;
  return btoa(unescape(encodeURIComponent(str)));
}


function decodeBase64(str) {
  if (!str) return "";
  return decodeURIComponent(escape(atob(str)));
}

export function useCodeExecution() {
  const [lang, setLang] = useState(languages.javascript);

  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [outputErr, setOutputErr] = useState(false);
  const [output, setOutput] = useState('');
  const [testStatus, setTestStatus] = useState(null); 
  
  async function runCode(code, stdin = null, expectedOutput = null) {
    if (!code || !code.trim()) {
      toast("Please write some code first!", { type: "warning" });
      return;
    }

    setLoading(true);
    setOpen(true);
    setTestStatus(null);
    setOutput("Running...");
    setOutputErr(false);

    try {
      const payload = {
        language_id: lang_to_id[lang],
        source_code: encodeBase64(code),
      };

      if (stdin) {
        payload.stdin = encodeBase64(stdin);
      }

      const res = await judge0_api.post('/submissions?wait=true&base64_encoded=true', payload);

      const stderr = decodeBase64(res.data.stderr);
      const compile_output = decodeBase64(res.data.compile_output);
      const stdout = decodeBase64(res.data.stdout);

      if (stderr || compile_output) {
        setOutputErr(true);
        setOutput(stderr || compile_output);
        if (expectedOutput) setTestStatus('Error');
      } else {
        setOutputErr(false);
        setOutput(stdout || '');

        if (expectedOutput) {
          try {
            const actualJson = JSON.parse(stdout.trim());
            const expectedJson = JSON.parse(expectedOutput.trim());
            
            if (JSON.stringify(actualJson) === JSON.stringify(expectedJson)) {
              setTestStatus('Passed');
            } else {
              setTestStatus('Failed');
            }
          } catch (e) {
            if (stdout.trim() === expectedOutput.trim()) {
              setTestStatus('Passed');
            } else {
              setTestStatus('Failed');
            }
          }
        }
      }
    } catch (err) {
      console.error("Judge0 API Error:", err?.response?.data || err.message);
      toast(err?.response?.data?.error || err.message, { type: "error" });
      if (expectedOutput) setTestStatus('Error');
      setOutput("Execution failed.");
    } finally {
      setLoading(false);
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
    testStatus,
    runCode,
  }
}