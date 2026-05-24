use wasm_bindgen::JsValue;
use web_sys::CanvasRenderingContext2d;
use crate::entity::*;
use crate::cubes::blue::{SlashState, ParryState};

#[derive(PartialEq)]
pub enum BeamState {
    Idle,
    Windup,
    Firing,
}

pub struct AngrySniperCube {
    pub entity: Entity,
    pub slash: SlashState,
    pub parry: ParryState,
    pub dash_active: bool,
    pub dash_timer: u32,
    pub dash_windup: u32,
    pub dash_cooldown: u32,
    pub dash_hit: bool,
    pub beam_state: BeamState,
    pub beam_timer: u32,
    pub is_invincible: bool,
}

impl AngrySniperCube {
    pub fn new(x: f64, y: f64) -> Self {
        AngrySniperCube {
            entity: Entity::new(x, y, RED, 100),
            slash: SlashState::new(),
            parry: ParryState::new(),
            dash_active: false,
            dash_timer: 0,
            dash_windup: 0,
            dash_cooldown: 0,
            dash_hit: false,
            beam_state: BeamState::Idle,
            beam_timer: 0,
            is_invincible: false,
        }
    }

    pub fn update(&mut self, target: &Entity, input: &crate::input::Input) {
        if self.entity.dead {
            return;
        }

        if self.dash_cooldown > 0 {
            self.dash_cooldown -= 1;
        }
        if self.parry.cooldown > 0 {
            self.parry.cooldown -= 1;
        }

        if input.is_tester {
            self.slash.cooldown = 0;
            self.dash_cooldown = 0;
            self.parry.cooldown = 0;
        }

        if self.parry.active {
            self.parry.timer -= 1;
            if self.parry.timer == 0 {
                self.parry.active = false;
                self.parry.cooldown = 60;
                self.entity.color = self.entity.base_color.clone();
            }
            return;
        }

        if self.slash.active {
            self.slash.timer -= 1;
            if self.slash.timer == 0 {
                self.slash.active = false;
            }
        }

        match &self.beam_state {
            BeamState::Windup => {
                self.entity.vx = 0.0;
                self.beam_timer -= 1;

                let now = js_sys::Date::now() as u64;
                if (now / 100) % 2 == 0 {
                    self.entity.color = CYAN.to_string();
                } else {
                    self.entity.color = BLACK.to_string();
                }

                if self.beam_timer == 0 {
                    self.beam_state = BeamState::Firing;
                    self.beam_timer = 20;
                    self.fire_beam(target);
                }
                return;
            }
            BeamState::Firing => {
                self.entity.color = RED.to_string();
                self.beam_timer -= 1;
                if self.beam_timer == 0 {
                    self.beam_state = BeamState::Idle;
                }
                return;
            }
            BeamState::Idle => {}
        }

        if self.dash_windup > 0 {
            self.dash_windup -= 1;
            self.entity.vx = 0.0;

            let now = js_sys::Date::now() as u64;
            if (now / 50) % 2 == 0 {
                self.entity.color = "#500000".to_string();
            } else {
                self.entity.color = RED.to_string();
            }

            if self.dash_windup == 0 {
                self.execute_dash();
            }
            return;
        }

        if self.dash_active {
            self.dash_timer -= 1;
            self.entity.vx = if self.entity.facing_right { 20.0 } else { -20.0 };
            self.is_invincible = true;

            if self.dash_timer == 0 {
                self.dash_active = false;
                self.entity.vx = 0.0;
                self.is_invincible = false;
                self.entity.color = self.entity.base_color.clone();
            }

            self.entity.vy += GRAVITY;
            self.entity.x += self.entity.vx;
            self.entity.y += self.entity.vy;

            if self.entity.y + self.entity.h >= FLOOR_Y {
                self.entity.y = FLOOR_Y - self.entity.h;
                self.entity.vy = 0.0;
                self.entity.is_grounded = true;
            }

            if self.entity.x < 0.0 {
                self.entity.x = 0.0;
                self.entity.vx = 0.0;
            }
            if self.entity.x + self.entity.w > WIDTH {
                self.entity.x = WIDTH - self.entity.w;
                self.entity.vx = 0.0;
            }
            return;
        }

        if input.is_pressed("a") {
            self.entity.vx = -MOVE_SPEED;
            self.entity.facing_right = false;
        }
        if input.is_pressed("d") {
            self.entity.vx = MOVE_SPEED;
            self.entity.facing_right = true;
        }
        if input.is_pressed("w") {
            self.entity.jump();
        }

        if input.is_pressed(" ") && self.slash.cooldown == 0 && !self.dash_active && self.dash_windup == 0 && self.dash_cooldown == 0 {
            self.dash_windup = 15;
        }

        if input.is_pressed("f") && self.beam_state == BeamState::Idle {
            self.beam_state = BeamState::Windup;
            self.beam_timer = 50;
        }

        self.entity.update();
    }

