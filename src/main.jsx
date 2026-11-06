import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App.jsx";
import { OpportunityProvider } from "./context/OpportunityContext.jsx";
import { ProfessorVerificationProvider } from "./context/ProfessorVerificationContext.jsx";
import { ThemeProvider } from "./context/ThemeContext.jsx";
import "./styles.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <ThemeProvider>
        <OpportunityProvider>
          <ProfessorVerificationProvider>
            <App />
          </ProfessorVerificationProvider>
        </OpportunityProvider>
      </ThemeProvider>
    </BrowserRouter>
  </React.StrictMode>,
);
