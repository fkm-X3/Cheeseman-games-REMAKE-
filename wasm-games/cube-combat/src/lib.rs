use wasm_bindgen::prelude::*;
use wasm_bindgen::JsCast;
use wasm_bindgen::closure::Closure;
use web_sys::{CanvasRenderingContext2d, HtmlCanvasElement, KeyboardEvent};
use std::rc::Rc;
use std::cell::RefCell;

#[wasm_bindgen(start)]
pub fn start() -> Result<(), JsValue> {
    console_error_panic_hook::set_once();

    let window = web_sys::window().ok_or_else(|| JsValue::from_str("no window"))?;
    let document = window.document().ok_or_else(|| JsValue::from_str("no document"))?;

    let canvas = document.get_element_by_id("game-canvas")
        .ok_or_else(|| JsValue::from_str("canvas not found"))?
        .dyn_into::<HtmlCanvasElement>()?;

    let width = 800.0_f64;
    let height = 400.0_f64;
    canvas.set_width(width as u32);
    canvas.set_height(height as u32);

    let ctx = canvas
        .get_context("2d")?
        .ok_or_else(|| JsValue::from_str("no 2d context"))?
        .dyn_into::<CanvasRenderingContext2d>()?;

    let game = Rc::new(RefCell::new(Game::new(ctx, width, height)));

    // keyboard listeners
    {
        let g = game.clone();
        let keydown = Closure::wrap(Box::new(move |e: KeyboardEvent| {
            g.borrow_mut().on_key_down(&e.key());
        }) as Box<dyn FnMut(_)>);
        window.add_event_listener_with_callback("keydown", keydown.as_ref().unchecked_ref())?;
        keydown.forget();
    }
    {
        let g = game.clone();
        let keyup = Closure::wrap(Box::new(move |e: KeyboardEvent| {
            g.borrow_mut().on_key_up(&e.key());
        }) as Box<dyn FnMut(_)>);
        window.add_event_listener_with_callback("keyup", keyup.as_ref().unchecked_ref())?;
        keyup.forget();
    }

    // animation loop
    let f = Rc::new(RefCell::new(None));
    let g = f.clone();
    let window2 = window.clone();
    let game_loop = game.clone();
    *g.borrow_mut() = Some(Closure::wrap(Box::new(move |_ts: f64| {
        {
            let mut gm = game_loop.borrow_mut();
            gm.update();
            gm.render();
        }
        // schedule next frame
        if let Some(cb) = f.borrow().as_ref() {
            window2.request_animation_frame(cb.as_ref().unchecked_ref()).unwrap();
        }
    }) as Box<dyn FnMut(f64)>));

    if let Some(cb) = g.borrow().as_ref() {
        window.request_animation_frame(cb.as_ref().unchecked_ref())?;
    }

    Ok(())
}

// --- Game data ---

#[derive(Default)]
struct Keys {
    left: bool,
    right: bool,
}

struct Game {
    ctx: CanvasRenderingContext2d,
    width: f64,
    height: f64,
    keys: Keys,
    player: Player,
    enemy: Enemy,
}

impl Game {
    fn new(ctx: CanvasRenderingContext2d, width: f64, height: f64) -> Self {
        Self {
            ctx,
            width,
            height,
            keys: Keys::default(),
            player: Player::new(100.0, height - 60.0),
            enemy: Enemy::new(600.0, height - 60.0),
        }
    }

    fn on_key_down(&mut self, key: &str) {
        match key {
            "ArrowLeft" => self.keys.left = true,
            "ArrowRight" => self.keys.right = true,
            "z" | "Z" => self.player.try_slash(),
            "x" | "X" => self.player.try_parry(),
            _ => {}
        }
    }

    fn on_key_up(&mut self, key: &str) {
        match key {
            "ArrowLeft" => self.keys.left = false,
            "ArrowRight" => self.keys.right = false,
            _ => {}
        }
    }

