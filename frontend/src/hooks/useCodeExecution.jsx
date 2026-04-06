import { useState } from "react";
import axios from 'axios';
import { toast } from "react-toastify";

export const languages = Object.freeze({
  javascript: 'javascript',
  python: 'python',
});

export const lang_to_id = Object.freeze({
  javascript: 102,
  python: 113,
});

// this is free api, idk, just use.
const judge0_api = axios.create({
  baseURL: 'https://ce.judge0.com',
  headers: {
    'Content-type': 'application/json',
  }
});

export function useCodeExecution() {
  const [lang, setLang] = useState(languages.javascript);

  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [outputErr, setOutputErr] = useState(false);
  const [output, setOutput] = useState('');
  
  async function runCode(code) {
    setLoading(true);
    setOpen(true);
    try {
      const res = await judge0_api.post('/submissions?wait=true', {
        language_id: lang_to_id[lang],
        source_code: code,
      });

      if (res.data.stderr) {
        setOutputErr(true);
        setOutput(res.data.stderr);
      } else {
        setOutputErr(false);
        setOutput(res.data.stdout);
      }
    } catch (err) {
      toast(err?.response?.data?.message || err.message);
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
    runCode,
  }
}