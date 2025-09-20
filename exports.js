/**
 * Entry point exports for terminal-quizzer.
 *
 * Exposes the primary classes used by consumers:
 * - Quizzer: simple stage runner used for legacy/step-based flows
 * - Questioner: modern prompt API with styling and helpers
 * - Table: interactive table renderer (UI/InteractiveTable)
 */
// Prefer minified builds when installed from npm (dist), fallback to source in dev.
let Quizzer, Questioner, Table;
try {
  Quizzer = require('./dist/quizzer.min.js');
  Questioner = require('./dist/questioner.min.js');
  Table = require('./dist/UI/table.min.js');
} catch (e) {
  // Fallback for local dev where dist may not exist
  Quizzer = require('./quizzer');
  Questioner = require('./questioner');
  Table = require('./UI/table');
}
module.exports = { Quizzer, Questioner, Table }