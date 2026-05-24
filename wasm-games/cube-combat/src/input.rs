use std::collections::HashMap;

pub struct Input {
    keys: HashMap<String, bool>,
    pub is_tester: bool,
    pub is_dev: bool,
}

impl Input {
    pub fn new() -> Self {
        Input {
            keys: HashMap::new(),
            is_tester: false,
            is_dev: false,
        }
    }

    pub fn set_key(&mut self, key: &str, pressed: bool) {
        self.keys.insert(key.to_lowercase(), pressed);
    }

    pub fn is_pressed(&self, key: &str) -> bool {
        self.keys.get(&key.to_lowercase()).copied().unwrap_or(false)
    }

    pub fn set_tester(&mut self, enabled: bool) {
        self.is_tester = enabled;
    }

    pub fn set_dev(&mut self, enabled: bool) {
        self.is_dev = enabled;
    }
}
