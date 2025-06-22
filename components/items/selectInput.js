import Select from 'react-select';
import React from 'react';
import { useLanguageContext } from '../../pages/_app';
import SupportedLanguages from '../../utils/translation/languages';

function convertItemNameForTranslationString(item) {
    if (!item) return "";
    return item.replaceAll('\'', '').replace(/(?:^\w|[A-Z]|\b\w)/g, function (word, index) {
        return index == 0  ? word.toLowerCase() : word.toUpperCase();
    }).replace(/\s+/g, '');
}

const SelectInput = (data) => {
    const { lang } = useLanguageContext();
    const options = data.sortableStats.map(
        item => {
            if (typeof item == "object") {
                return item;
            }

            if (!data.baseTranslationString) {
                return { "value": item, "label": item };
            }

            let translationString = `${data.baseTranslationString}.${convertItemNameForTranslationString(item)}`;
            return {
                "value": item,
                "label": SupportedLanguages[lang][translationString] ? SupportedLanguages[lang][translationString] : item
            };
        }
    );
    
    if (data.noneOption) {
        options.unshift({ "value": "None", "label": "None" });
    }

    return (
        <div>
            <Select
                ref={data.reference}
                instanceId={data.name}
                name={data.name}
                options={options}
                defaultValue={data.default ? data.default : options[0]}
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
                })}
                onChange={data.onChange}
            />
        </div>
    )
}

export default SelectInput;