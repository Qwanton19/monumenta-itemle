import styles from '../../styles/Items.module.css'
import TranslatableEnchant from '../../components/translatableEnchant';

export const Formats = {
    "ENCHANT": 0,
    "SINGLE_ENCHANT": 1,
    "ATTRIBUTE": 2,
    "CURSE": 3,
    "SINGLE_CURSE": 4,
    "BASE_STAT": 5
}

export const categories = {
    "speed": [
        ...["adrenaline", "soul_speed"]
            .map(entry => ({ name: entry, format: Formats.ENCHANT })),
        ...["speed_flat", "speed_percent"]
            .map(entry => ({ name: entry, format: Formats.ATTRIBUTE })),
        ...["curse_of_crippling"]
            .map(entry => ({ name: entry, format: Formats.CURSE }))
    ],
    "melee": [
        ...["sweeping_edge", "knockback", "quake", "smite", "slayer", "duelist", "chaotic",
            "hex_eater", "decay", "bleeding", "stamina", "first_strike", "technique", "reverb", "impact"]
            .map(entry => ({ name: entry, format: Formats.ENCHANT }))
    ],
    "misc": [
        ...["second_wind", "inferno", "regicide", "aptitude", "triage", "trivium", "looting",
            "ice_aspect", "fire_aspect", "thunder_aspect", "wind_aspect", "earth_aspect"]
            .map(entry => ({ name: entry, format: Formats.ENCHANT })),
        ...["intuition", "weightless", "radiant", "darksight", "void_tether", "resurrection", "infinity"]
            .map(entry => ({ name: entry, format: Formats.SINGLE_ENCHANT }))
    ],
    "prot": [
        ...["projectile_protection", "blast_protection", "fire_protection", "melee_protection", "magic_protection",
            "feather_falling"]
            .map(entry => ({ name: entry, format: Formats.ENCHANT }))
    ],
    "attributes": [
        ...["knockback_resistance_flat", "attack_damage_percent", "attack_speed_flat",
            "attack_speed_percent", "magic_damage_percent", "projectile_damage_percent",
            "projectile_speed_percent", "thorns_flat", "thorns_percent", "throw_rate_percent"]
            .map(entry => ({ name: entry, format: Formats.ATTRIBUTE }))
    ],
    "health": [
        ...["regeneration", "life_drain", "sustenance"]
            .map(entry => ({ name: entry, format: Formats.ENCHANT })),
        ...["max_health_flat", "max_health_percent"]
            .map(entry => ({ name: entry, format: Formats.ATTRIBUTE })),
        ...["curse_of_anemia"]
            .map(entry => ({ name: entry, format: Formats.CURSE }))
    ],
    "tool": [
        ...["efficiency", "eruption", "sapper", "multitool", "fortune", "lure", "drilling"]
            .map(entry => ({ name: entry, format: Formats.ENCHANT })),
        ...["silk_touch", "jungles_nourishment", "excavator", "broomstick"]
            .map(entry => ({ name: entry, format: Formats.SINGLE_ENCHANT }))
    ],
    "epic": [
        ...["arcane_thrust", "worldly_protection"]
            .map(entry => ({ name: entry, format: Formats.ENCHANT })),
        ...["ashes_of_eternity", "rage_of_the_keter", "liquid_courage", "temporal_bender", "intoxicating_warmth", "retaliation"]
            .map(entry => ({ name: entry, format: Formats.SINGLE_ENCHANT }))
    ],
    "ranged": [
        ...["quick_charge", "point_blank", "sniper", "piercing", "retrieval",
            "punch", "recoil", "explosive", "multi-load"]
            .map(entry => ({ name: entry, format: Formats.ENCHANT })),
        ...["multishot"]
            .map(entry => ({ name: entry, format: Formats.SINGLE_ENCHANT }))
    ],
    "specialist": [
        ...["shielding", "poise", "inure", "steadfast", "ethereal", "reflexes", "evasion", "tempo",
            "cloaked", "guard"]
            .map(entry => ({ name: entry, format: Formats.ENCHANT })),
        ...["adaptability"]
            .map(entry => ({ name: entry, format: Formats.SINGLE_ENCHANT }))
    ],
    "other_curse": [
        ...["ineptitude", "curse_of_shrapnel", "curse_of_vanishing", "projectile_fragility", "melee_fragility",
            "magic_fragility", "blast_fragility", "fire_fragility", "starvation", "curse_of_the_veil"]
            .map(entry => ({ name: entry, format: Formats.CURSE })),
        ...["two_handed", "curse_of_corruption", "curse_of_irreparability", "curse_of_instability", "cumbersome", "clucking",
            "baaing", "oinking", "curse_of_ephemerality"]
            .map(entry => ({ name: entry, format: Formats.SINGLE_CURSE }))
    ],
    "water": [
        ...["depth_strider", "abyssal", "respiration", "riptide"]
            .map(entry => ({ name: entry, format: Formats.ENCHANT })),
        ...["gills", "aqua_affinity"]
            .map(entry => ({ name: entry, format: Formats.SINGLE_ENCHANT }))
    ],
    "durability": [
        ...["unbreaking"]
            .map(entry => ({ name: entry, format: Formats.ENCHANT })),
        ...["unbreakable", "mending"]
            .map(entry => ({ name: entry, format: Formats.SINGLE_ENCHANT }))
    ],
    "defense": [
        ...["armor", "agility", "armor_percent", "agility_percent"]
            .map(entry => ({ name: entry, format: Formats.ATTRIBUTE }))
    ],
    "base_stats": [
        ...["spell_power_base"]
            .map(entry => ({ name: entry, format: Formats.ATTRIBUTE })),
        ...["attack_damage_base", "attack_speed_base", "projectile_damage_base", "projectile_speed_base", "throw_rate_base",
            "potion_damage_flat", "potion_radius_flat"]
            .map(entry => ({ name: entry, format: Formats.BASE_STAT }))
    ],
    "vanilla_attributes": [
        ...["generic.max_health", "generic.movement_speed", "generic.attack_damage",
            "generic.knockback_resistance", "generic.armor", "generic.attack_speed"]
            .map(entry => ({ name: entry, format: Formats.ATTRIBUTE }))
    ]
}

