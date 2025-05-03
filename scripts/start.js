const { exec } = require('child_process');

// Start the Next.js server
const server = exec('npx next start');

// Pipe the server output to the console
server.stdout.pipe(process.stdout);
server.stderr.pipe(process.stderr);

// Wait for server to start, then open browser
setTimeout(() => {
  exec('open http://localhost:3000');
}, 2000);

// Handle process termination
process.on('SIGINT', () => {
  server.kill('SIGINT');
  process.exit();
});
