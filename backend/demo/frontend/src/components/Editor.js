import React, { useEffect, useRef, useState } from 'react';

export default function Editor({ sessionId }) {
  const [code, setCode] = useState('');
  const ws = useRef(null);

  useEffect(() => {
    const protocol = window.location.protocol === 'https:' ? 'wss' : 'ws';
    const host = window.location.host;
    ws.current = new WebSocket(`${protocol}://${host}/ws?session=${sessionId}`);

    ws.current.onopen = () => {
      console.log('websocket opened');
    };

    ws.current.onmessage = (evt) => {
      setCode(evt.data);
    };

    ws.current.onclose = () => {
      console.log('websocket closed');
    };

    return () => {
      if (ws.current) ws.current.close();
    };
  }, [sessionId]);

  function handleChange(e) {
    const newCode = e.target.value;
    setCode(newCode);
    if (ws.current && ws.current.readyState === WebSocket.OPEN) {
      ws.current.send(newCode);
    }
  }

  return (
    <textarea
      value={code}
      onChange={handleChange}
      style={{ width: '100%', height: '90vh', fontFamily: 'monospace' }}
    />
  );
}
