/**
 * Thin compatibility wrapper.
 *
 * Historically, consumers imported UI/table. We now implement the advanced
 * features in UI/InteractiveTable, but preserve the original path to avoid
 * breaking changes.
 */
module.exports = require('./InteractiveTable')