    fn update(&mut self) {
        // player movement
        let speed = 3.0;
        if self.keys.left { self.player.x -= speed; self.player.facing = -1; }
        if self.keys.right { self.player.x += speed; self.player.facing = 1; }
        // clamp
        self.player.x = self.player.x.max(0.0).min(self.width - self.player.w);

        self.player.tick();

        // enemy AI + movement
        self.enemy.update_ai(self.player.x, self.width);
        self.enemy.tick();

        // collisions: slash
        if self.player.slash_timer > 0.0 && !self.enemy.dead {
            let (sx, sy, sw, sh) = self.player.slash_hitbox();
            if rects_overlap(sx, sy, sw, sh, self.enemy.x, self.enemy.y, self.enemy.w, self.enemy.h) {
                self.enemy.take_damage(15);
                self.player.slash_timer = 0.0; // one hit per slash
            }
        }

        // dash collision
        if self.enemy.is_dashing && !self.enemy.dead {
            if rects_overlap(self.player.x, self.player.y, self.player.w, self.player.h, self.enemy.x, self.enemy.y, self.enemy.w, self.enemy.h) {
                if self.player.parry_timer > 0.0 {
                    // reflect
                    self.enemy.take_damage(10);
                    self.enemy.stun(40.0);
                } else {
                    self.player.health -= 12;
                    // small knockback
                    self.player.x += 10.0 * (self.player.x - self.enemy.x).signum();
                }
            }
        }

        // beam collision
        if self.enemy.is_firing_beam && !self.enemy.dead {
            // beam rectangle from enemy towards facing edge
            let (bx, bw) = if self.enemy.facing == 1 { (self.enemy.x + self.enemy.w, self.width - (self.enemy.x + self.enemy.w)) } else { (0.0, self.enemy.x) };
            if rects_overlap(self.player.x, self.player.y, self.player.w, self.player.h, bx, 0.0, bw, self.height) {
                if self.player.parry_timer > 0.0 {
                    self.enemy.take_damage(8);
                    self.enemy.stun(40.0);
                } else {
                    // damage once per beam firing start; implement simple cooldown
                    if !self.enemy.did_hit_player_with_beam {
                        self.player.health -= 8;
                        self.enemy.did_hit_player_with_beam = true;
                    }
                }
            }
        }

        // clamp health
        if self.player.health < 0 { self.player.health = 0; }
    }

    fn render(&self) {
        // clear
        self.ctx.set_fill_style(&JsValue::from_str("#111"));
        self.ctx.fill_rect(0.0, 0.0, self.width, self.height);

        // ground
        self.ctx.set_fill_style(&JsValue::from_str("#222"));
        self.ctx.fill_rect(0.0, self.height - 40.0, self.width, 40.0);

        // player
        self.ctx.set_fill_style(&JsValue::from_str("#1e90ff"));
        self.ctx.fill_rect(self.player.x, self.player.y, self.player.w, self.player.h);

        // player slash
        if self.player.slash_timer > 0.0 {
            let (sx, sy, sw, sh) = self.player.slash_hitbox();
            self.ctx.set_fill_style(&JsValue::from_str("rgba(0,180,255,0.8)"));
            self.ctx.fill_rect(sx, sy, sw, sh);
        }

        // player parry indicator
        if self.player.parry_timer > 0.0 {
            self.ctx.set_stroke_style(&JsValue::from_str("#fff"));
            self.ctx.stroke_rect(self.player.x - 2.0, self.player.y - 2.0, self.player.w + 4.0, self.player.h + 4.0);
        }

        // enemy
        if !self.enemy.dead {
            self.ctx.set_fill_style(&JsValue::from_str("#d22"));
            self.ctx.fill_rect(self.enemy.x, self.enemy.y, self.enemy.w, self.enemy.h);

            // enemy dash visual
            if self.enemy.is_dashing {
                self.ctx.set_fill_style(&JsValue::from_str("rgba(255,120,120,0.6)"));
                self.ctx.fill_rect(self.enemy.x - 6.0, self.enemy.y - 6.0, self.enemy.w + 12.0, self.enemy.h + 12.0);
            }

            // beam
            if self.enemy.is_firing_beam {
                let (bx, bw) = if self.enemy.facing == 1 { (self.enemy.x + self.enemy.w, self.width - (self.enemy.x + self.enemy.w)) } else { (0.0, self.enemy.x) };
                self.ctx.set_fill_style(&JsValue::from_str("rgba(255,0,0,0.25)"));
                self.ctx.fill_rect(bx, 0.0, bw, self.height);
            }
        }

        // UI
        self.ctx.set_fill_style(&JsValue::from_str("#fff"));
        self.ctx.set_font("16px sans-serif");
        self.ctx.fill_text(&format!("Player HP: {}", self.player.health), 10.0, 20.0).ok();
        self.ctx.fill_text(&format!("Enemy HP: {}", if self.enemy.dead {0} else {self.enemy.health}), self.width - 140.0, 20.0).ok();

        // instructions
        self.ctx.set_fill_style(&JsValue::from_str("#aaa"));
        self.ctx.set_font("12px sans-serif");
        self.ctx.fill_text("Arrows: move  •  Z: slash  •  X: parry", self.width/2.0 - 110.0, 20.0).ok();
    }
}

// --- Player ---
struct Player {
    x: f64,
    y: f64,
    w: f64,
    h: f64,
    facing: i32,
    health: i32,
    slash_timer: f64,
    slash_cooldown: f64,
    parry_timer: f64,
    parry_cooldown: f64,
}

impl Player {
    fn new(x: f64, y: f64) -> Self {
        Self { x, y, w: 32.0, h: 48.0, facing: 1, health: 100, slash_timer: 0.0, slash_cooldown: 0.0, parry_timer: 0.0, parry_cooldown: 0.0 }
    }

