// About page content for the app.
import '../style.css';

const app = document.querySelector<HTMLDivElement>('#app');
if (!app) {
  throw new Error('Root element #app not found');
}

const base = import.meta.env.BASE_URL ?? '/';
const baseWithSlash = base.endsWith('/') ? base : `${base}/`;
const heroImage = `${baseWithSlash}assets/images/about/header1.png`;
const heroAlt = `${baseWithSlash}assets/images/about/header2.png`;
const inlineOne = `${baseWithSlash}assets/images/about/inline1.png`;
const inlineTwo = `${baseWithSlash}assets/images/about/inline2.png`;
const detailOne = `${baseWithSlash}assets/images/about/detail1.png`;
const detailTwo = `${baseWithSlash}assets/images/about/detail2.png`;
const detailThree = `${baseWithSlash}assets/images/about/detail3.png`;
const tileContact = `${baseWithSlash}assets/images/tiles/contact_form.png`;
const tileSearch = `${baseWithSlash}assets/images/tiles/Global_search.png`;
const tileManuals = `${baseWithSlash}assets/images/tiles/rov_ref_ref_files.png`;
const tileWelcome = `${baseWithSlash}assets/images/tiles/welcome.png`;
const tileProcedures = `${baseWithSlash}assets/images/tiles/rov_ref_ref_files.png`;
const tileCables = `${baseWithSlash}assets/images/tiles/cable-list.png`;
const tileFittings = `${baseWithSlash}assets/images/tiles/fitting-finder.png`;
const logoMark = `${baseWithSlash}assets/images/ROV_ref_logo.png`;

