"use client";
import React from "react";

export default function BankSlotManager({ numBanks, bankFiles, onFileChange }) {
  return (
    <div
      style={{
        width: "100%",
        display: "flex",
        flexDirection: "row",
        border: "1px solid black",
        padding: "10px",
      }}
    >
      <div
        style={{
          width: "100%",
          display: "flex",
          flexDirection: "column",
          marginLeft: "14px",
        }}
      >
        <div>
          {/* Left Side - Loaded Banks */}{" "}
          {bankFiles.map((file, index) => (
            <li
              key={index}
              style={{
                padding: "4px",
              }}
            >
              Bank {index + 1}: {file ? file.name : <i>No file selected</i>}
            </li>
          ))}
        </div>
      </div>
      <div
        style={{
          width: "100%",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* Right Side - User Imports */}
        <div style={{ width: "100%" }}>
          {Array.from({ length: numBanks }, (_, index) => (
            <div style={{ marginBottom: "10px" }} key={index}>
              <label>Bank {index + 1}: </label>
              <input
                id={`bankStored${index + 1}`}
                type="file"
                onChange={(e) => {
                  if (e.target.files.length > 0) {
                    const file = e.target.files[0];
                    console.log(
                      `File selected for bank ${index + 1}:`,
                      file.name,
                    );
                    onFileChange(index, file);
                  }
                }}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
