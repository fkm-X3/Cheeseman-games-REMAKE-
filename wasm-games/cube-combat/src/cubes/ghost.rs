use wasm_bindgen::JsValue;
use web_sys::CanvasRenderingContext2d;
use crate::entity::*;
use crate::cubes::blue::{SlashState, ParryState};

pub struct GhostCube {
    pub entity: Entity,
    pub slash: SlashState,
    pub parry: ParryState,
    pub teleport_cooldown: u32,
    pub teleport_active: bool,
    pub teleport_timer: u32,
    pub phase_active: bool,
    pub phase_timer: u32,
}

impl GhostCube {
    pub fn new(x: f64, y: f64) -> Self {
        let mut entity = Entity::new(x, y, "rgba(200,200,200,0.5)", 80);
        entity.max_hp = 80;
        entity.hp = 80;
        GhostCube {
            entity,
            slash: SlashState::new(),
            parry: ParryState::new(),
            teleport_cooldown: 0,
            teleport_active: false,
            teleport_timer: 0,
            phase_active: false,
            phase_timer: 0,
        }
    }

    pub fn update(&mut self, target: &Entity, input: &crate::input::Input) {
        if self.entity.dead {
            return;
        }

        if self.slash.cooldown > 0 {
            self.slash.cooldown -= 1;
        }
        if self.teleport_cooldown > 0 {
            self.teleport_cooldown -= 1;
        }
        if self.parry.cooldown > 0 {
            self.parry.cooldown -= 1;
        }

        if input.is_tester {
            self.slash.cooldown = 0;
            self.teleport_cooldown = 0;
            self.parry.cooldown = 0;
        }

        if self.teleport_active {
            self.teleport_timer -= 1;
            if self.teleport_timer == 0 {
                self.teleport_active = false;
            }
            return;
        }

        if self.phase_active {
            self.phase_timer -= 1;
            if self.phase_timer == 0 {
                self.phase_active = false;
                self.entity.color = self.entity.base_color.clone();
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
            self.phase_active = true;
            self.phase_timer = 10;
            self.entity.color = "rgba(255,255,255,0.8)".to_string();
        }

        if input.is_pressed("f") && self.teleport_cooldown == 0 && !self.teleport_active {
            self.perform_teleport(target);
        }

        self.entity.update();
    }

    fn perform_teleport(&mut self, target: &Entity) {
        self.teleport_active = true;
        self.teleport_timer = 15;
        self.teleport_cooldown = 90;

        let old_x = self.entity.x;
        let old_y = self.entity.y;

        self.entity.x = target.x + if self.entity.facing_right {
            -self.entity.w - 10.0
        } else {
            target.w + 10.0
        };
        self.entity.y = target.y;

        if self.entity.x < 0.0 {
            self.entity.x = 10.0;
        }
        if self.entity.x + self.entity.w > WIDTH {
            self.entity.x = WIDTH - self.entity.w - 10.0;
        }

        if rect_intersect(self.entity.x, self.entity.y, self.entity.w, self.entity.h,
            target.x, target.y, target.w, target.h) {
            // damage applied by caller
        }
    }

    pub fn draw(&self, ctx: &CanvasRenderingContext2d) -> Result<(), JsValue> {
        if self.entity.dead {
            return Ok(());
        }

        let alpha = if self.phase_active { 0.8 } else { 0.5 };
        ctx.set_global_alpha(alpha);
        ctx.set_fill_style_str(&self.entity.color);
        ctx.fill_rect(self.entity.x, self.entity.y, self.entity.w, self.entity.h);

        ctx.set_stroke_style_str("rgba(255,255,255,0.3)");
        ctx.set_line_width(2.0);
        ctx.stroke_rect(self.entity.x, self.entity.y, self.entity.w, self.entity.h);

        ctx.set_fill_style_str("rgba(255,255,255,0.9)");
        let eye_x = if self.entity.facing_right {
            self.entity.x + self.entity.w - 15.0
        } else {
            self.entity.x + 5.0
        };
        ctx.begin_path();
        ctx.arc(eye_x, self.entity.y + 10.0, 5.0, 0.0, std::f64::consts::PI * 2.0)?;
        ctx.fill();

        ctx.set_global_alpha(1.0);

        if self.slash.active {
            ctx.set_fill_style_str("rgba(200,200,200,0.4)");
            let reach = 70.0;
            let slash_x = if self.entity.facing_right {
                self.entity.x + self.entity.w
            } else {
                self.entity.x - reach
            };
            ctx.fill_rect(slash_x, self.entity.y, reach, self.entity.h);
        }

        if self.teleport_active {
            ctx.set_stroke_style_str(WHITE);
            ctx.set_line_width(2.0);
            ctx.begin_path();
            ctx.arc(self.entity.center_x(), self.entity.center_y(), 35.0, 0.0, std::f64::consts::PI * 2.0)?;
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

    pub fn is_phasing(&self) -> bool {
        self.phase_active
    }
}
