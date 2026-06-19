"use client";

export default function LoadingSpinner() {
    return (
      <div style={spinnerStyles}>
        <div>Loading...</div>
      </div>
    );
  }
  
  const spinnerStyles = {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    height: "100vh",
    fontSize: "24px",
  };