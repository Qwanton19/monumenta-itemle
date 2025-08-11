import styles from '../../styles/Items.module.css'
import StatFormatter from '../../utils/items/statFormatter'

export default function Enchants(data) {
    const allStats = { ...data.item.stats, ...data.item.attributes };

    const { topEnchants, bottomEnchants, attributes } = StatFormatter.formatStats(allStats, data.comparisonResultEnchants, data.styles);

    const hasBottomSection = attributes.length > 0 || bottomEnchants.length > 0;

    return (
        <div className={styles.enchants}>
            {topEnchants}
            {data.interstitialElement}
            {hasBottomSection && (
                <>
                    <div key="main-separator" style={{ height: '0.75em' }}></div>
                    {attributes}
                    {bottomEnchants}
                </>
            )}
        </div>
    )
}