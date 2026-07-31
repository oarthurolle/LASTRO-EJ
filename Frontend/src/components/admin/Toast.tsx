import { useEffect, useState, useCallback, createContext, useContext, type ReactNode } from "react";

interface ToastContextType {
  showToast: (mensagem: string) => void;
}

const ToastContext = createContext<ToastContextType | null>(null);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [mensagem, setMensagem] = useState<string>("");
  const [visivel, setVisivel] = useState<boolean>(false);

  const showToast = useCallback((msg: string) => {
    setMensagem(msg);
    setVisivel(true);
  }, []);

  useEffect(() => {
    if (!visivel) return;
    const timer = setTimeout(() => setVisivel(false), 3200);
    return () => clearTimeout(timer);
  }, [visivel]);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className={"toast" + (visivel ? " show" : "")}>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></svg>
        <span>{mensagem}</span>
      </div>
    </ToastContext.Provider>
  );
}

export function useToast(): ToastContextType {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast precisa estar dentro de um <ToastProvider>");
  return ctx;
}