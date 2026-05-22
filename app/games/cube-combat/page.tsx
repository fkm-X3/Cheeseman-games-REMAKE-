"use client";

import { type FC } from "react";

const CubeCombatPage: FC = () => {
  return (
    <div style={{ padding: "1rem 1.25rem" }}>
      <a
        href="/games"
        style={{ color: "#5372ff", textDecoration: "none", fontSize: "0.95rem" }}
      >
        Back to games
      </a>

      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "calc(100vh - 4rem)",
        }}
      >
        <iframe
          src="/games/cube-combat/index.html"
          width="800"
          height="600"
          style={{
            border: "none",
            boxShadow: "0 0 20px rgba(0, 0, 0, 0.5)",
          }}
          title="Cube Combat"
        />
      </div>
    </div>
  );
};

export default CubeCombatPage;
