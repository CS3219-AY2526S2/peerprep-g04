import { useState } from "react";

export const languages = Object.freeze({
  javascript: 'javascript',
  python: 'python',
});

export function useCodeExecution() {
  const [output, setOutput] = useState('');
  const [lang, setLang] = useState('javascript');

  return {
    lang,
    setLang,
  }
}