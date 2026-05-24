use wasm_bindgen::JsValue;
use web_sys::CanvasRenderingContext2d;
use crate::entity::*;
use crate::cubes::blue::ParryState;

#[derive(PartialEq)]
pub enum BeamState {
    Idle,
    Windup,
    Firing,
}

pub struct PoisonTarget {
    pub ticks_remaining: u32,
    pub tick_timer: u32,
}

pub struct Bobbythe124Cube {
    pub entity: Entity,
    pub slash: crate::cubes::blue::SlashState,
    pub parry: ParryState,
    pub jump_count: u32,
    pub base_jump_force: f64,
    pub silence_cooldown: u32,
    pub silence_active: bool,
    pub silence_timer: u32,
    pub hatred_active: bool,
    pub hatred_timer: u32,
    pub hatred_cooldown: u32,
    pub damage_mult: f64,
    pub beam_state: BeamState,
    pub beam_timer: u32,
    pub bleed_cooldown: u32,
    pub bleed_active: bool,
    pub bleed_timer: u32,
    pub poison_targets: Vec<PoisonTarget>,
}

impl Bobbythe124Cube {
    pub fn new(x: f64, y: f64) -> Self {
        let mut entity = Entity::new(x, y, PERIWINKLE, 149);
        entity.max_hp = 149;
        entity.hp = 149;
        Bobbythe124Cube {
            entity,
            slash: crate::cubes::blue::SlashState::new(),
            parry: ParryState::new(),
            jump_count: 0,
            base_jump_force: JUMP_FORCE,
            silence_cooldown: 0,
            silence_active: false,
            silence_timer: 0,
            hatred_active: false,
            hatred_timer: 0,
            hatred_cooldown: 0,
            damage_mult: 1.0,
            beam_state: BeamState::Idle,
            beam_timer: 0,
            bleed_cooldown: 0,
            bleed_active: false,
            bleed_timer: 0,
            poison_targets: Vec::new(),
        }
    }

