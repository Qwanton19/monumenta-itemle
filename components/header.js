import HomeButton from './homeButton'
import LanguageSelector from './languageSelector'
import TranslatableText from './translatableText'
import styles from '../styles/Header.module.css';

export default function Header() {
    // info differs between local copy, beta branch, and main
    // beta site tells people to ping me if there's an issue
    let span;
    let site = typeof window === "undefined" ? "" : window.location.origin;
    if(site.match("odetomisery-lucy")) {
        span = <span className="py-1"><b>[TESTING BUILD]</b> If you notice a bug, ping @lucychroma on Discord.</span>
    } else if (site.match("localhost:3000")) {
        span = <span className="py-1"><b>[DEVELOPMENT BUILD]</b> Locally hosted development version</span>
    } else {
        span = <span className="py-1"><b>Want to help translate?</b> Visit the <u><a className={styles.link} rel="noopener noreferrer" href="https://crowdin.com/project/ohthemisery" target="_blank">Crowdin Project</a></u>!</span>;
    }
    return (
        <header className="py-2 border-bottom border-light mb-2">
            <div className="row mx-0">
                <div className="col-2 col-md-1 col-lg-1">
                    <HomeButton />
                </div>
                <div className="col-8 col-md-4 col-lg-4 d-inline-flex align-items-center">
                    <TranslatableText identifier="header.selector.language" className="me-3"></TranslatableText>
                    <LanguageSelector />
                </div>
                <div className="col d-inline-flex justify-content-end align-items-center" suppressHydrationWarning={true}>
                    {/* "suppressHydrationWarning" needed because otherwise react throws a fit
                        since "window" doesn't exist on the server but it does on the client,
                        causing rendering mismatch */}
                    {span}
                </div>
            </div>
        </header>
    )
}