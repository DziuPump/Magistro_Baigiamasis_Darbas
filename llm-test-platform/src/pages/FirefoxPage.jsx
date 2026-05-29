import { useNavigate } from "react-router-dom";
import { useRequirements } from "../context/RequirementsContext";
import { useState } from "react";

// STILIAI
const getAuditButtonStyle = (isEvaluated, isPending) => ({
  background: isEvaluated ? "#eff6ff" : "#f0fdf4",
  border: `1px solid ${isEvaluated ? "#bfdbfe" : "#a7f3d0"}`,
  borderRadius: "6px",
  padding: "6px 10px",
  fontSize: "11px",
  cursor: isPending ? "not-allowed" : "pointer",
  color: isEvaluated ? "#2563eb" : "#059669",
  fontWeight: "700",
  textTransform: "uppercase",
  minWidth: "90px",
});

const containerStyle = {
  maxWidth: "1000px",
  margin: "40px auto",
  padding: "0 20px 100px 20px",
  fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
  color: "#333",
};

const cardStyle = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  padding: "16px",
  backgroundColor: "white",
  borderRadius: "12px",
  marginBottom: "12px",
  boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
  cursor: "pointer",
  border: "1px solid #f97316",
  transition: "all 0.2s ease",
};

const buttonStyle = {
  backgroundColor: "#f97316",
  color: "white",
  border: "none",
  padding: "10px 15px",
  borderRadius: "8px",
  cursor: "pointer",
  fontWeight: "600",
  fontSize: "14px",
};

export default function FirefoxPage() {
  const navigate = useNavigate();
  const { requirements, loading, refreshData } = useRequirements();
  const [evaluatingReqs, setEvaluatingReqs] = useState({});

  const AVAILABLE_MODELS = [
    { id: "gpt-5.2", label: "GPT-5.2" },
    { id: "gpt-4.1", label: "GPT-4.1" },
    { id: "gemini-3-pro-preview", label: "Gemini-3 Pro" },
    { id: "gemini-2.5-flash", label: "Gemini 2.5 Flash" },
    { id: "llama-3.3-70b-versatile", label: "LLaMA 3.3" },
  ];

  // filtras Firefox duomenims
  const firefoxReqs = requirements.filter(
    (r) => r.nfrType === "Ground-Truth" && !r.isDeleted,
  );

  const getReqStatus = (req) => {
    if (!req.generations || req.generations.length === 0) return null;
    if (req.generations.some((g) => g.status === "pending")) return "pending";
    if (req.generations.some((g) => g.status === "error")) return "error";
    return "done";
  };

  const handleAuditAll = async (reqId) => {
    setEvaluatingReqs((prev) => ({ ...prev, [reqId]: true }));
    try {
      const response = await fetch(
        `http://localhost:4000/requirements/${reqId}/evaluate-all`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
        },
      );
      if (response.ok) await refreshData();
    } catch (err) {
      console.error("Audit failed:", err);
    } finally {
      setEvaluatingReqs((prev) => ({ ...prev, [reqId]: false }));
    }
  };

  if (loading && requirements.length === 0)
    return <div style={containerStyle}>Kraunama...</div>;

  return (
    <div style={containerStyle}>
      <header
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "30px",
        }}
      >
        <div>
          <button
            onClick={() => navigate("/")}
            style={{
              background: "none",
              border: "none",
              color: "#64748b",
              cursor: "pointer",
              marginBottom: "10px",
              padding: 0,
            }}
          >
            ← Atgal į pagrindinį
          </button>
          <h1 style={{ margin: 0, color: "#c2410c" }}>
            Firefox Tyrimas (Ground Truth)
          </h1>
          <p
            style={{ margin: "5px 0 0 0", color: "#64748b", fontSize: "14px" }}
          >
            Šie moduliai naudojami lyginant LLM sugeneruotus testus su realiais
            Mozilla inžinierių etalonais.
          </p>
        </div>
      </header>

      <div>
        {firefoxReqs.map((r) => {
          const genDoneCount =
            r.generations?.filter((g) => g.status === "done").length || 0;
          const evalDoneCount =
            r.generations?.filter(
              (g) => g.status === "done" && g.evaluation?.scores,
            ).length || 0;
          const isEvaluated = evalDoneCount > 0;
          const isPending = evaluatingReqs[r.reqId];

          return (
            <div
              key={r._id}
              style={cardStyle}
              onClick={() => navigate(`/requirements/${r.reqId}`)}
            >
              <div style={{ display: "flex", alignItems: "center", flex: 1 }}>
                <div style={{ overflow: "hidden" }}>
                  <div
                    style={{
                      fontSize: "11px",
                      color: "#f97316",
                      fontWeight: "800",
                    }}
                  >
                    {r.reqId}
                  </div>
                  <div
                    style={{
                      fontWeight: "600",
                      fontSize: "16px",
                      color: "#1e293b",
                    }}
                  >
                    {r.title}
                  </div>
                  <div
                    style={{ display: "flex", gap: "12px", marginTop: "4px" }}
                  >
                    <div style={{ fontSize: "11px", color: "#64748b" }}>
                      Models:{" "}
                      <b>
                        {genDoneCount}/{AVAILABLE_MODELS.length}
                      </b>
                    </div>
                    <div
                      style={{
                        fontSize: "11px",
                        color:
                          evalDoneCount === genDoneCount && genDoneCount > 0
                            ? "#059669"
                            : "#64748b",
                        fontWeight: evalDoneCount > 0 ? "700" : "400",
                      }}
                    >
                      Evaluated:{" "}
                      <b>
                        {evalDoneCount}/{genDoneCount}
                      </b>
                    </div>
                  </div>
                </div>
              </div>

              <div
                style={{ display: "flex", alignItems: "center", gap: "10px" }}
              >
                {getReqStatus(r) === "done" && (
                  <button
                    disabled={isPending}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleAuditAll(r.reqId);
                    }}
                    style={getAuditButtonStyle(isEvaluated, isPending)}
                  >
                    {isPending
                      ? "Wait..."
                      : isEvaluated
                        ? "Reevaluate"
                        : "Evaluate"}
                  </button>
                )}
                <span
                  style={{
                    fontSize: "12px",
                    padding: "4px 8px",
                    backgroundColor: "#fff7ed",
                    borderRadius: "6px",
                    color: "#c2410c",
                    fontWeight: "600",
                  }}
                >
                  Etalonas ({r.groundTruthScenarios?.length || 0} testai)
                </span>
                <span style={{ color: "#cbd5e1", marginLeft: "10px" }}>❯</span>
              </div>
            </div>
          );
        })}
        {firefoxReqs.length === 0 && (
          <div
            style={{ textAlign: "center", padding: "40px", color: "#94a3b8" }}
          >
            Nėra Firefox modulių. Patikrinkite duomenų bazę.
          </div>
        )}
      </div>
    </div>
  );
}