    pub fn update(&mut self, target: &Entity, input: &crate::input::Input) {
        if self.entity.dead {
            return;
        }

        if self.silence_cooldown > 0 {
            self.silence_cooldown -= 1;
        }
        if self.hatred_cooldown > 0 {
            self.hatred_cooldown -= 1;
        }
        if self.bleed_cooldown > 0 {
            self.bleed_cooldown -= 1;
        }
        if self.parry.cooldown > 0 {
            self.parry.cooldown -= 1;
        }

        if input.is_tester {
            self.silence_cooldown = 0;
            self.hatred_cooldown = 0;
            self.bleed_cooldown = 0;
            self.parry.cooldown = 0;
        }

        self.process_poison_damage(target);

        if self.hatred_active {
            self.hatred_timer -= 1;

            let now = js_sys::Date::now() as u64;
            if (now / 80) % 2 == 0 {
                self.entity.color = DARK_RED.to_string();
            } else {
                self.entity.color = self.entity.base_color.clone();
            }
            self.damage_mult = 1.5;

            if self.hatred_timer == 0 {
                self.hatred_active = false;
                self.entity.color = self.entity.base_color.clone();
                self.damage_mult = 1.0;
                self.hatred_cooldown = 480;
            }
        }

        match &self.beam_state {
            BeamState::Windup => {
                self.entity.vx = 0.0;
                self.beam_timer -= 1;

                let now = js_sys::Date::now() as u64;
                if (now / 100) % 2 == 0 {
                    self.entity.color = self.entity.base_color.clone();
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
                if !self.hatred_active {
                    self.entity.color = self.entity.base_color.clone();
                }
                self.beam_timer -= 1;
                if self.beam_timer == 0 {
                    self.beam_state = BeamState::Idle;
                }
                return;
            }
            BeamState::Idle => {}
        }

        if self.silence_active {
            self.silence_timer -= 1;
            if self.silence_timer == 0 {
                self.silence_active = false;
            }
        }

        if self.bleed_active {
            self.bleed_timer -= 1;
            if self.bleed_timer == 0 {
                self.bleed_active = false;
            }
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

        let current_speed = if self.hatred_active { MOVE_SPEED * 1.5 } else { MOVE_SPEED };

        if input.is_pressed("a") {
            self.entity.vx = -current_speed;
            self.entity.facing_right = false;
        }
        if input.is_pressed("d") {
            self.entity.vx = current_speed;
            self.entity.facing_right = true;
        }
        if input.is_pressed("w") && self.entity.is_grounded {
            self.jump_count += 1;
            let jump_bonus = (self.jump_count as f64 * 1.5).min(10.0);
            self.entity.vy = -(self.base_jump_force + jump_bonus);
            self.entity.is_grounded = false;
        }

        if input.is_pressed(" ") && self.silence_cooldown == 0 && self.beam_state == BeamState::Idle {
            self.silence_active = true;
            self.silence_timer = 15;
            self.silence_cooldown = 60;
        }

        if input.is_pressed("q") && self.hatred_cooldown == 0 && !self.hatred_active {
            self.hatred_active = true;
            self.hatred_timer = 300;
            self.hatred_cooldown = 600;
        }

        if input.is_pressed("f") && self.beam_state == BeamState::Idle {
            self.beam_state = BeamState::Windup;
            self.beam_timer = 40;
        }

        if input.is_pressed("e") && self.bleed_cooldown == 0 && self.beam_state == BeamState::Idle {
            self.bleed_active = true;
            self.bleed_timer = 20;
            self.bleed_cooldown = 90;
        }

        self.entity.vy += GRAVITY;
        self.entity.x += self.entity.vx;
        self.entity.y += self.entity.vy;

        if self.entity.y + self.entity.h >= FLOOR_Y {
            self.entity.y = FLOOR_Y - self.entity.h;
            self.entity.vy = 0.0;
            self.entity.is_grounded = true;
        } else {
            self.entity.is_grounded = false;
        }

        if self.entity.x < 0.0 {
            self.entity.x = 0.0;
            self.entity.vx = 0.0;
        }
        if self.entity.x + self.entity.w > WIDTH {
            self.entity.x = WIDTH - self.entity.w;
            self.entity.vx = 0.0;
        }

        self.entity.vx *= FRICTION;
        if self.entity.vx.abs() < 0.1 {
            self.entity.vx = 0.0;
        }
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
            // damage applied by caller
        }
    }

    fn process_poison_damage(&mut self, _target: &Entity) {
        let mut to_remove = Vec::new();
        for (i, poison) in self.poison_targets.iter_mut().enumerate() {
            poison.tick_timer -= 1;
            if poison.tick_timer == 0 {
                poison.tick_timer = 60;
                poison.ticks_remaining -= 1;

                if poison.ticks_remaining == 0 {
                    to_remove.push(i);
                }
            }
        }
        for i in to_remove.into_iter().rev() {
            self.poison_targets.remove(i);
        }
    }

    pub fn draw(&self, ctx: &CanvasRenderingContext2d) -> Result<(), JsValue> {
        if self.entity.dead {
            return Ok(());
        }

        ctx.set_fill_style_str(&self.entity.color);
        ctx.fill_rect(self.entity.x, self.entity.y, self.entity.w, self.entity.h);

        if self.hatred_active {
            ctx.set_shadow_blur(20.0);
            ctx.set_shadow_color(RED);
            ctx.set_stroke_style_str(RED);
            ctx.set_line_width(4.0);
            ctx.stroke_rect(self.entity.x - 2.0, self.entity.y - 2.0, self.entity.w + 4.0, self.entity.h + 4.0);
            ctx.set_shadow_blur(0.0);
        } else {
            ctx.set_stroke_style_str("#9999CC");
            ctx.set_line_width(2.0);
            ctx.stroke_rect(self.entity.x, self.entity.y, self.entity.w, self.entity.h);
        }

        let eye_color = if self.hatred_active { RED } else { "#6666AA" };
        let eye_x = if self.entity.facing_right {
            self.entity.x + self.entity.w - 15.0
        } else {
            self.entity.x + 5.0
        };
        ctx.set_fill_style_str(eye_color);
        ctx.begin_path();
        ctx.arc(eye_x, self.entity.y + 10.0, 5.0, 0.0, std::f64::consts::PI * 2.0)?;
        ctx.fill();

        if self.silence_active {
            let reach = 70.0;
            let hit_x = if self.entity.facing_right {
                self.entity.x + self.entity.w
            } else {
                self.entity.x - reach
            };
            ctx.set_fill_style_str("rgba(153, 153, 204, 0.6)");
            ctx.fill_rect(hit_x, self.entity.y, reach, self.entity.h);
        }

        if matches!(self.beam_state, BeamState::Firing) {
            let beam_w = 600.0;
            let beam_x = if self.entity.facing_right {
                self.entity.x + self.entity.w
            } else {
                self.entity.x - beam_w
            };

            ctx.set_shadow_blur(10.0);
            ctx.set_shadow_color("#AAAAFF");
            ctx.set_fill_style_str("#AAAAFF");
            ctx.fill_rect(beam_x, self.entity.y + 15.0, beam_w, 30.0);

            ctx.set_fill_style_str(WHITE);
            ctx.fill_rect(beam_x, self.entity.y + 22.0, beam_w, 16.0);

            ctx.set_shadow_blur(0.0);
        }

        if self.bleed_active {
            let reach = 100.0;
            let hit_x = if self.entity.facing_right {
                self.entity.x + self.entity.w
            } else {
                self.entity.x - reach
            };
            ctx.set_fill_style_str("rgba(139, 0, 0, 0.6)");
            ctx.fill_rect(hit_x, self.entity.y - 20.0, reach, self.entity.h + 40.0);
        }

        ctx.set_font("10px Arial");
        ctx.set_text_align("left");
        let mut indicator_y = self.entity.y - 55.0;

        let silence_text = if self.silence_cooldown > 0 {
            format!("SILENCE {}s", (self.silence_cooldown as f64 / 60.0).ceil() as u32)
        } else {
            "SILENCE READY".to_string()
        };
        ctx.set_fill_style_str(if self.silence_cooldown > 0 { GRAY } else { "#9999CC" });
        ctx.fill_text(&silence_text, self.entity.x - 20.0, indicator_y)?;
        indicator_y += 12.0;

        let hatred_text = if self.hatred_active {
            "HATRED ACTIVE".to_string()
        } else if self.hatred_cooldown > 0 {
            format!("HATRED {}s", (self.hatred_cooldown as f64 / 60.0).ceil() as u32)
        } else {
            "HATRED READY".to_string()
        };
        ctx.set_fill_style_str(if self.hatred_cooldown > 0 { GRAY } else { DARK_RED });
        ctx.fill_text(&hatred_text, self.entity.x - 20.0, indicator_y)?;
        indicator_y += 12.0;

        let beam_text = if self.beam_state != BeamState::Idle {
            "BEAM CHARGING".to_string()
        } else {
            "BEAM READY".to_string()
        };
        ctx.set_fill_style_str(if self.beam_state != BeamState::Idle { GRAY } else { "#AAAAFF" });
        ctx.fill_text(&beam_text, self.entity.x - 20.0, indicator_y)?;
        indicator_y += 12.0;

        let bleed_text = if self.bleed_cooldown > 0 {
            format!("BLEED {}s", (self.bleed_cooldown as f64 / 60.0).ceil() as u32)
        } else {
            "BLEED READY".to_string()
        };
        ctx.set_fill_style_str(if self.bleed_cooldown > 0 { GRAY } else { DARK_RED });
        ctx.fill_text(&bleed_text, self.entity.x - 20.0, indicator_y)?;
        indicator_y += 12.0;

        let jump_bonus = (self.jump_count as f64 * 1.5).min(10.0);
        ctx.set_fill_style_str(PERIWINKLE);
        ctx.fill_text(&format!("JUMPS: {} (+{:.1})", self.jump_count, jump_bonus), self.entity.x - 20.0, indicator_y)?;

        ctx.set_text_align("start");

        Ok(())
    }

    pub fn silence_hitbox(&self) -> Option<(f64, f64, f64, f64)> {
        if !self.silence_active {
            return None;
        }
        let reach = 70.0;
        let hit_x = if self.entity.facing_right {
            self.entity.x + self.entity.w
        } else {
            self.entity.x - reach
        };
        Some((hit_x, self.entity.y, reach, self.entity.h))
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

    pub fn bleed_hitbox(&self) -> Option<(f64, f64, f64, f64)> {
        if !self.bleed_active {
            return None;
        }
        let reach = 100.0;
        let hit_x = if self.entity.facing_right {
            self.entity.x + self.entity.w
        } else {
            self.entity.x - reach
        };
        Some((hit_x, self.entity.y - 20.0, reach, self.entity.h + 40.0))
    }

    pub fn apply_bleed_poison(&mut self) {
        self.poison_targets.push(PoisonTarget {
            ticks_remaining: 6,
            tick_timer: 60,
        });
    }

    pub fn has_poison(&self) -> bool {
        !self.poison_targets.is_empty()
    }
}
