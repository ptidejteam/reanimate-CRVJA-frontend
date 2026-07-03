import React, { useState } from "react";

export default function FileActionButton({ label, onClick }) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        display: "flex",
        alignItems: "center",
        padding: "8px 8px",
        marginBottom: "8px",
        backgroundColor: isHovered ? "#e0f7f7" : "#f5f5f5",
        border: "1px solid #ccc",
        border: isHovered ? "4px solid #00aaaa" : "4px solid #ccc",
        borderRadius: "4px",
        cursor: "pointer",
        transition: "all 0.2s ease-in-out",
        color: "#333",
        fontSize: "13px",
        boxShadow: isHovered ? "2px 2px 5px rgba(0,0,0,0.1)" : "none",
      }}
    >
      <img src="/icons/file-button.png" alt="file icon" style={{ marginRight: "8px", width: "16px", height: "16px", objectFit: "contain" }} />
      <span>{label}</span>
    </div>
  );
}
