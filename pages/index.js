import Head from 'next/head'
import Footer from '../components/footer'
import styles from '../styles/Home.module.css'
import Link from 'next/link'
import TranslatableText from '../components/translatableText'


export default function Home() {
  return (
    <div className={styles.container}>
      <Head>
        <title>Ode to Misery</title>
        <meta property="og:image" content="/favicon.ico" />
        <meta name="description" content="Ode to OhtheMisery" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className={styles.main}>
        <h1 className={styles.title}>
          Ode to Misery
        </h1>
        <div className={styles.grid}>
          <Link href="/items" className={styles.card}>
            <h2><TranslatableText identifier="index.pages.items.title"></TranslatableText></h2>
            <p><TranslatableText identifier="index.pages.items.description"></TranslatableText></p>
          </Link>
        </div>

        <div className={styles.grid}>
          <Link href="/builder" className={styles.card}>
            <h2><TranslatableText identifier="index.pages.builder.title"></TranslatableText></h2>
            <p><TranslatableText identifier="index.pages.builder.description"></TranslatableText></p>
          </Link>
        </div>
      </main>
    </div>
  )
}
