import Link from "@docusaurus/Link";
import useDocusaurusContext from "@docusaurus/useDocusaurusContext";
import Layout from "@theme/Layout";
import clsx from "clsx";
import styles from "./index.module.css";

const features = [
  {
    icon: "⚡",
    title: "Zero Config",
    description:
      "ev dev / ev build — no Webpack or Babel config needed. Convention over configuration.",
  },
  {
    icon: "🔒",
    title: "Type-Safe Routing",
    description:
      "Full end-to-end type safety from server to browser URL bar, powered by TanStack Router.",
  },
  {
    icon: "🚀",
    title: "Server Functions",
    description:
      '"use server" directive auto-transforms async functions into remote API calls at build time.',
  },
  {
    icon: "🌐",
    title: "Multi-Runtime",
    description:
      "Hono-based server runs on Node.js, Deno, Bun, and edge runtimes out of the box.",
  },
  {
    icon: "🔌",
    title: "Pluggable Transport",
    description:
      "HTTP, WebSocket, or custom protocols via the ServerTransport interface.",
  },
  {
    icon: "🧩",
    title: "Plugin System",
    description:
      "Extend builds with custom module rules — Tailwind, SVG, PostCSS, and more.",
  },
];

function HomepageHeader() {
  const { siteConfig } = useDocusaurusContext();
  return (
    <header className={clsx("hero hero--primary", styles.heroBanner)}>
      <div className="container">
        <h1 className="hero__title">{siteConfig.title}</h1>
        <p className="hero__subtitle">{siteConfig.tagline}</p>
        <div className={styles.buttons}>
          <Link
            className="button button--secondary button--lg"
            to="/docs/quick-start"
          >
            Get Started →
          </Link>
        </div>
      </div>
    </header>
  );
}

function Feature({
  icon,
  title,
  description,
}: {
  icon: string;
  title: string;
  description: string;
}) {
  return (
    <div className={clsx("col col--4")}>
      <div className="text--center" style={{ fontSize: "2.5rem" }}>
        {icon}
      </div>
      <div className="text--center padding-horiz--md">
        <h3>{title}</h3>
        <p>{description}</p>
      </div>
    </div>
  );
}

function HomepageFeatures() {
  return (
    <section className={styles.features}>
      <div className="container">
        <div className="row">
          {features.map((props) => (
            <Feature key={props.title} {...props} />
          ))}
        </div>
      </div>
    </section>
  );
}

export default function Home() {
  const { siteConfig } = useDocusaurusContext();
  return (
    <Layout title={siteConfig.title} description={siteConfig.tagline}>
      <HomepageHeader />
      <main>
        <HomepageFeatures />
      </main>
    </Layout>
  );
}
