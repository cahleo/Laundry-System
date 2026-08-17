import { ChevronLeft, ChevronRight } from "lucide-react";
import { useTheme } from "../context/ThemeContext";
import Btn from "./Btn";

export default function Pagination({ page, setPage, total, pageSize }) {
  const { t } = useTheme();
  const pages = Math.max(1, Math.ceil(total / pageSize));
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 14 }}>
      <span style={{ fontFamily: "Inter, sans-serif", fontSize: 12.5, color: t.inkSoft }}>
        {total === 0 ? "No results" : `Page ${page + 1} of ${pages}`}
      </span>
      <div style={{ display: "flex", gap: 8 }}>
        <Btn variant="ghost" disabled={page === 0} onClick={() => setPage((p) => Math.max(0, p - 1))}>
          <ChevronLeft size={14} /> Prev
        </Btn>
        <Btn variant="ghost" disabled={page >= pages - 1} onClick={() => setPage((p) => Math.min(pages - 1, p + 1))}>
          Next <ChevronRight size={14} />
        </Btn>
      </div>
    </div>
  );
}
