import { useTheme } from "../context/ThemeContext";

export default function Card({ children, style, ...rest }) {
  const { t } = useTheme();
  return (
    <div style={{ background: t.surface, border: `1px solid ${t.line}`, borderRadius: 16, ...style }} {...rest}>
      {children}
    </div>
  );
}
