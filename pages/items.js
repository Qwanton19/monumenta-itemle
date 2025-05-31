import Head from 'next/head';
import styles from '../styles/Items.module.css';
import ItemTile from '../components/items/itemTile';
import MasterworkableItemTile from '../components/items/masterworkableItemTile';
import CharmTile from '../components/items/charmTile';
import ConsumableTile from '../components/items/consumableTile';
import SearchForm from '../components/items/searchForm';
import React from 'react';
import InfiniteScroll from "react-infinite-scroll-component";
import TranslatableText from '../components/translatableText';
import Axios from 'axios';
import AuthProvider from '../utils/authProvider';
import Fs from 'fs/promises';
import extras from '../public/items/extras.json';

function extractFilterValues(data, baseKey) {
    return Object.keys(data).filter(key => key.includes(baseKey)).map(key => data[key]);
}

function getRelevantItems(data, itemData, exaltedNameList) {
    let items = Object.keys(itemData);

    console.log("Data", data);

    if (data.searchName) {
        // Check if the user inputted any "|" to search for multiple item names at once.
        let names = data.searchName.split("|").map(name => name.toLowerCase().trim());
        items = items.filter(name => {
            let result = false;
            names.forEach(term => {
                if (name.toLowerCase().includes(term)) {
                    result = true;
                    return;
                }
            })
            return result;
        });
    }
    items = items.filter(name => itemData[name].base_item != 'Written Book');
    if (data.searchLore) {
        items = items.filter(name => itemData[name].lore?.toLowerCase().includes(data.searchLore.toLowerCase()))
    }

    let wantedItemTypes = extractFilterValues(data, "itemTypeSelect");
    if (wantedItemTypes.length > 0) {
        items = items.filter(name => wantedItemTypes.includes(itemData[name].type));
    }

    let wantedRegions = extractFilterValues(data, "regionSelect");
    if (wantedRegions.length > 0) {
        items = items.filter(name => wantedRegions.includes(itemData[name].region));
    }
    let wantedEffects = extractFilterValues(data, "effectSelect");

    function toCamelCase(str) {
      return str
        .toLowerCase()
        .split(" ")
        .map((word, i) =>
          i === 0
            ? word
            : word.charAt(0).toUpperCase() + word.slice(1)
        )
        .join("");
    }

    if (wantedEffects.length > 0) {
      const wantedEffectKeys = wantedEffects.map(toCamelCase);

      items = items.filter(name =>
        itemData[name].effects &&
        wantedEffectKeys.some(wantedKey =>
          itemData[name].effects.some(effectObj =>
            // Normalize to lowercase to avoid case mismatch
            effectObj.EffectType.toLowerCase() === wantedKey.toLowerCase()
          )
        )
      );
    }


    let wantedTiers = extractFilterValues(data, "tierSelect");
    if (wantedTiers.length > 0) {
        items = items.filter(name => wantedTiers.includes(itemData[name].tier));
    }

    let wantedLocations = extractFilterValues(data, "locationSelect");
    if (wantedLocations.length > 0) {
        items = items.filter(name => wantedLocations.includes(itemData[name].location));
    }

    let wantedPois = extractFilterValues(data, "poiSelect");
    if (wantedPois.length > 0) {
        items = items.filter(name => itemData[name].extras?.poi && wantedPois.includes(itemData[name].extras.poi));
    }

    let wantedClasses = extractFilterValues(data, "classSelect");
    if (wantedClasses.length > 0) {
        items = items.filter(name => wantedClasses.includes(itemData[name].class_name));
    }

    let wantedBaseItems = extractFilterValues(data, "baseItemSelect");
    if (wantedBaseItems.length > 0) {
        items = items.filter(name => wantedBaseItems.includes(itemData[name].base_item));
    }

    // Reverse to give higher sorting priority to the earliest filters
    let wantedCharmStats = extractFilterValues(data, "charmStatSelect").reverse();
    if (wantedCharmStats.length > 0) {
        wantedCharmStats.forEach(stat => {
            let attributeName = stat.split(" ").map(part => part.toLowerCase()).join("_");
            attributeName = (attributeName.includes("_%")) ? attributeName.replace("_%", "_percent") : attributeName += "_flat";
            items = items.filter(name => itemData[name].type == "Charm" && itemData[name].stats[attributeName] != undefined);
            items = items.sort((item1, item2) => ((itemData[item2].stats[attributeName] || 0)  - (itemData[item1].stats[attributeName] || 0)));
        });
    }

    // Reverse to give higher sorting priority to the earliest filters
    let wantedItemStats = extractFilterValues(data, "itemStatSelect").reverse();
    if (wantedItemStats.length > 0) {
        wantedItemStats.forEach(stat => {
            let attributeName = stat.toLowerCase().replaceAll(" ", "_");
            items = items.filter(name => (itemData[name].stats != undefined && typeof (itemData[name].stats[attributeName]) != "undefined"))
            items = items.sort((item1, item2) => (itemData[item2].stats[attributeName]) - (itemData[item1].stats[attributeName]))
        });
    }

    // Group up masterwork tiers by their name using an object, removing them from items.
    let masterworkItems = {};
    let otherPositionsToRemove = [];
    // Go through the array in reverse order to have the splice work properly
    // (items will go down in position if not removed from the end)
    for (let i = items.length - 1; i >= 0; i--) {
        let name = items[i];
        if (itemData[name].masterwork != undefined) {
            let itemName = itemData[name].name;
            if (!masterworkItems[itemName]) {
                masterworkItems[itemName] = {items:[],lowestPosition:9999999,lowestPositionName:null};
            }
            masterworkItems[itemName].items.push(itemData[name]);
            if (i < masterworkItems[itemName].lowestPosition) {
                // Remove the old lowest position item
                if (masterworkItems[itemName].lowestPosition < 9999999) {
                    otherPositionsToRemove.push(masterworkItems[itemName].lowestPosition);
                }
                // Set the new lowest position
                masterworkItems[itemName].lowestPosition = i;
                masterworkItems[itemName].lowestPositionName = name;
            } else {
                otherPositionsToRemove.push(i);
            }
        }
    }

    // Remove all the excess items that need to be grouped up
    otherPositionsToRemove = otherPositionsToRemove.sort((pos1, pos2) => pos2 - pos1);
    for (const pos of otherPositionsToRemove) {
        items.splice(pos, 1);
    }

    // Re-insert the groups as arrays into the items array, IN THE CORRECT POSITION.
    let masterworkGroups = Object.keys(masterworkItems).sort((item1, item2) => masterworkItems[item2].lowestPosition - masterworkItems[item1].lowestPosition);
    for (const masterworkGroup of masterworkGroups) {
        items.splice(items.indexOf(masterworkItems[masterworkGroup].lowestPositionName), 1, masterworkItems[masterworkGroup].items);
    }

    return items;
}

