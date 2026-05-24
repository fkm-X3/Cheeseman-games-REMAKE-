use wasm_bindgen::{JsCast, JsValue};
use web_sys::{CanvasRenderingContext2d, HtmlCanvasElement};
use crate::entity::*;
use crate::input::Input;
use crate::data;
use crate::cubes::{BlueCube, RedCube, GreenCube, PinkCube, BrownCube, PurpleCube, VigilanteCube, AngrySniperCube, GoldCube, Fbt7Cube, Bobbythe124Cube, GhostCube, TankCube, TricksterCube, PyroCube, FrostCube};
use crate::{show_game_over, show_menu, hide_menu};

pub struct Particle {
    pub x: f64,
    pub y: f64,
    pub vx: f64,
    pub vy: f64,
    pub color: String,
    pub life: u32,
    pub max_life: u32,
    pub size: f64,
}

impl Particle {
    pub fn new(x: f64, y: f64, color: &str) -> Self {
        Particle {
            x,
            y,
            vx: (js_sys::Math::random() - 0.5) * 8.0,
            vy: (js_sys::Math::random() - 0.5) * 8.0,
            color: color.to_string(),
            life: 30,
            max_life: 30,
            size: 4.0 + js_sys::Math::random() * 4.0,
        }
    }

    pub fn update(&mut self) {
        self.x += self.vx;
        self.y += self.vy;
        self.vy += 0.2;
        self.life -= 1;
        self.size *= 0.95;
    }

    pub fn is_dead(&self) -> bool {
        self.life == 0 || self.size < 0.5
    }

    pub fn draw(&self, ctx: &CanvasRenderingContext2d) -> Result<(), JsValue> {
        let alpha = self.life as f64 / self.max_life as f64;
        ctx.set_global_alpha(alpha);
        ctx.set_fill_style_str(&self.color);
        ctx.fill_rect(self.x, self.y, self.size, self.size);
        ctx.set_global_alpha(1.0);
        Ok(())
    }
}

pub struct FloatingText {
    pub x: f64,
    pub y: f64,
    pub text: String,
    pub color: String,
    pub life: u32,
}

impl FloatingText {
    pub fn new(x: f64, y: f64, text: &str, color: &str) -> Self {
        FloatingText {
            x,
            y,
            text: text.to_string(),
            color: color.to_string(),
            life: 60,
        }
    }

    pub fn update(&mut self) {
        self.y -= 2.0;
        self.life -= 1;
    }

    pub fn is_dead(&self) -> bool {
        self.life == 0
    }

    pub fn draw(&self, ctx: &CanvasRenderingContext2d) -> Result<(), JsValue> {
        let alpha = self.life as f64 / 60.0;
        ctx.set_global_alpha(alpha);
        ctx.set_fill_style_str(&self.color);
        ctx.set_font("bold 20px Arial");
        ctx.fill_text(&self.text, self.x, self.y)?;
        ctx.set_global_alpha(1.0);
        Ok(())
    }
}

#[derive(Clone)]
pub struct AchievementState {
    pub id: u32,
    pub unlocked: bool,
    pub progress: u32,
}

impl AchievementState {
    pub fn new(id: u32) -> Self {
        AchievementState { id, unlocked: false, progress: 0 }
    }
}

pub struct SessionStats {
    pub beams_hit_total: u32,
    pub ghost_wins: u32,
    pub damage_taken_match: u32,
    pub wombo_combo_hits: u32,
    pub decoy_kills_total: u32,
    pub burn_damage_total: u32,
    pub freeze_count_match: u32,
}

impl SessionStats {
    pub fn new() -> Self {
        SessionStats {
            beams_hit_total: 0,
            ghost_wins: 0,
            damage_taken_match: 0,
            wombo_combo_hits: 0,
            decoy_kills_total: 0,
            burn_damage_total: 0,
            freeze_count_match: 0,
        }
    }

    pub fn reset_match(&mut self) {
        self.damage_taken_match = 0;
        self.wombo_combo_hits = 0;
        self.freeze_count_match = 0;
    }
}

pub enum GameState {
    Menu,
    Playing,
    GameOver,
}

pub enum PlayerCube {
    Blue(BlueCube),
    Green(GreenCube),
    Pink(PinkCube),
    Brown(BrownCube),
    Purple(PurpleCube),
    Vigilante(VigilanteCube),
    AngrySniper(AngrySniperCube),
    Gold(GoldCube),
    Fbt7(Fbt7Cube),
    Bobbythe124(Bobbythe124Cube),
    Ghost(GhostCube),
    Tank(TankCube),
    Trickster(TricksterCube),
    Pyro(PyroCube),
    Frost(FrostCube),
}

