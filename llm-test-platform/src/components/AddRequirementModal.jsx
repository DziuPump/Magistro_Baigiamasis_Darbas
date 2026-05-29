import React, { useState, useEffect } from "react";

export default function AddRequirementModal({
  isOpen,
  onClose,
  lastId,
  onAdd,
}) {
  const [formData, setFormData] = useState({
    reqId: "",
    title: "",
    type: "US",
    description: "",
  });

  useEffect(() => {
    if (isOpen) {
      const nextNum = lastId ? parseInt(lastId.replace("REQ-", ""), 10) + 1 : 1;
      setFormData({
        reqId: `REQ-${nextNum}`,
        title: "",
        type: "US",
        description: "",
      });
    }
  }, [isOpen, lastId]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    onAdd(formData);
  };

  return (
    <div style={overlayStyle} onClick={onClose}>
      <div style={modalStyle} onClick={(e) => e.stopPropagation()}>
        <h2 style={{ marginTop: 0, marginBottom: "20px" }}>
          Naujas reikalavimas
        </h2>

        <form
          onSubmit={handleSubmit}
          style={{ display: "flex", flexDirection: "column", gap: "15px" }}
        >
          <div>
            <label style={labelStyle}>ID (pvz. REQ-401)</label>
            <input
              style={inputStyle}
              value={formData.reqId}
              onChange={(e) =>
                setFormData({ ...formData, reqId: e.target.value })
              }
              required
            />
          </div>

          <div>
            <label style={labelStyle}>Pavadinimas</label>
            <input
              style={inputStyle}
              placeholder="Pvz. Vartotojo prisijungimas"
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
              required
            />
          </div>

          <div>
            <label style={labelStyle}>Kategorija</label>
            <select
              style={inputStyle}
              value={formData.type}
              onChange={(e) =>
                setFormData({ ...formData, type: e.target.value })
              }
            >
              <option value="PE">Performance</option>
              <option value="US">Usability</option>
              <option value="SE">Security</option>
              <option value="A">Availability</option>
              <option value="O">Operational</option>
              <option value="NFR">Non-functional</option>
            </select>
          </div>

          <div>
            <label style={labelStyle}>Aprašymas (nebūtina)</label>
            <textarea
              style={{ ...inputStyle, minHeight: "80px", resize: "vertical" }}
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
            />
          </div>

          <div
            style={{
              display: "flex",
              justifyContent: "flex-end",
              gap: "10px",
              marginTop: "10px",
            }}
          >
            <button type="button" onClick={onClose} style={secondaryBtnStyle}>
              Atšaukti
            </button>
            <button type="submit" style={primaryBtnStyle}>
              Sukurti
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// stiliai
const overlayStyle = {
  position: "fixed",
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor: "rgba(15, 23, 42, 0.6)",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  zIndex: 2000,
  backdropFilter: "blur(4px)",
};

const modalStyle = {
  backgroundColor: "white",
  padding: "32px",
  borderRadius: "16px",
  width: "100%",
  maxWidth: "450px",
  boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1)",
};

const labelStyle = {
  display: "block",
  fontSize: "14px",
  fontWeight: "600",
  marginBottom: "5px",
  color: "#475569",
};
const inputStyle = {
  width: "100%",
  padding: "10px",
  borderRadius: "8px",
  border: "1px solid #cbd5e1",
  fontSize: "15px",
  boxSizing: "border-box",
};
const primaryBtnStyle = {
  backgroundColor: "#2563eb",
  color: "white",
  border: "none",
  padding: "10px 20px",
  borderRadius: "8px",
  cursor: "pointer",
  fontWeight: "600",
};
const secondaryBtnStyle = {
  backgroundColor: "#f1f5f9",
  color: "#475569",
  border: "1px solid #cbd5e1",
  padding: "10px 20px",
  borderRadius: "8px",
  cursor: "pointer",
};
