import Select from 'react-select';
import SelectInput from '../items/selectInput';
import CheckboxWithLabel from '../items/checkboxWithLabel';
import ItemTile from '../items/itemTile';
import MasterworkableItemTile from '../items/masterworkableItemTile';
import styles from '../../styles/Items.module.css'
import React from 'react';
import { useRouter } from 'next/router';

import Stats from '../../utils/builder/stats';
import TranslatableText from '../translatableText';
import ListSelector from './listSelector';
import CharmSelector from './charmSelector';
import CharmShortener from '../../utils/builder/charmShortener';

const emptyBuild = { mainhand: "None", offhand: "None", helmet: "None", chestplate: "None", leggings: "None", boots: "None" };

const enabledBoxes = {
    // Situational Defense
    shielding: false,
    poise: false,
    inure: false,
    steadfast: false,
    guard: false,
    second_wind: false,
    ethereal: false,
    reflexes: false,
    evasion: false,
    tempo: false,
    cloaked: false,

    // Situational Damage
    smite: false,
    duelist: false,
    slayer: false,
    point_blank: false,
    sniper: false,
    first_strike: false,
    regicide: false,
    trivium: false,
    stamina: false,
    technique: false,
    abyssal: false,
    // retaliation is handled separately

    // Class Ability Buffs
    versatile: false,
    weapon_mastery: false,
    formidable: false,
    dethroner_elite: false, // handle dethroner separately?
    dethroner_boss: false,
    culling: false,
    totemic_empowerment: false
};

const situationalDefenses = [
    "shielding",
    "poise",
    "inure",
    "steadfast",
    "guard",
    "second_wind",
    "ethereal",
    "reflexes",
    "evasion",
    "tempo",
    "cloaked"
]

const situationalFlatDamage = [
    "smite",
    "duelist",
    "slayer",
    "point_blank",
    "sniper"
]

const situationalPercentDamage = [
    "first_strike",
    "regicide",
    "trivium",
    "stamina",
    "technique",
    "abyssal"
]

const extraStats = {
    damageMultipliers: [],
    resistanceMultipliers: [],
    healthMultipliers: [],
    speedMultipliers: [],
    attackSpeedMultipliers: []
}

function groupMasterwork(items, itemData) {
    // Group up masterwork tiers by their name using an object, removing them from items.
    let masterworkItems = {};
    // Go through the array in reverse order to have the splice work properly
    // (items will go down in position if not removed from the end)
    for (let i = items.length - 1; i >= 0; i--) {
        let name = items[i];
        if (itemData[name].masterwork != undefined) {
            let itemName = itemData[name].name;
            if (!masterworkItems[itemName]) {
                masterworkItems[itemName] = [];
            }
            masterworkItems[itemName].push(itemData[name]);
            items.splice(i, 1);
        }
    }

    // Re-insert the groups as arrays into the items array.
    Object.keys(masterworkItems).forEach(item => {
        items.push({ value: `${item}-${masterworkItems[item][0].masterwork}`, label: item });
    });

    return items;
}

function getRelevantItems(types, itemData) {
    let items = Object.keys(itemData);
    return groupMasterwork(items.filter(name => types.includes(itemData[name].type.toLowerCase().replace(/<.*>/, "").trim())), itemData);
}

function recalcBuild(data, itemData) {
    let tempStats = new Stats(itemData, data, enabledBoxes, extraStats);
    return tempStats;
}

function createMasterworkData(name, itemData) {
    return Object.keys(itemData).filter(itemName => itemData[itemName].name == name).map(itemName => itemData[itemName]);
}

function removeMasterworkFromName(name) {
    return name.replace(/-\d$/g, "");
}

function checkExists(type, itemsToDisplay, itemData) {
    let retVal = false;
    if (itemsToDisplay.itemStats) {
        retVal = itemsToDisplay.itemStats[type] !== undefined;
    }
    if (itemsToDisplay.itemNames && itemsToDisplay.itemNames[type] && createMasterworkData(removeMasterworkFromName(itemsToDisplay.itemNames[type]), itemData)[0]?.masterwork != undefined) {
        retVal = true;
    }
    return retVal;
}

function formatSituationalName(situ) {
    return situ.split("_").map(word => word[0].toUpperCase() + word.substring(1)).join(" ")
}

