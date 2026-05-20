"use client";

import { useEffect, useRef, useState, type FC, type CSSProperties } from "react";

const CubeCombatPage: FC = () => {
  const gameContainerRef = useRef<HTMLDivElement>(null);
  const [isReady, setIsReady] = useState(false);
  const animFrameRef = useRef<number | null>(null);
  const wasmModuleRef = useRef<{
    init_game: (canvas_id: string) => void;
    game_loop: () => void;
    handle_key_down: (key: string) => void;
    handle_key_up: (key: string) => void;
    restart_game: () => void;
  } | null>(null);

  useEffect(() => {
    let cancelled = false;

    const loadWasm = async (): Promise<void> => {
      try {
        const wasmPath = "/games/cube-combat/cube_combat_wasm.js";
        const wasmModule = await import(/* webpackIgnore: true */ wasmPath);

        if (cancelled) return;

        await wasmModule.default({ module_or_path: "/games/cube-combat/cube_combat_wasm_bg.wasm" });

        if (cancelled) return;

        wasmModuleRef.current = {
          init_game: wasmModule.init_game,
          game_loop: wasmModule.game_loop,
          handle_key_down: wasmModule.handle_key_down,
          handle_key_up: wasmModule.handle_key_up,
          restart_game: wasmModule.restart_game,
        };

        wasmModule.init_game("gameCanvas");
        setIsReady(true);

        const loop = () => {
          if (wasmModuleRef.current) {
            wasmModuleRef.current.game_loop();
          }
          animFrameRef.current = requestAnimationFrame(loop);
        };
        animFrameRef.current = requestAnimationFrame(loop);
      } catch (err) {
        console.error("Failed to load WASM:", err);
        setIsReady(false);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (wasmModuleRef.current) {
        wasmModuleRef.current.handle_key_down(e.key);
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (wasmModuleRef.current) {
        wasmModuleRef.current.handle_key_up(e.key);
      }
    };

    const timer = setTimeout(() => {
      void loadWasm();
    }, 100);

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    return () => {
      cancelled = true;
      clearTimeout(timer);
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
      }
      const elementsToRemove = ["gameCanvas", "menu-overlay", "game-container"];
      elementsToRemove.forEach((id) => {
        const el = document.getElementById(id);
        if (el) el.remove();
      });
      wasmModuleRef.current = null;
    };
  }, []);

  const containerStyle: CSSProperties = {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    minHeight: "100vh",
  };

  return (
    <div style={{ padding: "1rem 1.25rem" }}>
      <a
        href="/games"
        style={{ color: "#5372ff", textDecoration: "none", fontSize: "0.95rem" }}
      >
        ← Back to games
      </a>

      <div ref={gameContainerRef} style={containerStyle}>
        <div id="game-wrapper" style={{ width: "100%" }}>
          <div className="main-wrapper">
            <div id="p1-sidebar" className="sidebar p1">
              <div className="sb-header-row">
                <div id="p1-sb-icon" className="sb-icon"></div>
                <div id="p1-sb-name" className="sb-name">
                  P1
                </div>
              </div>

              <div className="sb-health-container">
                <div id="p1-sb-health" className="sb-health-bar"></div>
              </div>

              <div className="sb-stat-box" id="p1-cd1-box">
                <div className="sb-stat-label">Slash Cooldown</div>
                <div id="p1-sb-cd1" className="sb-stat-value">
                  READY
                </div>
              </div>
              <div className="sb-stat-box" id="p1-cd2-box">
                <div className="sb-stat-label">Parry Cooldown</div>
                <div id="p1-sb-cd2" className="sb-stat-value">
                  READY
                </div>
              </div>

              <div className="sb-stat-box" id="p1-cd3-box" style={{ display: "none" }}>
                <div className="sb-stat-label">Slot 3</div>
                <div id="p1-sb-cd3" className="sb-stat-value">
                  READY
                </div>
              </div>
              <div className="sb-stat-box" id="p1-cd4-box" style={{ display: "none" }}>
                <div className="sb-stat-label">Slot 4</div>
                <div id="p1-sb-cd4" className="sb-stat-value">
                  READY
                </div>
              </div>

              <div
                id="p1-combo-sidebar"
                className="sb-stat-box"
                style={{ display: "none", borderColor: "gold" }}
              >
                <div className="sb-stat-label" style={{ color: "gold" }}>
                  COMBO
                </div>
                <div id="p1-combo-val" className="sb-stat-value" style={{ color: "gold" }}>
                  0
                </div>
              </div>
            </div>

            <div id="game-container">
              <div id="overtime-overlay" className="rainbow-overlay"></div>
              <canvas id="gameCanvas" width="800" height="600"></canvas>

              {!isReady && (
                <div
                  style={{
                    position: "absolute",
                    top: "50%",
                    left: "50%",
                    transform: "translate(-50%, -50%)",
                    color: "#fff",
                    fontSize: "18px",
                  }}
                >
                  Loading WASM...
                </div>
              )}

              <div id="ui-layer">
                <div className="hud" id="hud">
                  <div>
                    <div style={{ color: "blue" }} id="p1-name-display">
                      P1 (Blue)
                    </div>
                    <div className="health-bar-container">
                      <div id="p1-health" className="health-bar"></div>
                    </div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ color: "red" }} id="p2-name">
                      AI (Red)
                    </div>
                    <div className="health-bar-container">
                      <div id="p2-health" className="health-bar"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div id="p2-sidebar" className="sidebar p2">
              <div className="sb-header-row">
                <div id="p2-sb-name" className="sb-name">
                  P2
                </div>
                <div
                  id="p2-sb-icon"
                  className="sb-icon"
                  style={{ background: "red", marginRight: 0, marginLeft: "15px" }}
                ></div>
              </div>

              <div className="sb-health-container">
                <div id="p2-sb-health" className="sb-health-bar" style={{ background: "red" }}></div>
              </div>

              <div id="p2-role-ai">
                <div className="sb-stat-box">
                  <div className="sb-stat-label">Action Status</div>
                  <div id="p2-sb-status" className="sb-stat-value">
                    --
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CubeCombatPage;