impl PlayerCube {
    pub fn from_id(id: u32, x: f64, y: f64) -> Self {
        match id {
            1 => PlayerCube::Blue(BlueCube::new(x, y)),
            2 => PlayerCube::AngrySniper(AngrySniperCube::new(x, y)),
            3 => PlayerCube::Green(GreenCube::new(x, y)),
            4 => PlayerCube::Pink(PinkCube::new(x, y)),
            5 => PlayerCube::Brown(BrownCube::new(x, y)),
            6 => PlayerCube::Purple(PurpleCube::new(x, y)),
            7 => PlayerCube::Vigilante(VigilanteCube::new(x, y)),
            8 => PlayerCube::Fbt7(Fbt7Cube::new(x, y)),
            9 => PlayerCube::Gold(GoldCube::new(x, y)),
            10 => PlayerCube::Bobbythe124(Bobbythe124Cube::new(x, y)),
            11 => PlayerCube::Ghost(GhostCube::new(x, y)),
            12 => PlayerCube::Tank(TankCube::new(x, y)),
            13 => PlayerCube::Trickster(TricksterCube::new(x, y)),
            14 => PlayerCube::Pyro(PyroCube::new(x, y)),
            15 => PlayerCube::Frost(FrostCube::new(x, y)),
            _ => PlayerCube::Blue(BlueCube::new(x, y)),
        }
    }

    pub fn entity(&self) -> &Entity {
        match self {
            PlayerCube::Blue(c) => &c.entity,
            PlayerCube::Green(c) => &c.entity,
            PlayerCube::Pink(c) => &c.entity,
            PlayerCube::Brown(c) => &c.entity,
            PlayerCube::Purple(c) => &c.entity,
            PlayerCube::Vigilante(c) => &c.entity,
            PlayerCube::AngrySniper(c) => &c.entity,
            PlayerCube::Gold(c) => &c.entity,
            PlayerCube::Fbt7(c) => &c.entity,
            PlayerCube::Bobbythe124(c) => &c.entity,
            PlayerCube::Ghost(c) => &c.entity,
            PlayerCube::Tank(c) => &c.entity,
            PlayerCube::Trickster(c) => &c.entity,
            PlayerCube::Pyro(c) => &c.entity,
            PlayerCube::Frost(c) => &c.entity,
        }
    }

    pub fn entity_mut(&mut self) -> &mut Entity {
        match self {
            PlayerCube::Blue(c) => &mut c.entity,
            PlayerCube::Green(c) => &mut c.entity,
            PlayerCube::Pink(c) => &mut c.entity,
            PlayerCube::Brown(c) => &mut c.entity,
            PlayerCube::Purple(c) => &mut c.entity,
            PlayerCube::Vigilante(c) => &mut c.entity,
            PlayerCube::AngrySniper(c) => &mut c.entity,
            PlayerCube::Gold(c) => &mut c.entity,
            PlayerCube::Fbt7(c) => &mut c.entity,
            PlayerCube::Bobbythe124(c) => &mut c.entity,
            PlayerCube::Ghost(c) => &mut c.entity,
            PlayerCube::Tank(c) => &mut c.entity,
            PlayerCube::Trickster(c) => &mut c.entity,
            PlayerCube::Pyro(c) => &mut c.entity,
            PlayerCube::Frost(c) => &mut c.entity,
        }
    }

    pub fn update(&mut self, target: &Entity, input: &Input) {
        match self {
            PlayerCube::Blue(c) => c.update(target, input),
            PlayerCube::Green(c) => c.update(target, input),
            PlayerCube::Pink(c) => c.update(target, input),
            PlayerCube::Brown(c) => c.update(target, input),
            PlayerCube::Purple(c) => c.update(target, input),
            PlayerCube::Vigilante(c) => c.update(target, input),
            PlayerCube::AngrySniper(c) => c.update(target, input),
            PlayerCube::Gold(c) => c.update(target, input),
            PlayerCube::Fbt7(c) => c.update(target, input),
            PlayerCube::Bobbythe124(c) => c.update(target, input),
            PlayerCube::Ghost(c) => c.update(target, input),
            PlayerCube::Tank(c) => c.update(target, input),
            PlayerCube::Trickster(c) => c.update(target, input),
            PlayerCube::Pyro(c) => c.update(target, input),
            PlayerCube::Frost(c) => c.update(target, input),
        }
    }

    pub fn draw(&self, ctx: &CanvasRenderingContext2d) -> Result<(), JsValue> {
        match self {
            PlayerCube::Blue(c) => c.draw(ctx),
            PlayerCube::Green(c) => c.draw(ctx),
            PlayerCube::Pink(c) => c.draw(ctx),
            PlayerCube::Brown(c) => c.draw(ctx),
            PlayerCube::Purple(c) => c.draw(ctx),
            PlayerCube::Vigilante(c) => c.draw(ctx),
            PlayerCube::AngrySniper(c) => c.draw(ctx),
            PlayerCube::Gold(c) => c.draw(ctx),
            PlayerCube::Fbt7(c) => c.draw(ctx),
            PlayerCube::Bobbythe124(c) => c.draw(ctx),
            PlayerCube::Ghost(c) => c.draw(ctx),
            PlayerCube::Tank(c) => c.draw(ctx),
            PlayerCube::Trickster(c) => c.draw(ctx),
            PlayerCube::Pyro(c) => c.draw(ctx),
            PlayerCube::Frost(c) => c.draw(ctx),
        }
    }