function generateSituationalCheckboxes(itemsToDisplay, checkboxChanged){
    let tempDef = [];
    let tempFlatDmg = [];
    let tempPercentDmg = [];

    situationalDefenses.map(function(situ) { 
        if(!itemsToDisplay.situationals) return;
        if(itemsToDisplay.situationals[situ].level) { 
            tempDef.push(<CheckboxWithLabel key={"situationalbox-"+situ} name={formatSituationalName(situ)} checked={false} onChange={checkboxChanged} />);
        }
    });
    situationalFlatDamage.map(function(situ) { 
        if(!itemsToDisplay.situationals) return;
        if(itemsToDisplay.situationals[situ].level) { 
            tempFlatDmg.push(<CheckboxWithLabel key={"situationalbox-"+situ} name={formatSituationalName(situ)} checked={false} onChange={checkboxChanged} />);
        }
    });
    situationalPercentDamage.map(function(situ) { 
        if(!itemsToDisplay.situationals) return;
        if(itemsToDisplay.situationals[situ].level) { 
            tempPercentDmg.push(<CheckboxWithLabel key={"situationalbox-"+situ} name={formatSituationalName(situ)} checked={false} onChange={checkboxChanged} />);
        }
    });
    /* if(itemsToDisplay.meleeDamagePercent > 100 || itemsToDisplay.projectileDamagePercent > 100){
        tempPercentDmg.push(<CheckboxWithLabel key={"situationalbox-versatile"} name="Versatile" checked={false} onChange={checkboxChanged} />)
    } */

    let temp = [];
    temp.push(...tempDef);
    if(tempDef.length > 0 && tempFlatDmg.length > 0){
        temp.push(<span key="spacer1" style={{width: "10px", padding: "0px"}}></span>);
        // spacer between def and flat damage if both exist
    }
    temp.push(...tempFlatDmg);
    if(temp.length > 0 && tempPercentDmg.length > 0){
        temp.push(<span key="spacer2" style={{width: "10px", padding: "0px"}}></span>);
        // spacer between existing stuff and percent damage if both exist
    }
    temp.push(...tempPercentDmg);
    if(temp.length == 0){
        temp.push(<TranslatableText className={styles.noSituationals} key="builder.info.noSituationals" identifier="builder.info.noSituationals"></TranslatableText>)
    }
    return temp;
}

