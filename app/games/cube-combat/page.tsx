"use client";

import { useEffect, useRef, type FC } from "react";

declare global {
  interface Window {
    __cubeCombatIframeReady?: boolean;
  }
}

const CubeCombatPage: FC = () => {
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    function isFromIframe(event: MessageEvent): boolean {
      return (
        iframeRef.current?.contentWindow != null &&
        event.source === iframeRef.current.contentWindow
      );
    }

    function handleMessage(event: MessageEvent) {
      const msg = event.data;
      if (!msg || typeof msg !== "object" || !msg.type) return;

      if (msg.type === "cube-combat:ready") {
        console.log("[cube-combat page] iframe ready");
        window.__cubeCombatIframeReady = true;
        return;
      }

      if (msg.type.startsWith("cube-combat:")) {
        if (isFromIframe(event)) {
          console.log("[cube-combat page] msg from iframe (not forwarding):", msg.type);
          return;
        }
        const target = iframeRef.current?.contentWindow;
        if (!target) {
          console.error("[cube-combat page] iframe contentWindow unavailable");
          return;
        }
        console.log("[cube-combat page] forwarding %s to iframe", msg.type);
        target.postMessage(msg, "*");
      }
    }

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, []);

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
          ref={iframeRef}
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
