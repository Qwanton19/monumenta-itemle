import styles from '../../styles/Items.module.css';

const nameMappings = {
    "Vanilla Fire Res": "Fire Immunity",
    "damage": "Damage"
};

const oneLevelEffects = ["Fire Immunity", "Night Vision", "Nausea"];
const integerLevelEffects = ["Regeneration", "Haste", "Mining Fatigue", "Poison", "Jump Boost"];
const inverseColorEffects = [
    "Slow", "Blast Vulnerability", "Magic Vulnerability", "Melee Vulnerability", "Fall Vulnerability",
    "Projectile Vulnerability", "Anti Heal", "Melee Weakness", "Projectile Weakness", "Magic Weakness",
    "Mining Fatigue", "Poison", "Nausea"
];

class ConsumableFormatter {
    static convertTime(ticks) {
        let seconds = (ticks / 20) % 60;
        let minutes = Math.floor(ticks / (20 * 60));
        return `${minutes}:${(seconds < 10) ? `0${seconds}` : seconds}`;
    }

    static toHumanReadable(effect) {
        let splitName = effect.EffectType.split(/(?=[A-Z])/).join(" ");
        splitName = splitName.replace("Percent", "").replace("Increase", "").replace(/Resist$/, "Resistance").trim();

        // Some effects have a completely different name.
        let mapping = nameMappings[splitName];
        if (mapping !== undefined) {
            splitName = mapping;
        }

        // Some effects should be red when positive, and blue when negative, as they are debuffs.
        if (inverseColorEffects.includes(splitName)) {
            effect.invert = true;
        }

        // Some effects use levels like III instead of percentages, for the effect potency.
        if (integerLevelEffects.includes(splitName)) {
            return `${splitName} ${effect.EffectStrength}`
        }

        if (oneLevelEffects.includes(splitName)) {
            return splitName;
        }
        return `${(effect.EffectStrength < 0) ? "-" : "+"}${(effect.EffectStrength * 100).toPrecision(2)}% ${splitName}`;
    }

    static statStyle(effect) {
        return (effect.EffectStrength < 0 ^ effect.invert) ? "negativeCharm" : "positiveCharm";
    }

    static shouldTimeBeVisible(effectType) {
        return !(effectType.toLowerCase().includes("instant"));
    }

    static formatEffects(consumableEffects) {
        let formattedEffects = [];

        for (const effect of consumableEffects) {
            formattedEffects.push(<span className={styles[this.statStyle(effect)]}
                key={effect.EffectType}>{this.toHumanReadable(effect)} {(this.shouldTimeBeVisible(effect.EffectType)) ? <span className={styles.infoText}>{`(${this.convertTime(effect.EffectDuration)})`}</span> : ""}</span>);
        }

        return formattedEffects;
    }
}

module.exports = ConsumableFormatter;