export default function Items({ itemData }) {
    const [relevantItems, setRelevantItems] = React.useState(Object.keys(itemData));
    const [itemsToShow, setItemsToShow] = React.useState(20)
    const itemsToLoad = 20;

    function handleChange(data) {
        setRelevantItems(getRelevantItems(data, itemData))
        setItemsToShow(itemsToLoad)
    }

    function showMoreItems() {
        setItemsToShow(itemsToShow + itemsToLoad)
    };

    return (
        <div className={styles.container}>
            <Head>
                <title>Monumenta Items</title>
                <meta property="og:image" content="/favicon.ico" />
                <meta name="description" content="Monumenta item guide to make it easier to find items." />
                <meta name="keywords" content="Monumenta, Minecraft, MMORPG, Items, Item Guide" />
            </Head>
            <main className={styles.main}>
                <h1>Monumenta Items</h1>
                {/*<LegacySearchForm update={handleChange} itemData={itemData} />*/}
                <SearchForm update={handleChange} itemData={itemData}></SearchForm>
                {
                    (relevantItems.length > 0) ?
                    <h4 className="mt-1">
                        <TranslatableText identifier="items.searchForm.itemsFound"></TranslatableText> {relevantItems.length}
                    </h4> : ""
                }

                <InfiniteScroll
                    className={styles.itemsContainer}
                    dataLength={itemsToShow}
                    next={showMoreItems}
                    hasMore={true}
                    loader={<h4>No items found</h4>}
                >
                    {relevantItems.slice(0, itemsToShow).map(name => {
                        if (typeof name == "object") {
                            return (
                                <MasterworkableItemTile key={`${name[0].name}-${name[0].masterwork}`} name={name[0].name} item={name}></MasterworkableItemTile>
                            )
                        }
                        if (itemData[name].type == "Charm") {
                            return (
                                <CharmTile key={name} name={itemData[name].name} item={itemData[name]}></CharmTile>
                            )
                        }
                        if (itemData[name].type == "Consumable" && itemData[name].effects != undefined) {
                            return (
                                <ConsumableTile key={name} name={name} item={itemData[name]}></ConsumableTile>
                            )
                        }
                        return (
                            <ItemTile key={name} name={name} item={itemData[name]}></ItemTile>
                        )
                    })}
                </InfiniteScroll>
            </main>
        </div>
    )
}

