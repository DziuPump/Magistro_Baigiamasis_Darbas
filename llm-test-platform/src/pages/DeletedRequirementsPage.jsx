import { useNavigate } from "react-router-dom";
import { useRequirements } from "../context/RequirementsContext";

const containerStyle = {
  maxWidth: "1000px",
  margin: "40px auto",
  padding: "0 20px",
  fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
};

const cardStyle = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  padding: "16px",
  backgroundColor: "#fcfcfc",
  borderRadius: "12px",
  marginBottom: "12px",
  border: "1px dashed #cbd5e1",
};

const buttonGroupStyle = {
  display: "flex",
  gap: "10px",
  alignItems: "center",
};

export default function DeletedRequirementsPage() {
  const navigate = useNavigate();
  const { requirements, refreshData } = useRequirements();

  const deletedReqs = requirements.filter((r) => r.isDeleted === true);

  const deletePermanently = async (reqId) => {
    if (
      !window.confirm(
        `Ar tikrai norite visam laikui ištrinti ${reqId}? Šio veiksmo atšaukti nepavyks.`,
      )
    )
      return;

    try {
      const res = await fetch(
        `http://localhost:4000/requirements/${reqId}/force`,
        {
          method: "DELETE",
        },
      );
      if (res.ok) await refreshData();
    } catch (err) {
      console.error("Klaida trinant:", err);
    }
  };

  const restoreRequirement = async (reqId) => {
    try {
      const res = await fetch(
        `http://localhost:4000/requirements/${reqId}/restore`,
        {
          method: "PATCH",
        },
      );
      if (res.ok) await refreshData();
    } catch (err) {
      console.error("Klaida atkuriant:", err);
    }
  };

  return (
    <div style={containerStyle}>
      <header style={{ marginBottom: "30px" }}>
        <button
          onClick={() => navigate("/")}
          style={{
            background: "none",
            border: "none",
            color: "#2563eb",
            cursor: "pointer",
            fontWeight: "600",
            marginBottom: "10px",
            display: "block",
            padding: 0,
          }}
        >
          ← Back to list
        </button>
        <h1 style={{ margin: 0 }}>Trash</h1>
      </header>

      {deletedReqs.length === 0 ? (
        <div style={{ textAlign: "center", padding: "50px", color: "#64748b" }}>
          Trash is empty :)
        </div>
      ) : (
        deletedReqs.map((r) => (
          <div key={r._id} style={cardStyle}>
            <div
              onClick={() => navigate(`/requirements/${r.reqId}`)}
              style={{ cursor: "pointer", flex: 1 }}
            >
              <div
                style={{
                  fontSize: "11px",
                  color: "#64748b",
                  fontWeight: "800",
                  marginBottom: "2px",
                }}
              >
                {r.reqId}
              </div>
              <div
                style={{
                  fontWeight: "600",
                  fontSize: "15px",
                  color: "#475569",
                  textDecoration: "underline",
                }}
              >
                {r.title}
              </div>
            </div>

            <div style={buttonGroupStyle}>
              <button
                onClick={() => restoreRequirement(r.reqId)}
                style={{
                  backgroundColor: "#ecfdf5",
                  color: "#059669",
                  border: "1px solid #10b981",
                  padding: "8px 16px",
                  borderRadius: "8px",
                  cursor: "pointer",
                  fontWeight: "600",
                }}
              >
                Restore
              </button>
              <button
                onClick={() => deletePermanently(r.reqId)}
                style={{
                  backgroundColor: "#fef2f2",
                  color: "#dc2626",
                  border: "1px solid #fecaca",
                  padding: "8px 16px",
                  borderRadius: "8px",
                  cursor: "pointer",
                  fontWeight: "600",
                }}
              >
                Permanent Delete
              </button>
            </div>
          </div>
        ))
      )}
    </div>
  );
}
