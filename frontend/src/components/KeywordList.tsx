interface Props {
  title: string;
  keywords: string[];
  type: "matched" | "missing";
}

export default function KeywordList({ title, keywords, type }: Props) {
  const color = type === "matched" ? "#22c55e" : "#f59e0b";
  const bg = type === "matched" ? "#052e16" : "#1c1402";
  const border = type === "matched" ? "#166534" : "#854d0e";

  return (
    <div
      style={{
        background: "#1e293b",
        border: "1px solid #334155",
        borderRadius: 12,
        padding: 24,
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 16,
        }}
      >
        <span style={{ fontWeight: 600, color: "#f1f5f9" }}>{title}</span>
        <span
          style={{
            background: `${color}20`,
            color,
            padding: "2px 10px",
            borderRadius: 12,
            fontSize: 13,
            fontWeight: 600,
          }}
        >
          {keywords.length}
        </span>
      </div>

      {keywords.length === 0 ? (
        <div style={{ color: "#64748b", fontSize: 14 }}>None found</div>
      ) : (
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          {keywords.map((kw) => (
            <span
              key={kw}
              style={{
                background: bg,
                border: `1px solid ${border}`,
                color,
                padding: "4px 10px",
                borderRadius: 6,
                fontSize: 13,
              }}
            >
              {kw}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
