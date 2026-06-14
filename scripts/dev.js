// Chạy đồng thời backend + frontend chỉ với 1 lệnh: npm run dev
// Không cần thư viện ngoài — dùng child_process của Node.
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const npm = process.platform === 'win32' ? 'npm.cmd' : 'npm';

function run(name, cwd, args, color) {
  const child = spawn(npm, args, { cwd: join(root, cwd), shell: true });
  const tag = `\x1b[${color}m[${name}]\x1b[0m`;
  child.stdout.on('data', (d) => process.stdout.write(`${tag} ${d}`));
  child.stderr.on('data', (d) => process.stderr.write(`${tag} ${d}`));
  child.on('exit', (code) => console.log(`${tag} kết thúc (code ${code})`));
  return child;
}

console.log('🚀 Khởi động SunoMusic (backend :4000 + frontend :5173)...\n');
const be = run('backend', 'backend', ['start'], '36');
const fe = run('frontend', 'frontend', ['run', 'dev'], '35');

const shutdown = () => {
  be.kill();
  fe.kill();
  process.exit(0);
};
process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
