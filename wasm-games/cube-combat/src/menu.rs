use wasm_bindgen::prelude::*;
use web_sys::{Document, Element};

#[derive(Clone, Copy, PartialEq)]
pub enum MenuScreen {
    Main,
    Modes,
    PvpSubmenu,
    P2pLobby,
    Cubes,
    Achievements,
}

pub struct MenuSystem {
    pub document: Document,
    pub current_screen: MenuScreen,
    pub menu_overlay: Option<Element>,
}

impl MenuSystem {
    pub fn new() -> Result<Self, JsValue> {
        let window = web_sys::window().ok_or("no window")?;
        let document = window.document().ok_or("no document")?;

        let mut menu = MenuSystem {
            document,
            current_screen: MenuScreen::Main,
            menu_overlay: None,
        };

        menu.setup_overlay()?;
        menu.show_screen(MenuScreen::Main)?;

        Ok(menu)
    }

    fn setup_overlay(&mut self) -> Result<(), JsValue> {
        let overlay = self.document.create_element("div")?;
        overlay.set_id("menu-overlay");
        overlay.set_attribute("class", "menu-overlay")?;

        let screens = [
            (MenuScreen::Main, "screen-main", Self::main_menu_html()),
            (MenuScreen::Modes, "screen-modes", Self::modes_screen_html()),
            (MenuScreen::PvpSubmenu, "screen-pvp-submenu", Self::pvp_submenu_html()),
            (MenuScreen::P2pLobby, "screen-p2p-lobby", Self::p2p_lobby_html()),
            (MenuScreen::Cubes, "screen-cubes", Self::cubes_screen_html()),
            (MenuScreen::Achievements, "screen-achievements", Self::achievements_screen_html()),
        ];

        for (_screen_id, element_id, html) in screens.iter() {
            let el = self.document.create_element("div")?;
            el.set_id(element_id);
            el.set_attribute("class", "menu-screen")?;
            el.set_inner_html(html);
            overlay.append_child(&el)?;
        }

        let game_over = self.document.create_element("div")?;
        game_over.set_id("game-over-screen");
        game_over.set_attribute("class", "hidden")?;
        game_over.set_inner_html(Self::game_over_html());
        overlay.append_child(&game_over)?;

        if let Some(body) = self.document.body() {
            body.append_child(&overlay)?;
        }

        self.menu_overlay = Some(overlay);

        Ok(())
    }

    pub fn show_screen(&mut self, screen: MenuScreen) -> Result<(), JsValue> {
        let all_screens = [
            "screen-main",
            "screen-modes",
            "screen-pvp-submenu",
            "screen-p2p-lobby",
            "screen-cubes",
            "screen-achievements",
        ];

        for id in all_screens.iter() {
            if let Some(el) = self.document.get_element_by_id(id) {
                el.set_attribute("class", "menu-screen")?;
            }
        }

        let target_id = match screen {
            MenuScreen::Main => "screen-main",
            MenuScreen::Modes => "screen-modes",
            MenuScreen::PvpSubmenu => "screen-pvp-submenu",
            MenuScreen::P2pLobby => "screen-p2p-lobby",
            MenuScreen::Cubes => "screen-cubes",
            MenuScreen::Achievements => "screen-achievements",
        };

        if let Some(el) = self.document.get_element_by_id(target_id) {
            el.set_attribute("class", "menu-screen active")?;
        }

        self.current_screen = screen;
        Ok(())
    }

    pub fn show_game_over(&self, winner: &str) -> Result<(), JsValue> {
        if let Some(el) = self.document.get_element_by_id("game-over-screen") {
            el.remove_attribute("class")?;
            el.set_attribute("class", "game-over")?;
        }

        if let Some(el) = self.document.get_element_by_id("winner-text") {
            el.set_text_content(Some(&format!("{} WINS!", winner)));
        }

        Ok(())
    }

    pub fn hide_game_over(&self) -> Result<(), JsValue> {
        if let Some(el) = self.document.get_element_by_id("game-over-screen") {
            el.set_attribute("class", "hidden")?;
        }
        Ok(())
    }

    pub fn hide(&self) -> Result<(), JsValue> {
        if let Some(ref overlay) = self.menu_overlay {
            overlay.set_attribute("style", "display: none;")?;
        }
        Ok(())
    }

    pub fn show(&self) -> Result<(), JsValue> {
        if let Some(ref overlay) = self.menu_overlay {
            overlay.set_attribute("style", "display: flex;")?;
        }
        Ok(())
    }

