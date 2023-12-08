import Enchants from './enchants'
import styles from '../../styles/Items.module.css'
import React from 'react'
import TranslatableText from '../translatableText';

function camelCase(str, upper) {
    if (!str) return "";
    return str.replaceAll('\'', '').replace(/(?:^\w|[A-Z]|\b\w)/g, function (word, index) {
        return index == 0 && !upper ? word.toLowerCase() : word.toUpperCase();
    }).replace(/\s+/g, '');
}

const maxMasterwork = {
    "Rare": 4,
    "Artifact": 4,
    "Epic": 6
}

const undiscovered = {
    UNDISCOVERED: 1,
    DOES_NOT_EXIST: 2
}

function getLowestMasterworkItem(items) {
    let min = items[0];
    for (let i = 1; i < items.length; i++) {
        if (items[i].masterwork < min.masterwork) {
            min = items[i];
        }
    }
    return min;
}

function getItemWithMasterwork(items, masterwork) {
    let minMasterwork = getLowestMasterworkItem(items).masterwork;
    if (masterwork >= minMasterwork) {
        for (let item of items) {
            if (Number(item.masterwork) === masterwork) {
                return item;
            }
        }
    }
    let undiscoveredItem = {};
    // Need to create a copy of the object or it will modify the original object if I simply equal them.
    for (let key of Object.keys(items[0])) {
        switch (key) {
            case "stats": {
                undiscoveredItem.stats = {};
                break;
            }
            case "masterwork": {
                undiscoveredItem.masterwork = masterwork;
                break;
            }
            default: {
                undiscoveredItem[key] = items[0][key];
                break;
            }
        }
    }
    (masterwork < minMasterwork) ? undiscoveredItem.undiscovered = undiscovered.DOES_NOT_EXIST : undiscoveredItem.undiscovered = undiscovered.UNDISCOVERED;
    return undiscoveredItem;
}

