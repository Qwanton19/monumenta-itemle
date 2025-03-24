import React from 'react';
import { useLanguageContext } from "../pages/_app";
import SupportedLanguages from '../utils/translation/languages';

function formatTitle(str) {
    if (!str) return "";
    if (str.toLowerCase().includes("infinity")) return "infinity";
    return str.replaceAll("jungle_s", "jungles").replaceAll("_", " ").replace(/(?:^\w|[A-Z]|\b\w)/g, (word, index) => {
        return index == 0 ? word.toLowerCase() : word.toUpperCase();
    }).replace(/[\s+ ]/g, '');
}

export default function TranslatableEnchant({title, className, children}) {
    const { lang } = useLanguageContext();
    return (
        <span className={className} title={SupportedLanguages[lang][(`items.enchant.${formatTitle(title)}`)]} key={`${lang}-${formatTitle(title)}`}>{children}</span>
    )
}
