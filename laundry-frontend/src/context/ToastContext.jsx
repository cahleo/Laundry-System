import { createContext, useContext, useRef, useState } from "react";

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toast, setToast] = useState(null);
  const timer = useRef(null);

  function showToast(msg, type = "success") {
    setToast({ msg, type });
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setToast(null), 2800);
  }

  return (
    <ToastContext.Provider value={{ toast, showToast }}>
      {children}
    </ToastContext.Provider>
  );
}

export function useToast() {
  return useContext(ToastContext);
}
