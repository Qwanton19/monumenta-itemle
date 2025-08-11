import Head from 'next/head';
import React from 'react';
import Axios from 'axios';
import Fs from 'fs/promises';
import Select from 'react-select';
import seedrandom from 'seedrandom';

import ItemTile from '../components/items/itemTile';
import CharmTile from '../components/items/charmTile';
import ConsumableTile from '../components/items/consumableTile';
import MasterworkableItemTile from '../components/items/masterworkableItemTile';

import AuthProvider from '../utils/authProvider';
import extras from '../public/items/extras.json';
import { categories, Formats } from '../utils/items/statFormatter';


function groupMasterwork(items, itemData) {
    let masterworkItems = {};
    for (let i = items.length - 1; i >= 0; i--) {
        let name = items[i];
        if (itemData[name] && itemData[name].masterwork !== undefined) {
            let itemName = itemData[name].name;
            if (!masterworkItems[itemName]) masterworkItems[itemName] = [];
            masterworkItems[itemName].push(itemData[name]);
            items.splice(i, 1);
        }
    }
    Object.keys(masterworkItems).forEach(item => {
        masterworkItems[item].sort((a, b) => a.masterwork - b.masterwork);
        items.push({ value: `${item}-${masterworkItems[item][0].masterwork}`, label: item });
    });
    return items;
}

function compareItems(guessedItem, secretItem) {
    const result = {
        baseItem: 'red', type: 'red', location: 'red',
        region: 'red', tier: 'red', enchants: {},
    };
    if (!guessedItem || !secretItem) return result;

    const guessedMaterial = (guessedItem.base_item || '').split(' ')[0];
    const secretMaterial = (secretItem.base_item || '').split(' ')[0];
    if (guessedMaterial === secretMaterial) result.baseItem = 'green';

    if (guessedItem.type === secretItem.type) result.type = 'green';
    if (guessedItem.location === secretItem.location) result.location = 'green';
    if (guessedItem.region === secretItem.region) result.region = 'green';

    const guessedTier = guessedItem.tier || "";
    const secretTier = secretItem.tier || "";
    if (guessedTier === secretTier) {
        result.tier = 'green';
    } else if (guessedTier.includes("Tier") && secretTier.includes("Tier")) {
        result.tier = 'yellow';
    } else {
        result.tier = 'red';
    }

    const getOrderedPrimaryEnchants = (item) => {
        const enchants = [];
        const allItemStats = { ...(item.stats || {}), ...(item.attributes || {}) };
        if (!allItemStats) return [];
        for (const categoryName in categories) {
            for (const statDef of categories[categoryName]) {
                if (allItemStats[statDef.name] && statDef.format !== Formats.ATTRIBUTE && statDef.format !== Formats.BASE_STAT) {
                    enchants.push(statDef.name);
                }
            }
        }
        return enchants;
    };

    const guessedPrimaryEnchantNames = getOrderedPrimaryEnchants(guessedItem).slice(0, 2);
    const secretAllEnchants = { ...(secretItem.stats || {}), ...(secretItem.attributes || {}) };
    const guessedAllEnchants = { ...(guessedItem.stats || {}), ...(guessedItem.attributes || {}) };

    for (const enchantName of guessedPrimaryEnchantNames) {
        if (secretAllEnchants.hasOwnProperty(enchantName)) {
            result.enchants[enchantName] = secretAllEnchants[enchantName] === guessedAllEnchants[enchantName] ? 'green' : 'yellow';
        } else {
            result.enchants[enchantName] = 'red';
        }
    }
    return result;
}


function RenderItemTile({ itemKey, itemData, colorClasses = null }) {
    if (!itemKey || !itemData[itemKey]) return null;
    const item = itemData[itemKey];
    if (Array.isArray(item)) return <MasterworkableItemTile name={item[0].name} item={item} colorClasses={colorClasses} />;
    if (item.type === "Charm") return <CharmTile name={item.name} item={item} />;
    if (item.type === "Consumable" && item.effects) return <ConsumableTile name={itemKey} item={item} />;
    return <ItemTile name={itemKey} item={item} colorClasses={colorClasses} />;
}

const equipmentCategories = [
    { value: 'mainhand', label: 'Mainhand' }, { value: 'offhand', label: 'Offhand' },
    { value: 'helmet', label: 'Helmet' }, { value: 'chestplate', label: 'Chestplate' },
    { value: 'leggings', 'label': 'Leggings' }, { value: 'boots', label: 'Boots' },
];
const categoryTypeMap = {
    mainhand: ["mainhand", "mainhand sword", "mainhand shield", "axe", "pickaxe", "wand", "scythe", "bow", "crossbow", "snowball", "trident"],
    offhand: ["offhand", "offhand shield", "offhand sword"], helmet: ["helmet"], chestplate: ["chestplate"],
    leggings: ["leggings"], boots: ["boots"],
};


