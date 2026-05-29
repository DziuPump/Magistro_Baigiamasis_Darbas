import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import LLMSection from "../components/LLMSection";
import { useRequirements } from "../context/RequirementsContext";

// stiliai
const infoGridStyle = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
  gap: "20px",
  marginBottom: "30px",
};

const infoBoxStyle = {
  backgroundColor: "#f8fafc",
  padding: "16px",
  borderRadius: "12px",
  border: "1px solid #e2e8f0",
};

const labelStyle = {
  display: "block",
  fontSize: "11px",
  fontWeight: "700",
  color: "#64748b",
  textTransform: "uppercase",
  letterSpacing: "0.5px",
  marginBottom: "4px",
};

const criteriaListStyle = {
  paddingLeft: "20px",
  margin: "10px 0",
  color: "#334155",
  lineHeight: "1.6",
};

export default function RequirementDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { reloadRequirements } = useRequirements();
  const [requirement, setRequirement] = useState(null);
  const [loading, setLoading] = useState(true);

  const MODELS = [
    { id: "gpt-5.2", label: "GPT-5.2" },
    { id: "gpt-4.1", label: "GPT-4.1" },
    { id: "gemini-3-pro-preview", label: "Gemini-3 Pro" },
    { id: "gemini-2.5-flash", label: "Gemini 2.5 Flash" },
    { id: "llama-3.3-70b-versatile", label: "LLaMA 3.3" },
  ];

  const fetchRequirement = async () => {
    try {
      const res = await fetch(`http://localhost:4000/requirements/${id}`);
      const data = await res.json();
      setRequirement(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequirement();
  }, [id]);

  useEffect(() => {
    if (!requirement) return;
    const hasActive = requirement.generations?.some(
      (g) => g.status === "pending" || g.status === "generating",
    );
    if (hasActive) {
      const interval = setInterval(fetchRequirement, 2000);
      return () => clearInterval(interval);
    }
  }, [requirement]);

  const handleGenerate = async (modelIds) => {
    const res = await fetch(
      `http://localhost:4000/requirements/${id}/generate`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ models: modelIds }),
      },
    );
    setRequirement(await res.json());
    await reloadRequirements();
  };

  const handleEvaluate = async (modelName) => {
    try {
      const res = await fetch(
        `http://localhost:4000/requirements/${id}/evaluate/${modelName}`,
        {
          method: "POST",
        },
      );
      if (!res.ok) throw new Error("Nepavyko atlikti audito");

      fetchRequirement();
    } catch (err) {
      alert("Klaida: " + err.message);
    }
  };

  // FUNKCIJA KOSINUSINIAM PANASUMUI
  const handleCalculateSimilarity = async () => {
    try {
      const res = await fetch(
        `http://localhost:4000/requirements/${requirement.reqId}/calculate-similarity`,
        {
          method: "POST",
        },
      );

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Nepavyko apskaičiuoti panašumo");
      }

      alert("Matematinis palyginimas sėkmingai baigtas!");
      fetchRequirement();
    } catch (err) {
      alert("Klaida: " + err.message);
    }
  };

  if (loading)
    return (
      <div style={{ padding: "40px", textAlign: "center" }}>
        Loading details...
      </div>
    );
  if (!requirement)
    return (
      <div style={{ padding: "40px", textAlign: "center" }}>
        Requirement not found.
      </div>
    );

  return (
    <div
      style={{
        maxWidth: "1000px",
        margin: "40px auto",
        padding: "0 20px 100px 20px",
        fontFamily: "'Inter', sans-serif",
      }}
    >
      <button
        onClick={() =>
          navigate(requirement.nfrType === "Ground-Truth" ? "/firefox" : "/")
        }
        style={{
          background: "none",
          border: "none",
          color: "#64748b",
          cursor: "pointer",
          marginBottom: "20px",
          fontSize: "14px",
          fontWeight: "600",
        }}
      >
        ←{" "}
        {requirement.nfrType === "Ground-Truth"
          ? "Back to Firefox Modules"
          : "Back to Requirements"}
      </button>

      {requirement.isDeleted && (
        <div
          style={{
            backgroundColor: "#fff7ed",
            border: "1px solid #ffedd5",
            padding: "16px",
            borderRadius: "12px",
            marginBottom: "24px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <span style={{ color: "#9a3412", fontWeight: "600" }}>
            This requirement is in the trash bin.
          </span>
          <button
            onClick={async () => {
              await fetch(
                `http://localhost:4000/requirements/${requirement.reqId}/restore`,
                { method: "PATCH" },
              );
              fetchRequirement();
            }}
            style={{
              backgroundColor: "#f97316",
              color: "white",
              border: "none",
              padding: "8px 16px",
              borderRadius: "8px",
              cursor: "pointer",
            }}
          >
            Restore
          </button>
        </div>
      )}

      <div
        style={{
          backgroundColor: "white",
          padding: "32px",
          borderRadius: "16px",
          boxShadow: "0 4px 6px rgba(0,0,0,0.05)",
          border: "1px solid #f3f4f6",
          marginBottom: "30px",
        }}
      >
        <div
          style={{
            display: "flex",
            gap: "10px",
            alignItems: "center",
            marginBottom: "15px",
          }}
        >
          <span
            style={{
              backgroundColor: "#eff6ff",
              color: "#2563eb",
              padding: "4px 10px",
              borderRadius: "6px",
              fontSize: "12px",
              fontWeight: "800",
            }}
          >
            {requirement.reqId}
          </span>
          <span style={{ color: "#64748b", fontSize: "14px" }}>•</span>
          <span
            style={{ color: "#64748b", fontSize: "14px", fontWeight: "600" }}
          >
            {requirement.nfrType}
          </span>
        </div>

        <h1
          style={{
            fontSize: "28px",
            fontWeight: "800",
            color: "#1e293b",
            margin: "0 0 16px 0",
          }}
        >
          {requirement.title}
        </h1>
        <p
          style={{
            fontSize: "16px",
            color: "#475569",
            lineHeight: "1.6",
            margin: "0 0 24px 0",
          }}
        >
          {requirement.description}
        </p>

        <div style={infoGridStyle}>
          <div style={infoBoxStyle}>
            <span style={labelStyle}>System</span>
            <span style={{ fontWeight: "600", color: "#1e293b" }}>
              {requirement.context?.system || "N/A"}
            </span>
          </div>
          <div style={infoBoxStyle}>
            <span style={labelStyle}>Platform</span>
            <span style={{ fontWeight: "600", color: "#1e293b" }}>
              {requirement.context?.platform || "N/A"}
            </span>
          </div>
          <div style={infoBoxStyle}>
            <span style={labelStyle}>Suggested Standard</span>
            <span style={{ fontWeight: "600", color: "#2563eb" }}>
              {requirement.standard || "None"}
            </span>
          </div>
        </div>

        <div
          style={{
            ...infoBoxStyle,
            marginBottom: "20px",
            backgroundColor: "#f1f5f9",
          }}
        >
          <span style={labelStyle}>Architecture Context</span>
          <span style={{ fontSize: "14px", color: "#334155" }}>
            {requirement.context?.architecture || "N/A"}
          </span>
        </div>

        <div
          style={{
            marginTop: "24px",
            borderTop: "1px solid #f1f5f9",
            paddingTop: "24px",
          }}
        >
          <h3
            style={{
              fontSize: "16px",
              fontWeight: "700",
              marginBottom: "12px",
              color: "#1e293b",
            }}
          >
            Acceptance Criteria
          </h3>
          <ul style={criteriaListStyle}>
            {requirement.acceptanceCriteria?.map((criterion, index) => (
              <li key={index} style={{ marginBottom: "8px" }}>
                {criterion}
              </li>
            )) || <li>No criteria defined</li>}
          </ul>
        </div>
        {requirement.groundTruthScenarios &&
          requirement.groundTruthScenarios.length > 0 && (
            <div
              style={{
                marginTop: "32px",
                borderTop: "1px solid #f1f5f9",
                paddingTop: "24px",
              }}
            >
              <h3
                style={{
                  fontSize: "18px",
                  fontWeight: "800",
                  marginBottom: "16px",
                  color: "#c2410c",
                }}
              >
                Ground Truth Scenarios (
                {requirement.groundTruthScenarios.length})
              </h3>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "16px",
                }}
              >
                {requirement.groundTruthScenarios.map((scenario, idx) => (
                  <div
                    key={idx}
                    style={{
                      backgroundColor: "#fff7ed",
                      padding: "16px",
                      borderRadius: "12px",
                      border: "1px solid #fed7aa",
                    }}
                  >
                    <h4
                      style={{
                        margin: "0 0 10px 0",
                        color: "#9a3412",
                        fontSize: "15px",
                      }}
                    >
                      {idx + 1}. {scenario.title}
                    </h4>

                    {scenario.preconditions && (
                      <p
                        style={{
                          margin: "0 0 8px 0",
                          fontSize: "14px",
                          color: "#475569",
                        }}
                      >
                        <strong style={{ color: "#1e293b" }}>
                          Preconditions:
                        </strong>{" "}
                        {scenario.preconditions}
                      </p>
                    )}

                    <div
                      style={{
                        margin: "0 0 8px 0",
                        fontSize: "14px",
                        color: "#475569",
                      }}
                    >
                      <strong style={{ color: "#1e293b" }}>Steps:</strong>
                      <ol style={{ margin: "4px 0 0 0", paddingLeft: "20px" }}>
                        {scenario.steps.map((step, sIdx) => (
                          <li key={sIdx} style={{ marginBottom: "4px" }}>
                            {step}
                          </li>
                        ))}
                      </ol>
                    </div>

                    <p
                      style={{
                        margin: "8px 0 0 0",
                        fontSize: "14px",
                        color: "#475569",
                      }}
                    >
                      <strong style={{ color: "#1e293b" }}>
                        Expected Result:
                      </strong>{" "}
                      {scenario.expectedResult}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
      </div>

      {!requirement.isDeleted && (
        <div
          style={{
            display: "flex",
            gap: "10px",
            marginBottom: "40px",
            flexWrap: "wrap",
            alignItems: "center",
          }}
        >
          <button
            onClick={() => handleGenerate(MODELS.map((m) => m.id))}
            style={{
              backgroundColor: "#4f46e5",
              color: "white",
              border: "none",
              padding: "12px 20px",
              borderRadius: "8px",
              fontWeight: "700",
              cursor: "pointer",
            }}
          >
            🚀 Generate Tests (All LLMs)
          </button>

          {requirement.nfrType === "Ground-Truth" && (
            <button
              onClick={handleCalculateSimilarity}
              style={{
                backgroundColor: "#f97316",
                color: "white",
                border: "none",
                padding: "12px 20px",
                borderRadius: "8px",
                fontWeight: "700",
                cursor: "pointer",
                boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
              }}
            >
              📐 Calculate Cosine Similarity
            </button>
          )}

          {MODELS.map((m) => (
            <button
              key={m.id}
              onClick={() => handleGenerate([m.id])}
              style={{
                backgroundColor: "white",
                border: "1px solid #d1d5db",
                padding: "10px 14px",
                borderRadius: "8px",
                cursor: "pointer",
                fontSize: "13px",
                fontWeight: "500",
              }}
            >
              {m.label}
            </button>
          ))}

          <button
            onClick={async () => {
              if (window.confirm("Clear all generations?")) {
                await fetch(
                  `http://localhost:4000/requirements/${id}/generations`,
                  { method: "DELETE" },
                );
                fetchRequirement();
              }
            }}
            style={{
              marginLeft: "auto",
              color: "#ef4444",
              background: "none",
              border: "none",
              cursor: "pointer",
              fontWeight: "600",
            }}
          >
            🗑️ Clear results
          </button>
        </div>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
        {requirement.generations?.length > 0 ? (
          requirement.generations.map((gen, i) => (
            <LLMSection
              key={i}
              model={gen.model}
              data={gen}
              onEvaluate={() => handleEvaluate(gen.model)}
            />
          ))
        ) : (
          <div
            style={{
              textAlign: "center",
              padding: "60px",
              backgroundColor: "#f8fafc",
              borderRadius: "16px",
              border: "2px dashed #e2e8f0",
            }}
          >
            <p style={{ color: "#94a3b8", fontWeight: "500" }}>
              No test scenarios generated for this requirement yet.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
