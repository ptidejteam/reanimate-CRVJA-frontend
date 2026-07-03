"use client";
import React, { useState, useRef, useEffect } from "react";

export default function VersionSelector({
  children,
  value,
  onChange,
}) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const versions = ["2.0.0", "1.1.0"];

  const toggleVersionSelector = () => {
    setIsOpen(!isOpen);
  };

  const handleSelect = (version) => {
    if (onChange) onChange(version);
    setIsOpen(false);
  };

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div
      ref={dropdownRef}
      style={{
        position: "relative",
        display: "flex",
        alignItems: "center",
        gap: "10px",
        marginLeft: "auto", // Pushes the whole group to the right
      }}
    >
      {/* Render the label (children) passed to the component */}
      {children && (
        <span style={{ fontWeight: "bold", fontSize: "14px", color: "black" }}>
          {children}
        </span>
      )}

      {/* VersionSelector button styles */}
      <button
        onClick={toggleVersionSelector}
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "10px",
          minWidth: "160px",
          background: "#FFFFFF",
          color: "#000000",
          fontFamily: "monospace",
          fontSize: "12px",
          fontWeight: "bold",
          padding: "6px 12px",
          border: "3px solid #000000",
          boxShadow: "2px 2px 0 rgba(0,0,0,0.3)",
          cursor: "pointer",
        }}
      >
        <span>{value}</span>
        <span style={{ fontSize: "10px" }}>▼</span>
      </button>

      {/* VersionSelector menu */}
      {isOpen && (
        <div
          style={{
            position: "absolute",
            top: "100%",
            right: 0, // Align menu to the right side of the container since it's now a flex container
            marginTop: "4px",
            minWidth: "160px", // Match button width at minimum
            background: "#FFFFFF",
            border: "3px solid #000000",
            zIndex: 100, // Make sure it floats above other components
            display: "flex",
            flexDirection: "column",
            boxShadow: "4px 4px 0 rgba(0,0,0,0.5)",
          }}
        >
          {versions.map((version, index) => (
            <div
              key={index}
              onClick={() => handleSelect(version)}
              style={{
                padding: "8px 12px",
                cursor: "pointer",
                color: "black",
                fontFamily: "monospace",
                fontSize: "12px",
                fontWeight: "bold",
                borderBottom:
                  index < versions.length - 1 ? "1px solid #C0C0C0" : "none",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "#003C98";
                e.currentTarget.style.color = "white";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "transparent";
                e.currentTarget.style.color = "black";
              }}
            >
              {version}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