export default function Itemle({ itemData, dailyItemKey, itemleDayNumber }) {
    const [isLoading, setIsLoading] = React.useState(true);
    const [selectedCategory, setSelectedCategory] = React.useState(null);
    const [selectedItemKey, setSelectedItemKey] = React.useState(null);
    const [currentItemSelection, setCurrentItemSelection] = React.useState(null);
    const [guessedItems, setGuessedItems] = React.useState([]);
    const [isWin, setIsWin] = React.useState(false);
    const [shareText, setShareText] = React.useState("Share");

    React.useEffect(() => {
        if (typeof window !== 'undefined') {
            const savedStateJSON = localStorage.getItem('itemleGameState');
            if (savedStateJSON) {
                try {
                    const savedState = JSON.parse(savedStateJSON);
                    if (savedState.day === itemleDayNumber) {
                        setGuessedItems(savedState.guesses);
                        setIsWin(savedState.win);
                    } else {
                        localStorage.removeItem('itemleGameState');
                    }
                } catch (e) {
                    console.error("Failed to parse saved game state:", e);
                    localStorage.removeItem('itemleGameState');
                }
            }
        }
        setIsLoading(false);
    }, [itemleDayNumber]);

    React.useEffect(() => {
        if (!isLoading && typeof window !== 'undefined') {
            const gameState = {
                day: itemleDayNumber,
                guesses: guessedItems,
                win: isWin,
            };
            localStorage.setItem('itemleGameState', JSON.stringify(gameState));
        }
    }, [guessedItems, isWin, itemleDayNumber, isLoading]);

    const MAX_GUESSES = 6;
    const isGameFinished = isWin || guessedItems.length >= MAX_GUESSES;

    const itemOptions = React.useMemo(() => {
        if (!selectedCategory) return [];
        const validTypes = categoryTypeMap[selectedCategory.value];
        let filteredItems = Object.keys(itemData).filter(key => {
            const item = itemData[key];
            return item?.type && validTypes.includes(item.type.toLowerCase().replace(/<.*>/, "").trim());
        });
        let groupedItems = groupMasterwork(filteredItems, itemData);
        const options = groupedItems.map(item => (typeof item === 'string') ? { value: item, label: itemData[item].name } : item);
        return options.sort((a, b) => a.label.localeCompare(b.label));
    }, [selectedCategory, itemData]);

    const handleGuess = () => {
        if (!selectedItemKey || isGameFinished) return;
        if (selectedItemKey === dailyItemKey) setIsWin(true);
        setGuessedItems(prev => [...prev, selectedItemKey]);
        setSelectedItemKey(null);
        setCurrentItemSelection(null);
        setSelectedCategory(null);
    };

    const handleCategoryChange = (selectedOption) => {
        setSelectedCategory(selectedOption);
        setSelectedItemKey(null);
        setCurrentItemSelection(null);
    };

    const handleItemSelectChange = (selectedOption) => {
        setSelectedItemKey(selectedOption ? selectedOption.value : null);
        setCurrentItemSelection(selectedOption);
    };

    const generateShareText = () => {
        const score = isWin ? guessedItems.length : 'X';
        let text = `Monumenta Itemle ${itemleDayNumber} ${score}/6\n\n`;
        const emojiMap = { green: '🟩', yellow: '🟨', red: '🟥', gray: '⬜' };
        const emojiGrid = {
            baseItem: [], type: [], enchant1: [],
            enchant2: [], location: [], region: [], tier: []
        };
        const getOrderedPrimaryEnchants = (item) => {
            const enchants = [];
            const allItemStats = { ...(item.stats || {}), ...(item.attributes || {}) };
            if (!allItemStats) return [];
            for (const categoryName in categories) {
                for (const statDef of categories[categoryName]) {
                    if (allItemStats[statDef.name] && statDef.format !== Formats.ATTRIBUTE && statDef.format !== Formats.BASE_STAT) {
                        enchants.push(statDef.name);
                    }
                }
            }
            return enchants;
        };

        guessedItems.forEach(key => {
            const guessedItem = itemData[key];
            const secretItem = itemData[dailyItemKey];
            const result = compareItems(guessedItem, secretItem);
            emojiGrid.baseItem.push(emojiMap[result.baseItem]);
            emojiGrid.type.push(emojiMap[result.type]);
            emojiGrid.location.push(emojiMap[result.location]);
            emojiGrid.region.push(emojiMap[result.region]);
            emojiGrid.tier.push(emojiMap[result.tier]);
            const primaryEnchants = getOrderedPrimaryEnchants(guessedItem);
            const enchant1Name = primaryEnchants[0];
            const enchant2Name = primaryEnchants[1];
            emojiGrid.enchant1.push(enchant1Name ? emojiMap[result.enchants[enchant1Name] || 'red'] : emojiMap.gray);
            emojiGrid.enchant2.push(enchant2Name ? emojiMap[result.enchants[enchant2Name] || 'red'] : emojiMap.gray);
        });

        text += `Item Material: ${emojiGrid.baseItem.join('')}\n`;
        text += `Item Type:      ${emojiGrid.type.join('')}\n`;
        text += `Enchant 1:      ${emojiGrid.enchant1.join('')}\n`;
        text += `Enchant 2:     ${emojiGrid.enchant2.join('')}\n`;
        text += `Location:       ${emojiGrid.location.join('')}\n`;
        text += `Region:           ${emojiGrid.region.join('')}\n`;
        text += `Tier:                 ${emojiGrid.tier.join('')}\n`;

        return text;
    }

    const handleShareClick = () => {
        const shareString = generateShareText();
        navigator.clipboard.writeText(shareString).then(() => {
            setShareText("Copied!");
            setTimeout(() => setShareText("Share"), 2000);
        }).catch(err => {
            console.error("Failed to copy text: ", err);
        });
    };

    if (isLoading) {
        return null;
    }

    return (
        <div className="container-fluid px-4">
            <Head>
                <title>Monumenta Itemle</title>
                <meta property="og:image" content="/favicon.ico" />
                <meta name="description" content="A Wordle-like game for guessing Monumenta items." />
                <link rel="icon" href="/favicon.ico" />
            </Head>

            <main style={{ minHeight: '80vh', display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: '1rem' }}>
                <div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem', minHeight: '350px' }}>
                    {!isGameFinished ? (
                        <>
                            <h2 className="h4 text-center">Select an Item to Guess ({guessedItems.length} / {MAX_GUESSES})</h2>
                             <div className="d-flex flex-column" style={{ width: '100%', maxWidth: '600px', gap: '1rem' }}>
                                <Select
                                    instanceId="itemle-category-selector" options={equipmentCategories} onChange={handleCategoryChange} value={selectedCategory}
                                    placeholder="1. Select an equipment slot..." isDisabled={isGameFinished}
                                    theme={theme => ({ ...theme, borderRadius: 0, colors: { ...theme.colors, primary: "#bbbbbb", primary25: "#2a2a2a", neutral0: "black", neutral80: "white" }})} />
                                <Select
                                    key={selectedCategory ? selectedCategory.value : 'item-selector'}
                                    instanceId="itemle-item-selector" options={itemOptions} onChange={handleItemSelectChange}
                                    value={currentItemSelection} placeholder="2. Select an item..."
                                    isDisabled={!selectedCategory || isGameFinished} isOptionDisabled={(option) => guessedItems.includes(option.value)}
                                    theme={theme => ({ ...theme, borderRadius: 0, colors: { ...theme.colors, primary: "#bbbbbb", primary25: "#2a2a2a", neutral0: "black", neutral80: "white" }})} isClearable />
                            </div>
                             {selectedItemKey && (
                                <div className="text-center d-flex flex-column align-items-center" style={{ animation: 'fadeIn 0.5s' }}>
                                    <RenderItemTile itemKey={selectedItemKey} itemData={itemData} />
                                    <button onClick={handleGuess} className="btn btn-primary btn-lg mt-3">Guess Item</button>
                                </div>
                            )}
                        </>
                    ) : (
                        <div className="text-center d-flex flex-column align-items-center" style={{ animation: 'fadeIn 0.5s' }}>
                            {isWin ? <h2 className="h4 text-success fw-bold mt-4">You got it! This was the correct item!</h2>
                                 : <h2 className="h4 text-danger fw-bold mt-4">Game Over! This was the correct item!</h2>}

                             <button onClick={handleShareClick} className="btn btn-lg my-3 share-button">
                                {shareText}
                             </button>

                            <RenderItemTile itemKey={dailyItemKey} itemData={itemData} />
                        </div>
                    )}
                </div>

                {guessedItems.length > 0 && (
                     <div
                        className="guesses-container"
                        style={{ width: '100%', marginTop: '2rem', paddingTop: '2rem', borderTop: '1px solid #dee2e6' }}>
                        {guessedItems.map((key) => {
                            const result = compareItems(itemData[key], itemData[dailyItemKey]);
                            const capitalize = (s) => s && s.charAt(0).toUpperCase() + s.slice(1);
                            const colorClasses = {
                                baseItem: `text${capitalize(result.baseItem)}`,
                                type: `text${capitalize(result.type)}`,
                                location: `text${capitalize(result.location)}`,
                                region: `text${capitalize(result.region)}`,
                                tier: `text${capitalize(result.tier)}`,
                                enchants: result.enchants,
                            };
                            return (
                                <div key={key} className="guess-item-wrapper" style={{ animation: 'slideInUp 0.5s forwards' }}>
                                    <RenderItemTile itemKey={key} itemData={itemData} colorClasses={colorClasses} />
                                </div>
                            )
                        })}
                    </div>
                )}
            </main>
            <style jsx global>{`
                @keyframes fadeIn {
                    from { opacity: 0; transform: scale(0.95); }
                    to { opacity: 1; transform: scale(1); }
                }

                @keyframes slideInUp {
                    from {
                        opacity: 0;
                        transform: translateY(20px) scale(0.9);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0) scale(0.9);
                    }
                }

                .guesses-container {
                    display: flex;
                    flex-wrap: wrap;
                    justify-content: center;
                    gap: 1rem;
                }

                @media (min-width: 1600px) {
                    .guesses-container {
                        display: flex;
                        justify-content: center;
                        flex-wrap: nowrap;
                        gap: 0;
                    }
                    .guess-item-wrapper {
                        transform-origin: top center;
                        margin-right: -35px;
                    }
                }

                .share-button {
                    background-color: black;
                    color: white;
                    border: 2px solid white;
                    border-radius: 0;
                    padding: 0.5rem 1.5rem;
                }

                .share-button:hover {
                    background-color: #333;
                    color: white;
                    border-color: white;
                }
            `}</style>
        </div>
    )
}

