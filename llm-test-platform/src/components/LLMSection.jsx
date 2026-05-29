import { MODEL_PRICING } from "./pricing";

export default function LLMSection({ model, data, onEvaluate }) {
  if (!data) return null;

  const getScoreColor = (score) => {
    if (!score) return "#cbd5e1";
    if (score >= 4.5) return "#10b981";
    if (score >= 3.5) return "#f59e0b";
    return "#ef4444";
  };

  const calculateDetailedCost = () => {
    const pricing = MODEL_PRICING[model];
    if (!pricing || !data.usage) return null;

    const inputTokens = data.usage.promptTokens || 0;
    const outputTokens = data.usage.completionTokens || 0;
    const inputCost = (inputTokens / 1_000_000) * pricing.inputPer1M;
    const outputCost = (outputTokens / 1_000_000) * pricing.outputPer1M;

    return {
      inputTokens,
      outputTokens,
      totalTokens: inputTokens + outputTokens,
      totalCost: (inputCost + outputCost).toFixed(5),
    };
  };

  const details = calculateDetailedCost();

  const metrics = [
    { label: "Coverage", key: "coverage" },
    { label: "BVA", key: "bva" },
    { label: "EP", key: "ep" },
    { label: "Logic", key: "logic" },
    { label: "Verifiability", key: "verifiability" },
    { label: "NFR Focus", key: "nfrFocus" },
    { label: "Redundancy", key: "redundancy" },
  ];

  return (
    <div
      style={{
        backgroundColor: "#fff",
        borderRadius: "12px",
        border: `1px solid #e5e7eb`,
        boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
        padding: "24px",
        marginBottom: "24px",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "20px",
        }}
      >
        <h3
          style={{
            margin: 0,
            fontSize: "1.25rem",
            color: "#111827",
            fontWeight: "700",
          }}
        >
          {model}
        </h3>
        <span
          style={{
            backgroundColor: data.status === "done" ? "#f0fdf4" : "#eef2ff",
            color: data.status === "done" ? "#15803d" : "#4338ca",
            border: `1px solid ${
              data.status === "done" ? "#bbf7d0" : "#c7d2fe"
            }`,
            padding: "4px 12px",
            borderRadius: "9999px",
            fontSize: "0.875rem",
            fontWeight: 600,
          }}
        >
          {data.status === "done" ? "✅ Sugeneruota" : "⏳ Generuojama..."}
        </span>
      </div>

      {data.status === "done" && (
        <div style={{ display: "grid", gap: "20px" }}>
          <div
            style={{
              padding: "16px",
              backgroundColor: "#f8fafc",
              borderRadius: "10px",
              border: "1px solid #e2e8f0",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "12px",
              }}
            >
              <h4 style={{ margin: 0, fontSize: "14px", color: "#1e293b" }}>
                QA Quality Audit
              </h4>
              <div
                style={{ display: "flex", alignItems: "center", gap: "12px" }}
              >
                {data.evaluation?.totalAvg && (
                  <div
                    style={{
                      fontWeight: "700",
                      fontSize: "16px",
                      color: getScoreColor(data.evaluation.totalAvg),
                    }}
                  >
                    Score: {data.evaluation.totalAvg}/5
                  </div>
                )}
                <button
                  onClick={onEvaluate}
                  style={
                    data.evaluation ? reAuditButtonStyle : auditButtonStyle
                  }
                >
                  {data.evaluation ? "Re-run Audit" : "Run AI Audit"}
                </button>
              </div>
            </div>

            {data.evaluation?.scores && (
              <div style={{ fontSize: "13px" }}>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(80px, 1fr))",
                    gap: "8px",
                    marginBottom: "16px",
                  }}
                >
                  {metrics.map((item) => (
                    <div key={item.key} style={metricStyle}>
                      <div
                        style={{
                          fontSize: "9px",
                          color: "#64748b",
                          textTransform: "uppercase",
                          marginBottom: "4px",
                        }}
                      >
                        {item.label}
                      </div>
                      <b
                        style={{
                          fontSize: "15px",
                          color: getScoreColor(
                            data.evaluation.scores[item.key],
                          ),
                        }}
                      >
                        {data.evaluation.scores[item.key] || 0}
                      </b>
                    </div>
                  ))}
                </div>
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "10px",
                    marginBottom: "12px",
                  }}
                >
                  {Object.entries(data.evaluation.justification || {}).map(
                    ([key, text]) => (
                      <div
                        key={key}
                        style={{
                          paddingLeft: "10px",
                          borderLeft: `3px solid ${getScoreColor(
                            data.evaluation.scores[key],
                          )}`,
                          fontSize: "12px",
                          color: "#475569",
                          lineHeight: "1.4",
                        }}
                      >
                        <strong
                          style={{
                            textTransform: "capitalize",
                            color: "#1e293b",
                          }}
                        >
                          {key.replace(/([A-Z])/g, " $1")}:
                        </strong>{" "}
                        {text}
                      </div>
                    ),
                  )}
                </div>

                {data.evaluation.missingParts?.length > 0 && (
                  <div
                    style={{
                      marginTop: "10px",
                      padding: "10px",
                      backgroundColor: "#fff1f2",
                      borderRadius: "6px",
                      color: "#991b1b",
                      fontSize: "11px",
                      fontWeight: "600",
                      border: "1px solid #fecaca",
                    }}
                  >
                    ⚠️ Missing: {data.evaluation.missingParts.join(", ")}
                  </div>
                )}
              </div>
            )}
          </div>

          {details && (
            <div
              style={{
                fontSize: "12px",
                color: "#64748b",
                borderTop: "1px solid #f1f5f9",
                paddingTop: "12px",
              }}
            >
              <b>Cost:</b> ${details.totalCost} | <b>Tokens:</b>{" "}
              {details.totalTokens.toLocaleString()} | <b>Time:</b>{" "}
              {(data.durationMs / 1000).toFixed(2)}s
            </div>
          )}

          {data.similarityMetrics && (
            <div
              style={{
                padding: "12px",
                backgroundColor: "#f0fdf4",
                borderRadius: "8px",
                border: "1px solid #bbf7d0",
                display: "flex",
                gap: "20px",
              }}
            >
              <div>
                <span
                  style={{
                    fontSize: "12px",
                    color: "#166534",
                    display: "block",
                  }}
                >
                  RECALL
                </span>
                <strong style={{ fontSize: "18px", color: "#15803d" }}>
                  {(data.similarityMetrics.recall * 100).toFixed(0)}%
                </strong>
              </div>
              <div>
                <span
                  style={{
                    fontSize: "12px",
                    color: "#166534",
                    display: "block",
                  }}
                >
                  PRECISION
                </span>
                <strong style={{ fontSize: "18px", color: "#15803d" }}>
                  {(data.similarityMetrics.precision * 100).toFixed(0)}%
                </strong>
              </div>
              <div
                style={{
                  fontSize: "12px",
                  color: "#64748b",
                  alignSelf: "center",
                }}
              >
                Matched <b>{data.similarityMetrics.num_mat_uniq_truth}</b> of{" "}
                <b>{data.similarityMetrics.num_truth}</b> truth scenarios
              </div>
            </div>
          )}

          <div>
            <h4
              style={{
                marginBottom: "12px",
                color: "#1e293b",
                fontSize: "1rem",
              }}
            >
              Test Scenarios
            </h4>
            <div
              style={{ display: "flex", flexDirection: "column", gap: "10px" }}
            >
              {data.testScenarios?.map((ts, i) => (
                <details
                  key={i}
                  style={{
                    border: "1px solid #f1f5f9",
                    borderRadius: "8px",
                    backgroundColor: "#f8fafc",
                  }}
                >
                  <summary
                    style={{
                      padding: "14px",
                      cursor: "pointer",
                      fontWeight: 600,
                      fontSize: "14px",
                      color: "#334155",
                    }}
                  >
                    {ts.title}
                  </summary>
                  <div
                    style={{
                      padding: "16px",
                      backgroundColor: "#fff",
                      borderTop: "1px solid #f1f5f9",
                      fontSize: "14px",
                    }}
                  >
                    <p style={{ margin: "0 0 8px 0" }}>
                      <b>Steps:</b>
                    </p>
                    <ol style={{ paddingLeft: "20px", margin: 0 }}>
                      {ts.steps?.map((s, si) => (
                        <li key={si} style={{ marginBottom: "4px" }}>
                          {s}
                        </li>
                      ))}
                    </ol>
                    <div
                      style={{
                        marginTop: "12px",
                        padding: "10px",
                        backgroundColor: "#f0fdf4",
                        borderRadius: "6px",
                        border: "1px solid #dcfce7",
                      }}
                    >
                      <b
                        style={{
                          color: "#166534",
                          fontSize: "11px",
                          textTransform: "uppercase",
                        }}
                      >
                        Expected Result
                      </b>
                      <p
                        style={{
                          margin: "4px 0 0 0",
                          color: "#15803d",
                          fontWeight: "500",
                        }}
                      >
                        {ts.expectedResult}
                      </p>
                    </div>
                  </div>
                </details>
              ))}
            </div>
          </div>
        </div>
      )}

      {data.status === "error" && (
        <div
          style={{
            marginTop: "16px",
            padding: "12px",
            backgroundColor: "#fef2f2",
            border: "1px solid #fee2e2",
            borderRadius: "8px",
            color: "#991b1b",
            fontSize: "14px",
          }}
        >
          <b>Error:</b> {data.errorMessage || "Unknown error occurred."}
        </div>
      )}
    </div>
  );
}

const auditButtonStyle = {
  padding: "6px 12px",
  backgroundColor: "#4f46e5",
  color: "white",
  border: "none",
  borderRadius: "6px",
  cursor: "pointer",
  fontSize: "12px",
  fontWeight: "600",
};

const reAuditButtonStyle = {
  ...auditButtonStyle,
  backgroundColor: "transparent",
  color: "#64748b",
  border: "1px solid #cbd5e1",
};

const metricStyle = {
  padding: "8px",
  backgroundColor: "#fff",
  borderRadius: "6px",
  border: "1px solid #e2e8f0",
  textAlign: "center",
  minWidth: "70px",
};