    fn try_slash(&mut self) {
        if self.slash_cooldown <= 0.0 {
            self.slash_timer = 12.0; // ~200ms
            self.slash_cooldown = 30.0;
        }
    }

    fn try_parry(&mut self) {
        if self.parry_cooldown <= 0.0 {
            self.parry_timer = 18.0; // ~300ms
            self.parry_cooldown = 60.0; // cooldown
        }
    }

    fn tick(&mut self) {
        if self.slash_timer > 0.0 { self.slash_timer -= 1.0; }
        if self.slash_cooldown > 0.0 { self.slash_cooldown -= 1.0; }
        if self.parry_timer > 0.0 { self.parry_timer -= 1.0; }
        if self.parry_cooldown > 0.0 { self.parry_cooldown -= 1.0; }
    }

    fn slash_hitbox(&self) -> (f64, f64, f64, f64) {
        let sh = 28.0;
        let sw = 40.0;
        if self.facing >= 0 {
            (self.x + self.w, self.y + (self.h - sh)/2.0, sw, sh)
        } else {
            (self.x - sw, self.y + (self.h - sh)/2.0, sw, sh)
        }
    }
}

// --- Enemy ---
#[derive(PartialEq)]
enum EnemyState { Idle, Dashing, BeamWindup, BeamFiring, Stunned }

struct Enemy {
    x: f64,
    y: f64,
    w: f64,
    h: f64,
    facing: i32,
    health: i32,
    state: EnemyState,
    state_timer: f64,
    dash_cooldown: f64,
    beam_cooldown: f64,
    is_dashing: bool,
    is_firing_beam: bool,
    dead: bool,
    did_hit_player_with_beam: bool,
}

impl Enemy {
    fn new(x: f64, y: f64) -> Self {
        Self { x, y, w: 36.0, h: 52.0, facing: -1, health: 120, state: EnemyState::Idle, state_timer: 0.0, dash_cooldown: 0.0, beam_cooldown: 0.0, is_dashing: false, is_firing_beam: false, dead: false, did_hit_player_with_beam: false }
    }

    fn update_ai(&mut self, player_x: f64, _world_w: f64) {
        if self.dead { return }
        // face player
        self.facing = if player_x > self.x { 1 } else { -1 };

        // choose actions when idle
        if self.state == EnemyState::Idle {
            if self.dash_cooldown <= 0.0 && js_sys::Math::random() > 0.985 {
                self.start_dash();
            } else if self.beam_cooldown <= 0.0 && js_sys::Math::random() > 0.992 {
                self.start_beam();
            }
        }
    }

    fn start_dash(&mut self) {
        self.state = EnemyState::Dashing;
        self.state_timer = 18.0; // dash duration
        self.is_dashing = true;
        self.dash_cooldown = 120.0;
        self.did_hit_player_with_beam = false;
    }

    fn start_beam(&mut self) {
        self.state = EnemyState::BeamWindup;
        self.state_timer = 24.0; // windup
        self.beam_cooldown = 180.0;
        self.is_firing_beam = false;
        self.did_hit_player_with_beam = false;
    }

    fn stun(&mut self, t: f64) {
        self.state = EnemyState::Stunned;
        self.state_timer = t;
        self.is_dashing = false;
        self.is_firing_beam = false;
    }

    fn take_damage(&mut self, d: i32) {
        self.health -= d;
        if self.health <= 0 { self.dead = true; }
    }

    fn tick(&mut self) {
        if self.dead { return }
        // timers
        if self.dash_cooldown > 0.0 { self.dash_cooldown -= 1.0; }
        if self.beam_cooldown > 0.0 { self.beam_cooldown -= 1.0; }

        match self.state {
            EnemyState::Dashing => {
                let vel = 8.0 * (self.facing as f64);
                self.x += vel;
                self.state_timer -= 1.0;
                self.is_dashing = true;
                if self.state_timer <= 0.0 { self.state = EnemyState::Idle; self.is_dashing = false; }
            }
            EnemyState::BeamWindup => {
                self.state_timer -= 1.0;
                if self.state_timer <= 0.0 { self.state = EnemyState::BeamFiring; self.state_timer = 30.0; self.is_firing_beam = true; self.did_hit_player_with_beam = false; }
            }
            EnemyState::BeamFiring => {
                self.state_timer -= 1.0;
                self.is_firing_beam = true;
                if self.state_timer <= 0.0 { self.state = EnemyState::Idle; self.is_firing_beam = false; }
            }
            EnemyState::Stunned => {
                self.state_timer -= 1.0;
                if self.state_timer <= 0.0 { self.state = EnemyState::Idle; }
            }
            EnemyState::Idle => {}
        }
    }
}

// --- helpers ---

fn rects_overlap(ax: f64, ay: f64, aw: f64, ah: f64, bx: f64, by: f64, bw: f64, bh: f64) -> bool {
    ax < bx + bw && ax + aw > bx && ay < by + bh && ay + ah > by
}
