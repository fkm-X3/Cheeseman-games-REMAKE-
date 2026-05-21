"use client";

import { useEffect, useRef, useState, type FC } from "react";

const CubeCombatPage: FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isReady, setIsReady] = useState(false);
  const animFrameRef = useRef<number | null>(null);
  const wasmRef = useRef<{
    init_game: (canvas_id: string) => void;
    init_menu: () => void;
    game_loop: () => void;
    handle_key_down: (key: string) => void;
    handle_key_up: (key: string) => void;
    restart_game: () => void;
    nav_to: (screen_id: string) => void;
    prepare_game: (mode: string, from_screen: string) => void;
    show_game_over: (winner: string) => void;
    go_to_menu: () => void;
  } | null>(null);

  useEffect(() => {
    let cancelled = false;

    const loadWasm = async () => {
      try {
        const wasmModule = await import(
          /* webpackIgnore: true */ "/games/cube-combat/cube_combat_wasm.js"
        );

        if (cancelled) return;

        await wasmModule.default({
          module_or_path: "/games/cube-combat/cube_combat_wasm_bg.wasm",
        });

        if (cancelled) return;

        wasmRef.current = {
          init_game: wasmModule.init_game,
          init_menu: wasmModule.init_menu,
          game_loop: wasmModule.game_loop,
          handle_key_down: wasmModule.handle_key_down,
          handle_key_up: wasmModule.handle_key_up,
          restart_game: wasmModule.restart_game,
          nav_to: wasmModule.nav_to,
          prepare_game: wasmModule.prepare_game,
          show_game_over: wasmModule.show_game_over,
          go_to_menu: wasmModule.go_to_menu,
        };

        wasmModule.init_game("game-canvas");
        wasmModule.init_menu();

        bindMenuHandlers(wasmModule);

        setIsReady(true);

        const loop = () => {
          if (wasmRef.current) {
            wasmRef.current.game_loop();
          }
          animFrameRef.current = requestAnimationFrame(loop);
        };
        animFrameRef.current = requestAnimationFrame(loop);
      } catch (err) {
        console.error("Failed to load WASM:", err);
      }
    };

    const bindMenuHandlers = (m: typeof wasmRef.current) => {
      if (!m) return;

      const on = (id: string, fn: () => void) => {
        document.getElementById(id)?.addEventListener("click", fn);
      };

      on("btn-start-game", () => m.nav_to("screen-modes"));
      on("btn-collected-cubes", () => m.nav_to("screen-cubes"));
      on("btn-achievements", () => m.nav_to("screen-achievements"));
      on("btn-reset-progress", () => {
        if (confirm("Are you sure you want to reset all progress?")) {
          localStorage.clear();
        }
      });
      on("btn-quit", () => {
        window.location.href = "/games";
      });
      on("btn-pvai", () => m.prepare_game("ai", "screen-modes"));
      on("btn-pvp", () => m.nav_to("screen-pvp-submenu"));
      on("btn-back-modes", () => m.nav_to("screen-main"));
      on("btn-local-mp", () => m.prepare_game("pvp", "screen-pvp-submenu"));
      on("btn-p2p-mp", () => m.prepare_game("p2p_setup", "screen-pvp-submenu"));
      on("btn-back-pvp", () => m.nav_to("screen-modes"));
      on("btn-host-game", () => {
        document.getElementById("p2p-host-section")!.style.display = "block";
        document.getElementById("p2p-join-section")!.style.display = "none";
        document.getElementById("p2p-buttons")!.style.display = "none";
        (document.getElementById("p2p-status-msg") as HTMLElement).textContent =
          "Host mode - waiting for connection...";
      });
      on("btn-join-game", () => {
        document.getElementById("p2p-host-section")!.style.display = "none";
        document.getElementById("p2p-join-section")!.style.display = "block";
        document.getElementById("p2p-buttons")!.style.display = "none";
        (document.getElementById("p2p-status-msg") as HTMLElement).textContent =
          "Enter host ID to connect";
      });
      on("btn-connect", () => {
        const hostId = (document.getElementById("join-id-input") as HTMLInputElement).value;
        if (hostId) {
          m.prepare_game("p2p", "screen-p2p-lobby");
        }
      });
      on("btn-back-p2p", () => {
        document.getElementById("p2p-host-section")!.style.display = "none";
        document.getElementById("p2p-join-section")!.style.display = "none";
        document.getElementById("p2p-buttons")!.style.display = "block";
        (document.getElementById("p2p-status-msg") as HTMLElement).textContent =
          "Select Host or Join";
        m.nav_to("screen-pvp-submenu");
      });
      on("btn-back-cubes", () => m.nav_to("screen-main"));
      on("btn-sandbox", () => m.prepare_game("sandbox", "screen-cubes"));
      on("btn-fight", () => m.prepare_game("ai", "screen-cubes"));
      on("btn-back-achievements", () => m.nav_to("screen-main"));
      on("btn-restart", () => m.restart_game());
      on("btn-main-menu", () => m.go_to_menu());
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        ["Space", "KeyW", "KeyA", "KeyS", "KeyD", "KeyF", "KeyR", "Escape"].includes(e.code)
      ) {
        e.preventDefault();
      }
      wasmRef.current?.handle_key_down(e.key.toLowerCase());
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      wasmRef.current?.handle_key_up(e.key.toLowerCase());
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
      ["game-canvas", "menu-overlay"].forEach((id) => {
        document.getElementById(id)?.remove();
      });
      wasmRef.current = null;
    };
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
          minHeight: "100vh",
        }}
      >
        <div id="game-wrapper" style={{ position: "relative" }}>
          <canvas
            ref={canvasRef}
            id="game-canvas"
            width={800}
            height={600}
            style={{
              border: "2px solid #333",
              background: "#f0f0f0",
              display: "block",
              boxShadow: "0 0 20px rgba(0, 0, 0, 0.5)",
            }}
          />
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
        </div>
      </div>
    </div>
  );
};

export default CubeCombatPage;
