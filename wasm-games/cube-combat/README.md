# Cube Combat (WASM + Rust)

A minimal Rust + wasm-bindgen prototype: blue player cube vs red AI cube.

Controls:
- Arrow Left/Right: move
- Z: Slash
- X: Parry

Build & run:
1. Install Rust and wasm-pack
2. rustup target add wasm32-unknown-unknown
3. wasm-pack build --target web
4. Serve the project directory (e.g., `python -m http.server 8080`)
5. Open http://localhost:8080

Notes:
- Player: slash & parry
- Enemy: beam & dash AI

This is a starting prototype; run `wasm-pack build --target web` then open index.html after serving the folder.