app.innerHTML = `
  <main class="page narrow-page about-page">
    <p class="back"><a href="../index.html">&larr; Back to dashboard</a></p>
    <header class="page-header">
      <h1>About This App</h1>
      <p class="lead">Built for operators who need the right info fast, without the noise.</p>
    </header>

    <section class="about-hero-full">
      <div class="page-hero about-hero" style="background-image: url('${heroImage}');">
        <div class="page-hero__overlay about-hero-overlay">
          <div class="about-hero-copy">
            <p class="pill subtle">ROV Reference</p>
            <h2>A practical offshore notebook that travels with you.</h2>
            <p class="helper-text">Built for operators who need the right info fast, without the noise.</p>
          </div>
        </div>
      </div>
    </section>

    <section class="card">
      <div class="card-header-row">
        <h2>Why It Exists</h2>
      </div>
      <div class="about-split">
        <div>
          <p>This app started the way a lot of good offshore ideas do: too many PDFs, screenshots, and half-remembered manual references at the exact moment you need a clear answer.</p>
          <p>I have spent most of my working life around work-class ROVs, flying them, fixing them, and keeping them earning money instead of sitting broken on deck. Over time you build a head full of rules, shortcuts, checks, and the "this always catches people out" knowledge. The problem is that knowledge usually lives in someone's memory until they go on leave.</p>
        </div>
        <div class="about-photo">
          <img src="${inlineOne}" alt="ROV reference detail" loading="lazy" />
        </div>
      </div>
      <p>This is my attempt to gather the practical things I actually use:</p>
      <div class="accordion">
        <div class="fit-card">
          <strong>Quick reference info</strong>
          <p class="helper-text">The essentials without the book-length explanations.</p>
        </div>
        <div class="fit-card">
          <strong>Cheat sheets</strong>
          <p class="helper-text">The numbers and checks you need most often.</p>
        </div>
        <div class="fit-card">
          <strong>Simple finders</strong>
          <p class="helper-text">Get to the right part or drawing fast.</p>
        </div>
        <div class="fit-card">
          <strong>Clear procedures</strong>
          <p class="helper-text">Step-by-step guidance you can trust.</p>
        </div>
        <div class="fit-card">
          <strong>Links to the right manuals and videos</strong>
          <p class="helper-text">The source material when you need to go deeper.</p>
        </div>
      </div>
    </section>

    <section class="card">
      <div class="card-header-row">
        <h2>How to use it</h2>
      </div>
      <div class="about-split">
        <div class="accordion">
          <div class="fit-card">
            <strong>Global Search</strong>
            <p class="helper-text">Jump across fittings, cables, parts, and videos.</p>
          </div>
          <div class="fit-card">
            <strong>Mini-app pages</strong>
            <p class="helper-text">Each page is tuned for one job with filters, quick nav, and PDF-first layouts.</p>
          </div>
          <div class="fit-card">
            <strong>Any screen</strong>
            <p class="helper-text">The app works on mobile just as well as desktop.</p>
          </div>
        </div>
        <div class="about-photo">
          <img src="${inlineTwo}" alt="ROV field workflow" loading="lazy" />
        </div>
      </div>
    </section>

    <section class="card">
      <div class="card-header-row">
        <h2>Limitations and cautions</h2>
      </div>
      <div class="accordion">
        <div class="fit-card">
          <strong>Verify critical work</strong>
          <p class="helper-text">Data may be incomplete or outdated. Confirm with official manuals.</p>
        </div>
        <div class="fit-card">
          <strong>AI-assisted content</strong>
          <p class="helper-text">Treat suggestions as guidance, not authority.</p>
        </div>
        <div class="fit-card">
          <strong>PDF revisions</strong>
          <p class="helper-text">Check revision dates and cross-check with control room documents.</p>
        </div>
        <div class="fit-card">
          <strong>Report issues</strong>
          <p class="helper-text">If something looks wrong, send feedback via the Contact page.</p>
        </div>
      </div>
    </section>

    <section class="card">
      <div class="card-header-row">
        <h2>What this app does</h2>
      </div>
      <div class="tile-grid img-tiles">
        <a class="img-tile" href="search.html">
          <div class="tile-overlay"></div>
          <img class="tile-bg" src="${tileSearch}" alt="" loading="lazy" onerror="this.style.display='none';" />
          <div class="tile-content">
            <h3>Global Search</h3>
            <p>Jump across cables, parts, manuals, and videos.</p>
          </div>
        </a>
        <a class="img-tile" href="procedures.html">
          <div class="tile-overlay"></div>
          <img class="tile-bg" src="${tileProcedures}" alt="" loading="lazy" onerror="this.style.display='none';" />
          <div class="tile-content">
            <h3>Procedures</h3>
            <p>Step-by-step checks you can trust.</p>
          </div>
        </a>
        <a class="img-tile" href="cable-list.html">
          <div class="tile-overlay"></div>
          <img class="tile-bg" src="${tileCables}" alt="" loading="lazy" onerror="this.style.display='none';" />
          <div class="tile-content">
            <h3>Cable Finder</h3>
            <p>Find the right drawing fast.</p>
          </div>
        </a>
        <a class="img-tile" href="fitting-finder.html">
          <div class="tile-overlay"></div>
          <img class="tile-bg" src="${tileFittings}" alt="" loading="lazy" onerror="this.style.display='none';" />
          <div class="tile-content">
            <h3>Fitting Finder</h3>
            <p>Match OD/ID quickly on deck.</p>
          </div>
        </a>
      </div>
    </section>

    <section class="card">
      <div class="card-header-row">
        <h2>What This App Is (and Is Not)</h2>
      </div>
      <div class="tile-grid">
        <article class="tile">
          <h3>It is</h3>
          <ul>
            <li>A personal reference project</li>
            <li>Built slowly, feature by feature</li>
            <li>Focused on practical ROV operations and maintenance</li>
            <li>Designed to be simple, fast, and reliable</li>
          </ul>
        </article>
        <article class="tile">
          <h3>It is not</h3>
          <ul>
            <li>A commercial product</li>
            <li>A replacement for OEM documentation</li>
            <li>Finished (it probably never will be)</li>
            <li>Trying to impress anyone except the person using it at 3 a.m. on night shift</li>
          </ul>
        </article>
      </div>
    </section>

    <section class="card">
      <div class="card-header-row">
        
      </div>
      <div class="tile-grid">
        <article class="tile about-image-tile">
          <img src="${heroAlt}" alt="ROV operations header" loading="lazy" />
        </article>
        <article class="tile about-image-tile">
          <img src="${detailOne}" alt="ROV system detail" loading="lazy" />
        </article>
        <article class="tile about-image-tile">
          <img src="${detailTwo}" alt="ROV tooling detail" loading="lazy" />
        </article>
        <article class="tile about-image-tile">
          <img src="${detailThree}" alt="ROV operations detail" loading="lazy" />
        </article>
      </div>
    </section>

    <section class="card">
      <div class="card-header-row">
        <h2>How It Is Built</h2>
      </div>
      <div class="about-split">
        <div class="fit-card">
          <p>The app is deliberately kept old-school:</p>
          <ul>
            <li>Simple HTML, CSS, and JavaScript</li>
            <li>No backend</li>
            <li>No accounts</li>
            <li>No tracking</li>
            <li>Runs as a static site</li>
          </ul>
          
        </div>
        <div class="about-photo">
          <img src="${inlineTwo}" alt="ROV reference interface" loading="lazy" />
        </div>
      </div>
    </section>

    <section class="card">
      <div class="card-header-row">
        <h2>Going Forward</h2>
      </div>
      <div class="fit-card">
        <p>This will keep growing as new ideas pop up, new problems appear, and new "that would have been handy last week" moments happen. Some bits will be rough, some will be refined, and some ideas will get scrapped entirely. That is part of the process.</p>
        <p>If it helps you avoid one mistake, find one part quicker, or remember one step you would otherwise miss, then it is doing its job.</p>
        <p><strong>Built for curiosity, practicality, and a quiet appreciation of things that just work.</strong></p>
      </div>
    </section>

    <section class="card">
      <div class="card-header-row">
        <h2>Say Hello or try the tools</h2>
      </div>
      <div class="tile-grid">
        <a class="img-tile about-cta" href="contact.html">
          <div class="tile-overlay"></div>
          <img class="tile-bg" src="${tileContact}" alt="" loading="lazy" onerror="this.style.display='none';" />
          <div class="tile-content">
            <h3>Send feedback</h3>
            <p>Found something missing or wrong? Share it here.</p>
          </div>
        </a>
        <a class="img-tile about-cta" href="../index.html">
          <div class="tile-overlay"></div>
          <img class="tile-bg" src="${tileWelcome}" alt="" loading="lazy" onerror="this.style.display='none';" />
          <div class="tile-content">
            <h3>Back to the tools</h3>
            <p>Jump straight to the dashboard and keep moving.</p>
          </div>
        </a>
        <a class="img-tile about-cta" href="search.html">
          <div class="tile-overlay"></div>
          <img class="tile-bg" src="${tileSearch}" alt="" loading="lazy" onerror="this.style.display='none';" />
          <div class="tile-content">
            <h3>Global search</h3>
            <p>Search cables, parts, manuals, and videos in one place.</p>
          </div>
        </a>
        <a class="img-tile about-cta" href="manual-finder.html">
          <div class="tile-overlay"></div>
          <img class="tile-bg" src="${tileManuals}" alt="" loading="lazy" onerror="this.style.display='none';" />
          <div class="tile-content">
            <h3>Manual Finder</h3>
            <p>Open manuals and drawings fast.</p>
          </div>
        </a>
      </div>
    </section>

    <section class="card">
      <div class="card-header-row">
        <h2>Built With Intent</h2>
      </div>
      <div class="about-split">
       
        <div class="fit-card">
          <p>If it helps you avoid one mistake, find one part quicker, or remember one step you would otherwise miss, then it is doing its job.</p>
          <p><strong>Built for curiosity, practicality, and a quiet appreciation of things that just work.</strong></p>
          <p class="helper-text">Thanks for having a look, </p>
          <p class="helper-text">Matt </p>
          <img src="${logoMark}" alt="ROV Reference logo mark" class="about-logo-mark" />
        </div>
      </div>
    </section>
  </main>
`;
