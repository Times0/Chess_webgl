import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";
import Modal from "react-modal";

// Move this line to a higher level in your component hierarchy
Modal.setAppElement("#root"); // This line is needed for accessibility reasons

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
