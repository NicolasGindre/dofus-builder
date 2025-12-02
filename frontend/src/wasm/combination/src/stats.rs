use serde::{Serialize, Deserialize};

macro_rules! stat_fields {
    ($macro:ident) => {
        $macro! {
            ap, mp, range, summon,
            vitality,
            strength, agility, chance, intelligence,
            power, wisdom, prospecting,
            lock, dodge,
            critical_chance,
            critical_damage, pushback_damage, trap_damage, trap_power,
            spell_damage_per, ranged_damage_per, melee_damage_per, weapon_damage_per, final_damage_per,
            damage, neutral_damage, earth_damage, air_damage, water_damage, fire_damage,
            critical_resist, pushback_resist,
            neutral_resist, earth_resist, air_resist, water_resist, fire_resist,
            neutral_resist_per, earth_resist_per, air_resist_per, water_resist_per, fire_resist_per,
            ranged_resist_per, melee_resist_per,
            mp_reduction, ap_reduction,
            mp_resist, ap_resist,
            heal, reflect,
            initiative, pods
        }
    };
}

macro_rules! define_stats {
    ( $( $field:ident ),+ ) => {
        #[derive(Serialize, Deserialize, Clone, Debug, Default)]
        // #[derive(Serialize, Deserialize, Clone, Copy, Debug, Default)] // seems slower
        // #[repr(C)] // seems slower
        #[serde(rename_all = "camelCase")]
        #[serde(default)]
        pub struct Stats {
            $( pub $field: f64, )+
        }

        #[derive(Serialize, Deserialize, Clone, Debug)]
        #[serde(rename_all = "camelCase")]
        #[serde(default)]
        pub struct MaxStats {
            $( pub $field: f64, )+
        }

        impl Default for MaxStats {
            fn default() -> Self {
                Self {
                    $( $field: f64::INFINITY, )+
                }
            }
        }

        #[derive(Serialize, Deserialize, Clone, Debug)]
        #[serde(rename_all = "camelCase")]
        #[serde(default)]
        pub struct MinStats {
            $( pub $field: f64, )+
        }

        impl Default for MinStats {
            fn default() -> Self {
                Self {
                    $( $field: f64::NEG_INFINITY, )+
                }
            }
        }
    };
}

stat_fields!(define_stats);

macro_rules! define_value {
    ( $( $field:ident ),+ ) => {
        impl Stats {
            pub fn value(&self, weights: &Stats, min: &MinStats, max: &MaxStats) -> f64 {
                let mut total = 0.0;
                $(
                    if self.$field < min.$field {
                        return 0.0;
                    }
                    total += if self.$field > max.$field {
                        max.$field * weights.$field
                    } else {
                        self.$field * weights.$field
                    };
                )+
                total
            }
        }
    };
}

stat_fields!(define_value);

use std::ops::AddAssign;
// use std::ops::{AddAssign, Sub};

macro_rules! define_add_assign {
    ( $( $field:ident ),+ ) => {
        impl AddAssign<&Stats> for Stats {
            // #[inline(always)] // confirmed slows down with flags
            fn add_assign(&mut self, other: &Stats) {
                $( self.$field += other.$field; )+
            }
        }
    };
}

stat_fields!(define_add_assign);

// macro_rules! define_sub {
//     ( $( $field:ident ),+ ) => {
//         impl Sub<&Stats> for &Stats {
//             type Output = Stats;
//             fn sub(self, rhs: &Stats) -> Stats {
//                 Stats {
//                     $( $field: self.$field - rhs.$field, )+
//                 }
//             }
//         }
//     };
// }

// stat_fields!(define_sub);

// macro_rules! define_sub_minmax {
//     ( $( $field:ident ),+ ) => {
//         impl Sub<&Stats> for &MaxStats {
//             type Output = MaxStats;
//             fn sub(self, rhs: &Stats) -> MaxStats {
//                 MaxStats {
//                     $( $field: self.$field - rhs.$field, )+
//                 }
//             }
//         }

//         impl Sub<&Stats> for &MinStats {
//             type Output = MinStats;
//             fn sub(self, rhs: &Stats) -> MinStats {
//                 MinStats {
//                     $( $field: self.$field - rhs.$field, )+
//                 }
//             }
//         }
//     };
// }

// stat_fields!(define_sub_minmax);