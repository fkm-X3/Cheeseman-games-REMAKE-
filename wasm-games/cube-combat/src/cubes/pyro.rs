use wasm_bindgen::JsValue;
use web_sys::CanvasRenderingContext2d;
use crate::entity::*;
use crate::cubes::blue::{SlashState, ParryState};

pub struct PyroCube {
    pub entity: Entity,
    pub slash: SlashState,
    pub parry: ParryState,
    pub flame_dash_active: bool,
    pub flame_dash_timer: u32,
    pub flame_dash_cooldown: u32,
    pub fire_wall_active: bool,
    pub fire_wall_timer: u32,
    pub fire_wall_cooldown: u32,
    pub fire_wall_x: f64,
}

impl PyroCube {
    pub fn new(x: f64, y: f64) -> Self {
        PyroCube {
            entity: Entity::new(x, y, ORANGE_RED, 100),
            slash: SlashState::new(),
            parry: ParryState::new(),
            flame_dash_active: false,
            flame_dash_timer: 0,
            flame_dash_cooldown: 0,
            fire_wall_active: false,
            fire_wall_timer: 0,
            fire_wall_cooldown: 0,
            fire_wall_x: 0.0,
        }
    }

    pub fn update(&mut self, target: &Entity, input: &crate::input::Input) {
        if self.entity.dead {
            return;
        }

        if self.slash.cooldown > 0 {
            self.slash.cooldown -= 1;
        }
        if self.flame_dash_cooldown > 0 {
            self.flame_dash_cooldown -= 1;
        }
        if self.fire_wall_cooldown > 0 {
            self.fire_wall_cooldown -= 1;
        }
        if self.parry.cooldown > 0 {
            self.parry.cooldown -= 1;
        }

        if input.is_tester {
            self.slash.cooldown = 0;
            self.flame_dash_cooldown = 0;
            self.fire_wall_cooldown = 0;
            self.parry.cooldown = 0;
        }

        if self.flame_dash_active {
            self.flame_dash_timer -= 1;
            self.entity.vx = if self.entity.facing_right { 18.0 } else { -18.0 };

            if self.flame_dash_timer == 0 {
                self.flame_dash_active = false;
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

        if self.fire_wall_active {
            self.fire_wall_timer -= 1;

            if rect_intersect(self.fire_wall_x, FLOOR_Y - 80.0, 20.0, 80.0,
                target.x, target.y, target.w, target.h) {
                // damage applied by caller
            }

            if self.fire_wall_timer == 0 {
                self.fire_wall_active = false;
                self.fire_wall_cooldown = 240;
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

        if input.is_pressed(" ") && self.flame_dash_cooldown == 0 && !self.flame_dash_active {
            self.flame_dash_active = true;
            self.flame_dash_timer = 20;
            self.flame_dash_cooldown = 90;
            self.slash.active = true;
            self.slash.timer = 20;
        }

        if input.is_pressed("f") && !self.fire_wall_active && self.fire_wall_cooldown == 0 {
            self.fire_wall_active = true;
            self.fire_wall_timer = 240;
            self.fire_wall_x = self.entity.x + if self.entity.facing_right {
                self.entity.w + 30.0
            } else {
                -50.0
            };
        }

        self.entity.update();
    }

    pub fn draw(&self, ctx: &CanvasRenderingContext2d) -> Result<(), JsValue> {
        if self.entity.dead {
            return Ok(());
        }

        ctx.set_fill_style_str(&self.entity.color);
        ctx.fill_rect(self.entity.x, self.entity.y, self.entity.w, self.entity.h);

        ctx.set_stroke_style_str(BLACK);
        ctx.set_line_width(2.0);
        ctx.stroke_rect(self.entity.x, self.entity.y, self.entity.w, self.entity.h);

        if self.flame_dash_active {
            ctx.set_shadow_blur(15.0);
            ctx.set_shadow_color(ORANGE_RED);
            ctx.set_fill_style_str("rgba(255, 69, 0, 0.6)");
            let offset = if self.entity.facing_right { -30.0 } else { self.entity.w };
            ctx.fill_rect(self.entity.x + offset, self.entity.y, self.entity.w + 30.0, self.entity.h);
            ctx.set_shadow_blur(0.0);
        }

        if self.fire_wall_active {
            ctx.set_shadow_blur(20.0);
            ctx.set_shadow_color(ORANGE_RED);
            ctx.set_fill_style_str("rgba(255, 69, 0, 0.7)");
            ctx.fill_rect(self.fire_wall_x, FLOOR_Y - 80.0, 20.0, 80.0);

            ctx.set_fill_style_str("rgba(255, 200, 0, 0.5)");
            ctx.fill_rect(self.fire_wall_x + 3.0, FLOOR_Y - 70.0, 14.0, 70.0);
            ctx.set_shadow_blur(0.0);
        }

        ctx.set_fill_style_str(WHITE);
        let eye_x = if self.entity.facing_right {
            self.entity.x + self.entity.w - 15.0
        } else {
            self.entity.x + 5.0
        };
        ctx.begin_path();
        ctx.arc(eye_x, self.entity.y + 10.0, 5.0, 0.0, std::f64::consts::PI * 2.0)?;
        ctx.fill();

        Ok(())
    }

    pub fn slash_hitbox(&self) -> Option<(f64, f64, f64, f64)> {
        if !self.slash.active {
            return None;
        }
        let reach = 70.0;
        let slash_x = if self.entity.facing_right {
            self.entity.x + self.entity.w
        } else {
            self.entity.x - reach
        };
        Some((slash_x, self.entity.y, reach, self.entity.h))
    }

    pub fn fire_wall_hitbox(&self) -> Option<(f64, f64, f64, f64)> {
        if !self.fire_wall_active {
            return None;
        }
        Some((self.fire_wall_x, FLOOR_Y - 80.0, 20.0, 80.0))
    }

    pub fn dash_hitbox(&self) -> Option<(f64, f64, f64, f64)> {
        if !self.flame_dash_active {
            return None;
        }
        Some((self.entity.x, self.entity.y, self.entity.w, self.entity.h))
    }
}
