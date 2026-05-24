use wasm_bindgen::JsValue;
use web_sys::CanvasRenderingContext2d;
use crate::entity::*;

pub struct SlashState {
    pub active: bool,
    pub timer: u32,
    pub cooldown: u32,
}

impl SlashState {
    pub fn new() -> Self {
        SlashState {
            active: false,
            timer: 0,
            cooldown: 0,
        }
    }
}

pub struct ParryState {
    pub active: bool,
    pub timer: u32,
    pub cooldown: u32,
}

impl ParryState {
    pub fn new() -> Self {
        ParryState {
            active: false,
            timer: 0,
            cooldown: 0,
        }
    }
}

pub struct BlueCube {
    pub entity: Entity,
    pub slash: SlashState,
    pub parry: ParryState,
}

impl BlueCube {
    pub fn new(x: f64, y: f64) -> Self {
        BlueCube {
            entity: Entity::new(x, y, BLUE, 100),
            slash: SlashState::new(),
            parry: ParryState::new(),
        }
    }

    pub fn update(&mut self, _target: &Entity, input: &crate::input::Input) {
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

        if input.is_pressed("f") && self.parry.cooldown == 0 && !self.parry.active {
            self.parry.active = true;
            self.parry.timer = 30;
            self.entity.color = BLACK.to_string();
        }

        self.entity.update();
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
