import React, { useState, useEffect } from "react";

export default function EditRequirementModal({
  isOpen,
  onClose,
  requirement,
  onUpdate,
}) {
  const [formData, setFormData] = useState({
    title: "",
    type: "US",
    description: "",
  });

  useEffect(() => {
    if (requirement) {
      setFormData({
        title: requirement.title || "",
        type: requirement.type || "US",
        description: requirement.description || "",
      });
    }
  }, [requirement, isOpen]);

  if (!isOpen) return null;

  return (
    <div style={overlayStyle} onClick={onClose}>
      <div style={modalStyle} onClick={(e) => e.stopPropagation()}>
        <h2 style={{ marginTop: 0 }}>Edit {requirement?.reqId}</h2>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            onUpdate(requirement.reqId, formData);
          }}
        >
          <label style={labelStyle}>Title</label>
          <input
            style={inputStyle}
            value={formData.title}
            onChange={(e) =>
              setFormData({ ...formData, title: e.target.value })
            }
          />

          <label style={labelStyle}>Type</label>
          <select
            style={inputStyle}
            value={formData.type}
            onChange={(e) => setFormData({ ...formData, type: e.target.value })}
          >
            <option value="PE">Performance (PE)</option>
            <option value="US">Usability (US)</option>
            <option value="SE">Security (SE)</option>
            <option value="A">Availability (A)</option>
            <option value="O">Operational (O)</option>
            <option value="NFR">Non-functional (NFR)</option>
          </select>

          <div style={{ display: "flex", gap: "10px", marginTop: "20px" }}>
            <button type="button" onClick={onClose} style={secondaryBtnStyle}>
              Cancel
            </button>
            <button type="submit" style={primaryBtnStyle}>
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

const overlayStyle = {
  position: "fixed",
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor: "rgba(0,0,0,0.5)",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  zIndex: 1000,
};
const modalStyle = {
  backgroundColor: "white",
  padding: "30px",
  borderRadius: "12px",
  width: "400px",
};
const labelStyle = {
  display: "block",
  marginBottom: "5px",
  fontWeight: "bold",
  fontSize: "14px",
};
const inputStyle = {
  width: "100%",
  padding: "8px",
  marginBottom: "15px",
  borderRadius: "6px",
  border: "1px solid #ccc",
};
const primaryBtnStyle = {
  backgroundColor: "#2563eb",
  color: "white",
  border: "none",
  padding: "10px 20px",
  borderRadius: "6px",
  cursor: "pointer",
};
const secondaryBtnStyle = {
  backgroundColor: "#f1f5f9",
  border: "none",
  padding: "10px 20px",
  borderRadius: "6px",
  cursor: "pointer",
};
