import { useState } from "react";
import { FileText, Briefcase, Zap } from "lucide-react";
import ScoreCard from "./components/ScoreCard";
import KeywordList from "./components/KeywordList";

interface AnalysisResult {
  score: number;
  matched_keywords: string[];
  missing_keywords: string[];
  resume_text_preview: string;
}

export default function App() {
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [jdText, setJdText] = useState("");
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleAnalyze = async () => {
    // basic validation
    if (!resumeFile) return setError("Please upload your resume PDF.");
    if (!jdText.trim()) return setError("Please paste a job description.");
    if (jdText.trim().length < 50)
      return setError("Job description seems too short. Paste the full JD.");

    setError("");
    setLoading(true);
    setResult(null);

    try {
      // FormData is how we send a file + text together to the backend
      const formData = new FormData();
      formData.append("resume", resumeFile);
      formData.append("jd_text", jdText);

      const response = await fetch(
        "https://rythmsingh03-resume-matcher-api.hf.space/analyze",
        {
          method: "POST",
          body: formData,
        },
      );

      if (!response.ok)
        throw new Error("Server error. Make sure backend is running.");

      const data: AnalysisResult = await response.json();
      setResult(data);
    } catch (err: any) {
      setError(err.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 900, margin: "0 auto", padding: "40px 20px" }}>
      {/* Header */}
      <div style={{ textAlign: "center", marginBottom: 48 }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 12,
            marginBottom: 12,
          }}
        >
          <Zap size={32} color="#6366f1" />
          <h1 style={{ fontSize: 32, fontWeight: 700, color: "#f1f5f9" }}>
            Resume Matcher
          </h1>
        </div>
        <p style={{ color: "#94a3b8", fontSize: 16 }}>
          Upload your resume and paste a job description to see how well you
          match
        </p>
      </div>

      {/* Input Section */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 24,
          marginBottom: 24,
        }}
      >
        {/* Resume Upload */}
        <div style={cardStyle}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              marginBottom: 16,
            }}
          >
            <FileText size={18} color="#6366f1" />
            <span style={{ fontWeight: 600, color: "#f1f5f9" }}>
              Your Resume
            </span>
          </div>
          <label style={uploadLabelStyle(!!resumeFile)}>
            <input
              type="file"
              accept=".pdf"
              style={{ display: "none" }}
              onChange={(e) => setResumeFile(e.target.files?.[0] || null)}
            />
            {resumeFile ? (
              <div>
                <div
                  style={{ color: "#6366f1", fontWeight: 600, marginBottom: 4 }}
                >
                  ✓ File selected
                </div>
                <div style={{ color: "#94a3b8", fontSize: 13 }}>
                  {resumeFile.name}
                </div>
              </div>
            ) : (
              <div>
                <div style={{ color: "#94a3b8", marginBottom: 4 }}>
                  Click to upload PDF
                </div>
                <div style={{ color: "#64748b", fontSize: 13 }}>
                  Only .pdf files accepted
                </div>
              </div>
            )}
          </label>
        </div>

        {/* JD Input */}
        <div style={cardStyle}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              marginBottom: 16,
            }}
          >
            <Briefcase size={18} color="#6366f1" />
            <span style={{ fontWeight: 600, color: "#f1f5f9" }}>
              Job Description
            </span>
          </div>
          <textarea
            value={jdText}
            onChange={(e) => setJdText(e.target.value)}
            placeholder="Paste the full job description here..."
            style={textareaStyle}
          />
          <div style={{ color: "#64748b", fontSize: 12, marginTop: 8 }}>
            {jdText.length} characters
          </div>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div
          style={{
            background: "#450a0a",
            border: "1px solid #dc2626",
            borderRadius: 8,
            padding: "12px 16px",
            marginBottom: 16,
            color: "#fca5a5",
          }}
        >
          {error}
        </div>
      )}

      {/* Analyze Button */}
      <button
        onClick={handleAnalyze}
        disabled={loading}
        style={buttonStyle(loading)}
      >
        {loading ? "Analyzing..." : "Analyze Match"}
      </button>

      {/* Results */}
      {result && (
        <div style={{ marginTop: 40 }}>
          <ScoreCard score={result.score} />
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 24,
              marginTop: 24,
            }}
          >
            <KeywordList
              title="Matched Keywords"
              keywords={result.matched_keywords}
              type="matched"
            />
            <KeywordList
              title="Missing Keywords"
              keywords={result.missing_keywords}
              type="missing"
            />
          </div>

          {/* Improvement Tips */}
          {result.missing_keywords.length > 0 && (
            <div
              style={{
                marginTop: 24,
                background: "#1e293b",
                border: "1px solid #334155",
                borderRadius: 12,
                padding: 24,
              }}
            >
              <div
                style={{ fontWeight: 600, color: "#f1f5f9", marginBottom: 12 }}
              >
                How to improve your score
              </div>
              <div style={{ color: "#94a3b8", fontSize: 14, lineHeight: 1.8 }}>
                Your resume is missing{" "}
                <strong style={{ color: "#f59e0b" }}>
                  {result.missing_keywords.length} keywords
                </strong>{" "}
                from this job description. Consider naturally adding these to
                your resume where relevant:
                <span style={{ color: "#f59e0b" }}>
                  {" "}
                  {result.missing_keywords.slice(0, 5).join(", ")}
                </span>
                {result.missing_keywords.length > 5 && (
                  <span style={{ color: "#64748b" }}>
                    {" "}
                    and {result.missing_keywords.length - 5} more.
                  </span>
                )}
              </div>
              <div style={{ marginTop: 12, color: "#64748b", fontSize: 13 }}>
                Tip: Don't keyword-stuff. Only add terms that genuinely apply to
                your experience.
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// --- inline styles (kept here to avoid extra CSS files) ---

const cardStyle: React.CSSProperties = {
  background: "#1e293b",
  border: "1px solid #334155",
  borderRadius: 12,
  padding: 24,
};

const uploadLabelStyle = (selected: boolean): React.CSSProperties => ({
  display: "block",
  border: `2px dashed ${selected ? "#6366f1" : "#334155"}`,
  borderRadius: 8,
  padding: "32px 16px",
  textAlign: "center",
  cursor: "pointer",
  transition: "border-color 0.2s",
  background: selected ? "#1e1b4b" : "transparent",
});

const textareaStyle: React.CSSProperties = {
  width: "100%",
  height: 160,
  background: "#0f172a",
  border: "1px solid #334155",
  borderRadius: 8,
  padding: 12,
  color: "#e2e8f0",
  fontSize: 14,
  resize: "vertical",
  outline: "none",
  fontFamily: "inherit",
};

const buttonStyle = (loading: boolean): React.CSSProperties => ({
  width: "100%",
  padding: "14px 24px",
  background: loading ? "#4338ca" : "#6366f1",
  color: "#fff",
  border: "none",
  borderRadius: 8,
  fontSize: 16,
  fontWeight: 600,
  cursor: loading ? "not-allowed" : "pointer",
  opacity: loading ? 0.7 : 1,
  transition: "all 0.2s",
});
