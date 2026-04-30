"use client";

import { useEffect, useRef, useState } from "react";

function CubeCombatPage() {
  const gameContainerRef = useRef(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // Wait for DOM to be ready, then load game scripts
    const loadGameScripts = async () => {
      // Load PeerJS first
      if (!window.Peer) {
        const peerScript = document.createElement("script");
        peerScript.src = "https://unpkg.com/peerjs@1.5.2/dist/peerjs.min.js";
        peerScript.async = true;
        
        await new Promise((resolve) => {
          peerScript.onload = resolve;
          peerScript.onerror = () => {
            console.warn("PeerJS failed to load, P2P features may not work");
            resolve();
          };
          document.head.appendChild(peerScript);
        });
      }

      // Load CSS
      const cssLink = document.createElement("link");
      cssLink.rel = "stylesheet";
      cssLink.href = "/games/cube-combat/styles.css";
      document.head.appendChild(cssLink);

      // Load game engine
      const gameScript = document.createElement("script");
      gameScript.src = "/games/cube-combat/engine.js";
      gameScript.async = false;
      gameScript.onload = () => {
        console.log("Cube Combat loaded successfully");
        setIsReady(true);
      };
      gameScript.onerror = () => {
        console.error("Failed to load Cube Combat game engine");
        setIsReady(false);
      };
      document.body.appendChild(gameScript);
    };

    // Add small delay to ensure React has finished rendering
    const timer = setTimeout(() => {
      loadGameScripts();
    }, 100);

    return () => {
      clearTimeout(timer);
      // Cleanup: remove game-related DOM elements
      const elementsToRemove = [
        'gameCanvas',
        'menu-overlay',
        'game-container'
      ];
      elementsToRemove.forEach(id => {
        const el = document.getElementById(id);
        if (el) el.remove();
      });
    };
  }, []);

  return (
    <div style={{ padding: "1rem 1.25rem" }}>
      <a
        href="/games"
        style={{ color: "#5372ff", textDecoration: "none", fontSize: "0.95rem" }}
      >
        ← Back to games
      </a>

      <div
        ref={gameContainerRef}
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "100vh",
        }}
      >
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

              <div id="achievement-toast">
                <div className="toast-icon">🏆</div>
                <div className="toast-text">
                  <div className="toast-title">ACHIEVEMENT UNLOCKED</div>
                  <div id="toast-message">First Blood</div>
                </div>
              </div>

              <div id="sandbox-menu">
                <div className="sb-header">Sandbox Control Panel</div>
                <div
                  style={{
                    textAlign: "center",
                    marginBottom: "10px",
                    color: "#aaa",
                    fontStyle: "italic",
                  }}
                >
                  Press 'R' to toggle this menu
                </div>
                <div className="sb-content">
                  <div className="sb-list" id="sb-cube-list"></div>
                  <div className="sb-details" id="sb-details-pane"></div>
                </div>
                <button
                  className="btn btn-gray"
                  style={{ width: "100%", marginTop: "10px", padding: "10px" }}
                  onClick={() => {
                    if (window.toggleSandboxMenu) window.toggleSandboxMenu();
                  }}
                >
                  CLOSE MENU
                </button>
              </div>

              <div id="ui-layer">
                <div className="hud" id="hud">
                  <div>
                    <div style={{ color: "blue" }} id="p1-name-display">
                      P1 (Blue)
                    </div>
                    <div className="health-bar-container">
                      <div id="p1-health" className="health-bar"></div>
                      <div
                        id="p1-minion-health"
                        className="health-bar"
                        style={{
                          backgroundColor: "#888",
                          position: "absolute",
                          top: 0,
                          left: 0,
                          width: "0%",
                          display: "none",
                        }}
                      ></div>
                    </div>
                    <div id="p1-combo" className="combo-box">
                      0
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

              <div id="menu-overlay">
                <div id="screen-main" className="menu-screen active">
                  <div className="menu-title">CUBE COMBAT</div>

                  <button
                    className="btn btn-green"
                    onClick={() => {
                      if (window.navTo) window.navTo("screen-modes");
                    }}
                  >
                    START GAME
                  </button>
                  <button
                    className="btn btn-blue"
                    onClick={() => {
                      if (window.prepareGame) window.prepareGame(null, "screen-main");
                    }}
                  >
                    COLLECTED CUBES
                  </button>
                  <button
                    className="btn btn-pink"
                    onClick={() => {
                      if (window.navTo) window.navTo("screen-achievements");
                      if (window.renderAchievements) window.renderAchievements();
                    }}
                  >
                    ACHIEVEMENTS
                  </button>
                  <button
                    className="btn btn-red"
                    onClick={() => {
                      if (window.confirmResetProgress) window.confirmResetProgress();
                    }}
                  >
                    RESET PROGRESS
                  </button>
                  <button
                    className="btn btn-gray"
                    onClick={() => {
                      window.location.href = "/games";
                    }}
                  >
                    QUIT
                  </button>
                </div>

                <div id="screen-modes" className="menu-screen">
                  <div className="sub-title">SELECT GAME MODE</div>

                  <button
                    className="btn btn-red"
                    onClick={() => {
                      if (window.prepareGame) window.prepareGame("ai", "screen-modes");
                    }}
                  >
                    PLAYER VS AI
                  </button>
                  <button
                    className="btn btn-blue"
                    onClick={() => {
                      if (window.navTo) window.navTo("screen-pvp-submenu");
                    }}
                  >
                    PLAYER VS PLAYER
                  </button>
                  <div style={{ height: "20px" }}></div>
                  <button
                    className="btn btn-gray"
                    onClick={() => {
                      if (window.navTo) window.navTo("screen-main");
                    }}
                  >
                    BACK
                  </button>
                </div>

                <div id="screen-pvp-submenu" className="menu-screen">
                  <div className="sub-title">PLAYER VS PLAYER</div>

                  <button
                    className="btn btn-blue"
                    onClick={() => {
                      if (window.prepareGame) window.prepareGame("pvp", "screen-pvp-submenu");
                    }}
                  >
                    LOCAL MULTIPLAYER
                  </button>
                  <button
                    className="btn btn-cyan"
                    onClick={() => {
                      if (window.prepareGame) window.prepareGame("p2p_setup", "screen-pvp-submenu");
                    }}
                  >
                    P2P MULTIPLAYER
                  </button>
                  <div style={{ height: "20px" }}></div>
                  <button
                    className="btn btn-gray"
                    onClick={() => {
                      if (window.navTo) window.navTo("screen-modes");
                    }}
                  >
                    BACK
                  </button>
                </div>

                <div id="screen-p2p-lobby" className="menu-screen">
                  <div className="sub-title">P2P LOBBY</div>

                  <div id="p2p-status-msg" className="p2p-status">
                    Select Host or Join
                  </div>

                  <div id="p2p-host-section" style={{ display: "none", textAlign: "center" }}>
                    <div style={{ color: "#aaa", fontSize: "14px" }}>
                      Share this ID with your friend:
                    </div>
                    <input
                      type="text"
                      id="host-id-display"
                      className="p2p-input"
                      readOnly
                      value="Generating ID..."
                      onClick={(e) => e.target.select()}
                    />
                    <div style={{ color: "#00aa00", marginTop: "5px" }}>
                      Waiting for connection...
                    </div>
                  </div>

                  <div id="p2p-join-section" style={{ display: "none", textAlign: "center" }}>
                    <div style={{ color: "#aaa", fontSize: "14px" }}>
                      Enter Host ID:
                    </div>
                    <input
                      type="text"
                      id="join-id-input"
                      className="p2p-input"
                      placeholder="Paste ID here"
                    />
                    <button
                      className="btn btn-green"
                      style={{ width: "200px", margin: "10px auto" }}
                      onClick={() => {
                        if (window.connectToHost) window.connectToHost();
                      }}
                    >
                      CONNECT
                    </button>
                  </div>

                  <div id="p2p-buttons">
                    <button
                      className="btn btn-orange"
                      onClick={() => {
                        if (window.initP2PHost) window.initP2PHost();
                      }}
                    >
                      HOST GAME
                    </button>
                    <button
                      className="btn btn-cyan"
                      onClick={() => {
                        if (window.initP2PJoin) window.initP2PJoin();
                      }}
                    >
                      JOIN GAME
                    </button>
                  </div>

                  <div style={{ height: "20px" }}></div>
                  <button
                    className="btn btn-gray"
                    onClick={() => {
                      if (window.resetP2P) window.resetP2P();
                      if (window.navTo) window.navTo("screen-pvp-submenu");
                    }}
                  >
                    BACK
                  </button>
                </div>

                <div id="screen-cubes" className="menu-screen">
                  <div className="sub-title">COLLECTED CUBES</div>
                  <button
                    className="btn btn-gray"
                    style={{ width: "150px", position: "absolute", top: "20px", left: "20px" }}
                    onClick={() => {
                      if (window.handleCubeBack) window.handleCubeBack();
                    }}
                  >
                    BACK (ESC)
                  </button>

                  <button
                    id="btn-confirm-selection"
                    className="btn btn-green"
                    style={{
                      width: "200px",
                      position: "absolute",
                      bottom: "20px",
                      right: "20px",
                      display: "none",
                    }}
                    onClick={() => {
                      if (window.confirmSelection) window.confirmSelection();
                    }}
                  >
                    FIGHT!
                  </button>

                  <button
                    className="btn btn-orange"
                    style={{
                      width: "200px",
                      position: "absolute",
                      top: "20px",
                      right: "20px",
                    }}
                    onClick={() => {
                      if (window.startGame) window.startGame("sandbox");
                    }}
                  >
                    SANDBOX MODE
                  </button>

                  <div className="cubes-layout">
                    <div className="cubes-grid" id="cubes-grid-container"></div>
                    <div className="cube-details" id="cube-details-panel">
                      <div
                        style={{
                          textAlign: "center",
                          marginTop: "50px",
                          color: "#aaa",
                        }}
                      >
                        Select a cube to view details
                      </div>
                    </div>
                  </div>
                </div>

                <div id="screen-achievements" className="menu-screen">
                  <div className="sub-title">ACHIEVEMENTS</div>
                  <button
                    className="btn btn-gray"
                    style={{ width: "150px", position: "absolute", top: "20px", left: "20px" }}
                    onClick={() => {
                      if (window.navTo) window.navTo("screen-main");
                    }}
                  >
                    BACK (ESC)
                  </button>

                  <div className="achievements-list" id="achievements-container"></div>
                </div>

                <div
                  id="game-over-screen"
                  className="hidden"
                  style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    width: "100%",
                    height: "100%",
                    background: "rgba(0,0,0,0.9)",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    zIndex: 20,
                  }}
                >
                  <div
                    id="winner-text"
                    style={{
                      fontSize: "50px",
                      marginBottom: "30px",
                      fontWeight: "bold",
                      color: "white",
                    }}
                  >
                    WINNER
                  </div>

                  <button
                    id="restart-btn"
                    className="btn btn-green"
                    onClick={() => {
                      if (window.requestRestart) window.requestRestart();
                    }}
                  >
                    RESTART (R)
                  </button>

                  <div
                    id="waiting-msg"
                    style={{
                      display: "none",
                      color: "yellow",
                      fontSize: "24px",
                      margin: "10px",
                      fontWeight: "bold",
                      textShadow: "1px 1px 0 #000",
                    }}
                  >
                    WAITING FOR HOST TO RESTART...
                  </div>

                  <button
                    className="btn btn-gray"
                    onClick={() => {
                      window.location.href = "/games";
                    }}
                  >
                    MAIN MENU
                  </button>
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

              <div id="p2-role-human" style={{ display: "none" }}>
                <div className="sb-stat-box">
                  <div className="sb-stat-label">Dash (K)</div>
                  <div id="p2-sb-cd1" className="sb-stat-value">
                    READY
                  </div>
                </div>
                <div className="sb-stat-box">
                  <div className="sb-stat-label">Laser (L)</div>
                  <div id="p2-sb-cd2" className="sb-stat-value">
                    READY
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CubeCombatPage;
