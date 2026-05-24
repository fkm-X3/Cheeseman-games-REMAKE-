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

pub struct GreenCube {
    pub entity: Entity,
    pub slash: SlashState,
    pub parry: ParryState,
    pub beam_state: BeamState,
    pub beam_timer: u32,
}

impl GreenCube {
    pub fn new(x: f64, y: f64) -> Self {
        GreenCube {
            entity: Entity::new(x, y, GREEN, 100),
            slash: SlashState::new(),
            parry: ParryState::new(),
            beam_state: BeamState::Idle,
            beam_timer: 0,
        }
    }

    pub fn update(&mut self, target: &Entity, input: &crate::input::Input) {
        if self.entity.dead {
            return;
        }

        if self.slash.cooldown > 0 {
            self.slash.cooldown -= 1;
        }
        if self.parry.cooldown > 0 {
            self.parry.cooldown -= 1;
        }

        if input.is_tester {
            self.slash.cooldown = 0;
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
                    self.entity.color = GREEN.to_string();
                } else {
                    self.entity.color = WHITE.to_string();
                }

                if self.beam_timer == 0 {
                    self.beam_state = BeamState::Firing;
                    self.beam_timer = 15;
                    self.fire_beam(target);
                }
                return;
            }
            BeamState::Firing => {
                self.entity.color = GREEN.to_string();
                self.beam_timer -= 1;
                if self.beam_timer == 0 {
                    self.beam_state = BeamState::Idle;
                }
                return;
            }
            BeamState::Idle => {}
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
            self.slash.timer = 15;
            self.slash.cooldown = 60;
        }

        if input.is_pressed("f") && self.beam_state == BeamState::Idle {
            self.beam_state = BeamState::Windup;
            self.beam_timer = 40;
        }

        self.entity.update();
    }

    fn fire_beam(&mut self, target: &Entity) {
        let beam_w = 600.0;
        let beam_h = 30.0;
        let beam_x = if self.entity.facing_right {
            self.entity.x + self.entity.w
        } else {
            self.entity.x - beam_w
        };
        let beam_y = self.entity.y + 15.0;

        if rect_intersect(beam_x, beam_y, beam_w, beam_h, target.x, target.y, target.w, target.h) {
            // damage applied - caller handles actual take_damage
        }
    }

    pub fn draw(&self, ctx: &CanvasRenderingContext2d) -> Result<(), JsValue> {
        self.entity.draw(ctx)?;

        if self.slash.active {
            ctx.set_fill_style_str(PURPLE);
            let slash_reach = 70.0;
            let slash_x = if self.entity.facing_right {
                self.entity.x + self.entity.w
            } else {
                self.entity.x - slash_reach
            };
            ctx.begin_path();
            ctx.arc(
                slash_x + slash_reach / 2.0,
                self.entity.y + self.entity.h / 2.0,
                slash_reach / 2.0,
                0.0,
                std::f64::consts::PI * 2.0,
            )?;
            ctx.fill();
        }

        if self.parry.active {
            ctx.set_fill_style_str(WHITE);
            ctx.set_global_alpha(0.5);
            ctx.begin_path();
            ctx.arc(
                self.entity.center_x(),
                self.entity.center_y(),
                self.entity.w / 2.0 + 10.0,
                0.0,
                std::f64::consts::PI * 2.0,
            )?;
            ctx.fill();
            ctx.set_global_alpha(1.0);
        }

        if matches!(self.beam_state, BeamState::Firing) {
            let beam_w = 600.0;
            let beam_x = if self.entity.facing_right {
                self.entity.x + self.entity.w
            } else {
                self.entity.x - beam_w
            };

            ctx.set_shadow_blur(20.0);
            ctx.set_shadow_color(GREEN);
            ctx.set_fill_style_str(GREEN);
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
        let slash_reach = 70.0;
        let slash_x = if self.entity.facing_right {
            self.entity.x + self.entity.w
        } else {
            self.entity.x - slash_reach
        };
        Some((slash_x, self.entity.y, slash_reach, self.entity.h))
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
}
