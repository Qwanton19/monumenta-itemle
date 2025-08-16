import Enchants from './enchants';
import styles from '../../styles/Items.module.css';
import TranslatableText from '../translatableText';
import React from 'react';

function camelCase(str, upper) {
    if (!str) return "";
    return str.replaceAll('\'', '').replace(/(?:^\w|[A-Z]|\b\w)/g, function (word, index) {
        return index == 0 && !upper ? word.toLowerCase() : word.toUpperCase();
    }).replace(/\s+/g, '');
}

function getItemType(item) {
    if (item.type != undefined) return camelCase(item.type);
    return "misc";
}

function getItemsheetClass(itemName) {
    return `monumenta-${camelCase(itemName.replaceAll("-", "").replaceAll(".", "").replaceAll("'", "").replace(/\(.*\)/g, '').trim().replaceAll(" ", "-").replaceAll("_", "-").toLowerCase(), true)}`;
}

function doesStyleExist(className) {
    try {
        let styleSheets = document.styleSheets;
        let styleSheetsLength = styleSheets.length;
        for (let i = 0; i < styleSheetsLength; i++){
            let classes = styleSheets[i].cssRules;
            if (!classes) continue;
            for (let x = 0; x < classes.length; x++) {
                if (classes[x].selectorText == `.${className}`) return true;
            }
        }
    } catch (e) { return false; }
    return false;
}

function doesNameContainNonASCII(name) {
    for (let i = 0; i < name.length; i++) {
        if (name.charCodeAt(i) > 127) return true;
    }
    return false;
}

export default function ItemTile(data) {
    const { item, colorClasses } = data;
    const [cssClass, setCssClass] = React.useState(getItemsheetClass(item.name));
    const [baseBackgroundClass, setBaseBackgroundClass] = React.useState("monumenta-items");

    if (doesNameContainNonASCII(data.name)) {
        item.name = data.name;
    }

    React.useEffect(() => {
        if (!doesStyleExist(getItemsheetClass(item.name))) {
            setBaseBackgroundClass("minecraft");
            setCssClass(`minecraft-${item['base_item'].replaceAll(" ", "-").replaceAll("_", "-").toLowerCase()}`);
        } else {
            setBaseBackgroundClass("monumenta-items");
            setCssClass(getItemsheetClass(item.name));
        }
    }, [item]);

    const relocatedElements = [];

    if (item.location) {
        relocatedElements.push(<p className={`${styles.infoText} m-0`} key="location">
            <span className={`${styles[camelCase(item.location)]} ${colorClasses?.location || ''}`}>{item.location}</span>
        </p>);
    }
    if (item.region) {
        relocatedElements.push(<p className={`${styles.infoText} m-0`} key="region">
            <span className={`${colorClasses?.region || ''}`}>{item.region}</span>
        </p>);
    }
    if (item.tier) {
        relocatedElements.push(<p className={`${styles.infoText} m-0`} key="tier">
            <span className={`${styles[camelCase(item.tier)]} ${colorClasses?.tier || ''}`}>{item.tier}</span>
        </p>);
    }
    if (item.extras?.poi) {
        relocatedElements.push(<p className={`${styles.infoText} m-0`} key="poi">{`Found in ${item.extras.poi}`}</p>);
    }

    const relocatedInfoElement = relocatedElements.length > 0 ? (<div key="relocated-info-wrapper">{relocatedElements}</div>) : null;

    let displayBaseItem;
    const standardDisplayMaterials = [
        'leather', 'chainmail', 'iron', 'golden', 'stone', 'diamond', 'netherite',
        'bow', 'crossbow', 'trident', 'snowball', 'shield', 'wooden'
    ];

    const material = (item.base_item || '').split(' ')[0].toLowerCase();

    if (standardDisplayMaterials.includes(material)) {
        let deDupedName = item['base_item'];
        if (item.type) {
            const filteredBaseWords = (item['base_item'] || '').split(' ').filter(baseWord =>
                !item.type.split(' ').some(typeWord => typeWord.toLowerCase() === baseWord.toLowerCase())
            );
            const newName = filteredBaseWords.join(' ');
            if (newName.trim() !== '') {
                deDupedName = newName;
            }
        }
        displayBaseItem = deDupedName;
    } else {
        displayBaseItem = 'Other';
    }

    const isAlchemistBag = (item.base_item || '').toLowerCase() === 'splash potion';
    const projectileWeapons = ['bow', 'crossbow', 'trident', 'snowball'];
    const isProjectile = projectileWeapons.includes(material);

    return (
        <div className={`${styles.itemTile} ${data.hidden ? styles.hidden : ""}`}>
             <style jsx>{`
                :global(.textGreen) { color: #28a745 !important; font-weight: bold !important; }
                :global(.textYellow) { color: #ffc107 !important; font-weight: bold !important; }
                :global(.textRed) { color: #dc3545 !important; font-weight: bold !important; }
            `}</style>
            <div className={styles.imageIcon}>
                <div className={[baseBackgroundClass, cssClass].join(" ")}></div>
            </div>
            <span className={`${styles[camelCase(item.location)]} ${(item.tier == "Tier 3" && item.region == "Ring") ? styles["tier5"] : styles[camelCase(item.tier)]} ${styles.name}`}>
                <a href={`https://monumenta.wiki.gg/wiki/${item.name.replace(/\(.*\)/g, '').trim().replaceAll(" ", "_",)}`} target="_blank" rel="noreferrer">{item.name}</a>
            </span>

            <div style={{ height: '0.75em' }} />

            <p className={`${styles.infoText} m-0 ${colorClasses?.baseItem || ''}`}>{displayBaseItem}</p>

            <p className={`${styles.infoText} m-0 ${colorClasses?.type || ''}`}>
                {isAlchemistBag ? 'Alchemist Bag' :
                 isProjectile ? 'Projectile Weapon' :
                 <TranslatableText identifier={`items.type.${getItemType(item)}`}></TranslatableText>}
            </p>

            {item['original_item'] ? <span className={`${styles.infoText}`}>{`Skin for ${item['original_item']} `}</span> : ""}

            <Enchants item={item} interstitialElement={relocatedInfoElement} comparisonResultEnchants={colorClasses?.enchants || null} styles={styles} />

            {item.extras?.notes ? <p className={`${styles.infoText} m-0`}>{item.extras.notes}</p> : ""}
        </div>
    )
}