function random(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function animate(star, index, starIntervals) {
    if (star.current) {
        star.current.style.setProperty("--star-left", `${random(-20, 80)}%`);
        star.current.style.setProperty("--star-top", `${random(-50, 70)}%`);
    
        // Use DOM Reflow to restart the animation
        star.current.style.animation = "none";
        star.current.offsetHeight;
        star.current.style.animation = "";
    } else {
        clearTimeout(starIntervals[index]);
    }
}

function getItemsheetClass(itemName) {
    return `monumenta-${camelCase(itemName.replace(/\(.*\)/g, '').replace("EX ", "").replaceAll("'", "").replaceAll(".", "").trim().replaceAll(" ", "-").replaceAll("_", "-").toLowerCase(), true)}`;
}

function doesStyleExist(className) {
    try {
        let styleSheets = document.styleSheets;
        let styleSheetsLength = styleSheets.length;
        for (let i = 0; i < styleSheetsLength; i++){
            let classes = styleSheets[i].cssRules;
            if (!classes) {
                continue;
            }
            
            for (let x = 0; x < classes.length; x++) {
                if (classes[x].selectorText == `.${className}`) {
                    return true;
                }
            }
        }
    } catch (e) {
        return false;
    }
    return false;
}

function doesNameContainNonASCII(name) {
    for (let i = 0; i < name.length; i++) {
        if (name.charCodeAt(i) > 127) {
            return true;
        }
    }
    return false;
}

export default function MasterworkableItemTile(data) {
    // This is an array
    const item = data.item;

    // If the item name has accented characters, they are actually not present in the item's name property,
    // but they are present in the item's key. In that case, set the name to the key.
    if (doesNameContainNonASCII(data.name)) {
        for (let masterworkItem of data.item) {
            masterworkItem.name = data.name;
        }
    }

    let defaultItem;
    if (data.default) {
        defaultItem = getItemWithMasterwork(item, data.default);
    } else {
        defaultItem = getLowestMasterworkItem(item);
    }
    const [activeItem, setActiveItem] = React.useState(defaultItem);
    const [cssClass, setCssClass] = React.useState(getItemsheetClass(activeItem.name));
    const [baseBackgroundClass, setBaseBackgroundClass] = React.useState("monumenta-items");

    function spanClicked(event) {
        let masterworkClicked = Number(event.target.id.split("-")[1]);
        const tempActiveItem = getItemWithMasterwork(item, masterworkClicked)
        setActiveItem(tempActiveItem);
        if (data.update) {
            data.update(tempActiveItem, tempActiveItem.type);
        }
    }

    const star1 = React.useRef();
    const star2 = React.useRef();
    const star3 = React.useRef();
    const star4 = React.useRef();
    const [starsAnimated, setStarsAnimated] = React.useState(false);

    React.useEffect(() => {
        if (!doesStyleExist(getItemsheetClass(activeItem.name))) {
            // The item doesn't have its own texture on the spritesheet, and must be defaulted to a minecraft texture.
            setBaseBackgroundClass("minecraft");
            setCssClass(`minecraft-${activeItem['base_item'].replaceAll(" ", "-").replaceAll("_", "-").toLowerCase()}`);
        } else {
            setBaseBackgroundClass("monumenta-items");
            setCssClass(getItemsheetClass(activeItem.name));
        }

        const stars = [star1, star2, star3, star4];
        const starIntervals = ["", "", "", ""];

        if (activeItem.name.includes("EX ") && !starsAnimated) {
            let index = 0;
            let interval = 2000;
            for (let i = 0; i < stars.length; i++) {
                setTimeout(() => {
                    animate(stars[i], i, starIntervals);
                    starIntervals[i] = setInterval(() => {
                        animate(stars[i], i, starIntervals);
                    }, interval)
                }, index++ * (interval / 4));
            }
    
            setStarsAnimated(true);
        }
    }, [activeItem, starsAnimated]);

    
    return (
        <div className={`${styles.itemTile} ${data.hidden ? styles.hidden : ""}`}>
            <div className={styles.imageIcon}>
                <div className={[baseBackgroundClass, cssClass].join(" ")}></div>
            </div>
            <span className={`${styles[camelCase(activeItem.location)]} ${styles[camelCase(activeItem.tier)]} ${styles.name}`}>
                {
                    (activeItem.name.includes("EX ")) ? <span className={styles.exalted}>
                        <span className={styles["exalted-star"]} ref={star1}>
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 576 512">{/*! Font Awesome Pro 6.3.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2023 Fonticons, Inc.*/}<path d="M316.9 18C311.6 7 300.4 0 288.1 0s-23.4 7-28.8 18L195 150.3 51.4 171.5c-12 1.8-22 10.2-25.7 21.7s-.7 24.2 7.9 32.7L137.8 329 113.2 474.7c-2 12 3 24.2 12.9 31.3s23 8 33.8 2.3l128.3-68.5 128.3 68.5c10.8 5.7 23.9 4.9 33.8-2.3s14.9-19.3 12.9-31.3L438.5 329 542.7 225.9c8.6-8.5 11.7-21.2 7.9-32.7s-13.7-19.9-25.7-21.7L381.2 150.3 316.9 18z"/></svg>
                        </span>
                        <span className={styles["exalted-star"]} ref={star2}>
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 576 512">{/*! Font Awesome Pro 6.3.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2023 Fonticons, Inc.*/}<path d="M316.9 18C311.6 7 300.4 0 288.1 0s-23.4 7-28.8 18L195 150.3 51.4 171.5c-12 1.8-22 10.2-25.7 21.7s-.7 24.2 7.9 32.7L137.8 329 113.2 474.7c-2 12 3 24.2 12.9 31.3s23 8 33.8 2.3l128.3-68.5 128.3 68.5c10.8 5.7 23.9 4.9 33.8-2.3s14.9-19.3 12.9-31.3L438.5 329 542.7 225.9c8.6-8.5 11.7-21.2 7.9-32.7s-13.7-19.9-25.7-21.7L381.2 150.3 316.9 18z"/></svg>
                        </span>
                        <span className={styles["exalted-star"]} ref={star3}>
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 576 512">{/*! Font Awesome Pro 6.3.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2023 Fonticons, Inc.*/}<path d="M316.9 18C311.6 7 300.4 0 288.1 0s-23.4 7-28.8 18L195 150.3 51.4 171.5c-12 1.8-22 10.2-25.7 21.7s-.7 24.2 7.9 32.7L137.8 329 113.2 474.7c-2 12 3 24.2 12.9 31.3s23 8 33.8 2.3l128.3-68.5 128.3 68.5c10.8 5.7 23.9 4.9 33.8-2.3s14.9-19.3 12.9-31.3L438.5 329 542.7 225.9c8.6-8.5 11.7-21.2 7.9-32.7s-13.7-19.9-25.7-21.7L381.2 150.3 316.9 18z"/></svg>
                        </span>
                        <span className={styles["exalted-star"]} ref={star4}>
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 576 512">{/*! Font Awesome Pro 6.3.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2023 Fonticons, Inc.*/}<path d="M316.9 18C311.6 7 300.4 0 288.1 0s-23.4 7-28.8 18L195 150.3 51.4 171.5c-12 1.8-22 10.2-25.7 21.7s-.7 24.2 7.9 32.7L137.8 329 113.2 474.7c-2 12 3 24.2 12.9 31.3s23 8 33.8 2.3l128.3-68.5 128.3 68.5c10.8 5.7 23.9 4.9 33.8-2.3s14.9-19.3 12.9-31.3L438.5 329 542.7 225.9c8.6-8.5 11.7-21.2 7.9-32.7s-13.7-19.9-25.7-21.7L381.2 150.3 316.9 18z"/></svg>
                        </span>
                        <span className={styles["exalted-text"]}>EX</span>
                    </span> : ""
                }
                <a href={`https://monumenta.wiki.gg/wiki/${activeItem.name.replace(/\(.*\)/g, '').trim().replaceAll(" ", "_",)}`} target="_blank" rel="noreferrer">{activeItem.name.replace("EX ", "")}</a>
            </span>
            <span className={styles.infoText}><TranslatableText identifier={`items.type.${camelCase(activeItem.type.replace("<M>", ""))}`}></TranslatableText>{` - ${activeItem['base_item']} `}</span>
            {activeItem['original_item'] ? <span className={styles.infoText}>{`Skin for ${activeItem['original_item']} `}</span> : ""}
            <span className={styles.infoText}>
                <span onClick={spanClicked} id="mw-0" className={styles["starSpan"]}>Masterwork</span>: <span>
                    {
                        [...Array(maxMasterwork[activeItem.tier]).keys()].map(num => num + 1).map(num => {
                            if (num <= activeItem.masterwork) {
                                return <span key={`mw-${num}`} onClick={spanClicked} id={`mw-${num}`} className={[styles["starSpan"], styles["masterworkStar"]].join(" ")}>★</span>
                            } else {
                                return <span key={`mw-${num}`} onClick={spanClicked} id={`mw-${num}`} className={styles["starSpan"]}>☆</span>
                            }
                        })
                    }
                </span>
            </span>
            {
                (activeItem.undiscovered) ? (
                    (activeItem.undiscovered == undiscovered.UNDISCOVERED) ? <span className={styles["undiscovered"]}>This item has not yet been discovered! Tag FlamingoBike#6228 on discord with a screenshot of the item.</span> :
                        (activeItem.undiscovered == undiscovered.DOES_NOT_EXIST) ? <span className={styles["undiscovered"]}>This item does not appear ingame with this level of masterwork, or this level of masterwork does not have the desired stat.</span> : ""
                ) :
                    <div>
                        <Enchants item={activeItem}></Enchants>
                        <span>
                            <span className={styles.infoText}>{`${activeItem.region} `}</span>
                            <span className={styles[camelCase(activeItem.tier)]}>{activeItem.tier}</span>
                        </span>
                    </div>
            }
            <span className={styles[camelCase(activeItem.location)]}>{activeItem.location}</span>
            {
                (!activeItem.undiscovered) ?
                <div>
                    {activeItem.lore ? <span className={styles.infoText}>{activeItem.lore}</span> : ""}
                    {activeItem.extras?.poi ? <p className={`${styles.infoText} m-0`}>{`Found in ${activeItem.extras.poi}`}</p> : ""}
                    {activeItem.extras?.notes ? <p className={`${styles.infoText} m-0`}>{activeItem.extras.notes}</p> : ""}
                </div> : ""
            }
        </div>
    )
}