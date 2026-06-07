import { spawn } from 'node:child_process';

const port = process.env.PORT || '4173';
const command = process.platform === 'win32' ? 'npx.cmd' : 'npx';

const preview = spawn(
  command,
  ['vite', 'preview', '--host', '0.0.0.0', '--port', port],
  {
    stdio: 'inherit',
    shell: process.platform === 'win32',
  },
);

preview.on('exit', (code) => {
  process.exit(code ?? 0);
});
