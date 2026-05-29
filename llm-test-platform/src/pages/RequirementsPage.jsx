import { useNavigate } from "react-router-dom";
import { useRequirements } from "../context/RequirementsContext";
import { useState } from "react";
import AddRequirementModal from "../components/AddRequirementModal";
import EditRequirementModal from "../components/EditRequirementModal";

// stiliai
const editButtonStyle = {
  background: "#f8fafc",
  border: "1px solid #cbd5e1",
  borderRadius: "6px",
  padding: "6px 0",
  width: "30px",
  fontSize: "12px",
  cursor: "pointer",
  color: "#64748b",
  fontWeight: "600",
  transition: "all 0.2s",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  flexShrink: 0,
};

const getAuditButtonStyle = (isEvaluated, isPending) => ({
  background: isEvaluated ? "#eff6ff" : "#f0fdf4",
  border: `1px solid ${isEvaluated ? "#bfdbfe" : "#a7f3d0"}`,
  borderRadius: "6px",
  padding: "6px 10px",
  width: "auto",
  fontSize: "11px",
  cursor: isPending ? "not-allowed" : "pointer",
  color: isEvaluated ? "#2563eb" : "#059669",
  fontWeight: "700",
  transition: "all 0.2s",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  flexShrink: 0,
  textTransform: "uppercase",
  opacity: isPending ? 0.6 : 1,
  minWidth: "90px",
});

const sidePanelStyle = {
  position: "fixed",
  left: "20px",
  top: "50%",
  transform: "translateY(-50%)",
  display: "flex",
  flexDirection: "column",
  gap: "15px",
  padding: "20px",
  backgroundColor: "white",
  borderRadius: "16px",
  boxShadow: "0 10px 25px rgba(0,0,0,0.1)",
  border: "1px solid #e5e7eb",
  zIndex: 100,
  width: "200px",
  maxHeight: "90vh",
  overflowY: "auto",
};

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
  border: "1px solid #eee",
  transition: "all 0.2s ease",
};

const buttonStyle = {
  backgroundColor: "#2563eb",
  color: "white",
  border: "none",
  padding: "10px 15px",
  borderRadius: "8px",
  cursor: "pointer",
  fontWeight: "600",
  fontSize: "14px",
  transition: "background 0.2s",
  textAlign: "center",
};

const secondaryButtonStyle = {
  backgroundColor: "#f3f4f6",
  color: "#374151",
  border: "1px solid #d1d5db",
  padding: "8px 12px",
  borderRadius: "8px",
  cursor: "pointer",
  fontWeight: "500",
  fontSize: "13px",
  textAlign: "center",
};

