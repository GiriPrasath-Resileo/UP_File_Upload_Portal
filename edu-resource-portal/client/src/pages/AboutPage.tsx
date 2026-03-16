import React from 'react';

export function AboutPage() {
  return (
    <div className="p-6 sm:p-8 flex flex-col gap-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-3 flex-wrap">
          <h1 className="text-2xl font-bold text-slate-900" style={{ fontFamily: 'Inter, ui-sans-serif, system-ui, sans-serif' }}>
            EduResource Portal
          </h1>
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-100 text-indigo-700">
            v1.0.0
          </span>
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-700">
            Uttar Pradesh
          </span>
        </div>
        <p className="text-base text-slate-500 font-medium">UP State Resource Management System</p>
      </div>

      {/* Overview */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
        <h2 className="text-base font-semibold text-slate-800 mb-3">Overview</h2>
        <p className="text-sm text-slate-600 leading-relaxed">
          EduResource Portal is the official educational resource file management system for the state of Uttar Pradesh.
          It enables authorized uploaders to submit PDF-format educational materials — such as notebooks, worksheets, and
          assessment papers — organized by district, block, school, grade, and subject. Each uploaded file is automatically
          assigned a unique sequential file number in the format <span className="font-mono text-indigo-700 bg-indigo-50 px-1 rounded">UP-XXXXXX</span>,
          ensuring traceability across the entire state. Administrators have full oversight of all uploads, user accounts,
          and school master data, while uploaders operate within their assigned district scope. All files are stored securely
          in AWS S3 and accessible via time-limited presigned URLs.
        </p>
      </div>

      {/* Key Features */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
        <h2 className="text-base font-semibold text-slate-800 mb-4">Key Features</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            {
              title: 'Structured File Upload',
              desc: 'Upload PDFs organized by district, block, school, grade, subject, medium, and sample type.',
              icon: (
                <svg className="h-5 w-5 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                    d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
              ),
            },
            {
              title: 'Sequential File Numbering',
              desc: 'Every upload is automatically assigned a unique UP-XXXXXX file number via an atomic database counter.',
              icon: (
                <svg className="h-5 w-5 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                    d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" />
                </svg>
              ),
            },
            {
              title: 'Bulk Upload Support',
              desc: 'Upload multiple files at once using an Excel manifest paired with a batch of PDF attachments.',
              icon: (
                <svg className="h-5 w-5 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              ),
            },
            {
              title: 'School Master Directory',
              desc: 'Centrally manage school records including UDISE codes, board affiliations, and district/block mappings.',
              icon: (
                <svg className="h-5 w-5 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                    d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              ),
            },
            {
              title: 'Role-Based Access',
              desc: 'Admin and Uploader roles with district-level scope restrictions ensure secure, compartmentalized access.',
              icon: (
                <svg className="h-5 w-5 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                    d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              ),
            },
            {
              title: 'S3-Backed Storage',
              desc: 'All PDF files are stored in AWS S3 with a structured path hierarchy and served via presigned URLs.',
              icon: (
                <svg className="h-5 w-5 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                    d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
                </svg>
              ),
            },
          ].map(feat => (
            <div key={feat.title} className="flex gap-3 p-4 rounded-xl border border-slate-100 bg-slate-50/50">
              <div className="mt-0.5 flex-shrink-0 w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center">
                {feat.icon}
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-800">{feat.title}</p>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">{feat.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Pros & Pain Points Addressed */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
        <h2 className="text-base font-semibold text-slate-800 mb-4">Advantages & Pain Points Addressed</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <h3 className="text-sm font-semibold text-indigo-700 mb-3 flex items-center gap-2">
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Key Advantages
            </h3>
            <ul className="space-y-2 text-sm text-slate-600">
              <li className="flex gap-2"><span className="text-emerald-500">•</span> Single platform for state-wide resource collection — no scattered spreadsheets or email attachments</li>
              <li className="flex gap-2"><span className="text-emerald-500">•</span> Automatic file numbering eliminates manual tracking and duplicate IDs</li>
              <li className="flex gap-2"><span className="text-emerald-500">•</span> Bulk upload with Excel manifest saves hours when processing hundreds of samples</li>
              <li className="flex gap-2"><span className="text-emerald-500">•</span> District-scoped access keeps data compartmentalized and reduces errors</li>
              <li className="flex gap-2"><span className="text-emerald-500">•</span> Secure S3 storage with presigned URLs — no public exposure of raw files</li>
              <li className="flex gap-2"><span className="text-emerald-500">•</span> School master integration ensures consistent UDISE codes and metadata</li>
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-amber-700 mb-3 flex items-center gap-2">
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              Pain Points Addressed
            </h3>
            <ul className="space-y-2 text-sm text-slate-600">
              <li className="flex gap-2"><span className="text-amber-500">→</span> <strong>Lost or duplicate files:</strong> Centralized storage and unique IDs prevent mix-ups</li>
              <li className="flex gap-2"><span className="text-amber-500">→</span> <strong>Manual tracking:</strong> Sequential file numbers replace manual registers</li>
              <li className="flex gap-2"><span className="text-amber-500">→</span> <strong>Slow bulk processing:</strong> Parallel uploads and Excel manifest speed up large batches</li>
              <li className="flex gap-2"><span className="text-amber-500">→</span> <strong>Inconsistent metadata:</strong> School master ensures correct district/block/UDISE</li>
              <li className="flex gap-2"><span className="text-amber-500">→</span> <strong>Access control gaps:</strong> Role-based permissions and district scope enforce boundaries</li>
              <li className="flex gap-2"><span className="text-amber-500">→</span> <strong>File number waste on failed uploads:</strong> Numbers only assigned on successful upload</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Tech Stack */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
        <h2 className="text-base font-semibold text-slate-800 mb-4">Tech Stack</h2>
        <div className="flex flex-wrap gap-2">
          {[
            { label: 'PostgreSQL 15',   color: 'bg-blue-100 text-blue-700' },
            { label: 'Express 4.19',   color: 'bg-slate-100 text-slate-700' },
            { label: 'React 19',       color: 'bg-cyan-100 text-cyan-700' },
            { label: 'Node.js 20+',    color: 'bg-green-100 text-green-700' },
            { label: 'TypeScript 5.4', color: 'bg-blue-100 text-blue-800' },
            { label: 'Prisma 5.11',    color: 'bg-indigo-100 text-indigo-700' },
            { label: 'AWS SDK v3',     color: 'bg-orange-100 text-orange-700' },
            { label: 'Tailwind CSS 3.4', color: 'bg-teal-100 text-teal-700' },
          ].map(tech => (
            <span key={tech.label} className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${tech.color}`}>
              {tech.label}
            </span>
          ))}
        </div>
      </div>

      {/* Usage Guide */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
        <h2 className="text-base font-semibold text-slate-800 mb-4">Usage Guide</h2>
        <ol className="flex flex-col gap-4">
          {[
            {
              step: '1',
              title: 'Login',
              desc: 'Sign in using your assigned User ID and password. Your role and district scope are pre-configured by an administrator.',
            },
            {
              step: '2',
              title: 'Upload or Bulk Upload',
              desc: 'Use "New Upload" for single PDF submissions or "Bulk Upload" to submit an Excel manifest with multiple PDFs at once. Each file receives a unique UP-XXXXXX number.',
            },
            {
              step: '3',
              title: 'View Files via Presigned URLs',
              desc: 'Click the eye icon on any upload row to open the PDF directly from S3 using a secure, time-limited presigned URL.',
            },
          ].map(item => (
            <li key={item.step} className="flex gap-4 items-start">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center text-sm font-bold">
                {item.step}
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-800">{item.title}</p>
                <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">{item.desc}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>

      {/* System Info Footer */}
      <div className="bg-slate-50 rounded-2xl border border-slate-200 px-6 py-4">
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-sm">
          <div>
            <p className="text-xs text-slate-400 mb-0.5">App State</p>
            <p className="font-medium text-slate-700">Uttar Pradesh</p>
          </div>
          <div>
            <p className="text-xs text-slate-400 mb-0.5">Build</p>
            <p className="font-medium text-slate-700">Production</p>
          </div>
          <div>
            <p className="text-xs text-slate-400 mb-0.5">API</p>
            <p className="font-medium text-slate-700">REST + JSON</p>
          </div>
        </div>
      </div>
    </div>
  );
}