    pub fn slash_hitbox(&self) -> Option<(f64, f64, f64, f64)> {
        match self {
            PlayerCube::Blue(c) => c.slash_hitbox(),
            PlayerCube::Green(c) => c.slash_hitbox(),
            PlayerCube::Pink(c) => c.slash_hitbox(),
            PlayerCube::Brown(c) => c.slash_hitbox(),
            PlayerCube::Purple(c) => c.slash_hitbox(),
            PlayerCube::Vigilante(c) => c.dash_hitbox(),
            PlayerCube::AngrySniper(c) => c.dash_hitbox(),
            PlayerCube::Gold(c) => c.slash_hitbox(),
            PlayerCube::Fbt7(c) => c.delete_slash_hitbox(),
            PlayerCube::Bobbythe124(c) => c.silence_hitbox(),
            PlayerCube::Ghost(c) => c.slash_hitbox(),
            PlayerCube::Tank(c) => c.slam_hitbox(),
            PlayerCube::Trickster(c) => c.slash_hitbox(),
            PlayerCube::Pyro(c) => c.slash_hitbox(),
            PlayerCube::Frost(c) => c.slash_hitbox(),
        }
    }

    pub fn beam_hitbox(&self) -> Option<(f64, f64, f64, f64)> {
        match self {
            PlayerCube::Blue(_) => None,
            PlayerCube::Green(c) => c.beam_hitbox(),
            PlayerCube::Pink(_) => None,
            PlayerCube::Brown(c) => c.beam_hitbox(),
            PlayerCube::Purple(_) => None,
            PlayerCube::Vigilante(_) => None,
            PlayerCube::AngrySniper(c) => c.beam_hitbox(),
            PlayerCube::Gold(c) => c.minion_slash_hitbox(),
            PlayerCube::Fbt7(_) => None,
            PlayerCube::Bobbythe124(c) => c.beam_hitbox(),
            PlayerCube::Ghost(_) => None,
            PlayerCube::Tank(_) => None,
            PlayerCube::Trickster(c) => c.decoy_hitbox(),
            PlayerCube::Pyro(c) => c.fire_wall_hitbox(),
            PlayerCube::Frost(c) => c.ice_shard_hitbox(),
        }
    }

    pub fn is_invincible(&self) -> bool {
        match self {
            PlayerCube::Blue(c) => c.parry.active,
            PlayerCube::Green(c) => c.parry.active,
            PlayerCube::Pink(c) => c.is_blocking,
            PlayerCube::Brown(_) => false,
            PlayerCube::Purple(c) => c.parry.active,
            PlayerCube::Vigilante(c) => c.dash_active,
            PlayerCube::AngrySniper(c) => c.dash_active || c.is_invincible,
            PlayerCube::Gold(c) => c.parry.active,
            PlayerCube::Fbt7(c) => c.parry.active,
            PlayerCube::Bobbythe124(c) => c.parry.active,
            PlayerCube::Ghost(c) => c.is_phasing(),
            PlayerCube::Tank(_) => false,
            PlayerCube::Trickster(c) => c.is_swapping(),
            PlayerCube::Pyro(_) => false,
            PlayerCube::Frost(_) => false,
        }
    }

    pub fn absorb_damage(&mut self, amount: i32) -> i32 {
        match self {
            PlayerCube::Pink(c) => c.absorb_damage(amount),
            PlayerCube::Tank(c) => c.absorb_damage(amount),
            _ => amount,
        }
    }
}

pub struct Game {
    pub ctx: CanvasRenderingContext2d,
    pub input: Input,
    pub state: GameState,
    pub mode: String,
    pub selected_cube_id: u32,
    pub player: PlayerCube,
    pub red: RedCube,
    pub particles: Vec<Particle>,
    pub floating_texts: Vec<FloatingText>,
    pub shake_magnitude: f64,
    pub winner: Option<String>,
    pub session_stats: SessionStats,
    pub achievement_states: Vec<AchievementState>,
    pub progress_loaded: bool,
    localstorage_poll_counter: u32,
}

