const chalk = require('chalk');

/**
 * Styling
 *
 * Small helper around chalk that centralizes theme colors, icons, spinners
 * and a handful of UI primitives used by Questioner and InteractiveTable.
 */
class Styling {
    constructor() {
        this.themes = {
            default: {
                primary: '#00d4aa',
                secondary: '#0066cc',
                success: '#28a745',
                warning: '#ffc107',
                error: '#dc3545',
                info: '#17a2b8',
                muted: '#6c757d',
                background: '#000000',
                text: '#ffffff',
                border: '#444444'
            },
            dark: {
                primary: '#61dafb',
                secondary: '#ffd700',
                success: '#00ff7f',
                warning: '#ffa500',
                error: '#ff6b6b',
                info: '#87ceeb',
                muted: '#888888',
                background: '#0d1117',
                text: '#f0f6fc',
                border: '#30363d'
            },
            light: {
                primary: '#0066cc',
                secondary: '#6f42c1',
                success: '#198754',
                warning: '#fd7e14',
                error: '#dc3545',
                info: '#0dcaf0',
                muted: '#6c757d',
                background: '#ffffff',
                text: '#212529',
                border: '#dee2e6'
            }
        };

        this.currentTheme = 'default';
        this.boxStyles = {
            single: '┌─┐│ │└─┘',
            double: '╔═╗║ ║╚═╝',
            rounded: '╭─╮│ │╰─╯',
            thick: '┏━┓┃ ┃┗━┛',
            shadow: '┌─┐│ │└─┘'
        };

        this.spinners = {
            dots: { frames: ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏'], interval: 80 },
            line: { frames: ['-', '\\', '|', '/'], interval: 130 },
            star: { frames: ['✶', '✸', '✹', '✺', '✹', '✷'], interval: 120 },
            toggle: { frames: ['⊶', '⊷'], interval: 250 },
            arrow: { frames: ['←', '↖', '↑', '↗', '→', '↘', '↓', '↙'], interval: 120 }
        };

        this.icons = {
            success: '✅',
            error: '❌',
            warning: '⚠️',
            info: 'ℹ️',
            question: '❓',
            checked: '☑️',
            unchecked: '☐',
            radio_selected: '●',
            radio_unselected: '○',
            arrow_right: '→',
            arrow_left: '←',
            arrow_up: '↑',
            arrow_down: '↓'
        };
    }

    setTheme(themeName) {
        if (this.themes[themeName]) {
            this.currentTheme = themeName;
        }
    }

    getTheme() {
        return this.themes[this.currentTheme];
    }

    hex(color) {
        return chalk.hex(color);
    }

    gradient(text, colors) {
        // Simulate gradient effect with multiple colors
        const chars = text.split('');
        const colorCount = colors.length;
        const segmentSize = Math.ceil(chars.length / colorCount);

        let result = '';
        chars.forEach((char, index) => {
            const colorIndex = Math.floor(index / segmentSize);
            const color = colors[colorIndex] || colors[colors.length - 1];
            result += chalk.hex(color)(char);
        });

        return result;
    }

    // Box drawing utilities
    createBox(content, options = {}) {
        const {
            style = 'single',
            padding = 1,
            margin = 0,
            title = '',
            borderColor = this.getTheme().border,
            backgroundColor = null,
            width = null
        } = options;

        const lines = content.split('\n');
        const maxWidth = width || Math.max(...lines.map(line => line.length)) + (padding * 2);

        const chars = this.getBoxChars(style);
        const horizontalLine = chars.horizontal.repeat(maxWidth);

        let box = '';

        // Add margin
        if (margin > 0) {
            box += '\n'.repeat(margin);
        }

        // Top border
        box += chalk.hex(borderColor)(chars.topLeft + horizontalLine + chars.topRight) + '\n';

        // Title
        if (title) {
            const titlePadding = Math.max(0, maxWidth - title.length);
            const leftPad = Math.floor(titlePadding / 2);
            const rightPad = titlePadding - leftPad;
            box += chalk.hex(borderColor)(chars.vertical) +
                   ' '.repeat(leftPad) + chalk.bold(title) + ' '.repeat(rightPad) +
                   chalk.hex(borderColor)(chars.vertical) + '\n';
            box += chalk.hex(borderColor)(chars.leftTee + horizontalLine + chars.rightTee) + '\n';
        }

        // Padding
        if (padding > 0) {
            for (let i = 0; i < padding; i++) {
                box += chalk.hex(borderColor)(chars.vertical) +
                       ' '.repeat(maxWidth) +
                       chalk.hex(borderColor)(chars.vertical) + '\n';
            }
        }

        // Content
        lines.forEach(line => {
            const contentPadding = maxWidth - line.length - (padding * 2);
            const paddingStr = ' '.repeat(padding);
            const content = backgroundColor ? chalk.bgHex(backgroundColor)(line + ' '.repeat(contentPadding)) : line + ' '.repeat(contentPadding);
            box += chalk.hex(borderColor)(chars.vertical) + paddingStr + content + paddingStr + chalk.hex(borderColor)(chars.vertical) + '\n';
        });

        // Padding
        if (padding > 0) {
            for (let i = 0; i < padding; i++) {
                box += chalk.hex(borderColor)(chars.vertical) +
                       ' '.repeat(maxWidth) +
                       chalk.hex(borderColor)(chars.vertical) + '\n';
            }
        }

        // Bottom border
        box += chalk.hex(borderColor)(chars.bottomLeft + horizontalLine + chars.bottomRight);

        // Add margin
        if (margin > 0) {
            box += '\n'.repeat(margin);
        }

        return box;
    }

    getBoxChars(style) {
        const styles = {
            single: {
                topLeft: '┌', topRight: '┐', bottomLeft: '└', bottomRight: '┘',
                horizontal: '─', vertical: '│', leftTee: '├', rightTee: '┤'
            },
            double: {
                topLeft: '╔', topRight: '╗', bottomLeft: '╚', bottomRight: '╝',
                horizontal: '═', vertical: '║', leftTee: '╠', rightTee: '╣'
            },
            rounded: {
                topLeft: '╭', topRight: '╮', bottomLeft: '╰', bottomRight: '╯',
                horizontal: '─', vertical: '│', leftTee: '├', rightTee: '┤'
            },
            thick: {
                topLeft: '┏', topRight: '┓', bottomLeft: '┗', bottomRight: '┛',
                horizontal: '━', vertical: '┃', leftTee: '┣', rightTee: '┫'
            }
        };

        return styles[style] || styles.single;
    }

    // Progress bar with advanced styling
    createProgressBar(current, total, options = {}) {
        const {
            width = 40,
            showPercentage = true,
            showFraction = true,
            completeChar = '█',
            incompleteChar = '░',
            color = this.getTheme().primary,
            backgroundColor = this.getTheme().muted
        } = options;

        const percentage = Math.round((current / total) * 100);
        const completed = Math.round((current / total) * width);
        const remaining = width - completed;

        const completeSection = chalk.hex(color)(completeChar.repeat(completed));
        const incompleteSection = chalk.hex(backgroundColor)(incompleteChar.repeat(remaining));

        let bar = completeSection + incompleteSection;

        if (showPercentage) {
            bar += ` ${percentage}%`;
        }

        if (showFraction) {
            bar += ` (${current}/${total})`;
        }

        return bar;
    }

    formatTable(headers, rows, options = {}) {
        const {
            headerColor = this.getTheme().primary,
            borderColor = this.getTheme().border,
            alternateRows = true,
            rowColors = [this.getTheme().text, this.getTheme().muted]
        } = options;

        // Calculate column widths
        const colWidths = headers.map((header, index) => {
            const maxContentWidth = Math.max(...rows.map(row => String(row[index] || '').length));
            return Math.max(header.length, maxContentWidth) + 2; // Add padding
        });

        let table = '';

        // Top border
        table += chalk.hex(borderColor)('┌' + colWidths.map(w => '─'.repeat(w)).join('┬') + '┐\n');

        // Headers
        table += chalk.hex(borderColor)('│');
        headers.forEach((header, index) => {
            const padding = colWidths[index] - header.length;
            const leftPad = Math.floor(padding / 2);
            const rightPad = padding - leftPad;
            table += ' '.repeat(leftPad) + chalk.hex(headerColor).bold(header) + ' '.repeat(rightPad);
            table += chalk.hex(borderColor)('│');
        });
        table += '\n';

        // Header separator
        table += chalk.hex(borderColor)('├' + colWidths.map(w => '─'.repeat(w)).join('┼') + '┤\n');

        // Rows
        rows.forEach((row, rowIndex) => {
            table += chalk.hex(borderColor)('│');
            row.forEach((cell, cellIndex) => {
                const cellStr = String(cell || '');
                const padding = colWidths[cellIndex] - cellStr.length;
                const leftPad = 1;
                const rightPad = padding - leftPad;

                const color = alternateRows ? rowColors[rowIndex % rowColors.length] : rowColors[0];
                table += ' '.repeat(leftPad) + chalk.hex(color)(cellStr) + ' '.repeat(rightPad);
                table += chalk.hex(borderColor)('│');
            });
            table += '\n';
        });

        // Bottom border
        table += chalk.hex(borderColor)('└' + colWidths.map(w => '─'.repeat(w)).join('┴') + '┘');

        return table;
    }
}

module.exports = Styling;
