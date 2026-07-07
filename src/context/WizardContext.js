// src/context/WizardContext.js
"use client";
import { createContext, useContext, useState } from "react";

const WizardContext = createContext();

export const WizardProvider = ({ children, initialData = null }) => {
  const [wizardData, setWizardData] = useState(initialData);

  return (
    <WizardContext.Provider value={{ wizardData, setWizardData }}>
      {children}
    </WizardContext.Provider>
  );
};

export const useWizard = () => {
  const context = useContext(WizardContext);
  if (!context) {
    throw new Error("useWizard must be used within a WizardProvider");
  }
  return context;
};