impl Game {
    pub fn new(canvas_id: &str) -> Result<Self, JsValue> {
        let window = web_sys::window().ok_or("no window")?;
        let document = window.document().ok_or("no document")?;
        let canvas = document
            .get_element_by_id(canvas_id)
            .ok_or("canvas not found")?;
        let canvas: HtmlCanvasElement = canvas
            .dyn_into::<HtmlCanvasElement>()
            .map_err(|_| "not a canvas")?;
        canvas.set_width(WIDTH as u32);
        canvas.set_height(HEIGHT as u32);

        let ctx = canvas
            .get_context("2d")?
            .ok_or("no 2d context")?
            .dyn_into::<CanvasRenderingContext2d>()?;

        let player = PlayerCube::from_id(1, 150.0, FLOOR_Y - CUBE_SIZE);
        let red = RedCube::new(600.0, FLOOR_Y - CUBE_SIZE);

        let mut input = Input::new();
        if let Some(window) = web_sys::window() {
            if let Ok(Some(storage)) = window.local_storage() {
                if let Ok(Some(val)) = storage.get_item("cc_tester") {
                    input.is_tester = val == "true";
                }
                if let Ok(Some(val)) = storage.get_item("cc_dev") {
                    input.is_dev = val == "true";
                }
                if let Ok(Some(val)) = storage.get_item("cc_debugMode") {
                    input.is_debug = val == "true";
                }
            }
        }
        web_sys::console::log_1(&format!("[wasm] init: tester={} dev={} debug={}", input.is_tester, input.is_dev, input.is_debug).into());

        let achievement_states: Vec<AchievementState> = data::ACHIEVEMENTS.iter().map(|a| AchievementState::new(a.id)).collect();

        Ok(Game {
            ctx,
            input,
            state: GameState::Menu,
            mode: "ai".to_string(),
            selected_cube_id: 1,
            player,
            red,
            particles: Vec::new(),
            floating_texts: Vec::new(),
            shake_magnitude: 0.0,
            winner: None,
            session_stats: SessionStats::new(),
            achievement_states,
            progress_loaded: false,
            localstorage_poll_counter: 0,
        })
    }

    pub fn set_selected_cube(&mut self, id: u32) {
        self.selected_cube_id = id;
    }

    pub fn restart(&mut self) {
        self.player = PlayerCube::from_id(self.selected_cube_id, 150.0, FLOOR_Y - CUBE_SIZE);
        self.red = RedCube::new(600.0, FLOOR_Y - CUBE_SIZE);
        self.particles.clear();
        self.floating_texts.clear();
        self.shake_magnitude = 0.0;
        self.winner = None;
        self.session_stats.reset_match();
        self.state = GameState::Playing;
        let _ = hide_menu();
    }

    fn poll_localstorage(&mut self) {
        if let Some(window) = web_sys::window() {
            if let Ok(Some(storage)) = window.local_storage() {
                if let Ok(Some(val)) = storage.get_item("cc_tester") {
                    self.input.is_tester = val == "true";
                }
                if let Ok(Some(val)) = storage.get_item("cc_dev") {
                    self.input.is_dev = val == "true";
                }
                if let Ok(Some(val)) = storage.get_item("cc_debugMode") {
                    self.input.is_debug = val == "true";
                }
            }
        }
        web_sys::console::log_1(&format!("[wasm] poll: tester={} dev={} debug={}", self.input.is_tester, self.input.is_dev, self.input.is_debug).into());
    }

    pub fn update(&mut self) {
        self.localstorage_poll_counter = self.localstorage_poll_counter.saturating_sub(1);
        if self.localstorage_poll_counter == 0 {
            self.localstorage_poll_counter = 60;
            self.poll_localstorage();
        }

        match &self.state {
            GameState::Menu => {
                if self.input.is_pressed(" ") {
                    self.restart();
                }
            }
            GameState::Playing => self.update_playing(),
            GameState::GameOver => {
                if self.input.is_pressed("r") {
                    self.restart();
                }
            }
        }
    }

