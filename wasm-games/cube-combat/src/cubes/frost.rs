use wasm_bindgen::JsValue;
use web_sys::CanvasRenderingContext2d;
use crate::entity::*;
use crate::cubes::blue::{SlashState, ParryState};

pub struct FrostCube {
    pub entity: Entity,
    pub slash: SlashState,
    pub parry: ParryState,
    pub ice_shard_active: bool,
    pub ice_shard_timer: u32,
    pub ice_shard_cooldown: u32,
    pub ice_shard_x: f64,
    pub ice_shard_y: f64,
    pub ice_shard_vx: f64,
    pub freeze_active: bool,
    pub freeze_timer: u32,
    pub freeze_cooldown: u32,
}

impl FrostCube {
    pub fn new(x: f64, y: f64) -> Self {
        let mut entity = Entity::new(x, y, POWDER_BLUE, 110);
        entity.max_hp = 110;
        entity.hp = 110;
        FrostCube {
            entity,
            slash: SlashState::new(),
            parry: ParryState::new(),
            ice_shard_active: false,
            ice_shard_timer: 0,
            ice_shard_cooldown: 0,
            ice_shard_x: 0.0,
            ice_shard_y: 0.0,
            ice_shard_vx: 0.0,
            freeze_active: false,
            freeze_timer: 0,
            freeze_cooldown: 0,
        }
    }

    pub fn update(&mut self, target: &Entity, input: &crate::input::Input) {
        if self.entity.dead {
            return;
        }

        if self.slash.cooldown > 0 {
            self.slash.cooldown -= 1;
        }
        if self.ice_shard_cooldown > 0 {
            self.ice_shard_cooldown -= 1;
        }
        if self.freeze_cooldown > 0 {
            self.freeze_cooldown -= 1;
        }
        if self.parry.cooldown > 0 {
            self.parry.cooldown -= 1;
        }

        if input.is_tester {
            self.slash.cooldown = 0;
            self.ice_shard_cooldown = 0;
            self.freeze_cooldown = 0;
            self.parry.cooldown = 0;
        }

        if self.ice_shard_active {
            self.ice_shard_timer -= 1;
            self.ice_shard_x += self.ice_shard_vx;

            if rect_intersect(self.ice_shard_x, self.ice_shard_y, 15.0, 10.0,
                target.x, target.y, target.w, target.h) {
                self.ice_shard_active = false;
            }

            if self.ice_shard_timer == 0 || self.ice_shard_x < 0.0 || self.ice_shard_x > WIDTH {
                self.ice_shard_active = false;
            }
        }

        if self.freeze_active {
            self.freeze_timer -= 1;
            if self.freeze_timer == 0 {
                self.freeze_active = false;
                self.freeze_cooldown = 180;
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

        if input.is_pressed(" ") && self.ice_shard_cooldown == 0 && !self.ice_shard_active {
            self.ice_shard_active = true;
            self.ice_shard_timer = 60;
            self.ice_shard_cooldown = 45;
            self.ice_shard_x = if self.entity.facing_right {
                self.entity.x + self.entity.w
            } else {
                self.entity.x - 15.0
            };
            self.ice_shard_y = self.entity.y + self.entity.h / 2.0 - 5.0;
            self.ice_shard_vx = if self.entity.facing_right { 12.0 } else { -12.0 };
        }

        if input.is_pressed("f") && self.freeze_cooldown == 0 && !self.freeze_active {
            self.freeze_active = true;
            self.freeze_timer = 90;
            self.freeze_cooldown = 180;
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

        if self.ice_shard_active {
            ctx.set_fill_style_str("#E0FFFF");
            ctx.fill_rect(self.ice_shard_x, self.ice_shard_y, 15.0, 10.0);
            ctx.set_fill_style_str(WHITE);
            ctx.fill_rect(self.ice_shard_x + 2.0, self.ice_shard_y + 2.0, 11.0, 6.0);
        }

        if self.freeze_active {
            ctx.set_stroke_style_str(POWDER_BLUE);
            ctx.set_line_width(3.0);
            ctx.begin_path();
            ctx.arc(self.entity.center_x(), self.entity.center_y(), 40.0, 0.0, std::f64::consts::PI * 2.0)?;
            ctx.stroke();
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

    pub fn ice_shard_hitbox(&self) -> Option<(f64, f64, f64, f64)> {
        if !self.ice_shard_active {
            return None;
        }
        Some((self.ice_shard_x, self.ice_shard_y, 15.0, 10.0))
    }

    pub fn is_freezing(&self) -> bool {
        self.freeze_active
    }
}