export default function RequirementsPage() {
  const navigate = useNavigate();
  const { requirements, loading, refreshData } = useRequirements();
  const [typeFilter, setTypeFilter] = useState("ALL");
  const [selectedReqs, setSelectedReqs] = useState(new Set());
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedReq, setSelectedReq] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [evaluatingReqs, setEvaluatingReqs] = useState({});

  const AVAILABLE_MODELS = [
    { id: "gpt-5.2", label: "GPT-5.2" },
    { id: "gpt-4.1", label: "GPT-4.1" },
    { id: "gemini-3-pro-preview", label: "Gemini-3 Pro" },
    { id: "gemini-2.5-flash", label: "Gemini 2.5 Flash" },
    { id: "llama-3.3-70b-versatile", label: "LLaMA 3.3" },
  ];

  const [selectedModels, setSelectedModels] = useState(
    AVAILABLE_MODELS.map((m) => m.id),
  );

  const lastIdNum = requirements.reduce((max, req) => {
    const num = parseInt(req.reqId.replace("REQ-", "").replace("NFR-", ""), 10);
    return isNaN(num) ? max : Math.max(max, num);
  }, 0);

  const handleAddRequirement = async (newReq) => {
    try {
      const res = await fetch("http://localhost:4000/requirements", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newReq),
      });
      if (res.ok) {
        setIsModalOpen(false);
        await refreshData();
      }
    } catch (err) {
      console.error(err);
    }
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
      if (response.ok) {
        await refreshData();
      } else {
        const errorData = await response.json();
        alert("Vertinimas nepavyko: " + (errorData.error || "Klaida"));
      }
    } catch (err) {
      console.error("Audit failed:", err);
      alert("Nepavyko pasiekti serverio.");
    } finally {
      setEvaluatingReqs((prev) => ({ ...prev, [reqId]: false }));
    }
  };

  const clearContentForSelected = async () => {
    if (selectedReqs.size === 0) return;
    if (!window.confirm(`Išvalyti testus ${selectedReqs.size} reikalavimams?`))
      return;
    for (const reqId of selectedReqs) {
      await fetch(`http://localhost:4000/requirements/${reqId}/generations`, {
        method: "DELETE",
      });
    }
    setSelectedReqs(new Set());
    await refreshData();
  };

  const generateForSelected = async () => {
    if (selectedReqs.size === 0) return;
    const idsToGenerate = Array.from(selectedReqs);
    for (const reqId of idsToGenerate) {
      await fetch(`http://localhost:4000/requirements/${reqId}/generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ models: selectedModels }),
      });
    }
    setSelectedReqs(new Set());
    await refreshData();
  };

  const deleteSelectedRequirements = async () => {
    if (!window.confirm(`Ištrinti ${selectedReqs.size} reikalavimus?`)) return;
    for (const reqId of selectedReqs) {
      await fetch(`http://localhost:4000/requirements/${reqId}`, {
        method: "DELETE",
      });
    }
    setSelectedReqs(new Set());
    await refreshData();
  };

  const toggleRequirement = (reqId) => {
    setSelectedReqs((prev) => {
      const next = new Set(prev);
      next.has(reqId) ? next.delete(reqId) : next.add(reqId);
      return next;
    });
  };

  const getReqStatus = (req) => {
    if (!req.generations || req.generations.length === 0) return null;
    if (req.generations.some((g) => g.status === "pending")) return "pending";
    if (req.generations.some((g) => g.status === "error")) return "error";
    return "done";
  };

  const visibleRequirements = requirements
    .filter((r) => !r.isDeleted)
    .filter((r) => r.nfrType !== "Ground-Truth")
    .filter((r) => typeFilter === "ALL" || r.nfrType === typeFilter)
    .filter(
      (r) =>
        r.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.reqId.toLowerCase().includes(searchTerm.toLowerCase()),
    )
    .sort((a, b) => {
      const idA = a.reqId.replace(/^\D+/g, "");
      const idB = b.reqId.replace(/^\D+/g, "");

      return parseInt(idA, 10) - parseInt(idB, 10);
    });

  if (loading && requirements.length === 0)
    return <div style={containerStyle}>Kraunama...</div>;

  return (
    <div style={{ ...containerStyle, marginLeft: "250px" }}>
      <div style={sidePanelStyle}>
        <div style={{ marginBottom: "15px" }}>
          <label
            style={{
              fontSize: "12px",
              fontWeight: "600",
              color: "#475569",
              display: "block",
              marginBottom: "5px",
            }}
          >
            Search:
          </label>
          <input
            type="text"
            placeholder="ID or title..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              width: "100%",
              padding: "8px 12px",
              borderRadius: "8px",
              border: "1px solid #d1d5db",
              fontSize: "13px",
              boxSizing: "border-box",
            }}
          />
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          style={{ ...buttonStyle, backgroundColor: "#4f46e5", width: "100%" }}
        >
          ➕ New Req
        </button>
        <button
          style={{ ...buttonStyle, width: "100%" }}
          disabled={selectedReqs.size === 0}
          onClick={generateForSelected}
        >
          Generate ({selectedReqs.size})
        </button>

        <div style={{ borderTop: "1px solid #f1f5f9", paddingTop: "10px" }}>
          <span
            style={{
              fontSize: "12px",
              fontWeight: "600",
              color: "#475569",
              display: "block",
              marginBottom: "8px",
            }}
          >
            Models:
          </span>
          {AVAILABLE_MODELS.map((m) => (
            <label
              key={m.id}
              style={{
                fontSize: "13px",
                display: "flex",
                alignItems: "center",
                gap: "8px",
                marginBottom: "6px",
                cursor: "pointer",
              }}
            >
              <input
                type="checkbox"
                checked={selectedModels.includes(m.id)}
                onChange={() =>
                  setSelectedModels((prev) =>
                    prev.includes(m.id)
                      ? prev.filter((x) => x !== m.id)
                      : [...prev, m.id],
                  )
                }
              />
              {m.label}
            </label>
          ))}
        </div>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "8px",
            borderTop: "1px solid #f1f5f9",
            paddingTop: "10px",
          }}
        >
          <button
            style={secondaryButtonStyle}
            onClick={() =>
              setSelectedReqs(new Set(visibleRequirements.map((r) => r.reqId)))
            }
          >
            Mark All
          </button>
          <button
            style={secondaryButtonStyle}
            onClick={() => setSelectedReqs(new Set())}
          >
            Unmark All
          </button>
          <button
            style={{
              ...secondaryButtonStyle,
              color: "#f59e0b",
              backgroundColor: "#fffbeb",
              borderColor: "#fef3c7",
            }}
            disabled={selectedReqs.size === 0}
            onClick={clearContentForSelected}
          >
            🧹 Clear Content
          </button>
          <button
            style={{
              ...secondaryButtonStyle,
              color: "#dc2626",
              backgroundColor: "#fef2f2",
            }}
            disabled={selectedReqs.size === 0}
            onClick={deleteSelectedRequirements}
          >
            Delete Reqs
          </button>
        </div>

        <button
          onClick={() => navigate("/trash")}
          style={{
            ...secondaryButtonStyle,
            width: "100%",
            marginTop: "10px",
            color: "#64748b",
          }}
        >
          🗑️ Trash ({requirements.filter((r) => r.isDeleted).length})
        </button>
      </div>

      <header
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "30px",
        }}
      >
        <h1 style={{ margin: 0 }}>Reikalavimai</h1>
        <div style={{ display: "flex", gap: "10px" }}>
          <button
            onClick={() => navigate("/firefox")}
            style={{ ...buttonStyle, backgroundColor: "#f97316" }}
          >
            Firefox Tyrimas
          </button>

          <button
            onClick={() => navigate("/statistics")}
            style={{ ...buttonStyle, backgroundColor: "#10b981" }}
          >
            Statistics
          </button>
        </div>
      </header>

      <div
        style={{
          backgroundColor: "#f9fafb",
          padding: "15px 20px",
          borderRadius: "12px",
          marginBottom: "30px",
          border: "1px solid #f1f5f9",
        }}
      >
        <label
          style={{ fontWeight: "600", fontSize: "14px", marginRight: "10px" }}
        >
          Filter by type:
        </label>
        <select
          style={{
            padding: "8px",
            borderRadius: "8px",
            border: "1px solid #d1d5db",
          }}
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
        >
          <option value="ALL">All</option>
          <option value="Performance">Performance</option>
          <option value="Security">Security</option>
          <option value="Usability">Usability</option>
          <option value="Availability">Availability</option>
        </select>
      </div>

      <div>
        {visibleRequirements.map((r) => {
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
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  flex: 1,
                  minWidth: 0,
                }}
              >
                <input
                  type="checkbox"
                  checked={selectedReqs.has(r.reqId)}
                  onChange={() => toggleRequirement(r.reqId)}
                  onClick={(e) => e.stopPropagation()}
                  style={{
                    marginRight: "15px",
                    width: "18px",
                    height: "18px",
                    cursor: "pointer",
                    flexShrink: 0,
                  }}
                />
                <div style={{ overflow: "hidden" }}>
                  <div
                    style={{
                      fontSize: "11px",
                      color: "#2563eb",
                      fontWeight: "800",
                    }}
                  >
                    {r.reqId}
                  </div>
                  <div
                    style={{
                      fontWeight: "600",
                      fontSize: "15px",
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}
                  >
                    {r.title}
                  </div>

                  <div
                    style={{ display: "flex", gap: "12px", marginTop: "4px" }}
                  >
                    <div style={{ fontSize: "10px", color: "#64748b" }}>
                      Models:{" "}
                      <b>
                        {genDoneCount}/{AVAILABLE_MODELS.length}
                      </b>
                    </div>
                    <div
                      style={{
                        fontSize: "10px",
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
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  marginLeft: "20px",
                  flexShrink: 0,
                }}
              >
                {getReqStatus(r) === "done" && (
                  <button
                    disabled={isPending}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleAuditAll(r.reqId);
                    }}
                    style={getAuditButtonStyle(isEvaluated, isPending)}
                    title={
                      isEvaluated
                        ? "Run evaluation again"
                        : "Run LLM Evaluation"
                    }
                  >
                    {isPending
                      ? "Wait..."
                      : isEvaluated
                        ? "Reevaluate"
                        : "Evaluate"}
                  </button>
                )}

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedReq(r);
                    setIsEditModalOpen(true);
                  }}
                  style={editButtonStyle}
                  title="Edit Requirement"
                >
                  ✏️
                </button>

                <span
                  style={{
                    fontSize: "12px",
                    padding: "4px 8px",
                    backgroundColor: "#f1f5f9",
                    borderRadius: "6px",
                    color: "#475569",
                    fontWeight: "600",
                  }}
                >
                  {r.nfrType}
                </span>

                <div style={{ width: "24px", textAlign: "center" }}>
                  {getReqStatus(r) === "pending"}
                  {getReqStatus(r) === "done"}
                  {getReqStatus(r) === "error"}
                </div>
                <span style={{ color: "#cbd5e1" }}>❯</span>
              </div>
            </div>
          );
        })}
      </div>

      <AddRequirementModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        lastId={`REQ-${lastIdNum}`}
        onAdd={handleAddRequirement}
      />
      <EditRequirementModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        requirement={selectedReq}
        onUpdate={refreshData}
      />
    </div>
  );
}