    fn update_playing(&mut self) {
        let player_dead = self.player.entity().dead;
        let red_dead = self.red.entity.dead;

        if !player_dead {
            self.player.update(&self.red.entity, &self.input);
        }
        if !red_dead {
            self.red.update(&self.player.entity());
        }

        let slash_hit = if let Some((sx, sy, sw, sh)) = self.player.slash_hitbox() {
            rect_intersect(sx, sy, sw, sh, self.red.entity.x, self.red.entity.y, self.red.entity.w, self.red.entity.h)
        } else {
            false
        };

        if slash_hit && !self.red.is_invincible && !self.red.entity.dead {
            let damage = match &self.player {
                PlayerCube::Brown(_) => 15,
                PlayerCube::Vigilante(_) => 20,
                PlayerCube::AngrySniper(_) => 15,
                PlayerCube::Fbt7(c) => (15.0 * c.damage_mult) as i32,
                PlayerCube::Bobbythe124(c) => (35.0 * c.damage_mult) as i32,
                _ => 20,
            };
            let actual_damage = self.red.entity.hp.min(damage);
            self.red.entity.take_damage(actual_damage);
            let rx = self.red.entity.center_x();
            let ry = self.red.entity.y;
            for _ in 0..8 {
                self.particles.push(Particle::new(rx, ry + 25.0, &self.red.entity.color));
            }
            self.shake_magnitude = 5.0;
            let dir = if self.player.entity().facing_right { 1.0 } else { -1.0 };
            self.red.entity.vx = dir * 10.0;
            self.red.entity.vy = -5.0;
            self.floating_texts.push(FloatingText::new(rx, ry, &format!("{}", damage), WHITE));

            if let PlayerCube::Fbt7(c) = &mut self.player {
                c.apply_poison();
            }
            if let PlayerCube::Bobbythe124(c) = &mut self.player {
                if c.bleed_active {
                    c.apply_bleed_poison();
                }
            }
        }

        let beam_hit = if let Some((bx, by, bw, bh)) = self.player.beam_hitbox() {
            rect_intersect(bx, by, bw, bh, self.red.entity.x, self.red.entity.y, self.red.entity.w, self.red.entity.h)
        } else {
            false
        };

        if beam_hit && !self.red.entity.dead {
            self.session_stats.beams_hit_total += 1;
            let damage = match &self.player {
                PlayerCube::Green(_) => 25,
                PlayerCube::Brown(c) => c.beam_damage(),
                PlayerCube::AngrySniper(_) => 25,
                PlayerCube::Bobbythe124(c) => (50.0 * c.damage_mult) as i32,
                _ => 20,
            };
            let actual_damage = self.red.entity.hp.min(damage);
            self.red.entity.take_damage(actual_damage);
            let bx = self.red.entity.center_x();
            let by = self.red.entity.y;
            for _ in 0..8 {
                self.particles.push(Particle::new(bx, by + 25.0, &self.red.entity.color));
            }
            self.shake_magnitude = 8.0;
            self.floating_texts.push(FloatingText::new(bx, by, &format!("{}", damage), RED));
        }

        let red_beam_hit = if let Some((bx, by, bw, bh)) = self.red.beam_hitbox() {
            rect_intersect(bx, by, bw, bh, self.player.entity().x, self.player.entity().y, self.player.entity().w, self.player.entity().h)
        } else {
            false
        };

        if red_beam_hit && !self.player.is_invincible() && !self.player.entity().dead {
            let base_damage = 30;
            let damage = self.player.absorb_damage(base_damage);
            if damage > 0 {
                let actual_damage = self.player.entity().hp.min(damage);
                self.player.entity_mut().take_damage(actual_damage);
                self.session_stats.damage_taken_match += actual_damage as u32;
                let bx = self.player.entity().center_x();
                let by = self.player.entity().y;
                for _ in 0..8 {
                    self.particles.push(Particle::new(bx, by + 25.0, &self.player.entity().color));
                }
                self.shake_magnitude = 8.0;
                self.floating_texts.push(FloatingText::new(bx, by, &format!("{}", damage), RED));
            }
        }

        if !self.player.entity().dead && !self.red.entity.dead {
            let body_collision = rect_intersect(
                self.player.entity().x, self.player.entity().y, self.player.entity().w, self.player.entity().h,
                self.red.entity.x, self.red.entity.y, self.red.entity.w, self.red.entity.h,
            );
            if body_collision && self.red.is_invincible {
                let base_damage = 15;
                let damage = self.player.absorb_damage(base_damage);
                if damage > 0 {
                    let actual_damage = self.player.entity().hp.min(damage);
                    self.player.entity_mut().take_damage(actual_damage);
                    let bx = self.player.entity().center_x();
                    let by = self.player.entity().y;
                    for _ in 0..8 {
                        self.particles.push(Particle::new(bx, by + 25.0, &self.player.entity().color));
                    }
                    self.shake_magnitude = 5.0;
                }
            }
        }

        self.particles.iter_mut().for_each(|p| p.update());
        self.particles.retain(|p| !p.is_dead());

        self.floating_texts.iter_mut().for_each(|t| t.update());
        self.floating_texts.retain(|t| !t.is_dead());

        self.shake_magnitude *= 0.9;
        if self.shake_magnitude < 0.5 {
            self.shake_magnitude = 0.0;
        }

        if self.player.entity().dead {
            self.winner = Some("enemy".to_string());
            self.state = GameState::GameOver;
            self.check_achievements();
            self.save_progress();
            let _ = show_game_over("ENEMY");
        }
        if self.red.entity.dead {
            self.winner = Some("player".to_string());
            self.state = GameState::GameOver;
            self.check_achievements();
            self.save_progress();
            let _ = show_game_over("PLAYER");
        }
    }

    pub fn render(&mut self) -> Result<(), JsValue> {
        self.ctx.save();

        if self.shake_magnitude > 0.0 {
            let dx = (js_sys::Math::random() - 0.5) * self.shake_magnitude;
            let dy = (js_sys::Math::random() - 0.5) * self.shake_magnitude;
            self.ctx.translate(dx, dy)?;
        }

        match &self.state {
            GameState::Menu => self.render_menu()?,
            GameState::Playing => self.render_playing()?,
            GameState::GameOver => {
                self.render_playing()?;
                self.render_game_over()?;
            }
        }

        self.ctx.restore();
        Ok(())
    }

