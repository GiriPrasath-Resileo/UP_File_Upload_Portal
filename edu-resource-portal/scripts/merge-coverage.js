const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const clientCoverage = path.join(root, 'client', 'coverage', 'coverage-summary.json');
const serverCoverage = path.join(root, 'server', 'coverage', 'coverage-summary.json');
const outputPath = path.join(root, 'client', 'public', 'coverage-report.json');

function readJson(p) {
  try {
    return JSON.parse(fs.readFileSync(p, 'utf8'));
  } catch {
    return null;
  }
}

const client = readJson(clientCoverage);
const server = readJson(serverCoverage);

const report = {
  generatedAt: new Date().toISOString(),
  frontend: client ? {
    total: client.total,
    files: Object.entries(client)
      .filter(([k]) => k !== 'total')
      .map(([file, data]) => ({
        file: file.replace(/^.*[\\/]client[\\/]src[\\/]/, 'src/').replace(/^.*[\\/]client[\\/]/, ''),
        ...data,
      })),
  } : null,
  backend: server ? {
    total: server.total,
    files: Object.entries(server)
      .filter(([k]) => k !== 'total')
      .map(([file, data]) => ({
        file: file.replace(/^.*[\\/]server[\\/]src[\\/]/, 'src/').replace(/^.*[\\/]server[\\/]/, ''),
        ...data,
      })),
  } : null,
};

const publicDir = path.dirname(outputPath);
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}
fs.writeFileSync(outputPath, JSON.stringify(report, null, 2), 'utf8');
console.log('Coverage report written to', outputPath);
