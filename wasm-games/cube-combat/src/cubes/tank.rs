use wasm_bindgen::JsValue;
use web_sys::CanvasRenderingContext2d;
use crate::entity::*;
use crate::cubes::blue::{SlashState, ParryState};

pub struct TankCube {
    pub entity: Entity,
    pub slash: SlashState,
    pub parry: ParryState,
    pub armor_active: bool,
    pub armor_timer: u32,
    pub armor_cooldown: u32,
    pub slam_active: bool,
    pub slam_timer: u32,
    pub slam_cooldown: u32,
}

impl TankCube {
    pub fn new(x: f64, y: f64) -> Self {
        let mut entity = Entity::new(x, y, DARK_OLIVE, 200);
        entity.max_hp = 200;
        entity.hp = 200;
        TankCube {
            entity,
            slash: SlashState::new(),
            parry: ParryState::new(),
            armor_active: false,
            armor_timer: 0,
            armor_cooldown: 0,
            slam_active: false,
            slam_timer: 0,
            slam_cooldown: 0,
        }
    }

    pub fn update(&mut self, _target: &Entity, input: &crate::input::Input) {
        if self.entity.dead {
            return;
        }

        if self.slash.cooldown > 0 {
            self.slash.cooldown -= 1;
        }
        if self.slam_cooldown > 0 {
            self.slam_cooldown -= 1;
        }
        if self.armor_cooldown > 0 {
            self.armor_cooldown -= 1;
        }
        if self.parry.cooldown > 0 {
            self.parry.cooldown -= 1;
        }

        if input.is_tester {
            self.slash.cooldown = 0;
            self.slam_cooldown = 0;
            self.armor_cooldown = 0;
            self.parry.cooldown = 0;
        }

        if self.armor_active {
            self.armor_timer -= 1;
            if self.armor_timer == 0 {
                self.armor_active = false;
                self.armor_cooldown = 180;
                self.entity.color = self.entity.base_color.clone();
            }
        }

        if self.slam_active {
            self.slam_timer -= 1;
            if self.slam_timer == 0 {
                self.slam_active = false;
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

        let move_speed = if self.armor_active { MOVE_SPEED * 0.5 } else { MOVE_SPEED * 0.7 };

        if input.is_pressed("a") {
            self.entity.vx = -move_speed;
            self.entity.facing_right = false;
        }
        if input.is_pressed("d") {
            self.entity.vx = move_speed;
            self.entity.facing_right = true;
        }
        if input.is_pressed("w") {
            self.entity.vy = -JUMP_FORCE * 0.8;
            self.entity.is_grounded = false;
        }

        if input.is_pressed(" ") && self.slam_cooldown == 0 {
            self.slam_active = true;
            self.slam_timer = 20;
            self.slam_cooldown = 90;
        }

        if input.is_pressed("f") && !self.armor_active && self.armor_cooldown == 0 {
            self.armor_active = true;
            self.armor_timer = 180;
            self.entity.color = "#7A8B4F".to_string();
        }

        self.entity.update();
    }

    pub fn absorb_damage(&mut self, amount: i32) -> i32 {
        if self.armor_active {
            amount / 2
        } else {
            amount
        }
    }

    pub fn draw(&self, ctx: &CanvasRenderingContext2d) -> Result<(), JsValue> {
        if self.entity.dead {
            return Ok(());
        }

        ctx.set_fill_style_str(&self.entity.color);
        ctx.fill_rect(self.entity.x, self.entity.y, self.entity.w, self.entity.h);

        if self.armor_active {
            ctx.set_stroke_style_str(GOLD);
            ctx.set_line_width(4.0);
        } else {
            ctx.set_stroke_style_str(BLACK);
            ctx.set_line_width(2.0);
        }
        ctx.stroke_rect(self.entity.x, self.entity.y, self.entity.w, self.entity.h);

        ctx.set_fill_style_str(WHITE);
        let eye_x = if self.entity.facing_right {
            self.entity.x + self.entity.w - 15.0
        } else {
            self.entity.x + 5.0
        };
        ctx.begin_path();
        ctx.arc(eye_x, self.entity.y + 10.0, 5.0, 0.0, std::f64::consts::PI * 2.0)?;
        ctx.fill();

        if self.slam_active {
            let aoe_range = 120.0;
            let aoe_x = self.entity.x + self.entity.w / 2.0 - aoe_range;
            ctx.set_fill_style_str("rgba(85, 107, 47, 0.4)");
            ctx.fill_rect(aoe_x, self.entity.y + self.entity.h - 20.0, aoe_range * 2.0, 40.0);

            ctx.set_stroke_style_str("rgba(85, 107, 47, 0.6)");
            ctx.set_line_width(2.0);
            ctx.begin_path();
            ctx.arc(self.entity.center_x(), self.entity.y + self.entity.h, aoe_range, std::f64::consts::PI, 0.0)?;
            ctx.stroke();
        }

        if self.armor_active {
            ctx.set_stroke_style_str("rgba(255, 215, 0, 0.5)");
            ctx.set_line_width(3.0);
            ctx.begin_path();
            ctx.arc(self.entity.center_x(), self.entity.center_y(), 40.0, 0.0, std::f64::consts::PI * 2.0)?;
            ctx.stroke();
        }

        Ok(())
    }

    pub fn slam_hitbox(&self) -> Option<(f64, f64, f64, f64)> {
        if !self.slam_active {
            return None;
        }
        let aoe_range = 120.0;
        let aoe_x = self.entity.x + self.entity.w / 2.0 - aoe_range;
        Some((aoe_x, self.entity.y + self.entity.h - 20.0, aoe_range * 2.0, 40.0))
    }
}
