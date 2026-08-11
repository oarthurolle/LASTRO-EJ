import {
  useCallback,
  createContext,
  useContext,
  type ReactNode,
} from "react";

interface ToastContextType {
  showToast: (mensagem: string) => void;
}

const ToastContext = createContext<ToastContextType | null>(null);

export function ToastProvider({ children }: { children: ReactNode }) {
  const showToast = useCallback((msg: string) => {
    console.log(msg);
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
    </ToastContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useToast(): ToastContextType {
  const ctx = useContext(ToastContext);

  if (!ctx) {
    throw new Error(
      "useToast precisa estar dentro de um <ToastProvider>"
    );
  }

  return ctx;
}