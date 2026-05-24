use wasm_bindgen::JsValue;
use web_sys::CanvasRenderingContext2d;
use crate::entity::*;
use crate::cubes::blue::{SlashState, ParryState};

pub struct VigilanteCube {
    pub entity: Entity,
    pub slash: SlashState,
    pub parry: ParryState,
    pub dash_active: bool,
    pub dash_timer: u32,
    pub dash_hit: bool,
    pub drone_active: bool,
    pub drone_timer: u32,
    pub drone_cooldown: u32,
    pub drone_x: f64,
    pub drone_y: f64,
    pub drone_fire_timer: u32,
}

impl VigilanteCube {
    pub fn new(x: f64, y: f64) -> Self {
        let mut entity = Entity::new(x, y, DARK_SLATE, 125);
        entity.max_hp = 125;
        entity.hp = 125;
        VigilanteCube {
            entity,
            slash: SlashState::new(),
            parry: ParryState::new(),
            dash_active: false,
            dash_timer: 0,
            dash_hit: false,
            drone_active: false,
            drone_timer: 0,
            drone_cooldown: 0,
            drone_x: 0.0,
            drone_y: 0.0,
            drone_fire_timer: 0,
        }
    }

    pub fn update(&mut self, target: &Entity, input: &crate::input::Input) {
        if self.entity.dead {
            return;
        }

        if self.slash.cooldown > 0 {
            self.slash.cooldown -= 1;
        }
        if self.drone_cooldown > 0 {
            self.drone_cooldown -= 1;
        }
        if self.parry.cooldown > 0 {
            self.parry.cooldown -= 1;
        }

        if input.is_tester {
            self.slash.cooldown = 0;
            self.drone_cooldown = 0;
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

        if self.drone_active {
            self.drone_timer -= 1;

            let target_x = target.x;
            let target_y = target.y - 150.0;

            self.drone_x += (target_x - self.drone_x) * 0.1;
            self.drone_y += (target_y - self.drone_y) * 0.1;

            self.drone_fire_timer -= 1;
            if self.drone_fire_timer == 0 {
                self.drone_fire_timer = 60;
                // drone fires - damage applied by caller
            }

            if self.drone_timer == 0 {
                self.drone_active = false;
                self.drone_cooldown = 900;
            }
        }

        if self.dash_active {
            let dash_speed = 20.0;
            self.entity.vx = if self.entity.facing_right { dash_speed } else { -dash_speed };
            self.dash_timer -= 1;

            if self.dash_timer == 0 {
                self.dash_active = false;
                if !self.dash_hit {
                    self.entity.vx = 0.0;
                }
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

        if input.is_pressed(" ") && self.slash.cooldown == 0 && !self.dash_active {
            self.dash_active = true;
            self.dash_timer = 15;
            self.slash.cooldown = 60;
            self.dash_hit = false;
        }

        if input.is_pressed("f") && !self.drone_active && self.drone_cooldown == 0 {
            self.drone_active = true;
            self.drone_timer = 480;
            self.drone_x = self.entity.x;
            self.drone_y = self.entity.y - 50.0;
            self.drone_fire_timer = 30;
        }

        self.entity.update();
    }

    pub fn draw(&self, ctx: &CanvasRenderingContext2d) -> Result<(), JsValue> {
        self.entity.draw(ctx)?;

        if self.dash_active {
            ctx.set_fill_style_str("rgba(47, 79, 79, 0.5)");
            let offset = if self.entity.facing_right { -20.0 } else { 20.0 };
            ctx.fill_rect(self.entity.x + offset, self.entity.y, self.entity.w, self.entity.h);
        }

        if self.drone_active {
            ctx.set_fill_style_str(CYAN);
            ctx.fill_rect(self.drone_x, self.drone_y, 30.0, 10.0);
            ctx.set_fill_style_str(WHITE);
            ctx.fill_rect(self.drone_x + 10.0, self.drone_y - 5.0, 10.0, 5.0);

            if self.drone_fire_timer > 55 {
                ctx.set_fill_style_str("rgba(0, 255, 255, 0.8)");
                ctx.fill_rect(self.drone_x + 14.0, self.drone_y + 10.0, 2.0, 50.0);
            }

            ctx.set_stroke_style_str("rgba(0, 255, 255, 0.2)");
            ctx.set_line_width(1.0);
            ctx.begin_path();
            ctx.move_to(self.entity.center_x(), self.entity.y);
            ctx.line_to(self.drone_x + 15.0, self.drone_y + 10.0);
            ctx.stroke();
        }

        Ok(())
    }

    pub fn dash_hitbox(&self) -> Option<(f64, f64, f64, f64)> {
        if !self.dash_active {
            return None;
        }
        Some((self.entity.x, self.entity.y, self.entity.w, self.entity.h))
    }

    pub fn is_drone_firing(&self) -> bool {
        self.drone_active && self.drone_fire_timer > 55
    }

    pub fn drone_position(&self) -> (f64, f64) {
        (self.drone_x, self.drone_y)
    }
}
