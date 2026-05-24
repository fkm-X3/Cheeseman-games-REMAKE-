use wasm_bindgen::JsValue;
use web_sys::CanvasRenderingContext2d;
use crate::entity::*;

pub enum RedState {
    Idle,
    Dashing,
    LaserCharging,
    Stunned,
}

pub struct RedCube {
    pub entity: Entity,
    pub state: RedState,
    pub state_timer: u32,
    pub beam_active: bool,
    pub beam_timer: u32,
    pub dash_cooldown: u32,
    pub is_invincible: bool,
}

impl RedCube {
    pub fn new(x: f64, y: f64) -> Self {
        RedCube {
            entity: Entity::new(x, y, RED, 100),
            state: RedState::Idle,
            state_timer: 0,
            beam_active: false,
            beam_timer: 0,
            dash_cooldown: 0,
            is_invincible: false,
        }
    }

    pub fn update(&mut self, target: &Entity) {
        if self.entity.dead {
            return;
        }

        if self.dash_cooldown > 0 {
            self.dash_cooldown -= 1;
        }

        match &self.state {
            RedState::Idle => self.update_idle(target),
            RedState::Dashing => self.update_dashing(target),
            RedState::LaserCharging => self.update_laser_charging(),
            RedState::Stunned => self.update_stunned(),
        }

        self.entity.update();
    }

    fn update_idle(&mut self, target: &Entity) {
        let dist = self.entity.distance_to(target);

        let rand = js_sys::Math::random();

        if dist < 300.0 && rand < 0.02 && self.dash_cooldown == 0 {
            self.state = RedState::Dashing;
            self.state_timer = 20;
            self.is_invincible = true;
            let dir = if target.center_x() > self.entity.center_x() { 1.0 } else { -1.0 };
            self.entity.vx = dir * 15.0;
            self.entity.facing_right = dir > 0.0;
            self.dash_cooldown = 90;
            return;
        }

        if rand < 0.005 && self.entity.is_grounded {
            self.entity.jump();
            return;
        }

        if dist > 400.0 && rand < 0.01 {
            self.state = RedState::LaserCharging;
            self.state_timer = 60;
            self.entity.color = CYAN.to_string();
            return;
        }

        let dir = if target.center_x() > self.entity.center_x() { 1.0 } else { -1.0 };
        self.entity.vx = dir * MOVE_SPEED * 0.8;
        self.entity.facing_right = dir > 0.0;
    }

    fn update_dashing(&mut self, target: &Entity) {
        self.state_timer -= 1;

        if rect_intersect(
            self.entity.x, self.entity.y, self.entity.w, self.entity.h,
            target.x, target.y, target.w, target.h,
        ) {
        }

        if self.state_timer == 0 {
            self.state = RedState::Idle;
            self.is_invincible = false;
            self.entity.color = RED.to_string();
        }
    }

    fn update_laser_charging(&mut self) {
        self.state_timer -= 1;

        if self.state_timer == 0 {
            self.beam_active = true;
            self.beam_timer = 30;
            self.entity.color = RED.to_string();
            self.state = RedState::Idle;
        }
    }

    fn update_stunned(&mut self) {
        self.state_timer -= 1;
        if self.state_timer == 0 {
            self.state = RedState::Idle;
        }
    }

    pub fn draw(&mut self, ctx: &CanvasRenderingContext2d) -> Result<(), JsValue> {
        self.entity.draw(ctx)?;

        if self.beam_active {
            ctx.set_fill_style_str(RED);
            ctx.set_shadow_blur(10.0);
            ctx.set_shadow_color(RED);
            let beam_x = if self.entity.facing_right {
                self.entity.x + self.entity.w
            } else {
                self.entity.x - 800.0
            };
            ctx.fill_rect(beam_x, self.entity.y + self.entity.h / 2.0 - 15.0, 800.0, 30.0);
            ctx.set_shadow_blur(0.0);
            self.beam_timer -= 1;
            if self.beam_timer == 0 {
                self.beam_active = false;
            }
        }

        if let RedState::LaserCharging = &self.state {
            ctx.set_fill_style_str(CYAN);
            ctx.set_global_alpha(0.5);
            ctx.begin_path();
            ctx.arc(
                self.entity.center_x(),
                self.entity.center_y(),
                self.entity.w / 2.0 + 15.0,
                0.0,
                std::f64::consts::PI * 2.0,
            )?;
            ctx.fill();
            ctx.set_global_alpha(1.0);
        }

        Ok(())
    }

    pub fn beam_hitbox(&self) -> Option<(f64, f64, f64, f64)> {
        if !self.beam_active {
            return None;
        }
        let beam_x = if self.entity.facing_right {
            self.entity.x + self.entity.w
        } else {
            self.entity.x - 800.0
        };
        Some((beam_x, self.entity.y + self.entity.h / 2.0 - 15.0, 800.0, 30.0))
    }
}