export async function getServerSideProps(context) {
    let itemData = null;
    if (AuthProvider.isUsingApi()) {
        await Axios.get(AuthProvider.getApiPath(), {headers: {'Authorization': AuthProvider.getAuthorizationData()}})
            .then(response => {
                itemData = response.data;
            })
            .catch(async (error) => {
                console.error("Fetch from Monumenta API failed. Attemtping to fetch from U5B's Github.");
                await Axios.get("https://raw.githubusercontent.com/U5B/Monumenta/main/out/item.json")
                    .then(response => {
                        itemData = response.data;
                    })
                    .catch(async (error) => {
                        console.error("Fetch from U5B's Github failed. Falling back to stored items json.");
                        itemData = JSON.parse(await Fs.readFile('public/items/itemData.json'));
                    })
            })
    } else {
        itemData = JSON.parse(await Fs.readFile('public/items/itemData.json'));
    }

    let exaltedNameList = [];

    // Add OTM extra info based on item's name
    // (so that it gets copied the same to each masterwork level)
    for (const item in itemData) {
        let itemStats = itemData[item];
        // Extras
        if (extras[itemStats.name]) {
            itemData[item].extras = extras[itemStats.name];
        }
        // Exalted
        if (itemStats.masterwork) {
            // If an item with the base, non-masterwork name exists, as a key
            if (itemData[itemStats.name]) {
                // Modify its name to have an "EX" at the start
                let exName = `EX ${itemStats.name}`;
                let mwExName = `${exName}-${itemData[item].masterwork}`;
                itemData[mwExName] = itemData[item];
                itemData[mwExName].name = exName;
                delete itemData[item];
            }
        }
        if (!itemData[item]) itemData[item] = {};  // sanity check because this KEPT BREAKING

        switch (itemStats.location){
          case "April's Fools":
              itemData[item].location = "April Fools Event";
              break;
          case "Arena of Terth":
              itemData[item].location = "Arena of Terth";
              break;
          case "Azacor":
              itemData[item].location = "Azacor's Malice";
              break;
          case "Blitz":
              itemData[item].location = "Plunderer's Blitz";
              break;
          case "Blue":
              itemData[item].location = "Coven's Gambit";
              break;
          case "Brown":
              itemData[item].location = "Cradle of the Broken God";
              break;
          case "Carnival":
              itemData[item].location = "Floating Carnival";
              break;
          case "Challenger":
              itemData[item].location = "Challenger Skin";
              break;
          case "Corridors":
              itemData[item].location = "Ephemeral Corridors";
              break;
          case "Cyan":
              itemData[item].location = "The Scourge of Lunacy";
              break;
          case "Delves":
              itemData[item].location = "Dungeon Delves";
              break;
          case "Depths":
              itemData[item].location = "Darkest Depths";
              break;
          case "Divine Skin":
              itemData[item].location = "Divine Skin";
              break;
          case "Docks":
              itemData[item].location = "Expedition Docks";
              break;
          case "Easter":
              itemData[item].location = "Easter Event";
              break;
          case "Eldrask":
              itemData[item].location = "The Waking Giant";
              break;
          case "Ephemeral Enhancements":
              itemData[item].location = "Ephemeral Enhancements";
              break;
          case "Eternity Skin":
              itemData[item].location = "Eternity Skin";
              break;
          case "Fishing":
              itemData[item].location = "Architect's Ring Fishing";
              break;
          case "Forum":
              itemData[item].location = "The Fallen Forum";
              break;
          case "Gallery of Fear":
              itemData[item].location = "Gallery of Fear";
              break;
          case "Godspore":
              itemData[item].location = "The Godspore's Domain";
              break;
          case "Gray":
              itemData[item].location = "Valley of Forgotten Pharaohs";
              break;
          case "Greed Skin":
              itemData[item].location = "Greed Skin";
              break;
          case "Halloween Event":
              itemData[item].location = "Halloween Event";
              break;
          case "Halloween Skin":
              itemData[item].location = "Halloween Skin";
              break;
          case "Hekawt":
              itemData[item].location = "Hekawt's Fury";
              break;
          case "Hexfall":
              itemData[item].location = "Hexfall";
              break;
          case "Holiday Skin":
              itemData[item].location = "Holiday Skin";
              break;
          case "Horseman":
              itemData[item].location = "The Headless Horseman";
              break;
          case "Intellect Crystallizer":
              itemData[item].location = "Intellect Crystallizer";
              break;
          case "Isles Casino":
              itemData[item].location = "Monarch's Cozy Casino";
              break;
          case "Isles Overworld":
              itemData[item].location = "Celsian Isles Overworld";
              break;
          case "Kaul":
              itemData[item].location = "Kaul's Judgment";
              break;
          case "Labs":
              itemData[item].location = "Alchemy Labs";
              break;
          case "Light Blue":
              itemData[item].location = "Arcane Rivalry";
              break;
          case "Light Gray":
              itemData[item].location = "Palace of Mirrors";
              break;
          case "Lime":
              itemData[item].location = "Salazar's Folly";
              break;
          case "Lowtide Smuggler":
              itemData[item].location = "Lowtide Smuggler";
              break;
          case "Magenta":
              itemData[item].location = "Plagueroot Temple";
              break;
          case "Marina Noir":
              itemData[item].location = "Marina Noir";
              break;
          case "Mist":
              itemData[item].location = "The Black Mist";
              break;
          case "Mythic Reliquary":
              itemData[item].location = "Mythic Reliquary";
              break;
          case "Orange":
              itemData[item].location = "Fallen Menagerie";
              break;
          case "Overworld3":
              itemData[item].location = "Architect's Ring Overworld";
              break;
          case "Pelias' Keep":
              itemData[item].location = "Pelias' Keep";
              break;
          case "Pink":
              itemData[item].location = "Harmonic Arboretum";
              break;
          case "Portal":
              itemData[item].location = "P.O.R.T.A.L.";
              break;
          case "Purple":
              itemData[item].location = "The Grasp of Avarice";
              break;
          case "Quest Reward":
              itemData[item].location = "Quest Reward";
              break;
          case "Remorse":
              itemData[item].location = "Sealed Remorse";
              break;
          case "Remorseful Skin":
              itemData[item].location = "Remorseful Skin";
              break;
          case "Reverie":
              itemData[item].location = "Malevolent Reverie";
              break;
          case "Ring Casino":
              itemData[item].location = "Sticks and Stones Tavern";
              break;
          case "Royal Armory":
              itemData[item].location = "Royal Armory";
              break;
          case "Ruin":
              itemData[item].location = "Masquerader's Ruin";
              break;
          case "Rush":
              itemData[item].location = "Rush of Dissonance";
              break;
          case "Sanctum":
              itemData[item].location = "Forsworn Sanctum";
              break;
          case "Sanguine Halls":
              itemData[item].location = "Sanguine Halls";
              break;
          case "Seasonal Pass":
              itemData[item].location = "Seasonal Pass";
              break;
          case "Shifting":
              itemData[item].location = "City of Shifting Waters";
              break;
          case "Sirius":
              itemData[item].location = "The Final Blight";
              break;
          case "Sketched":
              itemData[item].location = "Sketched Skin";
              break;
          case "Skr":
              itemData[item].location = "Silver Knight's Remnants";
              break;
          case "SKT":
              itemData[item].location = "Silver Knight's Tomb";
              break;
          case "Soulwoven":
              itemData[item].location = "Soulwoven";
              break;
          case "Starpoint":
              itemData[item].location = "Star Point";
              break;
          case "Storied Skin":
              itemData[item].location = "Storied Skin";
              break;
          case "Teal":
              itemData[item].location = "Echoes of Oblivion";
              break;
          case "The Eternal Vigil":
              itemData[item].location = "The Eternal Vigil";
              break;
          case "The Hoard":
              itemData[item].location = "The Hoard";
              break;
          case "The Wolfswood":
              itemData[item].location = "The Wolfswood";
              break;
          case "Threadwarped Skin":
              itemData[item].location = "Threadwarped Skin";
              break;
          case "Titanic Skin":
              itemData[item].location = "Titanic Skin";
              break;
          case "Tov":
              itemData[item].location = "Treasures of Viridia";
              break;
          case "Transmogrifier":
              itemData[item].location = "Transmogrifier";
              break;
          case "Trickster":
              itemData[item].location = "Trickster Challenge";
              break;
          case "True North":
              itemData[item].location = "True North";
              break;
          case "Uganda":
              itemData[item].location = "Uganda 2018";
              break;
          case "Valentine's Day":
              itemData[item].location = "Valentine Event";
              break;
          case "Valley Casino":
              itemData[item].location = "Rock's Little Casino";
              break;
          case "Valley Overworld":
              itemData[item].location = "King's Valley Overworld";
              break;
          case "Verdant":
              itemData[item].location = "Verdant Remnants";
              break;
          case "White":
              itemData[item].location = "Halls of Wind and Blood";
              break;
          case "Willows":
              itemData[item].location = "The Black Willows";
              break;
          case "Winter Event":
              itemData[item].location = "Winter Event";
              break;
          case "Yellow":
              itemData[item].location = "Vernal Nightmare";
              break;
          case "Zenith":
              itemData[item].location = "The Celestial Zenith";
              break;
        }


    }

    return {
        props: {
            itemData,
            exaltedNameList
        }
    };
}
