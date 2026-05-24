use wasm_bindgen::JsValue;
use web_sys::CanvasRenderingContext2d;
use crate::entity::*;
use crate::cubes::blue::ParryState;

pub struct PoisonTarget {
    pub ticks_remaining: u32,
    pub tick_timer: u32,
}

pub struct CloneData {
    pub x: f64,
    pub y: f64,
    pub w: f64,
    pub h: f64,
    pub facing_right: bool,
    pub hp: i32,
    pub dead: bool,
    pub attack_timer: u32,
    pub alpha: f64,
}

pub struct Fbt7Cube {
    pub entity: Entity,
    pub delete_slash_active: bool,
    pub delete_slash_timer: u32,
    pub delete_cooldown: u32,
    pub poison_targets: Vec<PoisonTarget>,
    pub error404_active: bool,
    pub error404_timer: u32,
    pub error404_cooldown: u32,
    pub clone: Option<CloneData>,
    pub hatred_active: bool,
    pub hatred_timer: u32,
    pub hatred_cooldown: u32,
    pub damage_mult: f64,
    pub termination_cooldown: u32,
    pub parry: ParryState,
}

impl Fbt7Cube {
    pub fn new(x: f64, y: f64) -> Self {
        let mut entity = Entity::new(x, y, BLACK, 200);
        entity.max_hp = 200;
        entity.hp = 200;
        Fbt7Cube {
            entity,
            delete_slash_active: false,
            delete_slash_timer: 0,
            delete_cooldown: 0,
            poison_targets: Vec::new(),
            error404_active: false,
            error404_timer: 0,
            error404_cooldown: 0,
            clone: None,
            hatred_active: false,
            hatred_timer: 0,
            hatred_cooldown: 0,
            damage_mult: 1.0,
            termination_cooldown: 0,
            parry: ParryState::new(),
        }
    }

