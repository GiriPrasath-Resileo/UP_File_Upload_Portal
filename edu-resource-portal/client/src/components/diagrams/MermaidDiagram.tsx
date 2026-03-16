import React, { useEffect, useState } from 'react';

interface MermaidDiagramProps {
  chart: string;
  id?: string;
  className?: string;
}

export function MermaidDiagram({ chart, id, className }: MermaidDiagramProps) {
  const [error, setError] = useState<string | null>(null);
  const [svg, setSvg] = useState<string | null>(null);

  useEffect(() => {
    if (!chart) return;

    const uniqueId = id ?? `mermaid-${Math.random().toString(36).slice(2, 9)}`;

    const render = async () => {
      try {
        setError(null);
        setSvg(null);
        const mermaid = (await import('mermaid')).default;
        mermaid.initialize({
          startOnLoad: false,
          theme: 'neutral',
          securityLevel: 'loose',
          flowchart: { useMaxWidth: true, htmlLabels: true },
          sequence: { useMaxWidth: true },
        });
        const { svg: rendered } = await mermaid.render(uniqueId, chart);
        setSvg(rendered);
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Failed to render diagram');
      }
    };

    render();
  }, [chart, id]);

  if (error) {
    return (
      <div className={`rounded-xl border border-rose-200 bg-rose-50 p-4 text-rose-700 text-sm ${className ?? ''}`}>
        <p className="font-medium">Diagram render error</p>
        <p className="mt-1">{error}</p>
      </div>
    );
  }

  return (
    <div className={`mermaid-container flex justify-center overflow-x-auto rounded-xl border border-slate-200 bg-white p-4 ${className ?? ''}`}>
      {svg ? (
        <div dangerouslySetInnerHTML={{ __html: svg }} className="[&_svg]:max-w-full [&_svg]:h-auto" />
      ) : (
        <div className="flex items-center gap-2 text-slate-400 py-8">
          <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          <span>Rendering diagram...</span>
        </div>
      )}
    </div>
  );
}
