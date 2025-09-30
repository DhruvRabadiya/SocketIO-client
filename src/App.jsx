import React, { useEffect } from "react";
import { io } from "socket.io-client";
function App() {
  useEffect(() => {
    const socket = io(import.meta.env.VITE_BACKEND_URL);
    socket.on("connect", () => {
      console.log("Connected to backend:");
    });
    socket.on("onboard", (message) => {
      console.log(message);
    });
    socket.on("disconnect", () => {
      console.log("Disconnected from server");
    });
  }, []);

  return (
    <div style={{ textAlign: "center", marginTop: "50px" }}>
      <h1>React + Socket.io Client</h1>
      <p>Open the console to see socket messages once you add client code.</p>
    </div>
  );
}

export default App;