    fn draw_mode_badges(&self) -> Result<(), JsValue> {
        self.ctx.set_font("bold 16px Arial");
        let mut x = WIDTH - 10.0;
        if self.input.is_debug {
            let label = "DEBUG";
            let tw = label.len() as f64 * 9.0;
            x -= tw + 5.0;
            self.ctx.set_fill_style_str("#FF00FF");
            self.ctx.set_global_alpha(0.85);
            self.ctx.fill_rect(x - 4.0, 4.0, tw + 8.0, 22.0);
            self.ctx.set_global_alpha(1.0);
            self.ctx.set_fill_style_str("#000");
            self.ctx.fill_text(label, x, 20.0)?;
        }
        if self.input.is_tester {
            let label = "TESTER";
            let tw = label.len() as f64 * 9.0;
            x -= tw + 5.0;
            self.ctx.set_fill_style_str("#00FF00");
            self.ctx.set_global_alpha(0.85);
            self.ctx.fill_rect(x - 4.0, 4.0, tw + 8.0, 22.0);
            self.ctx.set_global_alpha(1.0);
            self.ctx.set_fill_style_str("#000");
            self.ctx.fill_text(label, x, 20.0)?;
        }
        if self.input.is_dev {
            let label = "DEV";
            let tw = 30.0;
            x -= tw + 5.0;
            self.ctx.set_fill_style_str("#FF8800");
            self.ctx.set_global_alpha(0.85);
            self.ctx.fill_rect(x - 4.0, 4.0, tw + 8.0, 22.0);
            self.ctx.set_global_alpha(1.0);
            self.ctx.set_fill_style_str("#000");
            self.ctx.fill_text(label, x, 20.0)?;
        }
        Ok(())
    }

    fn render_menu(&self) -> Result<(), JsValue> {
        self.ctx.set_fill_style_str("#1a1a2e");
        self.ctx.fill_rect(0.0, 0.0, WIDTH, HEIGHT);

        let _ = self.draw_mode_badges();
        let _ = show_menu();

        Ok(())
    }

    fn render_playing(&mut self) -> Result<(), JsValue> {
        self.ctx.set_fill_style_str("#f0f0f0");
        self.ctx.fill_rect(0.0, 0.0, WIDTH, HEIGHT);

        self.ctx.set_fill_style_str("#333333");
        self.ctx.fill_rect(0.0, FLOOR_Y, WIDTH, HEIGHT - FLOOR_Y);

        for p in &self.particles {
            p.draw(&self.ctx)?;
        }

        self.player.draw(&self.ctx)?;
        self.red.draw(&self.ctx)?;

        for t in &self.floating_texts {
            t.draw(&self.ctx)?;
        }

        self.draw_health_bars()?;

        Ok(())
    }

    fn render_game_over(&self) -> Result<(), JsValue> {
        self.ctx.set_fill_style_str("#000000");
        self.ctx.set_global_alpha(0.7);
        self.ctx.fill_rect(0.0, 0.0, WIDTH, HEIGHT);
        self.ctx.set_global_alpha(1.0);

        self.ctx.set_fill_style_str(WHITE);
        self.ctx.set_font("bold 48px Arial");

        let text = match &self.winner {
            Some(w) if w == "player" => "YOU WIN!",
            _ => "YOU LOSE!",
        };
        self.ctx.fill_text(text, WIDTH / 2.0 - 100.0, HEIGHT / 2.0)?;

        self.ctx.set_font("24px Arial");
        self.ctx.fill_text("Press R to restart", WIDTH / 2.0 - 100.0, HEIGHT / 2.0 + 50.0)?;

        Ok(())
    }

    fn draw_health_bars(&self) -> Result<(), JsValue> {
        let bar_width = 200.0;
        let bar_height = 20.0;
        let bar_y = 20.0;

        self.ctx.set_fill_style_str("#333333");
        self.ctx.fill_rect(20.0, bar_y, bar_width, bar_height);
        self.ctx.fill_rect(WIDTH - 20.0 - bar_width, bar_y, bar_width, bar_height);

        let player_hp_pct = self.player.entity().hp as f64 / self.player.entity().max_hp as f64;
        self.ctx.set_fill_style_str(&self.player.entity().color);
        self.ctx.fill_rect(20.0, bar_y, bar_width * player_hp_pct, bar_height);

        let red_hp_pct = self.red.entity.hp as f64 / self.red.entity.max_hp as f64;
        self.ctx.set_fill_style_str(RED);
        self.ctx.fill_rect(WIDTH - 20.0 - bar_width, bar_y, bar_width * red_hp_pct, bar_height);

        self.ctx.set_stroke_style_str(WHITE);
        self.ctx.set_line_width(2.0);
        self.ctx.stroke_rect(20.0, bar_y, bar_width, bar_height);
        self.ctx.stroke_rect(WIDTH - 20.0 - bar_width, bar_y, bar_width, bar_height);

        self.ctx.set_fill_style_str(WHITE);
        self.ctx.set_font("14px Arial");
        self.ctx.fill_text("PLAYER", 20.0, bar_y - 5.0)?;
        self.ctx.fill_text("ENEMY", WIDTH - 20.0 - bar_width, bar_y - 5.0)?;

        Ok(())
    }

