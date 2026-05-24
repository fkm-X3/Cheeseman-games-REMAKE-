pub struct CubeData {
    pub id: u32,
    pub name: &'static str,
    pub color: &'static str,
    pub hp: u32,
    pub attacks: &'static str,
    pub attack1: &'static str,
    pub attack2: &'static str,
    pub counter: &'static str,
    pub dev: bool,
}

pub const CUBES: &[CubeData] = &[
    CubeData { id: 1, name: "Sword Master", color: "#0000FF", hp: 100, attacks: "Slash, Parry", attack1: "[SPACE] Slash: Standard melee attack. Deals 25 dmg.", attack2: "[F] Parry: Turns black. Reflects attacks and stuns enemy.", counter: "Do not attack when he turns black (Parry). Wait for the parry to end (1 sec) then punish.", dev: false },
    CubeData { id: 2, name: "Angry Sniper", color: "#FF0000", hp: 100, attacks: "Dash (No CD), Laser", attack1: "[SPACE] Dash: Quick burst charge. No cooldown.", attack2: "[F] Laser: Long range beam. Deals 30 dmg.", counter: "The Dash has no cooldown but short range. The Laser has a long windup. Jump over the laser.", dev: false },
    CubeData { id: 3, name: "Sniper Cube", color: "#00FF00", hp: 100, attacks: "Slash, Laser (Windup)", attack1: "[SPACE] Slash: Standard melee.", attack2: "[F] Laser: Charges up (flashing) then fires a full screen beam (25 dmg).", counter: "Hit him while he is charging the laser. He cannot move while charging.", dev: false },
    CubeData { id: 4, name: "Magic Cube", color: "#FF69B4", hp: 100, attacks: "Slash, Block (Bar)", attack1: "[SPACE] Slash: Standard melee.", attack2: "[F] Block: Creates a shield. Drains energy bar. Negates damage.", counter: "Wait for the blue energy bar to deplete. He cannot block forever.", dev: false },
    CubeData { id: 5, name: "The Jorker", color: "#8B4513", hp: 75, attacks: "Kick, Laser (Windup)", attack1: "[SPACE] Kick: Short range, high knockback. 15 dmg + Stun.", attack2: "[F] Laser: Yellow beam. 25 dmg.", counter: "Low HP (75). Rush him down, but stay out of Kick range to avoid being stunned.", dev: false },
    CubeData { id: 6, name: "Ima Touch You", color: "#4B0082", hp: 75, attacks: "Slash, Pull (Invert)", attack1: "[SPACE] Slash: Standard melee.", attack2: "[F] Pull: Drags enemy closer. If very close, inverts controls.", counter: "Low HP. If you see the purple line, run away to break the tether before he touches you.", dev: false },
    CubeData { id: 7, name: "Vigilante", color: "#2F4F4F", hp: 125, attacks: "Takedown, Drone Support", attack1: "[SPACE] Takedown: High speed dash. 20 dmg + knockback.", attack2: "[F] Drone: Deploys a drone that shoots automatically.", counter: "High HP. Destroy the drone if possible. Jump over the Takedown dash.", dev: false },
    CubeData { id: 8, name: "Fbt_7 (Secret)", color: "#000000", hp: 200, attacks: "Delete (Poison), Error 404, Hatred, Termination", attack1: "[SPACE] Delete: Poison Slash. [F] 404: Stun/Clone. [Q] Hatred: Rage Mode. [E] Termination: Ultimate.", attack2: "Developer character with OP stats.", counter: "Run. Survive the Hatred mode. Pray he misses the Delete slash.", dev: true },
    CubeData { id: 9, name: "Master Cube", color: "#FFD700", hp: 100, attacks: "Call back, Overtime", attack1: "[SPACE] Overtime: Buffs minion stats to 100%.", attack2: "[F] Call Back: Swaps out for a random Minion.", counter: "Kill the minion. When the Master returns, he is vulnerable before he can swap again.", dev: false },
    CubeData { id: 10, name: "Bobbythe124", color: "#CCCCFF", hp: 149, attacks: "Silence, Hatred, Beam, Bleed", attack1: "[SPACE] Silence 35 dmg. [F] Beam 50 dmg. [E] Bleed Poison DoT.", attack2: "Passive: Jumps get higher each time.", counter: "Do not get hit by Silence. Watch out for his super high jumps.", dev: true },
    CubeData { id: 11, name: "Ghost Cube", color: "#C8C8C8", hp: 80, attacks: "Phase Slash, Teleport", attack1: "[SPACE] Phase Slash: Brief invincibility on hit. 20 dmg.", attack2: "[F] Teleport: Blink behind enemy. 15 dmg + disorient.", counter: "Low HP (80). Punish after teleport - he's vulnerable for 0.5 sec.", dev: false },
    CubeData { id: 12, name: "Tank Cube", color: "#556B2F", hp: 200, attacks: "Heavy Slam, Armor", attack1: "[SPACE] Heavy Slam: AOE ground pound. 30 dmg + knockback.", attack2: "[F] Armor: Reduces incoming damage by 50% for 3 sec.", counter: "Slow movement. Kite him and wait for Armor to expire. Don't stand in slam AOE.", dev: false },
    CubeData { id: 13, name: "Trickster Cube", color: "#FF69B4", hp: 90, attacks: "Decoy, Swap", attack1: "[SPACE] Decoy: Leaves a clone that explodes. 15 dmg.", attack2: "[F] Swap: Teleports to enemy position. 10 dmg + confusion.", counter: "Watch for the decoy. If swapped, controls are inverted briefly.", dev: false },
    CubeData { id: 14, name: "Pyro Cube", color: "#FF4500", hp: 100, attacks: "Flame Dash, Fire Wall", attack1: "[SPACE] Flame Dash: Burning charge, fire trail. 20 dmg + burn DoT.", attack2: "[F] Fire Wall: Wall of fire blocks and burns. 10 dmg/sec.", counter: "Fire trail stays on ground - avoid it. Fire Wall lasts 4 sec, go around.", dev: false },
    CubeData { id: 15, name: "Frost Cube", color: "#B0E0E6", hp: 110, attacks: "Ice Shard, Freeze", attack1: "[SPACE] Ice Shard: Ranged projectile. 18 dmg + slow.", attack2: "[F] Freeze: Short range freeze immobilizes 1.5 sec.", counter: "If frozen, mash space to break free. Ice shards are dodgeable.", dev: false },
];

