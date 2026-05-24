use wasm_bindgen::JsValue;
use web_sys::CanvasRenderingContext2d;

pub const WIDTH: f64 = 800.0;
pub const HEIGHT: f64 = 600.0;
pub const CUBE_SIZE: f64 = 50.0;
pub const GRAVITY: f64 = 0.6;
pub const FRICTION: f64 = 0.8;
pub const MOVE_SPEED: f64 = 5.0;
pub const JUMP_FORCE: f64 = 14.0;
pub const FLOOR_Y: f64 = HEIGHT - CUBE_SIZE;

pub const BLUE: &str = "#0000FF";
pub const RED: &str = "#FF0000";
pub const CYAN: &str = "#00FFFF";
pub const PURPLE: &str = "#800080";
pub const BLACK: &str = "#000000";
pub const WHITE: &str = "#FFFFFF";
pub const GRAY: &str = "#C8C8C8";
pub const GREEN: &str = "#00FF00";
pub const HOTPINK: &str = "#FF69B4";
pub const BROWN: &str = "#8B4513";
pub const INDIGO: &str = "#4B0082";
pub const DARK_SLATE: &str = "#2F4F4F";
pub const GOLD: &str = "#FFD700";
pub const YELLOW: &str = "#FFFF00";
pub const PERIWINKLE: &str = "#CCCCFF";
pub const DARK_RED: &str = "#8B0000";
pub const DARK_OLIVE: &str = "#556B2F";
pub const POWDER_BLUE: &str = "#B0E0E6";
pub const ORANGE_RED: &str = "#FF4500";

pub struct Entity {
    pub x: f64,
    pub y: f64,
    pub w: f64,
    pub h: f64,
    pub vx: f64,
    pub vy: f64,
    pub color: String,
    pub base_color: String,
    pub is_grounded: bool,
    pub max_hp: i32,
    pub hp: i32,
    pub dead: bool,
    pub facing_right: bool,
}

impl Entity {
    pub fn new(x: f64, y: f64, color: &str, hp: i32) -> Self {
        Entity {
            x,
            y,
            w: CUBE_SIZE,
            h: CUBE_SIZE,
            vx: 0.0,
            vy: 0.0,
            color: color.to_string(),
            base_color: color.to_string(),
            is_grounded: false,
            max_hp: hp,
            hp,
            dead: false,
            facing_right: true,
        }
    }

    pub fn update(&mut self) {
        if self.dead {
            return;
        }

        self.vy += GRAVITY;
        self.vx *= FRICTION;
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
    }

    pub fn jump(&mut self) {
        if self.is_grounded && !self.dead {
            self.vy = -JUMP_FORCE;
            self.is_grounded = false;
        }
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

    pub fn draw(&self, ctx: &CanvasRenderingContext2d) -> Result<(), JsValue> {
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
        let eye_y = self.y + 10.0;

        ctx.set_fill_style_str(WHITE);
        ctx.begin_path();
        ctx.arc(eye_x, eye_y, 5.0, 0.0, std::f64::consts::PI * 2.0)?;
        ctx.fill();

        Ok(())
    }

    pub fn center_x(&self) -> f64 {
        self.x + self.w / 2.0
    }

    pub fn center_y(&self) -> f64 {
        self.y + self.h / 2.0
    }

    pub fn distance_to(&self, other: &Entity) -> f64 {
        let dx = self.center_x() - other.center_x();
        let dy = self.center_y() - other.center_y();
        (dx * dx + dy * dy).sqrt()
    }
}

pub fn rect_intersect(
    x1: f64, y1: f64, w1: f64, h1: f64,
    x2: f64, y2: f64, w2: f64, h2: f64,
) -> bool {
    x2 < x1 + w1 && x2 + w2 > x1 && y2 < y1 + h1 && y2 + h2 > y1
}
