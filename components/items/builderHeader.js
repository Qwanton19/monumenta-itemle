import styles from '../../styles/BuilderHeader.module.css';
import EditIcon from '@mui/icons-material/Edit';

export default function BuilderHeader (data) {
    return (
        <div className="row mb-5">
            <div className="col-12 text-center">
                <span className={styles.builderHeader}>
                    <h1 className={styles.builderHeaderText}>Monumenta Builder</h1>
                    <span className={styles.spacer}></span>
                    <EditIcon className={styles.builderHeaderEditIcon} fontSize="large"/>
                </span>
            </div>
        </div>
    )
}