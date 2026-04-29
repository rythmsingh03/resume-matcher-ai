interface Props {
  score: number;
}

export default function ScoreCard({ score }: Props) {
  // pick color based on score range
  const color = score >= 70 ? "#22c55e" : score >= 40 ? "#f59e0b" : "#ef4444";
  const label =
    score >= 70 ? "Strong Match" : score >= 40 ? "Partial Match" : "Weak Match";

  return (
    <div
      style={{
        background: "#1e293b",
        border: `1px solid ${color}40`,
        borderRadius: 12,
        padding: 32,
        textAlign: "center",
      }}
    >
      <div style={{ fontSize: 14, color: "#94a3b8", marginBottom: 8 }}>
        Match Score
      </div>
      <div style={{ fontSize: 72, fontWeight: 800, color, lineHeight: 1 }}>
        {score}%
      </div>
      <div
        style={{
          display: "inline-block",
          marginTop: 12,
          padding: "4px 16px",
          background: `${color}20`,
          border: `1px solid ${color}40`,
          borderRadius: 20,
          color,
          fontSize: 14,
          fontWeight: 600,
        }}
      >
        {label}
      </div>
    </div>
  );
}
