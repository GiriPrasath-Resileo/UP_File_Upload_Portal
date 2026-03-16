import React, { useEffect, useState } from 'react';
import { StatCard } from '../components/common/StatCard';
import { ProgressBar } from '../components/common/ProgressBar';
import { Button } from '../components/common/Button';

type Lang = 'en' | 'hi';
type Dir = 'ltr' | 'rtl';

const i18n: Record<Lang, Record<string, string>> = {
  en: {
    title: 'Test Coverage Dashboard',
    subtitle: 'Unit test coverage for Frontend & Backend',
    refresh: 'Refresh Report',
    loading: 'Loading coverage data...',
    noData: 'No coverage data. Run "npm run test:coverage" from project root.',
    loadError: 'Failed to load report. The file may be missing or invalid.',
    frontend: 'Frontend',
    backend: 'Backend',
    statements: 'Statements',
    branches: 'Branches',
    functions: 'Functions',
    lines: 'Lines',
    files: 'Files',
    total: 'Total',
    runTests: 'Run Tests',
  },
  hi: {
    title: 'टेस्ट कवरेज डैशबोर्ड',
    subtitle: 'फ्रंटएंड और बैकएंड के लिए यूनिट टेस्ट कवरेज',
    refresh: 'रिपोर्ट रिफ्रेश करें',
    loading: 'कवरेज डेटा लोड हो रहा है...',
    noData: 'कोई कवरेज डेटा नहीं। प्रोजेक्ट रूट से "npm run test:coverage" चलाएं।',
    loadError: 'रिपोर्ट लोड करने में विफल। फॉर्मेट या फाइल अमान्य हो सकती है।',
    frontend: 'फ्रंटएंड',
    backend: 'बैकएंड',
    statements: 'स्टेटमेंट्स',
    branches: 'ब्रांचेस',
    functions: 'फंक्शन्स',
    lines: 'लाइन्स',
    files: 'फाइलें',
    total: 'कुल',
    runTests: 'टेस्ट चलाएं',
  },
};

interface CoverageSummary {
  total: { lines: { pct: number }; statements: { pct: number }; functions: { pct: number }; branches: { pct: number } };
  files: Array<{ file: string; lines: { pct: number }; statements: { pct: number }; functions: { pct: number }; branches: { pct: number } }>;
}

interface CoverageReport {
  generatedAt: string;
  frontend: CoverageSummary | null;
  backend: CoverageSummary | null;
}

function CoverageCard({
  title,
  value,
  color,
  icon,
}: {
  title: string;
  value: number;
  color: 'indigo' | 'emerald' | 'amber' | 'rose' | 'sky';
  icon: React.ReactNode;
}) {
  return (
    <StatCard
      title={title}
      value={`${value.toFixed(1)}%`}
      icon={icon}
      color={color}
    />
  );
}

function isValidReport(data: unknown): data is CoverageReport {
  return (
    typeof data === 'object' &&
    data !== null &&
    ('frontend' in data || 'backend' in data)
  );
}

async function loadCoverageReport(): Promise<CoverageReport | null> {
  const res = await fetch('/coverage-report.json');
  if (!res.ok) return null;
  const contentType = res.headers.get('Content-Type') ?? '';
  if (!contentType.includes('application/json')) return null;
  try {
    const data = await res.json();
    return isValidReport(data) ? data : null;
  } catch {
    return null;
  }
}

