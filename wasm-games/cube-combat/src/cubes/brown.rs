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

pub struct BrownCube {
    pub entity: Entity,
    pub slash: SlashState,
    pub parry: ParryState,
    pub beam_state: BeamState,
    pub beam_timer: u32,
    pub enemy_stun_timer: u32,
}

impl BrownCube {
    pub fn new(x: f64, y: f64) -> Self {
        let mut entity = Entity::new(x, y, BROWN, 75);
        entity.max_hp = 75;
        entity.hp = 75;
        BrownCube {
            entity,
            slash: SlashState::new(),
            parry: ParryState::new(),
            beam_state: BeamState::Idle,
            beam_timer: 0,
            enemy_stun_timer: 0,
        }
    }

    pub fn update(&mut self, target: &Entity, input: &crate::input::Input) {
        if self.entity.dead {
            return;
        }

        if self.slash.cooldown > 0 {
            self.slash.cooldown -= 1;
        }

        if input.is_tester {
            self.slash.cooldown = 0;
        }

        if self.enemy_stun_timer > 0 {
            self.enemy_stun_timer -= 1;
        }

        match &self.beam_state {
            BeamState::Windup => {
                self.entity.vx = 0.0;
                self.beam_timer -= 1;

                let now = js_sys::Date::now() as u64;
                if (now / 100) % 2 == 0 {
                    self.entity.color = BROWN.to_string();
                } else {
                    self.entity.color = YELLOW.to_string();
                }

                if self.beam_timer == 0 {
                    self.beam_state = BeamState::Firing;
                    self.beam_timer = 15;
                    self.fire_beam(target);
                }
                return;
            }
            BeamState::Firing => {
                self.entity.color = BROWN.to_string();
                self.beam_timer -= 1;
                if self.beam_timer == 0 {
                    self.beam_state = BeamState::Idle;
                }
                return;
            }
            BeamState::Idle => {}
        }

        if self.slash.active {
            self.slash.timer -= 1;
            if self.slash.timer == 0 {
                self.slash.active = false;
            }
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

        if input.is_pressed(" ") && self.slash.cooldown == 0 && !self.slash.active {
            self.slash.active = true;
            self.slash.timer = 10;
            self.slash.cooldown = 50;
        }

        if input.is_pressed("f") && self.beam_state == BeamState::Idle {
            self.beam_state = BeamState::Windup;
            self.beam_timer = 40;
        }

        self.entity.update();
    }

    fn fire_beam(&mut self, target: &Entity) {
        let beam_w = 600.0;
        let beam_x = if self.entity.facing_right {
            self.entity.x + self.entity.w
        } else {
            self.entity.x - beam_w
        };

        if rect_intersect(beam_x, self.entity.y + 15.0, beam_w, 30.0, target.x, target.y, target.w, target.h) {
            // damage applied by caller
        }
    }

    pub fn draw(&self, ctx: &CanvasRenderingContext2d) -> Result<(), JsValue> {
        self.entity.draw(ctx)?;

        if self.slash.active {
            let reach = 60.0;
            let hit_x = if self.entity.facing_right {
                self.entity.x + self.entity.w
            } else {
                self.entity.x - reach
            };
            ctx.set_fill_style_str("rgba(139, 69, 19, 0.6)");
            ctx.fill_rect(hit_x, self.entity.y + 20.0, reach, 30.0);
        }

        if matches!(self.beam_state, BeamState::Firing) {
            let beam_w = 600.0;
            let beam_x = if self.entity.facing_right {
                self.entity.x + self.entity.w
            } else {
                self.entity.x - beam_w
            };

            ctx.set_shadow_blur(15.0);
            ctx.set_shadow_color(YELLOW);
            ctx.set_fill_style_str(YELLOW);
            ctx.fill_rect(beam_x, self.entity.y + 15.0, beam_w, 30.0);

            ctx.set_fill_style_str(WHITE);
            ctx.fill_rect(beam_x, self.entity.y + 22.0, beam_w, 16.0);

            ctx.set_shadow_blur(0.0);
        }

        Ok(())
    }

    pub fn slash_hitbox(&self) -> Option<(f64, f64, f64, f64)> {
        if !self.slash.active {
            return None;
        }
        let reach = 60.0;
        let hit_x = if self.entity.facing_right {
            self.entity.x + self.entity.w
        } else {
            self.entity.x - reach
        };
        Some((hit_x, self.entity.y + 20.0, reach, 30.0))
    }

    pub fn beam_hitbox(&self) -> Option<(f64, f64, f64, f64)> {
        if !matches!(self.beam_state, BeamState::Firing) {
            return None;
        }
        let beam_w = 600.0;
        let beam_x = if self.entity.facing_right {
            self.entity.x + self.entity.w
        } else {
            self.entity.x - beam_w
        };
        Some((beam_x, self.entity.y + 15.0, beam_w, 30.0))
    }

    pub fn is_firing_beam(&self) -> bool {
        matches!(self.beam_state, BeamState::Firing)
    }

    pub fn kick_damage(&self) -> i32 {
        15
    }

    pub fn beam_damage(&self) -> i32 {
        25
    }
}
