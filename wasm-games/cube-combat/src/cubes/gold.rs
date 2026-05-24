use wasm_bindgen::JsValue;
use web_sys::CanvasRenderingContext2d;
use crate::entity::*;
use crate::cubes::blue::{SlashState, ParryState};

pub enum MasterState {
    Master,
    SwappingOut,
    MinionMode,
    SwappingIn,
}

pub struct Minion {
    pub x: f64,
    pub y: f64,
    pub w: f64,
    pub h: f64,
    pub vx: f64,
    pub vy: f64,
    pub color: String,
    pub base_color: String,
    pub hp: i32,
    pub max_hp: i32,
    pub dead: bool,
    pub facing_right: bool,
    pub slash_cooldown: u32,
    pub slash_active: bool,
    pub slash_timer: u32,
    pub damage_mult: f64,
    pub is_grounded: bool,
}

impl Minion {
    pub fn new(color: &str, base_color: &str) -> Self {
        Minion {
            x: -50.0,
            y: FLOOR_Y - CUBE_SIZE,
            w: CUBE_SIZE,
            h: CUBE_SIZE,
            vx: 20.0,
            vy: -10.0,
            color: color.to_string(),
            base_color: base_color.to_string(),
            hp: 50,
            max_hp: 50,
            dead: false,
            facing_right: true,
            slash_cooldown: 0,
            slash_active: false,
            slash_timer: 0,
            damage_mult: 0.5,
            is_grounded: false,
        }
    }

    pub fn update(&mut self, target: &Entity) {
        if self.dead {
            return;
        }

        if self.slash_cooldown > 0 {
            self.slash_cooldown -= 1;
        }

        if self.slash_active {
            self.slash_timer -= 1;
            if self.slash_timer == 0 {
                self.slash_active = false;
            }
        }

        self.vy += GRAVITY;
        self.x += self.vx;
        self.y += self.vy;

        if self.y + self.h >= FLOOR_Y {
            self.y = FLOOR_Y - self.h;
            self.vy = 0.0;
            self.is_grounded = true;
        } else {
            self.is_grounded = false;
        }

        if self.x < 0.0 {
            self.x = 0.0;
            self.vx = 0.0;
        }
        if self.x + self.w > WIDTH {
            self.x = WIDTH - self.w;
            self.vx = 0.0;
        }

        self.vx *= FRICTION;
        if self.vx.abs() < 0.1 {
            self.vx = 0.0;
        }

        if target.x > self.x + 100.0 {
            self.vx = MOVE_SPEED * 0.5;
            self.facing_right = true;
        } else if target.x < self.x - 100.0 {
            self.vx = -MOVE_SPEED * 0.5;
            self.facing_right = false;
        }

        if self.slash_cooldown == 0 {
            let dist = (self.x - target.x).abs();
            if dist < 80.0 {
                self.slash_active = true;
                self.slash_timer = 15;
                self.slash_cooldown = 60;
            }
        }
    }

    pub fn draw(&self, ctx: &CanvasRenderingContext2d) -> Result<(), JsValue> {
        if self.dead {
            return Ok(());
        }

        ctx.set_fill_style_str(&self.color);
        ctx.fill_rect(self.x, self.y, self.w, self.h);

        ctx.set_stroke_style_str(BLACK);
        ctx.set_line_width(2.0);
        ctx.stroke_rect(self.x, self.y, self.w, self.h);

        let eye_x = if self.facing_right {
            self.x + self.w - 15.0
        } else {
            self.x + 5.0
        };
        ctx.set_fill_style_str(WHITE);
        ctx.begin_path();
        ctx.arc(eye_x, self.y + 10.0, 5.0, 0.0, std::f64::consts::PI * 2.0)?;
        ctx.fill();

        if self.slash_active {
            ctx.set_fill_style_str(PURPLE);
            let reach = 70.0;
            let slash_x = if self.facing_right {
                self.x + self.w
            } else {
                self.x - reach
            };
            ctx.begin_path();
            ctx.arc(
                slash_x + reach / 2.0,
                self.y + self.h / 2.0,
                reach / 2.0,
                0.0,
                std::f64::consts::PI * 2.0,
            )?;
            ctx.fill();
        }

        Ok(())
    }

    pub fn take_damage(&mut self, amount: i32) {
        if self.dead {
            return;
        }
        self.hp -= amount;
        if self.hp <= 0 {
            self.hp = 0;
            self.dead = true;
        }
    }

    pub fn slash_hitbox(&self) -> Option<(f64, f64, f64, f64)> {
        if !self.slash_active {
            return None;
        }
        let reach = 70.0;
        let slash_x = if self.facing_right {
            self.x + self.w
        } else {
            self.x - reach
        };
        Some((slash_x, self.y, reach, self.h))
    }
}

pub struct GoldCube {
    pub entity: Entity,
    pub slash: SlashState,
    pub parry: ParryState,
    pub master_state: MasterState,
    pub minion: Option<Minion>,
    pub overtime_active: bool,
    pub overtime_timer: u32,
    pub overtime_cooldown: u32,
}