pub fn get_cube_by_id(id: u32) -> &'static CubeData {
    CUBES.iter().find(|c| c.id == id).unwrap_or(&CUBES[0])
}

pub struct AchievementData {
    pub id: u32,
    pub name: &'static str,
    pub desc: &'static str,
    pub unlocks: &'static str,
    pub max_progress: u32,
}

pub const ACHIEVEMENTS: &[AchievementData] = &[
    AchievementData { id: 1, name: "First Blood", desc: "Win your first battle", unlocks: "Sniper Cube", max_progress: 0 },
    AchievementData { id: 2, name: "Sharpshooter", desc: "Hit 15 beams total", unlocks: "Magic Cube", max_progress: 15 },
    AchievementData { id: 3, name: "Unstoppable", desc: "Win without taking damage", unlocks: "The Jorker", max_progress: 0 },
    AchievementData { id: 4, name: "Wombo Combo", desc: "Counter an attack then hit every shot to win", unlocks: "Ima Touch You", max_progress: 0 },
    AchievementData { id: 5, name: "In every timeline I kill you...", desc: "Lose to Fbt_7", unlocks: "Vigilante", max_progress: 0 },
    AchievementData { id: 6, name: "Not like this", desc: "Unlock everything else", unlocks: "The heartbreaking (placeholder)", max_progress: 0 },
    AchievementData { id: 7, name: "Cube Master", desc: "Unlock all other cubes", unlocks: "Master Cube", max_progress: 0 },
    AchievementData { id: 8, name: "Phantom Menace", desc: "Win 5 battles as Ghost Cube", unlocks: "Tank Cube", max_progress: 5 },
    AchievementData { id: 9, name: "Unbreakable", desc: "Win a battle with Tank Cube at full HP", unlocks: "Trickster Cube", max_progress: 0 },
    AchievementData { id: 10, name: "Now You See Me", desc: "Kill an enemy with a decoy explosion", unlocks: "Pyro Cube", max_progress: 0 },
    AchievementData { id: 11, name: "Burn Baby Burn", desc: "Deal 100 burn damage total", unlocks: "Frost Cube", max_progress: 100 },
    AchievementData { id: 12, name: "Absolute Zero", desc: "Freeze an enemy 10 times in one match", unlocks: "New Game+", max_progress: 10 },
];

pub fn get_cube_unlock_achievement_id(cube_id: u32) -> Option<u32> {
    match cube_id {
        1 | 2 => None,
        8 | 10 => None,
        9 => Some(6),
        _ => {
            let cube = get_cube_by_id(cube_id);
            ACHIEVEMENTS.iter().find(|a| a.unlocks == cube.name).map(|a| a.id)
        }
    }
}