    pub fn init_progress(&mut self) {
        if self.progress_loaded { return; }
        self.progress_loaded = true;
        if let Some(window) = web_sys::window() {
            if let Ok(Some(storage)) = window.local_storage() {
                if let Ok(Some(json)) = storage.get_item("cc_data") {
                    self.load_achievement_state_from_json(&json);
                }
            }
        }
    }

    fn load_achievement_state_from_json(&mut self, json: &str) {
        let json = json.trim();
        if !json.starts_with('[') || !json.ends_with(']') { return; }
        let inner = &json[1..json.len()-1];
        for chunk in inner.split("},{") {
            let chunk = chunk.trim().trim_start_matches('{').trim_end_matches('}');
            let mut id = 0u32;
            let mut unlocked = false;
            let mut progress = 0u32;
            for pair in chunk.split(',') {
                let pair = pair.trim();
                if let Some(eq) = pair.find(':') {
                    let key = pair[..eq].trim().trim_matches('"');
                    let val = pair[eq+1..].trim().trim_matches('"');
                    match key {
                        "id" => id = val.parse().unwrap_or(0),
                        "u" => unlocked = val == "true",
                        "p" => progress = val.parse().unwrap_or(0),
                        _ => {}
                    }
                }
            }
            if id > 0 {
                for state in &mut self.achievement_states {
                    if state.id == id {
                        state.unlocked = unlocked;
                        state.progress = progress;
                        break;
                    }
                }
            }
        }
    }

    pub fn save_progress(&self) {
        let json = self.build_achievement_json();
        if let Some(window) = web_sys::window() {
            if let Ok(Some(storage)) = window.local_storage() {
                let _ = storage.set_item("cc_data", &json);
            }
        }
    }