export default function CoverageDashboardPage() {
  const [report, setReport] = useState<CoverageReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lang, setLang] = useState<Lang>('en');
  const [dir, setDir] = useState<Dir>('ltr');

  const t = i18n[lang];

  const fetchReport = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await loadCoverageReport();
      setReport(data);
      if (!data) setError(t.loadError);
    } catch {
      setReport(null);
      setError(t.loadError);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReport();
  }, []);

  const toggleLang = () => {
    setLang((l) => (l === 'en' ? 'hi' : 'en'));
  };

  const toggleRTL = () => {
    setDir((d) => {
      const next = d === 'ltr' ? 'rtl' : 'ltr';
      if (typeof document !== 'undefined') document.documentElement.dir = next;
      return next;
    });
  };

  const refreshReport = () => {
    fetchReport();
  };

  if (loading && !report) {
    return (
      <div
        className="min-h-[60vh] flex items-center justify-center"
        dir={dir}
        lang={lang === 'hi' ? 'hi' : 'en'}
      >
        <div className="text-center text-slate-500">{t.loading}</div>
      </div>
    );
  }

  if (!report || (!report.frontend && !report.backend)) {
    return (
      <div
        className="max-w-2xl mx-auto p-8 text-center"
        dir={dir}
        lang={lang === 'hi' ? 'hi' : 'en'}
      >
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-8">
          <p className="text-amber-800 mb-4">{error ?? t.noData}</p>
          {!error && (
            <code className="block bg-white rounded-lg p-4 text-left text-sm font-mono text-slate-700 mb-4">
              npm run test:coverage
            </code>
          )}
          <Button variant="outline" onClick={refreshReport}>
            {t.refresh}
          </Button>
        </div>
      </div>
    );
  }

  const renderSection = (label: string, data: CoverageSummary | null) => {
    if (!data) return null;
    const { total, files } = data;
    const fileEntries = Array.isArray(files)
      ? files
      : Object.entries(files as Record<string, unknown>).filter(([k]) => k !== 'total');

    return (
      <section className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-100 bg-slate-50/50">
          <h2 className="text-lg font-bold text-slate-800">{label}</h2>
          {report?.generatedAt && (
            <p className="text-xs text-slate-500 mt-1">
              {new Date(report.generatedAt).toLocaleString(lang === 'hi' ? 'hi-IN' : 'en-US', {
                dateStyle: 'medium',
                timeStyle: 'short',
              })}
            </p>
          )}
        </div>
        <div className="p-5 grid grid-cols-2 sm:grid-cols-4 gap-4">
          <CoverageCard
            title={t.statements}
            value={total?.statements?.pct ?? 0}
            color="indigo"
            icon={<span aria-hidden>📊</span>}
          />
          <CoverageCard
            title={t.branches}
            value={total?.branches?.pct ?? 0}
            color="emerald"
            icon={<span aria-hidden>🌿</span>}
          />
          <CoverageCard
            title={t.functions}
            value={total?.functions?.pct ?? 0}
            color="amber"
            icon={<span aria-hidden>⚡</span>}
          />
          <CoverageCard
            title={t.lines}
            value={total?.lines?.pct ?? 0}
            color="rose"
            icon={<span aria-hidden>📝</span>}
          />
        </div>
        <div className="px-5 pb-5 max-h-80 overflow-y-auto">
          <h3 className="text-sm font-semibold text-slate-600 mb-3">{t.files}</h3>
          <div className="space-y-2">
            {fileEntries.map((entry: { file?: string; lines?: { pct: number } } | [string, unknown]) => {
              const item = Array.isArray(entry)
                ? { file: entry[0], lines: (entry[1] as { lines?: { pct: number } })?.lines }
                : entry;
              const file = item.file ?? '';
              const pct = item.lines?.pct ?? 0;
              const name = file.replace(/^.*[\\/]src[\\/]/, '').replace(/^.*[\\/]/, '');
              if (name.includes('.test.') || name.includes('.spec.')) return null;
              return (
                <div
                  key={name}
                  className="flex items-center gap-3 py-2 px-3 rounded-lg bg-slate-50 hover:bg-slate-100 transition-colors"
                >
                  <span className="text-sm font-mono text-slate-700 truncate flex-1" title={name}>
                    {name}
                  </span>
                  <div className="w-24 flex-shrink-0">
                    <ProgressBar value={pct} size="sm" color={pct >= 80 ? 'emerald' : pct >= 50 ? 'amber' : 'rose'} />
                  </div>
                  <span className="text-xs font-medium text-slate-600 w-12 text-right">{pct.toFixed(0)}%</span>
                </div>
              );
            })}
          </div>
        </div>
      </section>
    );
  };

  return (
    <div
      className="space-y-6"
      dir={dir}
      lang={lang === 'hi' ? 'hi' : 'en'}
    >
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">{t.title}</h1>
          <p className="text-slate-600 mt-1">{t.subtitle}</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Button variant="ghost" size="sm" onClick={toggleLang} aria-label={lang === 'en' ? 'Switch to Hindi' : 'Switch to English'}>
            {lang === 'en' ? 'हिंदी' : 'English'}
          </Button>
          <Button variant="ghost" size="sm" onClick={toggleRTL} aria-label={dir === 'ltr' ? 'Switch to RTL' : 'Switch to LTR'}>
            {dir === 'ltr' ? 'RTL' : 'LTR'}
          </Button>
          <Button variant="outline" size="sm" onClick={refreshReport}>
            {t.refresh}
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {renderSection(t.frontend, report?.frontend ?? null)}
        {renderSection(t.backend, report?.backend ?? null)}
      </div>
    </div>
  );
}