impl GoldCube {
    pub fn new(x: f64, y: f64) -> Self {
        GoldCube {
            entity: Entity::new(x, y, GOLD, 100),
            slash: SlashState::new(),
            parry: ParryState::new(),
            master_state: MasterState::Master,
            minion: None,
            overtime_active: false,
            overtime_timer: 0,
            overtime_cooldown: 0,
        }
    }

    pub fn update(&mut self, target: &Entity, input: &crate::input::Input) {
        if self.entity.dead {
            return;
        }

        if self.overtime_active {
            self.overtime_timer -= 1;
            if self.overtime_timer == 0 {
                self.overtime_active = false;
                self.overtime_cooldown = 300;
            }
        } else if self.overtime_cooldown > 0 {
            self.overtime_cooldown -= 1;
        }

        if input.is_tester {
            self.overtime_cooldown = 0;
            self.slash.cooldown = 0;
            self.parry.cooldown = 0;
        }

        match &self.master_state {
            MasterState::Master => {
                if self.parry.cooldown > 0 {
                    self.parry.cooldown -= 1;
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

                if input.is_pressed(" ") && !self.overtime_active && self.overtime_cooldown == 0 {
                    self.overtime_active = true;
                    self.overtime_timer = 300;
                }

                if input.is_pressed("f") {
                    self.master_state = MasterState::SwappingOut;
                }

                self.entity.update();
            }
            MasterState::SwappingOut => {
                self.entity.vx = -15.0;
                self.entity.x += self.entity.vx;
                self.entity.y += self.entity.vy;

                if self.entity.x < -100.0 {
                    self.spawn_minion();
                    self.master_state = MasterState::MinionMode;
                    self.entity.vx = 0.0;
                }
            }
            MasterState::MinionMode => {
                if let Some(ref mut minion) = self.minion {
                    minion.update(target);

                    if self.overtime_active {
                        if minion.slash_cooldown > 0 {
                            minion.slash_cooldown = minion.slash_cooldown.saturating_sub(1);
                        }
                    }

                    self.entity.x = minion.x;
                    self.entity.y = minion.y;

                    if minion.dead {
                        self.minion = None;
                        self.master_state = MasterState::SwappingIn;
                        self.entity.x = -100.0;
                        self.entity.y = FLOOR_Y - self.entity.h;
                    }
                }
            }
            MasterState::SwappingIn => {
                self.entity.vx = 15.0;
                self.entity.x += self.entity.vx;
                if self.entity.y + self.entity.h >= FLOOR_Y {
                    self.entity.y = FLOOR_Y - self.entity.h;
                }

                if self.entity.x >= 50.0 {
                    self.master_state = MasterState::Master;
                    self.entity.vx = 0.0;
                }
            }
        }
    }

    fn spawn_minion(&mut self) {
        let minion_types = [
            ("#0000FF", "#0000FF"),
            ("#00FF00", "#00FF00"),
            ("#FF69B4", "#FF69B4"),
            ("#8B4513", "#8B4513"),
            ("#4B0082", "#4B0082"),
            ("#2F4F4F", "#2F4F4F"),
            ("#FF0000", "#FF0000"),
        ];

        let idx = (js_sys::Math::random() * minion_types.len() as f64) as usize;
        let (color, base_color) = minion_types[idx];

        let mut minion = Minion::new(color, base_color);

        if self.overtime_active {
            minion.max_hp = 100;
            minion.hp = 100;
            minion.damage_mult = 1.0;
        }

        self.minion = Some(minion);
    }

    pub fn draw(&self, ctx: &CanvasRenderingContext2d) -> Result<(), JsValue> {
        if self.entity.dead {
            return Ok(());
        }

        if let Some(ref minion) = self.minion {
            if matches!(self.master_state, MasterState::MinionMode) {
                minion.draw(ctx)?;
            }
        } else {
            self.entity.draw(ctx)?;

            if matches!(self.master_state, MasterState::Master) {
                ctx.set_text_align("center");
                if self.overtime_active {
                    ctx.set_fill_style_str("#FF00FF");
                    ctx.set_font("bold 16px Arial");
                    ctx.fill_text("OVERTIME!", self.entity.center_x(), self.entity.y - 20.0)?;
                } else if self.overtime_cooldown > 0 {
                    ctx.set_fill_style_str(GRAY);
                    ctx.set_font("14px Arial");
                    ctx.fill_text(&format!("{}", (self.overtime_cooldown as f64 / 60.0).ceil() as u32), self.entity.center_x(), self.entity.y - 20.0)?;
                } else {
                    ctx.set_fill_style_str(YELLOW);
                    ctx.set_font("14px Arial");
                    ctx.fill_text("Ready", self.entity.center_x(), self.entity.y - 20.0)?;
                }
                ctx.set_text_align("start");
            }
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

    pub fn minion_slash_hitbox(&self) -> Option<(f64, f64, f64, f64)> {
        if let Some(ref minion) = self.minion {
            return minion.slash_hitbox();
        }
        None
    }

    pub fn is_in_minion_mode(&self) -> bool {
        matches!(self.master_state, MasterState::MinionMode)
    }
}
