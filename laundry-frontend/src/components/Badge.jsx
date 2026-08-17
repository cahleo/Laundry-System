import { useTheme } from "../context/ThemeContext";

export default function Badge({ children, tone = "cyan" }) {
  const { t } = useTheme();
  const map = {
    cyan: [t.cyanSoft, t.cyan], coral: [t.coralSoft, t.coral],
    amber: [t.amberSoft, t.amber], green: [t.greenSoft, t.green],
  };
  const [bg, fg] = map[tone];
  return (
    <span style={{
      background: bg, color: fg, fontFamily: "Inter, sans-serif", fontWeight: 600,
      fontSize: 12, padding: "4px 10px", borderRadius: 999, whiteSpace: "nowrap",
    }}>
      {children}
    </span>
  );
}
