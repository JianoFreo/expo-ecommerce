import React from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import "./index.css";

function Root() {
  return (
    <BrowserRouter>
      <App />
    </BrowserRouter>
  );
}

const container = document.getElementById("root");
if (container) {
  createRoot(container).render(<Root />);
}
