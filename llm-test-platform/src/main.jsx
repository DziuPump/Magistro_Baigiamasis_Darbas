import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import { RequirementsProvider } from "./context/RequirementsContext";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <RequirementsProvider>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </RequirementsProvider>
  </React.StrictMode>
);