class StatFormatter {
    static camelCase(str) {
        if (!str) return "";
        return str.replaceAll("_", " ").replace(/(?:^\w|[A-Z]|\b\w)/g, (word, index) => {
            return index == 0 ? word.toLowerCase() : word.toUpperCase();
        }).replace(/[\s+ ]/g, '');
    }

    static toHumanReadable(stat, value) {
        if (stat.name.startsWith("generic.")) {
            const displayName = stat.name.replace("generic.", "").split("_").map(p => p[0].toUpperCase() + p.substring(1)).join(" ");
            const isAttackSpeed = stat.name.includes("attack_speed");
            const displayValue = isAttackSpeed ? value : value * 100;
            const finalValue = displayValue % 1 === 0 ? displayValue : displayValue.toFixed(1);
            return `${finalValue > 0 ? '+' : ''}${finalValue}${isAttackSpeed ? "" : "%"} ${displayName}`;
        }
        let humanStr = stat.name.split("_").filter(part => (part != "m" && part != "p" && part != "bow" && part != "tool")).map(part => part[0].toUpperCase() + part.substring(1)).join(" ");
        humanStr = humanStr.replace(" Of ", " of ");
        humanStr = humanStr.replace(" The ", " the ");
        humanStr = humanStr.replace("Jungles", "Jungle's");
        switch (stat.format) {
            case Formats.ENCHANT: humanStr = `${humanStr} ${value}`; break;
            case Formats.SINGLE_ENCHANT: break;
            case Formats.ATTRIBUTE: humanStr = `${(value > 0) ? "+" : ""}${value}${(humanStr.includes(" Percent") || humanStr == "Spell Power Base") ? "%" : ""} ${humanStr.replace(" Percent", "").replace(" Base", "").replace(" Flat", "")}`; break;
            case Formats.CURSE: humanStr = `${humanStr} ${value}`; break;
            case Formats.SINGLE_CURSE: break;
            case Formats.BASE_STAT: humanStr = `${value} ${humanStr.replace(" Base", "").replace(" Flat", "")}`; break;
        }
        return humanStr;
    }

    static statStyle(stat, value, styles, comparisonResultEnchants) {
        if (!styles) return '';
        const capitalize = (s) => s && s.charAt(0).toUpperCase() + s.slice(1);
        let colorClass = '';
        if (comparisonResultEnchants && comparisonResultEnchants[stat.name]) {
            colorClass = styles[`text${capitalize(comparisonResultEnchants[stat.name])}`];
        }

        let styleClass = '';
        if (stat.name.startsWith("generic.")) {
            styleClass = (value < 0) ? styles.negativeStat : styles.positiveStat;
        } else {
            switch (stat.format) {
                case Formats.ATTRIBUTE: styleClass = (value < 0) ? styles.negativeStat : (stat.name == "armor" || stat.name == "agility") ? styles.positiveDefence : styles.positiveStat; break;
                case Formats.CURSE: case Formats.SINGLE_CURSE: styleClass = styles.negativeStat; break;
                case Formats.BASE_STAT: styleClass = styles.baseStats; break;
                default: styleClass = styles.none; break;
            }
        }
        return `${styleClass} ${colorClass}`;
    }

    static formatStats(stats, comparisonResultEnchants = null, styles = null) {
        if (stats == undefined) {
            return { topEnchants: [], bottomEnchants: [], attributes: [] };
        }

        let primaryStats = [];
        let attributes = [];

        for (const category in categories) {
            for (const stat of categories[category]) {
                if (stats[stat.name]) {
                    const finalClassName = this.statStyle(stat, stats[stat.name], styles, comparisonResultEnchants);
                    const jsxElement = <TranslatableEnchant key={stat.name} title={stat.name} className={finalClassName}>{this.toHumanReadable(stat, stats[stat.name])}</TranslatableEnchant>;

                    if (stat.format === Formats.ATTRIBUTE || stat.format === Formats.BASE_STAT) {
                        attributes.push(jsxElement);
                    } else {
                        primaryStats.push(jsxElement);
                    }
                }
            }
        }
        const topEnchants = primaryStats.slice(0, 2);
        const bottomEnchants = primaryStats.slice(2);

        return { topEnchants, bottomEnchants, attributes };
    }
}

export default StatFormatter;