    fn build_achievement_json(&self) -> String {
        let mut s = String::from('[');
        for (i, state) in self.achievement_states.iter().enumerate() {
            if i > 0 { s.push(','); }
            s.push_str(&format!(r#"{{"id":{},"u":{},"p":{}}}"#, state.id, if state.unlocked { "true" } else { "false" }, state.progress));
        }
        s.push(']');
        s
    }

    pub fn reset_progress(&mut self) {
        for state in &mut self.achievement_states {
            state.unlocked = false;
            state.progress = 0;
        }
        self.selected_cube_id = 1;
        self.save_progress();
    }

    fn get_achievement_state(&self, id: u32) -> &AchievementState {
        self.achievement_states.iter().find(|a| a.id == id).unwrap_or(&self.achievement_states[0])
    }

    fn get_achievement_state_mut(&mut self, id: u32) -> &mut AchievementState {
        let idx = self.achievement_states.iter().position(|a| a.id == id).unwrap_or(0);
        &mut self.achievement_states[idx]
    }

    pub fn unlock_achievement(&mut self, id: u32) -> bool {
        let state = self.get_achievement_state(id);
        if state.unlocked { return false; }
        let state = self.get_achievement_state_mut(id);
        state.unlocked = true;
        if let Some(ach_data) = data::ACHIEVEMENTS.iter().find(|a| a.id == id) {
            if ach_data.max_progress > 0 {
                state.progress = ach_data.max_progress;
            }
        }
        if self.achievement_states.iter().filter(|s| s.id != 6).all(|s| s.unlocked) {
            self.unlock_achievement(6);
        }
        true
    }

    pub fn is_cube_unlocked(&self, cube_id: u32) -> bool {
        if self.input.is_debug { return true; }
        match cube_id {
            1 | 2 => true,
            8 | 10 => self.input.is_dev,
            9 => self.get_achievement_state(6).unlocked,
            _ => {
                let cube = data::get_cube_by_id(cube_id);
                if let Some(ach) = data::ACHIEVEMENTS.iter().find(|a| a.unlocks == cube.name) {
                    self.get_achievement_state(ach.id).unlocked
                } else {
                    false
                }
            }
        }
    }

    pub fn check_achievements(&mut self) {
        let won = self.winner.as_deref() == Some("player");

        if won {
            if self.unlock_achievement(1) {
                self.save_progress();
            }

            if self.session_stats.damage_taken_match == 0 {
                if self.unlock_achievement(3) {
                    self.save_progress();
                }
            }

            if self.selected_cube_id == 11 {
                let state = self.get_achievement_state_mut(8);
                state.progress = state.progress.saturating_add(1);
                if state.progress >= data::ACHIEVEMENTS[7].max_progress {
                    if self.unlock_achievement(8) {
                        self.save_progress();
                    }
                }
                self.save_progress();
            }

            if self.selected_cube_id == 12 {
                let player_full_hp = self.player.entity().hp >= self.player.entity().max_hp;
                if player_full_hp {
                    if self.unlock_achievement(9) {
                        self.save_progress();
                    }
                }
            }
        }

        let state = self.get_achievement_state(2);
        if !state.unlocked && self.session_stats.beams_hit_total >= 15 {
            if self.unlock_achievement(2) {
                self.save_progress();
            }
        }

        if self.achievement_states.iter().filter(|s| s.id != 6 && s.id != 7).all(|s| s.unlocked) {
            if self.unlock_achievement(7) {
                self.save_progress();
            }
        }
    }

    pub fn get_cubes_grid_html(&self) -> String {
        let mut html = String::new();
        let mut display_ids: Vec<u32> = data::CUBES.iter().filter(|c| !c.dev || self.input.is_dev).map(|c| c.id).collect();

        let master_idx = display_ids.iter().position(|&id| id == 9);
        if let Some(idx) = master_idx {
            display_ids.remove(idx);
            if self.is_cube_unlocked(9) {
                display_ids.insert(0, 9);
            }
        }

        for &cube_id in &display_ids {
            let cube = data::get_cube_by_id(cube_id);
            let unlocked = self.is_cube_unlocked(cube_id);
            let selected = self.selected_cube_id == cube_id;

            let mut classes = String::from("cube-icon");
            if !unlocked { classes.push_str(" locked"); }
            if selected { classes.push_str(" selected"); }

            html.push_str(&format!(
                r#"<div class="{}" data-cube-id="{}" style="background-color: {};" title="{}"></div>"#,
                classes, cube.id, cube.color, if unlocked { cube.name } else { "Locked" }
            ));
        }
        html
    }

    pub fn get_cube_details_html(&self, cube_id: u32) -> String {
        let cube = data::get_cube_by_id(cube_id);
        let unlocked = self.is_cube_unlocked(cube_id);
        let selected = self.selected_cube_id == cube_id;

        if !unlocked {
            return format!(
                r#"<div style="text-align:center; margin-top:50px;"><div style="font-size:48px; margin-bottom:20px;">&#x1F512;</div><div style="color:#aaa; font-size:20px;">Locked</div><div style="color:#888; margin-top:10px;">Complete the related achievement to unlock this cube.</div></div>"#
            );
        }

        format!(
            r#"<div style="text-align:center; margin-bottom:20px;"><div style="background:{}; width:80px; height:80px; display:inline-block; border:2px solid white;"></div></div>
            <div class="detail-row"><div class="detail-label">Name:</div><div class="detail-value">{}</div></div>
            <div class="detail-row"><div class="detail-label">Color:</div><div class="detail-value">{}</div></div>
            <div class="detail-row"><div class="detail-label">Max HP:</div><div class="detail-value">{}</div></div>
            <div class="detail-row"><div class="detail-label">Attacks:</div><div class="detail-value">{}</div></div>
            <div class="detail-row"><div class="detail-label">Attack 1:</div><div class="detail-value">{}</div></div>
            <div class="detail-row"><div class="detail-label">Attack 2:</div><div class="detail-value">{}</div></div>
            <div class="detail-row"><div class="detail-label">Counter:</div><div class="detail-value">{}</div></div>
            <div style="margin-top:20px; color:#00FF00; font-weight:bold; text-align:center;">{}</div>"#,
            cube.color, cube.name, cube.color, cube.hp, cube.attacks,
            cube.attack1, cube.attack2, cube.counter,
            if selected { "SELECTED" } else { "Click to select" }
        )
    }

    pub fn get_achievements_html(&self) -> String {
        let mut html = String::new();
        for ach_data in data::ACHIEVEMENTS {
            let state = self.get_achievement_state(ach_data.id);
            let unlocked = state.unlocked || self.input.is_debug;
            let progress = state.progress;

            let item_class = if unlocked { "achievement-item unlocked" } else { "achievement-item locked" };
            let status_text = if unlocked { "UNLOCKED" } else { "LOCKED" };

            let mut progress_html = String::new();
            if ach_data.max_progress > 0 {
                let pct = if ach_data.max_progress > 0 {
                    (progress as f64 / ach_data.max_progress as f64 * 100.0).min(100.0)
                } else { 0.0 };
                let bar_color = if unlocked { "#00aa00" } else { "#00FFFF" };
                progress_html = format!(
                    r#"<div style="width:100%; background:#222; height:10px; margin-top:8px; border-radius:5px; position:relative; border:1px solid #555;">
                        <div style="width:{}%; background:{}; height:100%; border-radius:5px; transition:width 0.3s;"></div>
                        <div style="position:absolute; top:-18px; right:0; font-size:12px; color:#ccc;">{}/{}</div>
                    </div>"#,
                    pct as u32, bar_color, progress, ach_data.max_progress
                );
            }

            html.push_str(&format!(
                r#"<div class="{}">
                    <div style="width:100%;">
                        <div style="display:flex; justify-content:space-between; align-items:center;">
                            <div style="font-size:24px; font-weight:bold;">#{} - {}</div>
                            <div style="font-size:20px; font-weight:bold;">{}</div>
                        </div>
                        <div style="font-size:16px; margin-top:5px;">{}</div>
                        {}
                        <div style="font-size:14px; margin-top:5px; font-style:italic;">Unlocks: {}</div>
                    </div>
                </div>"#,
                item_class, ach_data.id, ach_data.name, status_text, ach_data.desc, progress_html, ach_data.unlocks
            ));
        }
        html
    }
}
