import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, "..");
const assetsDir = path.join(rootDir, "assets", "readme");
const screenshotDir = path.join(assetsDir, "screenshots");

const theme = {
  bg: "#07080f",
  panel: "#101526",
  panelAlt: "#151026",
  text: "#f8fafc",
  muted: "#94a3b8",
  blue: "#7dd3fc",
  cyan: "#22d3ee",
  purple: "#8b5cf6",
  violet: "#a855f7",
  crimson: "#ef4444",
  gold: "#f59e0b",
  green: "#22c55e",
  border: "rgba(255,255,255,0.1)",
};

function svg({ width = 1600, height = 900, content, defs = "" }) {
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" fill="none" role="img" aria-labelledby="title desc">
  <title id="title">Museum of Dead Dreams asset</title>
  <desc id="desc">Generated repository asset for README visuals.</desc>
  <defs>
    <linearGradient id="bgGradient" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#06070d"/>
      <stop offset="48%" stop-color="#130d1f"/>
      <stop offset="100%" stop-color="#180b12"/>
    </linearGradient>
    <linearGradient id="cardGradient" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#111827"/>
      <stop offset="100%" stop-color="#0b1020"/>
    </linearGradient>
    <linearGradient id="accentGradient" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stop-color="${theme.cyan}"/>
      <stop offset="50%" stop-color="${theme.purple}"/>
      <stop offset="100%" stop-color="${theme.crimson}"/>
    </linearGradient>
    <filter id="softGlow" x="-50%" y="-50%" width="200%" height="200%">
      <feGaussianBlur stdDeviation="18" result="blur"/>
      <feMerge>
        <feMergeNode in="blur"/>
        <feMergeNode in="SourceGraphic"/>
      </feMerge>
    </filter>
    <filter id="cardShadow" x="-30%" y="-30%" width="160%" height="160%">
      <feDropShadow dx="0" dy="28" stdDeviation="28" flood-color="#000000" flood-opacity="0.45"/>
    </filter>
    ${defs}
  </defs>
  <rect width="${width}" height="${height}" fill="url(#bgGradient)"/>
  <circle cx="${width - 240}" cy="150" r="180" fill="${theme.purple}" opacity="0.12" filter="url(#softGlow)"/>
  <circle cx="200" cy="${height - 140}" r="160" fill="${theme.crimson}" opacity="0.1" filter="url(#softGlow)"/>
  <circle cx="${width * 0.55}" cy="${height * 0.78}" r="220" fill="${theme.blue}" opacity="0.08" filter="url(#softGlow)"/>
  <g opacity="0.12">
    <path d="M0 ${height - 100} H${width}" stroke="#ffffff" stroke-width="1"/>
    <path d="M0 ${height - 60} H${width}" stroke="#ffffff" stroke-width="1"/>
  </g>
  ${content}
</svg>`;
}

function tag(x, y, label, tone = theme.blue) {
  const width = 14 * label.length + 48;
  return `
    <g transform="translate(${x} ${y})">
      <rect width="${width}" height="34" rx="17" fill="${tone}" opacity="0.16" stroke="${tone}" stroke-opacity="0.45"/>
      <text x="${width / 2}" y="22" text-anchor="middle" fill="${tone}" font-family="'JetBrains Mono', monospace" font-size="13" letter-spacing="3">${label}</text>
    </g>
  `;
}

function panel(x, y, w, h, title, subtitle = "", tone = theme.blue) {
  return `
    <g transform="translate(${x} ${y})" filter="url(#cardShadow)">
      <rect width="${w}" height="${h}" rx="28" fill="url(#cardGradient)" stroke="${theme.border}"/>
      <rect x="0.5" y="0.5" width="${w - 1}" height="${h - 1}" rx="27.5" stroke="${tone}" stroke-opacity="0.12"/>
      <text x="32" y="46" fill="${theme.text}" font-family="Inter, Arial, sans-serif" font-size="28" font-weight="700">${title}</text>
      ${
        subtitle
          ? `<text x="32" y="78" fill="${theme.muted}" font-family="Inter, Arial, sans-serif" font-size="17">${subtitle}</text>`
          : ""
      }
    </g>
  `;
}

function metricCard(x, y, w, h, label, value, tone) {
  return `
    <g transform="translate(${x} ${y})">
      <rect width="${w}" height="${h}" rx="24" fill="#0b1020" stroke="${tone}" stroke-opacity="0.24"/>
      <text x="26" y="34" fill="${theme.muted}" font-family="'JetBrains Mono', monospace" font-size="12" letter-spacing="2">${label}</text>
      <text x="26" y="78" fill="${theme.text}" font-family="Cinzel, Georgia, serif" font-size="34" font-weight="700">${value}</text>
    </g>
  `;
}

function arrowLine(x1, y1, x2, y2, tone = theme.blue) {
  return `
    <g>
      <path d="M${x1} ${y1} C ${(x1 + x2) / 2} ${y1}, ${(x1 + x2) / 2} ${y2}, ${x2} ${y2}" stroke="${tone}" stroke-width="4" stroke-linecap="round" stroke-opacity="0.8"/>
      <path d="M${x2 - 16} ${y2 - 10} L${x2} ${y2} L${x2 - 16} ${y2 + 10}" stroke="${tone}" stroke-width="4" stroke-linecap="round" stroke-linejoin="round" stroke-opacity="0.8"/>
    </g>
  `;
}

function box(x, y, w, h, title, lines, tone = theme.blue) {
  return `
    <g transform="translate(${x} ${y})">
      <rect width="${w}" height="${h}" rx="24" fill="#0d1322" stroke="${tone}" stroke-opacity="0.28"/>
      <text x="24" y="38" fill="${theme.text}" font-family="Inter, Arial, sans-serif" font-size="22" font-weight="700">${title}</text>
      ${lines
        .map(
          (line, index) =>
            `<text x="24" y="${72 + index * 28}" fill="${theme.muted}" font-family="Inter, Arial, sans-serif" font-size="16">${line}</text>`
        )
        .join("")}
    </g>
  `;
}

async function ensureDirs() {
  await mkdir(assetsDir, { recursive: true });
  await mkdir(screenshotDir, { recursive: true });
}

async function writeAsset(name, body, targetDir = assetsDir) {
  await writeFile(path.join(targetDir, name), body, "utf8");
}

function heroSvg() {
  const content = `
    <g>
      ${tag(84, 70, "AI MUSEUM", theme.cyan)}
      ${tag(268, 70, "GITHUB API", theme.gold)}
      ${tag(470, 70, "COPILOT KIT", theme.purple)}
      <text x="88" y="220" fill="${theme.text}" font-family="Cinzel, Georgia, serif" font-size="82" font-weight="700">Museum of Dead Dreams</text>
      <text x="88" y="278" fill="${theme.blue}" font-family="Inter, Arial, sans-serif" font-size="28">AI-powered GitHub project resurrection</text>
      <text x="88" y="336" fill="${theme.muted}" font-family="Inter, Arial, sans-serif" font-size="24">Resurrect abandoned GitHub projects with AI + Copilot execution kits.</text>

      <g transform="translate(90 420)">
        <rect width="640" height="320" rx="36" fill="url(#cardGradient)" stroke="${theme.border}"/>
        <text x="38" y="54" fill="${theme.text}" font-family="Inter, Arial, sans-serif" font-size="24" font-weight="700">Museum Hall</text>
        <rect x="38" y="90" width="170" height="190" rx="24" fill="#111827" stroke="${theme.crimson}" stroke-opacity="0.32"/>
        <rect x="232" y="90" width="170" height="190" rx="24" fill="#111827" stroke="${theme.purple}" stroke-opacity="0.32"/>
        <rect x="426" y="90" width="170" height="190" rx="24" fill="#111827" stroke="${theme.gold}" stroke-opacity="0.32"/>
        <text x="58" y="128" fill="${theme.crimson}" font-family="'JetBrains Mono', monospace" font-size="13" letter-spacing="2">DECEASED</text>
        <text x="252" y="128" fill="${theme.purple}" font-family="'JetBrains Mono', monospace" font-size="13" letter-spacing="2">UNDEAD</text>
        <text x="446" y="128" fill="${theme.gold}" font-family="'JetBrains Mono', monospace" font-size="13" letter-spacing="2">MUMMIFIED</text>
        <text x="58" y="170" fill="${theme.text}" font-family="Cinzel, Georgia, serif" font-size="24">CORTEX</text>
        <text x="252" y="170" fill="${theme.text}" font-family="Cinzel, Georgia, serif" font-size="24">Conforma</text>
        <text x="446" y="170" fill="${theme.text}" font-family="Cinzel, Georgia, serif" font-size="24">CodeSonify</text>
        <text x="58" y="210" fill="${theme.muted}" font-family="Inter, Arial, sans-serif" font-size="15">Trading system with no second life.</text>
        <text x="252" y="210" fill="${theme.muted}" font-family="Inter, Arial, sans-serif" font-size="15">6-agent compliance machine.</text>
        <text x="446" y="210" fill="${theme.muted}" font-family="Inter, Arial, sans-serif" font-size="15">Prototype that learned to sing.</text>
      </g>

      <g transform="translate(850 160)">
        <circle cx="220" cy="230" r="94" fill="${theme.blue}" opacity="0.16" filter="url(#softGlow)"/>
        <circle cx="220" cy="230" r="56" fill="none" stroke="${theme.blue}" stroke-width="8" stroke-opacity="0.75"/>
        <circle cx="220" cy="230" r="26" fill="${theme.blue}" opacity="0.85"/>
        <path d="M220 36 V112" stroke="${theme.blue}" stroke-width="5" stroke-linecap="round" stroke-dasharray="10 16" opacity="0.65"/>
        <path d="M220 348 V424" stroke="${theme.blue}" stroke-width="5" stroke-linecap="round" stroke-dasharray="10 16" opacity="0.65"/>
        <text x="220" y="26" text-anchor="middle" fill="${theme.text}" font-family="'JetBrains Mono', monospace" font-size="16" letter-spacing="3">OPENAI</text>
        <text x="220" y="454" text-anchor="middle" fill="${theme.text}" font-family="'JetBrains Mono', monospace" font-size="16" letter-spacing="3">RESURRECTION BAY</text>

        <rect x="20" y="118" width="162" height="74" rx="20" fill="#111827" stroke="${theme.border}"/>
        <text x="40" y="150" fill="${theme.text}" font-family="Inter, Arial, sans-serif" font-size="19" font-weight="700">GitHub API</text>
        <text x="40" y="174" fill="${theme.muted}" font-family="Inter, Arial, sans-serif" font-size="14">Repos + commits + manifests</text>

        <rect x="256" y="118" width="182" height="74" rx="20" fill="#111827" stroke="${theme.border}"/>
        <text x="276" y="150" fill="${theme.text}" font-family="Inter, Arial, sans-serif" font-size="19" font-weight="700">Curator AI</text>
        <text x="276" y="174" fill="${theme.muted}" font-family="Inter, Arial, sans-serif" font-size="14">Exhibits + Q&A + plans</text>

        <rect x="92" y="276" width="258" height="94" rx="24" fill="#111827" stroke="${theme.border}"/>
        <text x="112" y="316" fill="${theme.text}" font-family="Inter, Arial, sans-serif" font-size="19" font-weight="700">Copilot Resurrection Kit</text>
        <text x="112" y="344" fill="${theme.muted}" font-family="Inter, Arial, sans-serif" font-size="14">instructions + skill + backlog + plan</text>
      </g>
    </g>
  `;
  return svg({ content });
}

function architectureSvg() {
  const content = `
    <text x="80" y="90" fill="${theme.text}" font-family="Cinzel, Georgia, serif" font-size="58" font-weight="700">Architecture</text>
    <text x="80" y="132" fill="${theme.muted}" font-family="Inter, Arial, sans-serif" font-size="22">GitHub ingestion, grounded AI generation, and Copilot-ready outputs.</text>

    ${box(74, 190, 240, 150, "GitHub Username", ["Public profile input", "Shareable ?user= links"], theme.cyan)}
    ${box(384, 190, 240, 150, "GitHub API", ["repos", "commits", "languages"], theme.gold)}
    ${box(694, 190, 280, 150, "Repo Evidence Collector", ["README excerpt", "root files", "manifest snippets"], theme.blue)}
    ${box(1060, 190, 230, 150, "Abandonment Ranker", ["fork filter", "days silent", "top forgotten repos"], theme.crimson)}

    ${box(278, 430, 320, 170, "Local AI Server", ["/api/health", "/api/museum-exhibits", "/api/revival-plan", "/api/copilot-curator"], theme.purple)}
    ${box(650, 430, 240, 170, "OpenAI SDK", ["structured outputs", "compact grounded prompts"], theme.cyan)}
    ${box(944, 430, 250, 170, "Zod Validation", ["schema-safe exhibits", "schema-safe plans", "schema-safe curator replies"], theme.green)}

    ${box(80, 680, 250, 150, "Museum Exhibits", ["subtitle", "epitaph", "artifacts", "Copilot insight"], theme.crimson)}
    ${box(392, 680, 250, 150, "Revival Plans", ["diagnosis", "architecture", "stack", "score"], theme.purple)}
    ${box(704, 680, 250, 150, "Copilot Curator", ["Q&A", "evidence", "follow-ups"], theme.blue)}
    ${box(1016, 680, 250, 150, "Resurrection Bay", ["archive", "protocol", "Copilot kit"], theme.gold)}

    ${arrowLine(314, 265, 384, 265, theme.cyan)}
    ${arrowLine(624, 265, 694, 265, theme.gold)}
    ${arrowLine(974, 265, 1060, 265, theme.blue)}
    ${arrowLine(1174, 340, 438, 430, theme.crimson)}
    ${arrowLine(598, 515, 650, 515, theme.purple)}
    ${arrowLine(890, 515, 944, 515, theme.cyan)}
    ${arrowLine(438, 600, 206, 680, theme.purple)}
    ${arrowLine(518, 600, 518, 680, theme.purple)}
    ${arrowLine(776, 600, 828, 680, theme.blue)}
    ${arrowLine(1070, 600, 1140, 680, theme.green)}

    ${tag(1220, 80, "PDF EXPORT", theme.crimson)}
    ${tag(1020, 80, "COPILOT KIT", theme.gold)}
  `;
  return svg({ content });
}

function productFlowSvg() {
  const steps = [
    ["1", "Enter username", "GitHub profile input"],
    ["2", "Scan repos", "Find public abandoned work"],
    ["3", "Visit exhibit", "Explore AI museum room"],
    ["4", "Ask curator", "Grounded Q&A per project"],
    ["5", "Generate plan", "Diagnosis + stack + GTM"],
    ["6", "Export PDF", "Shareable executive brief"],
    ["7", "Commit to Bay", "Persistent archive entry"],
    ["8", "Download kit", "Copilot-ready repo files"],
  ];
  const cards = steps
    .map(([n, title, sub], index) => {
      const x = 70 + index * 185;
      const tone = [theme.cyan, theme.gold, theme.crimson, theme.blue, theme.purple, theme.green, theme.gold, theme.cyan][index];
      return `
        <g transform="translate(${x} 310)">
          <rect width="160" height="220" rx="26" fill="#0f1524" stroke="${tone}" stroke-opacity="0.28"/>
          <circle cx="38" cy="42" r="18" fill="${tone}" opacity="0.18"/>
          <text x="38" y="48" text-anchor="middle" fill="${tone}" font-family="'JetBrains Mono', monospace" font-size="16" font-weight="700">${n}</text>
          <text x="22" y="96" fill="${theme.text}" font-family="Inter, Arial, sans-serif" font-size="22" font-weight="700">${title}</text>
          <text x="22" y="134" fill="${theme.muted}" font-family="Inter, Arial, sans-serif" font-size="15">${sub}</text>
        </g>
        ${index < steps.length - 1 ? arrowLine(x + 160, 420, x + 184, 420, tone) : ""}
      `;
    })
    .join("");
  const content = `
    <text x="80" y="100" fill="${theme.text}" font-family="Cinzel, Georgia, serif" font-size="58" font-weight="700">Product Flow</text>
    <text x="80" y="144" fill="${theme.muted}" font-family="Inter, Arial, sans-serif" font-size="22">From a GitHub handle to a Copilot-ready resurrection workflow.</text>
    <rect x="72" y="210" width="1456" height="380" rx="38" fill="url(#cardGradient)" stroke="${theme.border}"/>
    ${cards}
  `;
  return svg({ content });
}

function beforeAfterSvg() {
  const content = `
    <text x="80" y="96" fill="${theme.text}" font-family="Cinzel, Georgia, serif" font-size="58" font-weight="700">Before / After</text>
    <text x="80" y="138" fill="${theme.muted}" font-family="Inter, Arial, sans-serif" font-size="22">The completion arc that turns a static demo into a real AI platform.</text>
    <g transform="translate(84 210)">
      <rect width="658" height="594" rx="34" fill="#120d16" stroke="${theme.crimson}" stroke-opacity="0.28"/>
      <text x="40" y="62" fill="${theme.crimson}" font-family="'JetBrains Mono', monospace" font-size="18" letter-spacing="4">BEFORE</text>
      <text x="40" y="112" fill="${theme.text}" font-family="Cinzel, Georgia, serif" font-size="40" font-weight="700">Static Prototype</text>
      ${[
        "Hardcoded four-room showcase",
        "No live GitHub ingestion",
        "No repo grounding or evidence recovery",
        "No AI-generated revival plans",
        "No Copilot Curator",
        "No persistent archive",
        "No exportable business artifact",
      ]
        .map(
          (line, index) => `
            <g transform="translate(40 ${180 + index * 56})">
              <circle cx="10" cy="10" r="5" fill="${theme.crimson}"/>
              <text x="30" y="16" fill="${theme.muted}" font-family="Inter, Arial, sans-serif" font-size="22">${line}</text>
            </g>
          `
        )
        .join("")}
    </g>
    <g transform="translate(860 210)">
      <rect width="658" height="594" rx="34" fill="#0c1420" stroke="${theme.green}" stroke-opacity="0.28"/>
      <text x="40" y="62" fill="${theme.green}" font-family="'JetBrains Mono', monospace" font-size="18" letter-spacing="4">AFTER</text>
      <text x="40" y="112" fill="${theme.text}" font-family="Cinzel, Georgia, serif" font-size="40" font-weight="700">AI Revival Platform</text>
      ${[
        "Live GitHub profile analysis",
        "Abandonment ranking and fork filtering",
        "Grounded AI exhibit generation",
        "Copilot Curator Q&A",
        "Revival Plan engine + branded PDF",
        "Persistent Resurrection Bay archive",
        "Downloadable Copilot Resurrection Kits",
      ]
        .map(
          (line, index) => `
            <g transform="translate(40 ${180 + index * 56})">
              <rect x="0" y="0" width="20" height="20" rx="6" fill="${theme.green}" opacity="0.2"/>
              <path d="M6 10 L9 13 L15 6" stroke="${theme.green}" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
              <text x="34" y="16" fill="${theme.muted}" font-family="Inter, Arial, sans-serif" font-size="22">${line}</text>
            </g>
          `
        )
        .join("")}
    </g>
    ${arrowLine(744, 507, 844, 507, theme.blue)}
  `;
  return svg({ content });
}

function copilotKitSvg() {
  const content = `
    <text x="80" y="96" fill="${theme.text}" font-family="Cinzel, Georgia, serif" font-size="58" font-weight="700">Copilot Resurrection Kit</text>
    <text x="80" y="138" fill="${theme.muted}" font-family="Inter, Arial, sans-serif" font-size="22">Repository-ready files that turn inspiration into a real implementation workflow.</text>

    <g transform="translate(86 210)">
      <rect width="560" height="610" rx="34" fill="url(#cardGradient)" stroke="${theme.border}"/>
      <text x="36" y="56" fill="${theme.text}" font-family="Inter, Arial, sans-serif" font-size="28" font-weight="700">Generated file tree</text>
      <text x="38" y="118" fill="${theme.blue}" font-family="'JetBrains Mono', monospace" font-size="22">.github/</text>
      <text x="72" y="160" fill="${theme.muted}" font-family="'JetBrains Mono', monospace" font-size="20">copilot-instructions.md</text>
      <text x="72" y="198" fill="${theme.muted}" font-family="'JetBrains Mono', monospace" font-size="20">instructions/resurrection.instructions.md</text>
      <text x="72" y="236" fill="${theme.muted}" font-family="'JetBrains Mono', monospace" font-size="20">skills/project-resurrection/SKILL.md</text>
      <text x="38" y="302" fill="${theme.gold}" font-family="'JetBrains Mono', monospace" font-size="22">AGENTS.md</text>
      <text x="38" y="368" fill="${theme.purple}" font-family="'JetBrains Mono', monospace" font-size="22">docs/</text>
      <text x="72" y="410" fill="${theme.muted}" font-family="'JetBrains Mono', monospace" font-size="20">revival-plan.md</text>
      <text x="72" y="448" fill="${theme.muted}" font-family="'JetBrains Mono', monospace" font-size="20">resurrection-backlog.md</text>
    </g>

    <g transform="translate(760 218)">
      ${metricCard(0, 0, 680, 144, "WHY IT MATTERS", "Copilot gets a product memory, delivery plan, and execution lane.", theme.cyan)}
      ${box(0, 184, 680, 166, "Repository instructions", ["Guide Copilot toward the new architecture", "Preserve fallbacks, PDF export, and Resurrection Bay"], theme.blue)}
      ${box(0, 382, 680, 166, "Project-specific skill", ["Teach Copilot how to revive this exact product", "Bind implementation to docs/revival-plan.md"], theme.purple)}
      ${box(0, 580, 680, 166, "Execution docs", ["Backlog, commercial framing, and priorities live inside the repo", "Developers can move from museum insight to code"], theme.gold)}
    </g>
  `;
  return svg({ content });
}

function roiDashboardSvg() {
  const content = `
    <text x="80" y="96" fill="${theme.text}" font-family="Cinzel, Georgia, serif" font-size="58" font-weight="700">Abandoned code = hidden capital</text>
    <text x="80" y="138" fill="${theme.muted}" font-family="Inter, Arial, sans-serif" font-size="22">Illustrative ROI framing for repo discovery, diagnosis, and prioritization.</text>

    ${metricCard(82, 220, 290, 150, "10 REPOS", "5-10 hrs saved", theme.cyan)}
    ${metricCard(402, 220, 290, 150, "50 REPOS", "25-50 hrs saved", theme.purple)}
    ${metricCard(722, 220, 290, 150, "FIRST PASS", "Minutes, not days", theme.gold)}
    ${metricCard(1042, 220, 390, 150, "STRATEGIC VALUE", "Discovery + prioritization compressed", theme.green)}

    <g transform="translate(82 430)">
      <rect width="1350" height="360" rx="34" fill="url(#cardGradient)" stroke="${theme.border}"/>
      <text x="34" y="52" fill="${theme.text}" font-family="Inter, Arial, sans-serif" font-size="26" font-weight="700">Illustrative comparison</text>
      <g transform="translate(34 88)">
        <rect width="1282" height="56" rx="18" fill="#0d1320" stroke="${theme.border}"/>
        <text x="20" y="35" fill="${theme.muted}" font-family="'JetBrains Mono', monospace" font-size="15" letter-spacing="2">SCENARIO</text>
        <text x="430" y="35" fill="${theme.muted}" font-family="'JetBrains Mono', monospace" font-size="15" letter-spacing="2">MANUAL PROCESS</text>
        <text x="770" y="35" fill="${theme.muted}" font-family="'JetBrains Mono', monospace" font-size="15" letter-spacing="2">WITH MUSEUM OF DEAD DREAMS</text>
        <text x="1110" y="35" fill="${theme.muted}" font-family="'JetBrains Mono', monospace" font-size="15" letter-spacing="2">VALUE</text>
      </g>
      ${[
        ["Solo developer / 10 repos", "5-10 hours of audit + triage", "1 session + AI exhibit pass", "Fast recovery of promising ideas"],
        ["Startup / 50 prototypes", "25-50 hours of discovery", "Portfolio-level scan + ranked backlog", "Prioritization before re-investment"],
        ["Hackathon team archive", "Manual review of scattered repos", "Story + diagnosis + revival plan", "Sharper portfolio narrative"],
        ["Maintainer triage", "Readme + issue archaeology", "Grounded repo autopsy", "Higher signal on next action"],
      ]
        .map(
          ([a, b, c, d], index) => `
            <g transform="translate(34 ${160 + index * 60})">
              <rect width="1282" height="48" rx="14" fill="${index % 2 === 0 ? "#0a0f1d" : "#0f1524"}"/>
              <text x="20" y="30" fill="${theme.text}" font-family="Inter, Arial, sans-serif" font-size="16">${a}</text>
              <text x="430" y="30" fill="${theme.muted}" font-family="Inter, Arial, sans-serif" font-size="16">${b}</text>
              <text x="770" y="30" fill="${theme.blue}" font-family="Inter, Arial, sans-serif" font-size="16">${c}</text>
              <text x="1110" y="30" fill="${theme.gold}" font-family="Inter, Arial, sans-serif" font-size="16">${d}</text>
            </g>
          `
        )
        .join("")}
    </g>
  `;
  return svg({ content });
}

function screenshotWelcomePreview() {
  const content = `
    <text x="76" y="86" fill="${theme.text}" font-family="Cinzel, Georgia, serif" font-size="48" font-weight="700">UI Preview - Welcome Screen</text>
    <rect x="70" y="130" width="1460" height="700" rx="40" fill="url(#cardGradient)" stroke="${theme.border}"/>
    <text x="120" y="240" fill="${theme.text}" font-family="Cinzel, Georgia, serif" font-size="78" font-weight="700">Museum of Dead Dreams</text>
    <text x="120" y="294" fill="${theme.muted}" font-family="Inter, Arial, sans-serif" font-size="24">Every developer has a graveyard. Let's find yours.</text>
    <rect x="120" y="390" width="720" height="86" rx="28" fill="#0a1020" stroke="${theme.border}"/>
    <text x="154" y="444" fill="${theme.muted}" font-family="'JetBrains Mono', monospace" font-size="24">github username</text>
    <rect x="870" y="390" width="250" height="86" rx="28" fill="${theme.crimson}" opacity="0.18" stroke="${theme.crimson}" stroke-opacity="0.45"/>
    <text x="932" y="444" fill="${theme.text}" font-family="Inter, Arial, sans-serif" font-size="24" font-weight="700">Enter Museum</text>
    ${tag(122, 154, "GITHUB GRAVEYARD GENERATOR", theme.blue)}
    ${box(1160, 356, 280, 220, "What the curator does", ["1. Fetches public repos", "2. Ranks abandoned work", "3. Generates exhibits", "4. Produces revival plans"], theme.purple)}
  `;
  return svg({ content });
}

function screenshotHallPreview() {
  const content = `
    <text x="76" y="86" fill="${theme.text}" font-family="Cinzel, Georgia, serif" font-size="48" font-weight="700">UI Preview - Museum Hall</text>
    <rect x="70" y="130" width="1460" height="700" rx="40" fill="url(#cardGradient)" stroke="${theme.border}"/>
    <text x="120" y="224" fill="${theme.text}" font-family="Cinzel, Georgia, serif" font-size="74" font-weight="700">Museum of Dead Dreams</text>
    <text x="120" y="274" fill="${theme.muted}" font-family="Inter, Arial, sans-serif" font-size="22">Curated from live GitHub repository analysis.</text>
    ${["FINEY_RUBRO", "trade-bot", "old-dashboard", "Resurrection Bay"]
      .map((name, index) => {
        const x = 120 + (index % 2) * 650;
        const y = 350 + Math.floor(index / 2) * 210;
        const tones = [theme.crimson, theme.purple, theme.gold, theme.blue];
        return `
          <g transform="translate(${x} ${y})">
            <rect width="560" height="170" rx="28" fill="#0d1322" stroke="${tones[index]}" stroke-opacity="0.26"/>
            <text x="28" y="46" fill="${tones[index]}" font-family="'JetBrains Mono', monospace" font-size="14" letter-spacing="2">${index === 3 ? "REBIRTH" : "EXHIBIT"}</text>
            <text x="28" y="90" fill="${theme.text}" font-family="Cinzel, Georgia, serif" font-size="34">${name}</text>
            <text x="28" y="126" fill="${theme.muted}" font-family="Inter, Arial, sans-serif" font-size="18">LOC 12,400  ·  Commits 18  ·  842d silent</text>
          </g>
        `;
      })
      .join("")}
  `;
  return svg({ content });
}

function screenshotRevivalPreview() {
  const content = `
    <text x="76" y="86" fill="${theme.text}" font-family="Cinzel, Georgia, serif" font-size="48" font-weight="700">UI Preview - Revival Plan</text>
    <rect x="70" y="130" width="1460" height="700" rx="40" fill="url(#cardGradient)" stroke="${theme.border}"/>
    ${tag(120, 168, "COPILOT REVIVAL REPORT", theme.blue)}
    ${tag(418, 168, "AI GENERATED", theme.green)}
    <text x="120" y="258" fill="${theme.text}" font-family="Cinzel, Georgia, serif" font-size="58" font-weight="700">FINEY_RUBRO - Revival Plan</text>
    <rect x="120" y="310" width="250" height="420" rx="28" fill="#0d1322" stroke="${theme.border}"/>
    ${["Diagnosis", "Architecture", "Tech Stack", "Features", "Go-to-Market", "Score"]
      .map(
        (label, index) => `
          <rect x="146" y="${340 + index * 60}" width="198" height="42" rx="16" fill="${index === 0 ? "#17304d" : "#111827"}" stroke="${index === 0 ? theme.blue : "rgba(255,255,255,0.08)"}"/>
          <text x="170" y="${368 + index * 60}" fill="${index === 0 ? theme.text : theme.muted}" font-family="Inter, Arial, sans-serif" font-size="18">${label}</text>
        `
      )
      .join("")}
    <rect x="410" y="310" width="1060" height="420" rx="30" fill="#0a1020" stroke="${theme.border}"/>
    <text x="452" y="368" fill="${theme.blue}" font-family="'JetBrains Mono', monospace" font-size="14" letter-spacing="3">THE AUTOPSY</text>
    <text x="452" y="420" fill="${theme.text}" font-family="Cinzel, Georgia, serif" font-size="42">Diagnosis</text>
    <rect x="452" y="458" width="476" height="210" rx="22" fill="#251014" stroke="${theme.crimson}" stroke-opacity="0.25"/>
    <rect x="956" y="458" width="476" height="210" rx="22" fill="#271d10" stroke="${theme.gold}" stroke-opacity="0.25"/>
    <text x="480" y="498" fill="${theme.crimson}" font-family="'JetBrains Mono', monospace" font-size="13" letter-spacing="2">TECHNICAL DIAGNOSIS</text>
    <text x="984" y="498" fill="${theme.gold}" font-family="'JetBrains Mono', monospace" font-size="13" letter-spacing="2">MARKET DIAGNOSIS</text>
    <text x="480" y="548" fill="${theme.text}" font-family="Inter, Arial, sans-serif" font-size="18">Prototype architecture was too loose, validation was weak, and</text>
    <text x="480" y="578" fill="${theme.text}" font-family="Inter, Arial, sans-serif" font-size="18">the product boundary was never hardened for real use.</text>
    <text x="984" y="548" fill="${theme.text}" font-family="Inter, Arial, sans-serif" font-size="18">The timing was right, but the packaging and positioning never</text>
    <text x="984" y="578" fill="${theme.text}" font-family="Inter, Arial, sans-serif" font-size="18">made the opportunity legible to buyers or judges.</text>
  `;
  return svg({ content });
}

function screenshotResurrectionPreview() {
  const content = `
    <text x="76" y="86" fill="${theme.text}" font-family="Cinzel, Georgia, serif" font-size="48" font-weight="700">UI Preview - Resurrection Bay</text>
    <rect x="70" y="130" width="1460" height="700" rx="40" fill="url(#cardGradient)" stroke="${theme.border}"/>
    ${tag(120, 168, "RESURRECTION BAY", theme.blue)}
    <text x="120" y="250" fill="${theme.text}" font-family="Cinzel, Georgia, serif" font-size="66" font-weight="700">Through the Gates of Rebirth</text>
    <text x="120" y="298" fill="${theme.muted}" font-family="Inter, Arial, sans-serif" font-size="22">Persistent archive of revived projects, Copilot kits, and replayable resurrection protocols.</text>
    ${metricCard(120, 346, 260, 132, "PROJECTS RECLAIMED", "4", theme.cyan)}
    ${metricCard(412, 346, 260, 132, "LINES PULLED BACK", "43,220", theme.purple)}
    ${metricCard(704, 346, 340, 132, "AVERAGE SCORE", "78/100", theme.gold)}
    <rect x="120" y="520" width="410" height="250" rx="28" fill="#0d1322" stroke="${theme.border}"/>
    <text x="152" y="566" fill="${theme.text}" font-family="Inter, Arial, sans-serif" font-size="24" font-weight="700">Resurrected Archive</text>
    ${["FINEY_RUBRO", "CORTEX Trading", "Conforma-AI"]
      .map(
        (name, index) => `
          <rect x="152" y="${598 + index * 54}" width="346" height="40" rx="14" fill="#111827" stroke="${index === 0 ? theme.blue : "rgba(255,255,255,0.08)"}"/>
          <text x="172" y="${624 + index * 54}" fill="${theme.text}" font-family="Inter, Arial, sans-serif" font-size="18">${name}</text>
        `
      )
      .join("")}
    <rect x="568" y="520" width="440" height="250" rx="28" fill="#0d1322" stroke="${theme.border}"/>
    <text x="600" y="566" fill="${theme.text}" font-family="Inter, Arial, sans-serif" font-size="24" font-weight="700">Heaven Gate Protocol</text>
    ${["Autopsy Recall", "Blueprint Rewrite", "Copilot Skill Imprint", "Launch Readiness"]
      .map(
        (label, index) => `
          <rect x="600" y="${598 + index * 42}" width="376" height="32" rx="12" fill="${index < 2 ? "#10311f" : "#111827"}" stroke="${index < 2 ? theme.green : "rgba(255,255,255,0.08)"}"/>
          <text x="620" y="${620 + index * 42}" fill="${index < 2 ? theme.green : theme.muted}" font-family="Inter, Arial, sans-serif" font-size="16">${label}</text>
        `
      )
      .join("")}
    <rect x="1044" y="520" width="426" height="250" rx="28" fill="#0d1322" stroke="${theme.border}"/>
    <text x="1076" y="566" fill="${theme.text}" font-family="Inter, Arial, sans-serif" font-size="24" font-weight="700">Copilot Kit</text>
    <text x="1076" y="610" fill="${theme.blue}" font-family="'JetBrains Mono', monospace" font-size="15">.github/copilot-instructions.md</text>
    <text x="1076" y="640" fill="${theme.blue}" font-family="'JetBrains Mono', monospace" font-size="15">AGENTS.md</text>
    <text x="1076" y="670" fill="${theme.blue}" font-family="'JetBrains Mono', monospace" font-size="15">docs/revival-plan.md</text>
    <text x="1076" y="700" fill="${theme.blue}" font-family="'JetBrains Mono', monospace" font-size="15">docs/resurrection-backlog.md</text>
  `;
  return svg({ content });
}

async function main() {
  await ensureDirs();

  await writeAsset("hero.svg", heroSvg());
  await writeAsset("architecture.svg", architectureSvg());
  await writeAsset("product-flow.svg", productFlowSvg());
  await writeAsset("before-after.svg", beforeAfterSvg());
  await writeAsset("copilot-kit.svg", copilotKitSvg());
  await writeAsset("roi-dashboard.svg", roiDashboardSvg());

  await writeAsset("screenshot-welcome-preview.svg", screenshotWelcomePreview(), screenshotDir);
  await writeAsset("screenshot-hall-preview.svg", screenshotHallPreview(), screenshotDir);
  await writeAsset("screenshot-revival-preview.svg", screenshotRevivalPreview(), screenshotDir);
  await writeAsset("screenshot-resurrection-preview.svg", screenshotResurrectionPreview(), screenshotDir);

  console.log("Generated README assets in", assetsDir);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