    pub fn update(&mut self, target: &Entity, input: &crate::input::Input) {
        if self.entity.dead {
            return;
        }

        if self.delete_cooldown > 0 {
            self.delete_cooldown -= 1;
        }
        if self.error404_cooldown > 0 {
            self.error404_cooldown -= 1;
        }
        if self.hatred_cooldown > 0 {
            self.hatred_cooldown -= 1;
        }
        if self.termination_cooldown > 0 {
            self.termination_cooldown -= 1;
        }
        if self.parry.cooldown > 0 {
            self.parry.cooldown -= 1;
        }

        if input.is_tester {
            self.delete_cooldown = 0;
            self.error404_cooldown = 0;
            self.hatred_cooldown = 0;
            self.termination_cooldown = 0;
            self.parry.cooldown = 0;
        }

        self.process_poison_damage(target);

        if self.hatred_active {
            self.hatred_timer -= 1;

            let now = js_sys::Date::now() as u64;
            if (now / 80) % 2 == 0 {
                self.entity.color = DARK_RED.to_string();
            } else {
                self.entity.color = BLACK.to_string();
            }
            self.damage_mult = 2.0;

            if self.hatred_timer == 0 {
                self.hatred_active = false;
                self.entity.color = self.entity.base_color.clone();
                self.damage_mult = 1.0;
                self.hatred_cooldown = 600;
            }
        }

        if self.error404_active {
            self.error404_timer -= 1;
            if self.error404_timer == 0 {
                self.error404_active = false;
                self.clone = None;
                self.error404_cooldown = 480;
            }
        }

        if let Some(ref mut clone) = self.clone {
            if clone.dead {
                // skip
            } else {
                let dx = target.x - clone.x;
                if dx.abs() > 100.0 {
                    clone.x += if dx > 0.0 { 3.0 } else { -3.0 };
                    clone.facing_right = dx > 0.0;
                }

                clone.attack_timer -= 1;
                if clone.attack_timer == 0 {
                    clone.attack_timer = 90;
                }
            }
        }

        if !self.error404_active {
            self.clone = None;
        }

        if self.delete_slash_active {
            self.delete_slash_timer -= 1;
            if self.delete_slash_timer == 0 {
                self.delete_slash_active = false;
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

        let current_speed = if self.hatred_active { MOVE_SPEED * 1.8 } else { MOVE_SPEED };

        if input.is_pressed("a") {
            self.entity.vx = -current_speed;
            self.entity.facing_right = false;
        }
        if input.is_pressed("d") {
            self.entity.vx = current_speed;
            self.entity.facing_right = true;
        }
        if input.is_pressed("w") {
            let jump_force = if self.hatred_active { JUMP_FORCE * 1.2 } else { JUMP_FORCE };
            self.entity.vy = -jump_force;
            self.entity.is_grounded = false;
        }

        if input.is_pressed(" ") && self.delete_cooldown == 0 && !self.delete_slash_active {
            self.delete_slash_active = true;
            self.delete_slash_timer = 20;
            self.delete_cooldown = 90;
        }

        if input.is_pressed("f") && self.error404_cooldown == 0 && !self.error404_active {
            self.error404_active = true;
            self.error404_timer = 180;
            self.error404_cooldown = 480;

            if js_sys::Math::random() < 0.4 {
                self.spawn_clone();
            }
        }

        if input.is_pressed("q") && self.hatred_cooldown == 0 && !self.hatred_active {
            self.hatred_active = true;
            self.hatred_timer = 300;
            self.hatred_cooldown = 600;
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

    fn spawn_clone(&mut self) {
        self.clone = Some(CloneData {
            x: if self.entity.facing_right {
                self.entity.x - 60.0
            } else {
                self.entity.x + 60.0
            },
            y: self.entity.y,
            w: self.entity.w,
            h: self.entity.h,
            facing_right: self.entity.facing_right,
            hp: 50,
            dead: false,
            attack_timer: 60,
            alpha: 0.6,
        });
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
            ctx.set_stroke_style_str("#444444");
            ctx.set_line_width(2.0);
            ctx.stroke_rect(self.entity.x, self.entity.y, self.entity.w, self.entity.h);
        }

        let eye_color = if self.hatred_active { RED } else { "#00FF00" };
        let eye_x = if self.entity.facing_right {
            self.entity.x + self.entity.w - 15.0
        } else {
            self.entity.x + 5.0
        };
        ctx.set_fill_style_str(eye_color);
        ctx.begin_path();
        ctx.arc(eye_x, self.entity.y + 10.0, 5.0, 0.0, std::f64::consts::PI * 2.0)?;
        ctx.fill();

        if self.delete_slash_active {
            let reach = 120.0;
            let hit_x = if self.entity.facing_right {
                self.entity.x + self.entity.w
            } else {
                self.entity.x - reach
            };
            ctx.set_fill_style_str("rgba(0, 255, 0, 0.6)");
            ctx.fill_rect(hit_x, self.entity.y - 20.0, reach, self.entity.h + 40.0);
        }

        if self.error404_active {
            ctx.set_fill_style_str("rgba(255, 0, 0, 0.3)");
            ctx.set_font("bold 16px monospace");
            ctx.fill_text("ERROR 404", self.entity.x - 10.0, self.entity.y - 30.0)?;
        }

        if let Some(ref clone) = self.clone {
            if !clone.dead {
                ctx.set_global_alpha(clone.alpha);
                ctx.set_fill_style_str(BLACK);
                ctx.fill_rect(clone.x, clone.y, clone.w, clone.h);
                ctx.set_stroke_style_str("#00FF00");
                ctx.set_line_width(2.0);
                ctx.stroke_rect(clone.x, clone.y, clone.w, clone.h);

                let clone_eye_x = if clone.facing_right {
                    clone.x + clone.w - 15.0
                } else {
                    clone.x + 5.0
                };
                ctx.set_fill_style_str("#00FF00");
                ctx.begin_path();
                ctx.arc(clone_eye_x, clone.y + 10.0, 5.0, 0.0, std::f64::consts::PI * 2.0)?;
                ctx.fill();
                ctx.set_global_alpha(1.0);
            }
        }

        ctx.set_font("10px Arial");
        ctx.set_text_align("left");
        let mut indicator_y = self.entity.y - 45.0;

        let delete_text = if self.delete_cooldown > 0 {
            format!("DELETE {}s", (self.delete_cooldown as f64 / 60.0).ceil() as u32)
        } else {
            "DELETE READY".to_string()
        };
        ctx.set_fill_style_str(if self.delete_cooldown > 0 { GRAY } else { "#00FF00" });
        ctx.fill_text(&delete_text, self.entity.x - 20.0, indicator_y)?;
        indicator_y += 12.0;

        let error_text = if self.error404_active {
            "404 ACTIVE".to_string()
        } else if self.error404_cooldown > 0 {
            format!("404 {}s", (self.error404_cooldown as f64 / 60.0).ceil() as u32)
        } else {
            "404 READY".to_string()
        };
        ctx.set_fill_style_str(if self.error404_cooldown > 0 { GRAY } else { RED });
        ctx.fill_text(&error_text, self.entity.x - 20.0, indicator_y)?;
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

        let term_text = if self.termination_cooldown > 0 {
            format!("TERM {}s", (self.termination_cooldown as f64 / 60.0).ceil() as u32)
        } else {
            "TERM READY".to_string()
        };
        ctx.set_fill_style_str(if self.termination_cooldown > 0 { GRAY } else { BLACK });
        ctx.fill_text(&term_text, self.entity.x - 20.0, indicator_y)?;

        ctx.set_text_align("start");

        Ok(())
    }

    pub fn delete_slash_hitbox(&self) -> Option<(f64, f64, f64, f64)> {
        if !self.delete_slash_active {
            return None;
        }
        let reach = 120.0;
        let hit_x = if self.entity.facing_right {
            self.entity.x + self.entity.w
        } else {
            self.entity.x - reach
        };
        Some((hit_x, self.entity.y - 20.0, reach, self.entity.h + 40.0))
    }

    pub fn has_poison(&self) -> bool {
        !self.poison_targets.is_empty()
    }

    pub fn apply_poison(&mut self) {
        self.poison_targets.push(PoisonTarget {
            ticks_remaining: 5,
            tick_timer: 60,
        });
    }

    pub fn should_invert_enemy(&self) -> bool {
        self.error404_active
    }
}
