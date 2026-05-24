use wasm_bindgen::JsValue;
use web_sys::CanvasRenderingContext2d;
use crate::entity::*;
use crate::cubes::blue::{SlashState, ParryState};

pub struct PurpleCube {
    pub entity: Entity,
    pub slash: SlashState,
    pub parry: ParryState,
    pub pull_active: bool,
    pub pull_timer: u32,
    pub pull_cooldown: u32,
    pub pull_windup: u32,
}

impl PurpleCube {
    pub fn new(x: f64, y: f64) -> Self {
        let mut entity = Entity::new(x, y, INDIGO, 75);
        entity.max_hp = 75;
        entity.hp = 75;
        PurpleCube {
            entity,
            slash: SlashState::new(),
            parry: ParryState::new(),
            pull_active: false,
            pull_timer: 0,
            pull_cooldown: 0,
            pull_windup: 0,
        }
    }

    pub fn update(&mut self, target: &Entity, input: &crate::input::Input) {
        if self.entity.dead {
            return;
        }

        if self.pull_cooldown > 0 {
            self.pull_cooldown -= 1;
        }

        if self.parry.cooldown > 0 {
            self.parry.cooldown -= 1;
        }

        if input.is_tester {
            self.slash.cooldown = 0;
            self.pull_cooldown = 0;
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

        if self.pull_windup > 0 {
            self.pull_windup -= 1;
            self.entity.vx = 0.0;

            let now = js_sys::Date::now() as u64;
            if (now / 50) % 2 == 0 {
                self.entity.color = PURPLE.to_string();
            } else {
                self.entity.color = INDIGO.to_string();
            }

            if self.pull_windup == 0 {
                self.execute_pull(target);
            }
            return;
        }

        if self.pull_active {
            self.pull_timer -= 1;
            self.entity.vx = 0.0;

            let dx = self.entity.x - target.x;
            let dist = dx.abs();

            if dist < 500.0 {
                // pulling enemy closer - velocity applied to target by caller
            }

            if self.pull_timer == 0 {
                self.pull_active = false;
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

        if input.is_pressed(" ") && self.slash.cooldown == 0 && !self.slash.active {
            self.slash.active = true;
            self.slash.timer = 15;
            self.slash.cooldown = 60;
        }

        if input.is_pressed("f") && self.pull_cooldown == 0 && self.pull_windup == 0 && !self.pull_active {
            self.pull_windup = 20;
        }

        self.entity.update();
    }

    fn execute_pull(&mut self, _target: &Entity) {
        self.pull_active = true;
        self.pull_timer = 30;
        self.pull_cooldown = 120;
        self.entity.color = PURPLE.to_string();
    }

    pub fn draw(&self, ctx: &CanvasRenderingContext2d) -> Result<(), JsValue> {
        self.entity.draw(ctx)?;

        if self.pull_windup > 0 {
            ctx.set_stroke_style_str("rgba(128, 0, 128, 0.5)");
            ctx.set_line_width(2.0);
            ctx.begin_path();
            ctx.arc(
                self.entity.center_x(),
                self.entity.center_y(),
                100.0 - (self.pull_windup as f64) * 3.0,
                0.0,
                std::f64::consts::PI * 2.0,
            )?;
            ctx.stroke();
        }

        if self.pull_active {
            ctx.set_stroke_style_str(PURPLE);
            ctx.set_line_width(5.0);
            ctx.begin_path();
            ctx.move_to(self.entity.center_x(), self.entity.center_y());
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

    pub fn is_pulling(&self) -> bool {
        self.pull_active
    }

    pub fn get_pull_distance_threshold(&self) -> f64 {
        80.0
    }
}
