import Image from 'next/image'
import styles from '../styles/Home.module.css'
import GitHubIcon from '@mui/icons-material/GitHub';


export default function Footer() {
    return (
        <footer className={styles.footer}>
            <div>
                Developed by <b>Albin#3246</b> and <b>FlamingoBike#6228</b>, forked and maintained by <b>Alecaboo</b>
            </div>
            <a
                href="https://github.com/Alecaboo/ohthemisery"
                target="_blank"
                rel="noopener noreferrer"
            >
                <GitHubIcon />
            </a>
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
        </footer>
    )
}
