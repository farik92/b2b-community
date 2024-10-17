// import React from 'react'
import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

declare global {
  interface Window {
    vendorId?: number;
  }
}

window.addEventListener("DOMContentLoaded", () => {
  const rootContainer = document.getElementById("root");
  ReactDOM.createRoot(rootContainer!).render(<App />);
});