    fn main_menu_html() -> &'static str {
        r#"
            <div class="menu-title">CUBE COMBAT</div>
            <button id="btn-start-game" class="btn btn-green">START GAME</button>
            <button id="btn-collected-cubes" class="btn btn-blue">COLLECTED CUBES</button>
            <button id="btn-achievements" class="btn btn-pink">ACHIEVEMENTS</button>
            <button id="btn-reset-progress" class="btn btn-red">RESET PROGRESS</button>
            <button id="btn-quit" class="btn btn-gray">QUIT</button>
        "#
    }

    fn modes_screen_html() -> &'static str {
        r#"
            <div class="sub-title">SELECT GAME MODE</div>
            <button id="btn-pvai" class="btn btn-red">PLAYER VS AI</button>
            <button id="btn-pvp" class="btn btn-blue">PLAYER VS PLAYER</button>
            <div style="height: 20px;"></div>
            <button id="btn-back-modes" class="btn btn-gray">BACK</button>
        "#
    }

    fn pvp_submenu_html() -> &'static str {
        r#"
            <div class="sub-title">PLAYER VS PLAYER</div>
            <button id="btn-local-mp" class="btn btn-blue">LOCAL MULTIPLAYER</button>
            <button id="btn-p2p-mp" class="btn btn-cyan">P2P MULTIPLAYER</button>
            <div style="height: 20px;"></div>
            <button id="btn-back-pvp" class="btn btn-gray">BACK</button>
        "#
    }

    fn p2p_lobby_html() -> &'static str {
        r#"
            <div class="sub-title">P2P LOBBY</div>
            <div id="p2p-status-msg" class="p2p-status">Select Host or Join</div>
            <div id="p2p-host-section" style="display: none; text-align: center;">
                <div style="color: #aaa; font-size: 14px;">Share this ID with your friend:</div>
                <input type="text" id="host-id-display" class="p2p-input" readonly value="Generating ID..." />
                <div style="color: #00aa00; margin-top: 5px;">Waiting for connection...</div>
            </div>
            <div id="p2p-join-section" style="display: none; text-align: center;">
                <div style="color: #aaa; font-size: 14px;">Enter Host ID:</div>
                <input type="text" id="join-id-input" class="p2p-input" placeholder="Paste ID here" />
                <button id="btn-connect" class="btn btn-green" style="width: 200px; margin: 10px auto;">CONNECT</button>
            </div>
            <div id="p2p-buttons">
                <button id="btn-host-game" class="btn btn-orange">HOST GAME</button>
                <button id="btn-join-game" class="btn btn-cyan">JOIN GAME</button>
            </div>
            <div style="height: 20px;"></div>
            <button id="btn-back-p2p" class="btn btn-gray">BACK</button>
        "#
    }

    fn cubes_screen_html() -> &'static str {
        r#"
            <div class="sub-title">COLLECTED CUBES</div>
            <button id="btn-back-cubes" class="btn btn-gray" style="width: 150px; position: absolute; top: 20px; left: 20px;">BACK (ESC)</button>
            <button id="btn-fight" class="btn btn-green" style="width: 200px; position: absolute; bottom: 20px; right: 20px; display: none;">FIGHT!</button>
            <button id="btn-sandbox" class="btn btn-orange" style="width: 200px; position: absolute; top: 20px; right: 20px;">SANDBOX MODE</button>
            <div class="cubes-layout">
                <div class="cubes-grid" id="cubes-grid-container"></div>
                <div class="cube-details" id="cube-details-panel">
                    <div style="text-align: center; margin-top: 50px; color: #aaa;">Select a cube to view details</div>
                </div>
            </div>
        "#
    }

    fn achievements_screen_html() -> &'static str {
        r#"
            <div class="sub-title">ACHIEVEMENTS</div>
            <button id="btn-back-achievements" class="btn btn-gray" style="width: 150px; position: absolute; top: 20px; left: 20px;">BACK (ESC)</button>
            <div class="achievements-list" id="achievements-container"></div>
        "#
    }

    fn game_over_html() -> &'static str {
        r#"
            <div id="winner-text" style="font-size: 50px; margin-bottom: 30px; font-weight: bold; color: white;">WINNER</div>
            <button id="btn-restart" class="btn btn-green">RESTART (R)</button>
            <div id="waiting-msg" style="display: none; color: yellow; font-size: 24px; margin: 10px; font-weight: bold; text-shadow: 1px 1px 0 #000;">WAITING FOR HOST TO RESTART...</div>
            <button id="btn-main-menu" class="btn btn-gray">MAIN MENU</button>
        "#
    }
}
