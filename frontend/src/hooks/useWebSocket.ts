// useWebSocket.ts
import { useState, useEffect } from "react";

interface WebSocketOptions {
  onMessage: (data: any) => void;
}

const useWebSocket = (options: WebSocketOptions) => {
  const [ws, setWs] = useState<WebSocket>();
  const [isConnected, setIsConnected] = useState(false);

  const connectWebSocket = () => {
    const newWs = new WebSocket("ws://localhost:3001");

    newWs.onopen = () => {
      setIsConnected(true);
    };

    newWs.onmessage = (event) => {
      const data = JSON.parse(event.data);
      options.onMessage(data);
    };

    setWs(newWs);
  };

  useEffect(() => {
    if (ws) {
      return () => {
        ws.close();
        setIsConnected(false);
      };
    }
  }, [ws]);

  return { ws, isConnected, connectWebSocket };
};

export default useWebSocket;
