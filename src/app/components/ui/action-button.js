import React from "react";

export default function ActionButton({
  children,
  onClick,
  style,
  icon,
  ...props
}) {
  return (
    <button
      className="action-button"
      onClick={onClick}
      style={style}
      {...props}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "5px",
        }}
      >
        {icon && (
          <img
            src={icon}
            alt=""
            style={{ width: "20px", height: "20px", objectFit: "contain" }}
          />
        )}
        <span>{children}</span>
      </div>
    </button>
  );
}