export default function BuildForm({ update, build, parentLoaded, itemData, itemsToDisplay, buildName, updateLink, setUpdateLink }) {
    const [stats, setStats] = React.useState({});
    const [charms, setCharms] = React.useState([]);
    const [urlCharms, setUrlCharms] = React.useState([]);

    const [updateLoaded, setUpdateLoaded] = React.useState(false);

    function sendUpdate(event) {
        event.preventDefault();
        const itemNames = Object.fromEntries(new FormData(event.target).entries());
        const tempStats = recalcBuild(itemNames, itemData);
        setStats(tempStats);
        update(tempStats);
        router.push(`/builder?${makeBuildString()}`, `/builder/${makeBuildString()}`, { shallow: true });
    }

    React.useEffect(() => {
        if (parentLoaded && build) {
            let buildParts = decodeURI(build).split("&");
            let itemNames = {
                mainhand: (buildParts.find(str => str.includes("m="))?.split("m=")[1]),
                offhand: (buildParts.find(str => str.includes("o="))?.split("o=")[1]),
                helmet: (buildParts.find(str => str.includes("h="))?.split("h=")[1]),
                chestplate: (buildParts.find(str => str.includes("c="))?.split("c=")[1]),
                leggings: (buildParts.find(str => str.includes("l="))?.split("l=")[1]),
                boots: (buildParts.find(str => str.includes("b="))?.split("b=")[1])
            };
            Object.keys(itemNames).forEach(type => {
                if (itemNames[type] === undefined || !Object.keys(itemData).includes(itemNames[type])) {
                    itemNames[type] = "None";
                }
            });
            let charmString = buildParts.find(str => str.includes("charm="));
            if (charmString) {
                let charmList = CharmShortener.parseCharmData(charmString.split("charm=")[1], itemData);
                setUrlCharms(charmList);

                // dunno what happened here but i needed to change this to have the map()
                // so it's passing a list of charm objects, not charm names
                // idk why it worked before and stopped working now, but this fixes it
                setCharms(charmList.map(name => itemData[name]));
            }
            const tempStats = recalcBuild(itemNames, itemData);
            setStats(tempStats);
            update(tempStats);
            setUpdateLoaded(true);
        }
    }, [parentLoaded]);

    const itemTypes = ["mainhand", "offhand", "helmet", "chestplate", "leggings", "boots"];

    const regions = [
        { value: 1, label: "Valley" },
        { value: 2, label: "Isles" },
        { value: 3, label: "Ring" }
      ]

    const formRef = React.useRef();
    const router = useRouter();
    const itemRefs = {
        mainhand: React.useRef(),
        offhand: React.useRef(),
        helmet: React.useRef(),
        chestplate: React.useRef(),
        leggings: React.useRef(),
        boots: React.useRef()
    }

    function resetForm(event) {
        for (let ref in itemRefs) {
            itemRefs[ref].current.setValue({ value: "None", label: "None" });
        }
        const tempStats = recalcBuild(emptyBuild, itemData)
        setStats(tempStats);
        update(tempStats);
        router.push('/builder', `/builder/`, { shallow: true });
    }

    function receiveMasterworkUpdate(newActiveItem, itemType) {
        let newBuild = {};
        for (let ref in itemRefs) {
            newBuild[ref] = itemRefs[ref].current.getValue()[0].value;
        }
        let mainhands = ["mainhand", "mainhand sword", "mainhand shield", "axe", "pickaxe", "wand", "scythe", "bow", "crossbow", "snowball", "trident"];
        let offhands = ["offhand", "offhand shield", "offhand sword"];
        let actualItemType = (mainhands.includes(itemType.toLowerCase())) ? "mainhand" : (offhands.includes(itemType.toLowerCase())) ? "offhand" : itemType.toLowerCase();

        const manualBuildString = encodeURI(decodeURI(makeBuildString()).replace(newBuild[actualItemType.toLowerCase()], `${newActiveItem.name}-${newActiveItem.masterwork}`));
        newBuild[actualItemType.toLowerCase()] = `${newActiveItem.name}-${newActiveItem.masterwork}`;
        itemRefs[actualItemType.toLowerCase()].current.setValue({ "value": `${newActiveItem.name}-${newActiveItem.masterwork}`, "label": newActiveItem.name });
        router.push(`/builder?${manualBuildString}`, `/builder/${manualBuildString}`, { shallow: true });

        const tempStats = recalcBuild(newBuild, itemData)
        setStats(tempStats);
        update(tempStats);
    }

    function copyBuild(event) {
        let baseUrl = `${window.location.origin}/builder/`;
        event.target.value = "Copied!";
        event.target.classList.add("fw-bold");
        setTimeout(() => { event.target.value = "Share"; event.target.classList.remove("fw-bold") }, 3000);

        if (!navigator.clipboard) {
            window.alert("Couldn't copy build to clipboard. Sadness. :(");
            return;
        }
        navigator.clipboard.writeText(`${baseUrl}${makeBuildString()}`).then(function () {
            console.log('Copying to clipboard was successful!');
        }, function (err) {
            console.error('Could not copy text: ', err);
        });
    }

    function getEquipName(type) {
        if (!build) return undefined
        let buildParts = decodeURI(build).split("&");
        let allowedTypes = ["mainhand", "offhand", "helmet", "chestplate", "leggings", "boots"]
        let name = (allowedTypes.includes(type)) ? buildParts.find(str => str.includes(`${type[0]}=`))?.split(`${type[0]}=`)[1] : "None";
        if (!Object.keys(itemData).includes(name)) {
            return { "value": "None", "label": "None" };
        }
        return { "value": name, "label": removeMasterworkFromName(name) };
    }

    function makeBuildString(charmsOverride, dataOverride) {
        let data = (dataOverride) ? dataOverride : new FormData(formRef.current).entries();
        let buildString = "";
        let keysToShare = ["mainhand", "offhand", "helmet", "chestplate", "leggings", "boots"];
        for (const [key, value] of data) {
            buildString += (keysToShare.includes(key)) ? `${key[0]}=${value.replaceAll(" ", "%20")}&` : "";
        }

        let charmsToLookAt = (charmsOverride) ? charmsOverride : charms;

        if (charmsToLookAt.length == 0) {
            buildString += "charm=None";
        } else {
            buildString += `charm=${CharmShortener.shortenCharmList(charmsToLookAt)}`;
        }

        if(buildName != "Monumenta Builder") buildString += `&name=${encodeURIComponent(buildName)}`;

        return buildString;
    }

    function checkboxChanged(event) {
        const name = event.target.name.replace(" ","_").replace(/[()]/g,""); // replace spaces so we can still have them visually without breaking existing stuff
        enabledBoxes[name] = event.target.checked;
        const itemNames = Object.fromEntries(new FormData(formRef.current).entries());
        const tempStats = recalcBuild(itemNames, itemData);
        setStats(tempStats);
        update(tempStats);
    }

    function multipliersChanged(newMultipliers, name) {
        extraStats[name] = newMultipliers;
        const itemNames = Object.fromEntries(new FormData(formRef.current).entries());
        const tempStats = recalcBuild(itemNames, itemData);
        setStats(tempStats);
        update(tempStats);
    }

    function damageMultipliersChanged(newMultipliers) {
        multipliersChanged(newMultipliers, "damageMultipliers");
    }

    function resistanceMultipliersChanged(newMultipliers) {
        multipliersChanged(newMultipliers, "resistanceMultipliers");
    }

    function healthMultipliersChanged(newMultipliers) {
        multipliersChanged(newMultipliers, "healthMultipliers");
    }

    function speedMultipliersChanged(newMultipliers) {
        multipliersChanged(newMultipliers, "speedMultipliers");
    }
    function attackSpeedMultipliersChanged(newMultipliers){
      multipliersChanged(newMultipliers,"attackSpeedMultipliers");
    }

    function updateCharms(charmNames) {
        let charmData = charmNames.map(name => itemData[name]);
        setCharms(charmData);
        router.push(`/builder?${makeBuildString(charmData)}`, `/builder/${makeBuildString(charmData)}`, { shallow: true });
    }

    function itemChanged(newValue, actionMeta) {
        // This is here so you don't have to scroll down to "Recalculate" and then back up to click a situational.
        // It updates the whole form. I don't think this was the original intent but checkboxes do anyway
        // so may as well. However, it's kind of awkward because the FormData.entries() does not yet contain
        // the new value of the item that was just changed, so we have to get it ourselves.
        // Unlike most event handler props, Select's `onChange` does not pass an event.
        // It instead passes the new value of the Select, and an "action meta".
        // Why is this not condensed into an event containing both of these and a ref to the target? Beats me. -LC
        let entries = Array.from(new FormData(formRef.current).entries());
        console.log(entries);
        for(let i=0;i<entries.length;i++){
            if(entries[i][0] == actionMeta.name) entries[i][1] = newValue.value;
        }
        console.log(entries);
        const itemNames = Object.fromEntries(entries);
        const tempStats = recalcBuild(itemNames, itemData);
        setStats(tempStats);
        update(tempStats);
        router.push(`/builder?${makeBuildString(null, entries)}`, `/builder/${makeBuildString(null, entries)}`, { shallow: true });
    }

    if(updateLink){
        // awkward signal thing to update the link from the builderheader to get the name properly fixed up
        // don't need to worry about updating the build string since it auto updates on dropdown change now
        router.push(`/builder?${makeBuildString()}`, `/builder/${makeBuildString()}`, { shallow: true });
        setUpdateLink(false);
    }

    return (
        <form ref={formRef} onSubmit={sendUpdate} onReset={resetForm} id="buildForm">
            <div className="row justify-content-center mb-3">
                <div className="col-12 col-md-5 col-lg-2 text-center">
                    <TranslatableText identifier="items.type.mainhand"></TranslatableText>
                    <SelectInput reference={itemRefs.mainhand} name="mainhand" default={getEquipName("mainhand")} noneOption={true} sortableStats={getRelevantItems(["mainhand", "mainhand sword", "mainhand shield", "axe", "pickaxe", "wand", "scythe", "bow", "crossbow", "snowball", "trident"], itemData)} onChange={itemChanged}></SelectInput>
                </div>
                <div className="col-12 col-md-5 col-lg-2 text-center">
                    <TranslatableText identifier="items.type.offhand"></TranslatableText>
                    <SelectInput reference={itemRefs.offhand} name="offhand" default={getEquipName("offhand")} noneOption={true} sortableStats={getRelevantItems(["offhand", "offhand shield", "offhand sword"], itemData)} onChange={itemChanged}></SelectInput>
                </div>
            </div>
            <div className="row justify-content-center mb-2 pt-2">
                <div className="col-12 col-md-3 col-lg-2 text-center">
                    <TranslatableText identifier="items.type.helmet"></TranslatableText>
                    <SelectInput reference={itemRefs.helmet} noneOption={true} name="helmet" default={getEquipName("helmet")} sortableStats={getRelevantItems(["helmet"], itemData)} onChange={itemChanged}></SelectInput>
                </div>
                <div className="col-12 col-md-3 col-lg-2 text-center">
                    <TranslatableText identifier="items.type.chestplate"></TranslatableText>
                    <SelectInput reference={itemRefs.chestplate} noneOption={true} name="chestplate" default={getEquipName("chestplate")} sortableStats={getRelevantItems(["chestplate"], itemData)} onChange={itemChanged}></SelectInput>
                </div>
                <div className="col-12 col-md-3 col-lg-2 text-center">
                    <TranslatableText identifier="items.type.leggings"></TranslatableText>
                    <SelectInput reference={itemRefs.leggings} noneOption={true} name="leggings" default={getEquipName("leggings")} sortableStats={getRelevantItems(["leggings"], itemData)} onChange={itemChanged}></SelectInput>
                </div>
                <div className="col-12 col-md-3 col-lg-2 text-center">
                    <TranslatableText identifier="items.type.boots"></TranslatableText>
                    <SelectInput reference={itemRefs.boots} noneOption={true} name="boots" default={getEquipName("boots")} sortableStats={getRelevantItems(["boots"], itemData)} onChange={itemChanged}></SelectInput>
                </div>
            </div>
            <div className="row justify-content-center pt-2">
                <TranslatableText identifier="builder.misc.situationals" className="text-center mb-1"></TranslatableText>
                {generateSituationalCheckboxes(itemsToDisplay, checkboxChanged)}
            </div>
            {/* <div className="row justify-content-center pt-2">

                I partially implemented class ability buffs here, but I'm going to leave it unfinished and dummied-out for now
                pending some more visual changes that are really moving into scope creep territory.
                I just want to get something out already so charms can be fixed. The rest can come later.
                (Versatile ~~has also been moved back with situationals for the moment~~ this is now false, it is
                disabled for now because it was causing problems in the situationals section)
                -LC

                <TranslatableText identifier="builder.misc.classAbilityBuffs" className="text-center mb-1"></TranslatableText>
                <CheckboxWithLabel name="Versatile" checked={false} onChange={checkboxChanged} />
                <CheckboxWithLabel name="Weapon Mastery" checked={false} onChange={checkboxChanged} />
                {/* TODO: do i have to make a separate system for WM1 WM2 WM1u WM2u augh im just gonna make it assume WM2 * /}
                <CheckboxWithLabel name="Formidable" checked={false} onChange={checkboxChanged} />
                <CheckboxWithLabel name="Dethroner (elite)" checked={false} onChange={checkboxChanged} />
                <CheckboxWithLabel name="Dethroner (boss)" checked={false} onChange={checkboxChanged} />
                {/* TODO: implement dethroner as click-to-cycle normal/elite/boss * /}
                <CheckboxWithLabel name="Culling" checked={false} onChange={checkboxChanged} />
                <CheckboxWithLabel name="Totemic Empowerment" checked={false} onChange={checkboxChanged} />
            </div> */}
            <div className="row justify-content-center mb-2 pt-2">
                <div className="col-12 col-md-3 col-lg-2 text-center">
                    <p className="mb-1"><TranslatableText identifier="builder.misc.region"></TranslatableText></p>
                    {/*<input type="number" name="situationalCap" placeholder="Situational Cap" min="1" defaultValue="30" className=""></input>*/}
                    <Select 
                        instanceId="this-is-just-here-so-react-doesnt-yell-at-me"
                        id="region"
                        name="region"
                        options={regions} 
                        defaultValue={{ value: 3, label: "Ring" }}
                        theme={theme => ({
                            ...theme,
                            borderRadius: 0,
                            colors: {
                                ...theme.colors,
                                primary: "#bbbbbb",
                                primary25: "#2a2a2a",
                                neutral0: "black",
                                neutral80: "white"
                        },
                    })} />
                </div>
            </div>
            <div className="row justify-content-center my-2">
                <div className="col text-center">
                    <p className="mb-1"><TranslatableText identifier="builder.misc.maxHealthPercent"></TranslatableText></p>
                    <input type="number" name="health" min="1" defaultValue="100" className="" />
                </div>
                <div className="col text-center">
                    <p className="mb-1">Tenacity</p>
                    <input type="number" name="tenacity" min="0" max="30" defaultValue="0" className="" />
                </div>
                <div className="col text-center">
                    <p className="mb-1">Vitality</p>
                    <input type="number" name="vitality" min="0" max="30" defaultValue="0" className="" />
                </div>
                <div className="col text-center">
                    <p className="mb-1">Vigor</p>
                    <input type="number" name="vigor" min="0" max="30" defaultValue="0" className="" />
                </div>
                <div className="col text-center">
                    <p className="mb-1">Focus</p>
                    <input type="number" name="focus" min="0" max="30" defaultValue="0" className="" />
                </div>
                <div className="col text-center">
                    <p className="mb-1">Perspicacity</p>
                    <input type="number" name="perspicacity" min="0" max="30" defaultValue="0" className="" />
                </div>
            </div>
            <div className="row pt-2">
                <span className="text-center text-danger fs-2 fw-bold">{(stats.corruption > 1) ? <TranslatableText identifier="builder.errors.corruption"></TranslatableText> : ""}</span>
            </div>
            <div className="row py-2">
                <span className="text-center text-danger fs-2 fw-bold">{(stats.twoHanded && !stats.weightless && stats.itemNames.offhand != "None") ? <TranslatableText identifier="builder.errors.twoHanded"></TranslatableText> : ""}</span>
            </div>
            <div className="row mb-2 justify-content-center">
                <div className="col-12 col-md-6 col-lg-2">
                    <ListSelector update={damageMultipliersChanged} translatableName="builder.multipliers.damage"></ListSelector>
                </div>
                <div className="col-12 col-md-6 col-lg-2">
                    <ListSelector update={resistanceMultipliersChanged} translatableName="builder.multipliers.resistance"></ListSelector>
                </div>
                <div className="col-12 col-md-6 col-lg-2">
                    <ListSelector update={healthMultipliersChanged} translatableName="builder.multipliers.health"></ListSelector>
                </div>
                <div className="col-12 col-md-6 col-lg-2">
                    <ListSelector update={speedMultipliersChanged} translatableName="builder.multipliers.speed"></ListSelector>
                </div>
                <div className="col-12 col-md-6 col-lg-2">
                    <ListSelector update={attackSpeedMultipliersChanged} translatableName="builder.multipliers.attackSpeed"></ListSelector>
                </div>
            </div>
            <div className="row my-3">
                <div className="col-12">
                    <CharmSelector update={updateCharms} translatableName={"builder.charms.select"} urlCharms={urlCharms} updateLoaded={updateLoaded} itemData={itemData}></CharmSelector>
                </div>
            </div>
            <div className="row justify-content-center">
                <div className="col-4 col-md-3 col-lg-2 text-center">
                    <button type="submit" className={styles.recalcButton} value="Recalculate">
                        <TranslatableText identifier="builder.buttons.recalculate"></TranslatableText>
                    </button>
                </div>
                <div className="col-4 col-md-3 col-lg-2 text-center">
                    <button type="button" className={styles.shareButton} id="share" onClick={copyBuild}>
                        <TranslatableText identifier="builder.buttons.share"></TranslatableText>
                    </button>
                </div>
                <div className="col-4 col-md-3 col-lg-2 text-center">
                    <input type="reset" className={styles.resetButton} />
                </div>
            </div>
            <div className="row justify-content-center mb-2">
                {
                    itemTypes.map(type =>
                        (checkExists(type, stats, itemData)) ?
                            (stats.fullItemData[type].masterwork != undefined) ?
                                <MasterworkableItemTile update={receiveMasterworkUpdate} key={stats.itemNames[type]} name={removeMasterworkFromName(stats.itemNames[type])} item={createMasterworkData(removeMasterworkFromName(stats.itemNames[type]), itemData)} default={Number(stats.itemNames[type].split("-").at(-1))}></MasterworkableItemTile> :
                                <ItemTile key={type} name={stats.itemNames[type]} item={stats.fullItemData[type]}></ItemTile> : ""
                    )
                }
            </div>
        </form>
    )
}