    fn execute_dash(&mut self) {
        self.dash_active = true;
        self.dash_timer = 15;
        self.dash_cooldown = 90;
        self.dash_hit = false;
        self.is_invincible = true;
        self.entity.color = RED.to_string();
    }

    fn fire_beam(&mut self, target: &Entity) {
        let beam_w = 600.0;
        let beam_h = 40.0;
        let beam_x = if self.entity.facing_right {
            self.entity.x + self.entity.w
        } else {
            self.entity.x - beam_w
        };
        let beam_y = self.entity.y + (self.entity.h / 2.0) - (beam_h / 2.0);

        if rect_intersect(beam_x, beam_y, beam_w, beam_h, target.x, target.y, target.w, target.h) {
            // damage applied by caller
        }
    }

    pub fn draw(&self, ctx: &CanvasRenderingContext2d) -> Result<(), JsValue> {
        self.entity.draw(ctx)?;

        if self.dash_windup > 0 {
            ctx.set_fill_style_str("rgba(255, 255, 255, 0.5)");
            ctx.fill_rect(self.entity.x, self.entity.y, self.entity.w, self.entity.h);
            ctx.set_stroke_style_str(WHITE);
            ctx.set_line_width(2.0);
            ctx.stroke_rect(self.entity.x - 5.0, self.entity.y - 5.0, self.entity.w + 10.0, self.entity.h + 10.0);
        }

        if self.dash_active {
            ctx.set_fill_style_str("rgba(255, 0, 0, 0.5)");
            let offset = if self.entity.facing_right { -20.0 } else { 20.0 };
            ctx.fill_rect(self.entity.x + offset, self.entity.y, self.entity.w, self.entity.h);
        }

        if matches!(self.beam_state, BeamState::Firing) {
            let beam_w = 600.0;
            let beam_h = 40.0;
            let beam_x = if self.entity.facing_right {
                self.entity.x + self.entity.w
            } else {
                self.entity.x - beam_w
            };
            let beam_y = self.entity.y + (self.entity.h / 2.0) - (beam_h / 2.0);

            ctx.set_shadow_blur(20.0);
            ctx.set_shadow_color(CYAN);
            ctx.set_fill_style_str(CYAN);
            ctx.fill_rect(beam_x, beam_y, beam_w, beam_h);

            ctx.set_fill_style_str(WHITE);
            ctx.fill_rect(beam_x, beam_y + 15.0, beam_w, 10.0);

            ctx.set_shadow_blur(0.0);
        }

        Ok(())
    }

    pub fn dash_hitbox(&self) -> Option<(f64, f64, f64, f64)> {
        if !self.dash_active {
            return None;
        }
        Some((self.entity.x, self.entity.y, self.entity.w, self.entity.h))
    }

    pub fn beam_hitbox(&self) -> Option<(f64, f64, f64, f64)> {
        if !matches!(self.beam_state, BeamState::Firing) {
            return None;
        }
        let beam_w = 600.0;
        let beam_h = 40.0;
        let beam_x = if self.entity.facing_right {
            self.entity.x + self.entity.w
        } else {
            self.entity.x - beam_w
        };
        let beam_y = self.entity.y + (self.entity.h / 2.0) - (beam_h / 2.0);
        Some((beam_x, beam_y, beam_w, beam_h))
    }

    pub fn is_firing_beam(&self) -> bool {
        matches!(self.beam_state, BeamState::Firing)
    }
}
