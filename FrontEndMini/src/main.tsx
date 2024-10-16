// import React from 'react'
import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

declare global {
  interface Window {
    vendorId?: number;
    requestPriceBtn?: string;
  }
}

//const chatTextArea = document.getElementById("chatTextArea");
//const requestPriceBtn = document.getElementById("requestPriceBtn");
//const showChatBtn = document.getElementById("showChatBtn");
/*window.addEventListener("DOMContentLoaded", () => {
  if (requestPriceBtn) {
    requestPriceBtn.addEventListener("click", function (e) {
      e.preventDefault();
      ReactDOM.createRoot(document.getElementById("root")!).render(<App />);
    });
  }
  if (showChatBtn) {
    showChatBtn.addEventListener("click", function (e) {
      e.preventDefault();
      ReactDOM.createRoot(document.getElementById("root")!).render(<App />);
    });
  }
});*/

window.addEventListener("DOMContentLoaded", () => {
  const rootContainer = document.getElementById("root");
  ReactDOM.createRoot(rootContainer!).render(<App />);
});
