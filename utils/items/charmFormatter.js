import styles from '../../styles/Items.module.css';

class CharmFormatter {
    static camelCase(str) {
        if (!str) return "";
        return str.replaceAll("_", " ").replace(/(?:^\w|[A-Z]|\b\w)/g, (word, index) => {
            return index == 0 ? word.toLowerCase() : word.toUpperCase();
        }).replace(/[\s+ ]/g, '');
    }

    static toHumanReadable(stat, valueObj) {
        let value = valueObj.value; // hack to fix locked charms
        let humanStr = stat.split("_")
            .filter(part => (part != "m" && part != "p" && part != "bow" && part != "tool"))
            .map(part => part[0].toUpperCase() + part.substring(1))
            .join(" ");

        humanStr = `${valueObj.locked ? "🔒 " : ""}${(value > 0) ? "+" : ""}${value}${(humanStr.includes(" Percent")) ? "%" : ""} ${humanStr.replace(" Percent", "").replace(" Base", "").replace(" Flat", "")}`;

        return humanStr;
    }

    static statStyle(stat, valueObj) {
        let value = valueObj.value; // hack to fix locked charms
        return (
            (stat.includes("cooldown") && (!stat.includes("reduction") && (!stat.includes("cap_flat"))))
            || stat.includes("price")
            || (stat.includes("threshold") && (!stat.includes("rejuvenation")) && (!stat.includes("coup")) && (!stat.includes("meteor")))
            || stat.includes("stacks_needed_for_activation_flat") // ok that one's a little gross I admit
            || stat.includes("self_damage")
            || stat.includes("delay")
        ) ?
            (value < 0) ? "positiveCharm" : "negativeCharm" :
            (value < 0) ? "negativeCharm" : "positiveCharm";
    }

    static formatCharm(charm) {
        let formattedStats = [];

        for (const stat in charm) {
            if (charm[stat]) {
                formattedStats.push(<span className={styles[this.statStyle(stat, charm[stat])]} key={stat}>{this.toHumanReadable(stat, charm[stat])}</span>);
            }
        }

        return formattedStats;
    }
}

module.exports = CharmFormatter;
