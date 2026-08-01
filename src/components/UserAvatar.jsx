import React from "react";

export default function UserAvatar({ name = "", size = 40, style = {} }) {
  const initials = name
    .trim()
    .split(" ")
    .map(part => part[0])
    .join("")
    .substring(0, 2)
    .toUpperCase() || "U";

  return (
    <div
      style={{
        width: `${size}px`,
        height: `${size}px`,
        borderRadius: "50%",
        backgroundColor: "var(--primary-coral-light)",
        color: "var(--primary-coral)",
        border: "1.5px solid var(--primary-coral-border)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontWeight: 700,
        fontSize: `${Math.max(11, size * 0.38)}px`,
        userSelect: "none",
        flexShrink: 0,
        ...style
      }}
    >
      {initials}
    </div>
  );
}
