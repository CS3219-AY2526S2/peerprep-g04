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

function encodeBase64(str) {
  if (str === null || str === undefined) return null;
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
      return null;
    }

    const hasTestCase = expectedOutput !== null && expectedOutput !== undefined && expectedOutput.trim() !== "";
    let calculatedStatus = hasTestCase ? null : 'Completed';

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
        if (hasTestCase) {
          setTestStatus('Error');
          calculatedStatus = 'Error';
        }
      } else {
        setOutputErr(false);
        const actualOutput = stdout || '';
        setOutput(actualOutput);

        if (hasTestCase) {
          const actualClean = actualOutput.trim();
          const expectedClean = expectedOutput.trim();

          try {
            const actualJson = JSON.parse(actualClean);
            const expectedJson = JSON.parse(expectedClean);
            
            if (JSON.stringify(actualJson) === JSON.stringify(expectedJson)) {
              setTestStatus('Passed');
              calculatedStatus = 'Passed';
            } else {
              setTestStatus('Failed');
              calculatedStatus = 'Failed';
            }
          } catch (e) {
            if (actualClean === expectedClean) {
              setTestStatus('Passed');
              calculatedStatus = 'Passed';
            } else {
              setTestStatus('Failed');
              calculatedStatus = 'Failed';
            }
          }
        }
      }
      
      return calculatedStatus;

    } catch (err) {
      console.error("Judge0 API Error:", err?.response?.data || err.message);
      toast(err?.response?.data?.error || err.message, { type: "error" });
      setOutput("Execution failed.");
      setOutputErr(true);
      if (hasTestCase) setTestStatus('Error');
      return 'Error';
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
  };
}