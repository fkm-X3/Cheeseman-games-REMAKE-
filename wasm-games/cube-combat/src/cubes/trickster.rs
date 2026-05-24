use wasm_bindgen::JsValue;
use web_sys::CanvasRenderingContext2d;
use crate::entity::*;
use crate::cubes::blue::{SlashState, ParryState};

const TRICKSTER_COLOR: &str = "#FF69B4";

pub struct TricksterCube {
    pub entity: Entity,
    pub slash: SlashState,
    pub parry: ParryState,
    pub decoy_active: bool,
    pub decoy_timer: u32,
    pub decoy_cooldown: u32,
    pub decoy_x: f64,
    pub decoy_y: f64,
    pub swap_active: bool,
    pub swap_timer: u32,
    pub swap_cooldown: u32,
}

impl TricksterCube {
    pub fn new(x: f64, y: f64) -> Self {
        let mut entity = Entity::new(x, y, TRICKSTER_COLOR, 90);
        entity.max_hp = 90;
        entity.hp = 90;
        TricksterCube {
            entity,
            slash: SlashState::new(),
            parry: ParryState::new(),
            decoy_active: false,
            decoy_timer: 0,
            decoy_cooldown: 0,
            decoy_x: 0.0,
            decoy_y: 0.0,
            swap_active: false,
            swap_timer: 0,
            swap_cooldown: 0,
        }
    }

    pub fn update(&mut self, target: &Entity, input: &crate::input::Input) {
        if self.entity.dead {
            return;
        }

        if self.slash.cooldown > 0 {
            self.slash.cooldown -= 1;
        }
        if self.decoy_cooldown > 0 {
            self.decoy_cooldown -= 1;
        }
        if self.swap_cooldown > 0 {
            self.swap_cooldown -= 1;
        }
        if self.parry.cooldown > 0 {
            self.parry.cooldown -= 1;
        }

        if input.is_tester {
            self.slash.cooldown = 0;
            self.decoy_cooldown = 0;
            self.swap_cooldown = 0;
            self.parry.cooldown = 0;
        }

        if self.decoy_active {
            self.decoy_timer -= 1;
            if self.decoy_timer == 0 {
                self.decoy_active = false;
            } else {
                let dx = target.x - self.decoy_x;
                let dy = target.y - self.decoy_y;
                let dist = (dx * dx + dy * dy).sqrt();

                if dist < 50.0 {
                    self.decoy_active = false;
                } else {
                    self.decoy_x += dx * 0.02;
                    self.decoy_y += dy * 0.02;
                }
            }
        }

        if self.swap_active {
            self.swap_timer -= 1;
            if self.swap_timer == 0 {
                self.swap_active = false;
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

        if input.is_pressed(" ") && self.slash.cooldown == 0 && !self.slash.active {
            self.slash.active = true;
            self.slash.timer = 15;
            self.slash.cooldown = 60;
            self.decoy_active = true;
            self.decoy_timer = 180;
            self.decoy_cooldown = 90;
            self.decoy_x = self.entity.x;
            self.decoy_y = self.entity.y;
        }

        if input.is_pressed("f") && self.swap_cooldown == 0 && !self.swap_active {
            self.perform_swap(target);
        }

        self.entity.update();
    }

    fn perform_swap(&mut self, target: &Entity) {
        self.swap_active = true;
        self.swap_timer = 30;
        self.swap_cooldown = 120;

        let old_x = self.entity.x;
        let old_y = self.entity.y;

        self.entity.x = target.x;
        self.entity.y = target.y;
    }

    pub fn draw(&self, ctx: &CanvasRenderingContext2d) -> Result<(), JsValue> {
        if self.entity.dead {
            return Ok(());
        }

        ctx.set_fill_style_str(TRICKSTER_COLOR);
        ctx.fill_rect(self.entity.x, self.entity.y, self.entity.w, self.entity.h);

        ctx.set_stroke_style_str(BLACK);
        ctx.set_line_width(2.0);
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

        if self.decoy_active {
            ctx.set_global_alpha(0.7);
            ctx.set_fill_style_str(TRICKSTER_COLOR);
            ctx.fill_rect(self.decoy_x, self.decoy_y, self.entity.w, self.entity.h);
            ctx.set_stroke_style_str("rgba(255,255,255,0.5)");
            ctx.set_line_width(1.0);
            ctx.stroke_rect(self.decoy_x, self.decoy_y, self.entity.w, self.entity.h);
            ctx.set_global_alpha(1.0);
        }

        if self.swap_active {
            ctx.set_stroke_style_str(TRICKSTER_COLOR);
            ctx.set_line_width(3.0);
            ctx.begin_path();
            ctx.arc(self.entity.center_x(), self.entity.center_y(), 40.0, 0.0, std::f64::consts::PI * 2.0)?;
            ctx.stroke();
        }

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

    pub fn decoy_hitbox(&self) -> Option<(f64, f64, f64, f64)> {
        if !self.decoy_active {
            return None;
        }
        Some((self.decoy_x, self.decoy_y, self.entity.w, self.entity.h))
    }

    pub fn is_swapping(&self) -> bool {
        self.swap_active
    }
}
