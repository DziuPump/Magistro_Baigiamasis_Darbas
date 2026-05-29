import { useRequirements } from "../context/RequirementsContext";
import { useNavigate } from "react-router-dom";

export default function StatusWidget() {
  const { requirements } = useRequirements();
  const navigate = useNavigate();

  // log patikrinimui
  console.log("Visi reikalavimai:", requirements);

  const activeGenerations = requirements.flatMap((req) => {
    const gens = req.generations || [];
    gens.forEach((g) =>
      console.log(`Req: ${req.reqId}, Model: ${g.model}, Status: ${g.status}`),
    );

    return gens
      .filter(
        (gen) =>
          gen.status?.toLowerCase() === "pending" ||
          gen.status?.toLowerCase() === "generating",
      )
      .map((gen) => ({
        id: req._id || req.reqId,
        reqId: req.reqId,
        title: req.title,
        model: gen.model,
      }));
  });

  if (activeGenerations.length === 0) return null;

  return (
    <div
      style={{
        position: "fixed",
        bottom: "24px",
        right: "24px",
        width: "320px",
        backgroundColor: "#ffffff",
        borderRadius: "16px",
        boxShadow:
          "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
        border: "1px solid #e2e8f0",
        zIndex: 9999,
        overflow: "hidden",
        animation: "slideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1)",
      }}
    >
      <div
        style={{
          padding: "16px",
          borderBottom: "1px solid #f1f5f9",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          backgroundColor: "#f8fafc",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <div className="pulse-dot"></div>
          <span
            style={{ fontWeight: "700", fontSize: "14px", color: "#1e293b" }}
          >
            Generating...
          </span>
        </div>
        <span
          style={{
            fontSize: "12px",
            backgroundColor: "#e0e7ff",
            color: "#4338ca",
            padding: "2px 8px",
            borderRadius: "12px",
            fontWeight: "600",
          }}
        >
          {activeGenerations.length}
        </span>
      </div>

      <div style={{ maxHeight: "300px", overflowY: "auto" }}>
        {activeGenerations.map((gen, i) => (
          <div
            key={`${gen.reqId}-${gen.model}-${i}`}
            onClick={() => navigate(`/requirements/${gen.reqId}`)}
            style={{
              padding: "12px 16px",
              borderBottom:
                i !== activeGenerations.length - 1
                  ? "1px solid #f1f5f9"
                  : "none",
              cursor: "pointer",
              transition: "background 0.2s",
            }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.backgroundColor = "#f1f5f9")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.backgroundColor = "transparent")
            }
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginBottom: "4px",
              }}
            >
              <span
                style={{
                  fontSize: "12px",
                  fontWeight: "700",
                  color: "#2563eb",
                }}
              >
                {gen.reqId}
              </span>
              <span
                style={{
                  fontSize: "11px",
                  color: "#64748b",
                  fontWeight: "500",
                }}
              >
                {gen.model}
              </span>
            </div>
            <div
              style={{
                fontSize: "13px",
                color: "#334155",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {gen.title}
            </div>
          </div>
        ))}
      </div>

      <style>{`
        @keyframes slideUp {
          from { transform: translateY(20px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        .pulse-dot {
          width: 8px;
          height: 8px;
          background-color: #22c55e;
          border-radius: 50%;
          box-shadow: 0 0 0 rgba(34, 197, 94, 0.4);
          animation: pulse 2s infinite;
        }
        @keyframes pulse {
          0% { box-shadow: 0 0 0 0 rgba(34, 197, 94, 0.7); }
          70% { box-shadow: 0 0 0 10px rgba(34, 197, 94, 0); }
          100% { box-shadow: 0 0 0 0 rgba(34, 197, 94, 0); }
        }
      `}</style>
    </div>
  );
}
