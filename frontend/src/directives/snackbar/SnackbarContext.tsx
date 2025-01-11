// src/context/SnackbarContext.tsx
import React, { createContext, useContext, useState, ReactNode } from "react";
import { Snackbar, Alert } from "@mui/material";

interface SnackbarState {
  message: string;
  severity: "success" | "error" | "info" | "warning";
}

interface SnackbarContextType {
  showSnackbar: (message: string, severity: "success" | "error" | "info" | "warning") => void;
}

// Definindo o tipo para as props do SnackbarProvider, incluindo `children`
interface SnackbarProviderProps {
  children: ReactNode; // O tipo `ReactNode` é o tipo correto para os filhos de um componente React
}

const SnackbarContext = createContext<SnackbarContextType | undefined>(undefined);

export const SnackbarProvider: React.FC<SnackbarProviderProps> = ({ children }) => {
  const [snackbarState, setSnackbarState] = useState<SnackbarState | null>(null);
  const [open, setOpen] = useState(false);

  const showSnackbar = (message: string, severity: "success" | "error" | "info" | "warning") => {
    setSnackbarState({ message, severity });
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  return (
    <SnackbarContext.Provider value={{ showSnackbar }}>
      {children}
      <Snackbar
        open={open}
        autoHideDuration={6000}
        onClose={handleClose}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert onClose={handleClose} severity={snackbarState?.severity} sx={{ width: "100%" }}>
          {snackbarState?.message}
        </Alert>
      </Snackbar>
    </SnackbarContext.Provider>
  );
};

export const useSnackbar = (): SnackbarContextType => {
  const context = useContext(SnackbarContext);
  if (!context) {
    throw new Error("useSnackbar must be used within a SnackbarProvider");
  }
  return context;
};