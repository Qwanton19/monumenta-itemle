import Image from 'next/image'
import styles from '../styles/Home.module.css'
import GitHubIcon from '@mui/icons-material/GitHub';

export default function Footer() {
    return (
        <footer className={styles.footer}>
            <div className={styles['footer-line']}>
                Forked from{' '}
                <a
                    href="https://github.com/Alecaboo/ohthemisery"
                    target="_blank"
                    rel="noopener noreferrer"
                >
                    <u><b>Ode To Misery</b></u>
                </a>{' '}
                by &nbsp; <b>Albin#3246</b>, &nbsp; <b>FlamingoBike#6228</b>, and &nbsp; <b>Alecaboo</b>
            </div>
            <div className={styles['footer-line']}>
                Itemle Developed by &nbsp; <b>Qwanton</b>{' '}
                <a
                    href="https://github.com/Qwanton19/monumenta-itemle"
                    target="_blank"
                    rel="noopener noreferrer"
                >
                    <GitHubIcon style={{ fontSize: '1.2em', verticalAlign: 'middle' }} />
                </a>
            </div>
            <div className={styles['footer-line']}>
                <a
                    href="https://vercel.com?utm_source=create-next-app&utm_medium=default-template&utm_campaign=create-next-app"
                    target="_blank"
                    rel="noopener noreferrer"
                >
                    Powered by{' '}
                    <span className={styles.logo}>
                        <Image src="/vercel.svg" alt="Vercel Logo" width={72} height={16} />
                    </span>
                </a>
            </div>
        </footer>
    )
}
