
import { mkdirSync, readdirSync, unlinkSync, writeFileSync, existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { mdToPdf } from 'md-to-pdf';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');

const pdfOptions = {
  format: 'Letter',
  margin: { top: '12mm', bottom: '12mm', left: '14mm', right: '14mm' },
};

const concurrency = Math.max(1, Math.min(7, Number(process.env.KB_PDF_CONCURRENCY ?? '3')));

function collectJobs() {
  /** @type {Array<[string, string]>} */
  const jobs = [];
  jobs.push([
    join(ROOT, 'kb/patients/README.md'),
    join(ROOT, 'kb/pdf/patients/README.pdf'),
  ]);
  const byMrn = join(ROOT, 'kb/patients/by-mrn');
  for (const name of readdirSync(byMrn)) {
    if (!name.endsWith('.md')) continue;
    const base = name.slice(0, -3);
    jobs.push([
      join(byMrn, name),
      join(ROOT, 'kb/pdf/patients/by-mrn', `${base}.pdf`),
    ]);
  }
  jobs.push([
    join(ROOT, 'docs/kb-agent-patient-registry.md'),
    join(ROOT, 'kb/pdf/kb-agent-patient-registry.pdf'),
  ]);
  return jobs;
}

async function convertOne(srcAbs, destAbs) {
  const { content } = await mdToPdf({ path: srcAbs }, { pdf_options: pdfOptions });
  mkdirSync(dirname(destAbs), { recursive: true });
  writeFileSync(destAbs, content);
  const stray = `${srcAbs.slice(0, -3)}.pdf`;
  if (stray !== destAbs && existsSync(stray)) {
    try {
      unlinkSync(stray);
    } catch {
      /* ignore */
    }
  }
}

async function runPool(items, limit, worker) {
  let i = 0;
  async function slot() {
    while (i < items.length) {
      const idx = i++;
      await worker(items[idx]);
    }
  }
  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, () => slot()));
}

const jobs = collectJobs();
await runPool(jobs, concurrency, async ([src, dest]) => {
  await convertOne(src, dest);
});

console.log(`Wrote ${jobs.length} PDFs under kb/pdf/ (concurrency=${concurrency})`);
