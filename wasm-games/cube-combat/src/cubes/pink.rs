use wasm_bindgen::JsValue;
use web_sys::CanvasRenderingContext2d;
use crate::entity::*;
use crate::cubes::blue::{SlashState, ParryState};

pub struct PinkCube {
    pub entity: Entity,
    pub slash: SlashState,
    pub parry: ParryState,
    pub block_energy: f64,
    pub is_blocking: bool,
}

impl PinkCube {
    pub fn new(x: f64, y: f64) -> Self {
        PinkCube {
            entity: Entity::new(x, y, HOTPINK, 100),
            slash: SlashState::new(),
            parry: ParryState::new(),
            block_energy: 100.0,
            is_blocking: false,
        }
    }

    pub fn update(&mut self, _target: &Entity, input: &crate::input::Input) {
        if self.entity.dead {
            return;
        }

        if self.block_energy < 100.0 && !self.is_blocking {
            self.block_energy += 0.5;
            if self.block_energy > 100.0 {
                self.block_energy = 100.0;
            }
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
            self.block_energy = 100.0;
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

        if input.is_pressed("f") && self.block_energy > 0.0 {
            self.is_blocking = true;
            self.block_energy -= 2.0;
            if self.block_energy < 0.0 {
                self.block_energy = 0.0;
            }
            self.entity.vx = 0.0;
            self.entity.color = "#FFC0CB".to_string();
        } else {
            self.is_blocking = false;
            self.entity.color = self.entity.base_color.clone();

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
        }

        self.entity.update();
    }

    pub fn absorb_damage(&mut self, amount: i32) -> i32 {
        if self.is_blocking {
            let energy_cost = (amount as f64 * 2.0).min(self.block_energy);
            self.block_energy -= energy_cost;
            if self.block_energy < 0.0 {
                self.block_energy = 0.0;
            }
            0
        } else {
            amount
        }
    }

    pub fn draw(&self, ctx: &CanvasRenderingContext2d) -> Result<(), JsValue> {
        self.entity.draw(ctx)?;

        let bar_y = self.entity.y - 15.0;
        ctx.set_fill_style_str("#333333");
        ctx.fill_rect(self.entity.x, bar_y, self.entity.w, 8.0);

        ctx.set_fill_style_str(CYAN);
        let energy_width = self.entity.w * (self.block_energy / 100.0);
        ctx.fill_rect(self.entity.x, bar_y, energy_width, 8.0);

        if self.is_blocking {
            ctx.set_stroke_style_str(CYAN);
            ctx.set_line_width(4.0);
            ctx.begin_path();
            ctx.arc(
                self.entity.center_x(),
                self.entity.center_y(),
                45.0,
                0.0,
                std::f64::consts::PI * 2.0,
            )?;
            ctx.stroke();
        }

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
}
