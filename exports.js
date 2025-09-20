/**
 * Entry point exports for terminal-quizzer.
 *
 * Exposes the primary classes used by consumers:
 * - Quizzer: simple stage runner used for legacy/step-based flows
 * - Questioner: modern prompt API with styling and helpers
 * - Table: interactive table renderer (UI/InteractiveTable)
 */
// Prefer minified builds when installed from npm (dist), fallback to source in dev.
const path = require('path');
let Quizzer, Questioner, Table;

// Try to require files relative to this file's directory so it works from both
// the repo root (exports.js) and the published package (dist/exports.min.js)
try {
  Quizzer = require(path.join(__dirname, 'quizzer.min.js'));
  Questioner = require(path.join(__dirname, 'questioner.min.js'));
  Table = require(path.join(__dirname, 'UI', 'table.min.js'));
} catch (e) {
  // Fallback for local dev where minified files may not exist
  try {
    Quizzer = require(path.join(__dirname, 'quizzer.js'));
    Questioner = require(path.join(__dirname, 'questioner.js'));
    Table = require(path.join(__dirname, 'UI', 'table.js'));
  } catch (e2) {
    // Final fallback: try without extensions (Node's resolution)
    Quizzer = require(path.join(__dirname, 'quizzer'));
    Questioner = require(path.join(__dirname, 'questioner'));
    Table = require(path.join(__dirname, 'UI', 'table'));
  }
}
module.exports = { Quizzer, Questioner, Table } 