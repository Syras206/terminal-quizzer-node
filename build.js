#!/usr/bin/env node
const { execSync } = require('child_process');
const { mkdirSync, existsSync, rmSync, writeFileSync } = require('fs');

const files = [
  'exports.js',
  'quizzer.js',
  'questioner.js',
  'UI/table.js',
  'UI/InteractiveTable.js',
  'UI/Styling.js',
  'UI/colours.js'
];

function run(cmd) {
  execSync(cmd, { stdio: 'inherit' });
}

function main() {
  if (existsSync('dist')) rmSync('dist', { recursive: true, force: true });
  mkdirSync('dist');
  mkdirSync('dist/UI');

  // Create a minimal package.json for the dist so require paths are stable if needed
  writeFileSync('dist/package.json', JSON.stringify({ type: 'commonjs' }));

  // Use locally installed terser from devDependencies
  for (const f of files) {
    const out = 'dist/' + (f.replace(/\.js$/,'') + '.min.js');
    // Note: terser CLI expects --comments with a value (all, some). Use 'false' by omitting the flag.
    run(`./node_modules/.bin/terser ${f} --compress --mangle --ecma 2019 --toplevel -o ${out}`);
  }
}

main();