export async function getServerSideProps(context) {
    context.res.setHeader('Cache-Control', 'private, no-cache, no-store, must-revalidate');
    context.res.setHeader('Pragma', 'no-cache');
    context.res.setHeader('Expires', '0');

    let itemData = null;
    if (AuthProvider.isUsingApi()) {
        await Axios.get(AuthProvider.getApiPath(), {headers: {'Authorization': AuthProvider.getAuthorizationData()}})
            .then(response => { itemData = response.data; })
            .catch(async () => {
                await Axios.get("https://raw.githubusercontent.com/U5B/Monumenta/main/out/item.json")
                    .then(response => { itemData = response.data; })
                    .catch(async () => { itemData = JSON.parse(await Fs.readFile('public/items/itemData.json')); })
            })
    } else {
        itemData = JSON.parse(await Fs.readFile('public/items/itemData.json'));
    }
    for(let i=1;i<=4;i++) {
        if(itemData["Truest North-"+i+" (compass)"]) {
          itemData["Truest North-"+i] = itemData["Truest North-"+i+" (compass)"];
          delete itemData["Truest North-"+i+" (compass)"]; delete itemData["Truest North-"+i+" (shears)"];
        }
    }
    if (itemData["Carcano 91/38"]) {
        itemData["Carcano 9138"] = itemData["Carcano 91/38"]; delete itemData["Carcano 91/38"];
    }
    for (const item in itemData) {
        let itemStats = itemData[item];
        if(!itemStats) continue;
        if (extras[itemStats.name]) itemData[item].extras = extras[itemStats.name];
        if (itemStats.masterwork && itemData[itemStats.name]) {
            let exName = `EX ${itemStats.name}`;
            let mwExName = `${exName}-${itemData[item].masterwork}`;
            itemData[mwExName] = itemData[item]; itemData[mwExName].name = exName; delete itemData[item];
        }
        switch (itemStats.location){
          case "Skr": itemData[item].location = "Silver Knight's Remnants"; break;
          case "SKT": itemData[item].location = "Silver Knight's Tomb"; break;
          case "Overworld3": itemData[item].location = "Architect's Ring Overworld"; break;
        }
    }

    const allWearableTypes = Object.values(categoryTypeMap).flat();
    let possibleItems = Object.keys(itemData).filter(key => {
        const item = itemData[key];
        return item?.type && allWearableTypes.includes(item.type.toLowerCase().replace(/<.*>/, "").trim());
    });

    const epochDate = new Date("2025-08-11T00:00:00.000-04:00");
    const estDate = new Date(new Date().toLocaleString("en-US", { timeZone: "America/New_York" }));
    const msSinceEpoch = estDate.getTime() - epochDate.getTime();
    const daysSinceEpoch = Math.floor(msSinceEpoch / (1000 * 60 * 60 * 24));
    const itemleDayNumber = daysSinceEpoch + 1;

    const dateSeed = estDate.toISOString().slice(0, 10);
    const rng = seedrandom(dateSeed);
    const randomIndex = Math.floor(rng() * possibleItems.length);
    const dailyItemKey = possibleItems[randomIndex];

    return { props: { itemData, dailyItemKey, itemleDayNumber } };
}