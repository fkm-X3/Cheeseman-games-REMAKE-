mod cubes;
mod data;
mod entity;
mod game;
mod input;
mod menu;

use wasm_bindgen::prelude::*;
use game::Game;
use menu::MenuSystem;

static mut GAME: Option<Game> = None;
static mut MENU: Option<MenuSystem> = None;

#[wasm_bindgen(start)]
pub fn main() -> Result<(), JsValue> {
    Ok(())
}

#[wasm_bindgen]
pub fn init_game(canvas_id: &str) -> Result<(), JsValue> {
    let game = Game::new(canvas_id)?;
    unsafe {
        GAME = Some(game);
    }
    Ok(())
}

#[wasm_bindgen]
pub fn init_menu() -> Result<(), JsValue> {
    let menu = MenuSystem::new()?;
    unsafe {
        MENU = Some(menu);
    }
    Ok(())
}

#[wasm_bindgen]
pub fn game_loop() -> Result<(), JsValue> {
    unsafe {
        if let Some(ref mut game) = GAME {
            game.update();
            let _ = game.render();
        }
    }
    Ok(())
}

#[wasm_bindgen]
pub fn handle_key_down(key: &str) -> Result<(), JsValue> {
    unsafe {
        if let Some(ref mut game) = GAME {
            game.input.set_key(key, true);
        }
        if let Some(ref menu) = MENU {
            if key == "escape" {
                match menu.current_screen {
                    menu::MenuScreen::Modes
                    | menu::MenuScreen::PvpSubmenu
                    | menu::MenuScreen::P2pLobby => {
                        let _ = nav_to("screen-modes");
                    }
                    menu::MenuScreen::Cubes
                    | menu::MenuScreen::Achievements => {
                        let _ = nav_to("screen-main");
                    }
                    _ => {}
                }
            }
        }
    }
    Ok(())
}

#[wasm_bindgen]
pub fn handle_key_up(key: &str) -> Result<(), JsValue> {
    unsafe {
        if let Some(ref mut game) = GAME {
            game.input.set_key(key, false);
        }
    }
    Ok(())
}

#[wasm_bindgen]
pub fn restart_game() -> Result<(), JsValue> {
    unsafe {
        if let Some(ref mut game) = GAME {
            game.restart();
        }
        if let Some(ref menu) = MENU {
            let _ = menu.hide_game_over();
        }
    }
    Ok(())
}

#[wasm_bindgen]
pub fn nav_to(screen_id: &str) -> Result<(), JsValue> {
    unsafe {
        if let Some(ref mut menu) = MENU {
            let screen = match screen_id {
                "screen-main" => menu::MenuScreen::Main,
                "screen-modes" => menu::MenuScreen::Modes,
                "screen-pvp-submenu" => menu::MenuScreen::PvpSubmenu,
                "screen-p2p-lobby" => menu::MenuScreen::P2pLobby,
                "screen-cubes" => menu::MenuScreen::Cubes,
                "screen-achievements" => menu::MenuScreen::Achievements,
                _ => menu::MenuScreen::Main,
            };
            let _ = menu.show_screen(screen);
        }
    }
    Ok(())
}

#[wasm_bindgen]
pub fn prepare_game(mode: &str, _from_screen: &str) -> Result<(), JsValue> {
    unsafe {
        if let Some(ref mut game) = GAME {
            game.restart();
            game.mode = mode.to_string();
            game.state = game::GameState::Playing;
        }
    }
    Ok(())
}

#[wasm_bindgen]
pub fn select_cube(id: u32) -> Result<(), JsValue> {
    unsafe {
        if let Some(ref mut game) = GAME {
            game.set_selected_cube(id);
        }
    }
    Ok(())
}

#[wasm_bindgen]
pub fn init_progress() -> Result<(), JsValue> {
    unsafe {
        if let Some(ref mut game) = GAME {
            game.init_progress();
        }
    }
    Ok(())
}

#[wasm_bindgen]
pub fn set_selected_cube(id: u32) -> Result<(), JsValue> {
    unsafe {
        if let Some(ref mut game) = GAME {
            game.set_selected_cube(id);
        }
    }
    Ok(())
}

#[wasm_bindgen]
pub fn get_selected_cube_id() -> u32 {
    unsafe {
        GAME.as_ref().map(|g| g.selected_cube_id).unwrap_or(1)
    }
}

#[wasm_bindgen]
pub fn get_cubes_grid_html() -> String {
    unsafe {
        GAME.as_ref().map(|g| g.get_cubes_grid_html()).unwrap_or_default()
    }
}

#[wasm_bindgen]
pub fn get_cube_details_html(cube_id: u32) -> String {
    unsafe {
        GAME.as_ref().map(|g| g.get_cube_details_html(cube_id)).unwrap_or_default()
    }
}

#[wasm_bindgen]
pub fn get_achievements_html() -> String {
    unsafe {
        GAME.as_ref().map(|g| g.get_achievements_html()).unwrap_or_default()
    }
}

#[wasm_bindgen]
pub fn reset_all_progress() -> Result<(), JsValue> {
    unsafe {
        if let Some(ref mut game) = GAME {
            game.reset_progress();
        }
    }
    Ok(())
}

#[wasm_bindgen]
pub fn show_game_over(winner: &str) -> Result<(), JsValue> {
    unsafe {
        if let Some(ref menu) = MENU {
            let _ = menu.show_game_over(winner);
        }
    }
    Ok(())
}

#[wasm_bindgen]
pub fn show_menu() -> Result<(), JsValue> {
    unsafe {
        if let Some(ref menu) = MENU {
            let _ = menu.show();
        }
    }
    Ok(())
}

#[wasm_bindgen]
pub fn hide_menu() -> Result<(), JsValue> {
    unsafe {
        if let Some(ref menu) = MENU {
            let _ = menu.hide();
        }
    }
    Ok(())
}

#[wasm_bindgen]
pub fn set_tester(enabled: bool) -> Result<(), JsValue> {
    unsafe {
        if let Some(ref mut game) = GAME {
            game.input.set_tester(enabled);
        }
    }
    Ok(())
}

#[wasm_bindgen]
pub fn set_dev(enabled: bool) -> Result<(), JsValue> {
    unsafe {
        if let Some(ref mut game) = GAME {
            game.input.set_dev(enabled);
        }
    }
    Ok(())
}

#[wasm_bindgen]
pub fn get_tester() -> bool {
    unsafe {
        GAME.as_ref().map(|g| g.input.is_tester).unwrap_or(false)
    }
}

#[wasm_bindgen]
pub fn get_dev() -> bool {
    unsafe {
        GAME.as_ref().map(|g| g.input.is_dev).unwrap_or(false)
    }
}

#[wasm_bindgen]
pub fn go_to_menu() -> Result<(), JsValue> {
    unsafe {
        if let Some(ref mut game) = GAME {
            game.state = game::GameState::Menu;
            game.winner = None;
            game.particles.clear();
            game.floating_texts.clear();
            game.shake_magnitude = 0.0;
        }
        if let Some(ref mut menu) = MENU {
            let _ = menu.hide_game_over();
            let _ = menu.show_screen(menu::MenuScreen::Main);
            let _ = menu.show();
        }
    }
    Ok(())
}
