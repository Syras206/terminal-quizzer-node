
const Styling = require('./Styling');
const readline = require('readline');

/**
 * InteractiveTable
 *
 * Render and optionally interact with tabular data in the terminal. Supports
 * sorting, filtering, pagination, and single/multi selection. Used via
 * the UI/table compatibility wrapper.
 */
class InteractiveTable {
	constructor(options = {}) {
        this.styling = new Styling();
        this.theme = options.theme || 'default';
        this.styling.setTheme(this.theme);

        // Configuration
        this.config = {
            borderStyle: options.borderStyle || 'single',
            alternateRows: options.alternateRows !== false,
            showHeader: options.showHeader !== false,
            sortable: options.sortable || false,
            filterable: options.filterable || false,
            selectable: options.selectable || false,
            multiSelect: options.multiSelect || false,
            pageSize: options.pageSize || 10,
            showPagination: options.showPagination || false,
            ...options
        };

        // Data
        this.columns = [];
        this.rows = [];
        this.selectedRows = new Set();
        this.currentPage = 0;
        this.sortColumn = null;
        this.sortDirection = 'asc';
        this.filters = {};
        this.title = '';
        this.selectedRow = options.selectedRow || 0;
        this.interactive = false;
    }

	setTitle(title) {
        this.title = title;
        return this;
    }

    setColumns(columns) {
        this.columns = columns.map(col => ({
            name: col.name || col,
            label: col.label || col.name || col,
            width: col.width || 'auto',
            align: col.align || 'left',
            sortable: col.sortable !== false,
            formatter: col.formatter || null,
            ...col
        }));
        return this;
    }

    setSelectedRow(index) {
        this.selectedRows.clear();
        if (index !== null && index >= 0) {
            this.selectedRows.add(index);
        }
        return this;
    }

    setRows(rows) {
        this.rows = rows;
        this.selectedRows.clear();
        return this;
    }

    addRow(row) {
        this.rows.push(row);
        return this;
    }

    removeRow(index) {
        if (index >= 0 && index < this.rows.length) {
            this.rows.splice(index, 1);
            this.selectedRows.delete(index);
        }
        return this;
    }

    // Add interactive selection capability
   	/**
   	 * Enable interactive selection; resolves with chosen row index/value via
   	 * consumer logic that reads selected rows when the user confirms.
   	 * @returns {Promise<any>} Resolves when selection is made.
   	 */
   	async showTableMenu() {
        return new Promise((resolve) => {
            this.interactive = true;
            this.render();

            // Correct order for keypress event handling
            readline.emitKeypressEvents(process.stdin);
            if (process.stdin.isTTY) {
                process.stdin.setRawMode(true);
            }
            process.stdin.on('keypress', this.handleKeyPress.bind(this, resolve));

            this.rl = readline.createInterface({
                input: process.stdin,
                output: process.stdout
            });
        });
    }


    handleKeyPress(resolve, char, key) {
        // Adjust rowCount for visible rows currently
        let visibleRows = this.getProcessedRows();
        if (this.config.showPagination) {
            const startIndex = this.currentPage * this.config.pageSize;
            const endIndex = startIndex + this.config.pageSize;
            visibleRows = visibleRows.slice(startIndex, endIndex);
        }

        const rowCount = visibleRows.length;

        switch (key.name) {
            case 'up':
                this.selectedRow = Math.max(0, this.selectedRow - 1);
                this.render();
                break;
            case 'down':
                this.selectedRow = Math.min(rowCount - 1, this.selectedRow + 1);
                this.render();
                break;
            case 'return':
                this.cleanup();
                resolve(this.selectedRow + (this.config.showPagination ? this.currentPage * this.config.pageSize : 0));
                break;
            case 'escape':
            case 'c':
                if (key.ctrl) {
                    this.cleanup();
                    process.exit();
                }
                break;
        }
    }
    cleanup() {
        if (this.rl) this.rl.close();
        if (process.stdin.isTTY) process.stdin.setRawMode(false);
        process.stdin.removeAllListeners('keypress');
        this.interactive = false;
    }

    // Fixed text wrapping implementation
    wrapText(text, width) {
        const words = text.split(' ');
        let lines = [];
        let currentLine = '';

        for (let word of words) {
            if ((currentLine.length + word.length + 1) > width) {
                if (currentLine.length === 0) {
                    lines.push(word.slice(0, width - 1) + '…');
                } else {
                    lines.push(currentLine.trim());
                    currentLine = word + ' ';
                }
            } else {
                currentLine += word + ' ';
            }
        }

        if (currentLine.trim().length > 0) {
            lines.push(currentLine.trim());
        }

        return lines;
    }

    render(options = {}) {
        const theme = this.styling.getTheme();
        const config = { ...this.config, ...options };

        if (this.interactive) {
            console.clear();
        }

        let output = '';

        // Title
        if (this.title) {
            output += this.styling.createBox(this.title, {
                style: 'rounded',
                borderColor: theme.primary,
                padding: 1,
                margin: 1
            }) + '\n\n';
        }

        // Get processed data
        let processedRows = this.getProcessedRows();

        // Pagination
        if (config.showPagination) {
            const startIndex = this.currentPage * config.pageSize;
            const endIndex = startIndex + config.pageSize;
            // Slice visible rows
            processedRows = processedRows.slice(startIndex, endIndex);

            // Adjust selectedRow if out of bounds
            if (this.selectedRow >= processedRows.length) {
                this.selectedRow = processedRows.length - 1;
            }
            if (this.selectedRow < 0) {
                this.selectedRow = 0;
            }
        }

        // Calculate column widths
        const columnWidths = this.calculateColumnWidths(processedRows, config);

        // Render table
        output += this.renderTable(processedRows, columnWidths, config);

        // Pagination info
        if (config.showPagination) {
            output += '\n' + this.renderPaginationInfo();
        }

        // Selection info
        if (config.selectable && this.selectedRows.size > 0) {
            output += '\n' + this.renderSelectionInfo();
        }

        if (this.interactive) {
            console.log(this.styling.hex(theme.muted)('Use ↑/↓ to navigate, Enter to select'));
        }

        console.log(output);
        return this;
    }
    renderTable(rows, columnWidths, config) {
        const theme = this.styling.getTheme();
        const borderChars = this.styling.getBoxChars(config.borderStyle);

        let table = '';

        // Top border
        table += this.renderHorizontalBorder('top', columnWidths, borderChars);

        // Headers
        if (config.showHeader) {
            table += this.renderHeaderRow(columnWidths, borderChars, theme);
            table += this.renderHorizontalBorder('middle', columnWidths, borderChars);
        }

        // Data rows
        rows.forEach((row, index) => {
            table += this.renderDataRow(row, index, columnWidths, borderChars, theme, config);
        });

        // Bottom border
        table += this.renderHorizontalBorder('bottom', columnWidths, borderChars);

        return table;
    }

    renderHeaderRow(columnWidths, borderChars, theme) {
        let row = this.styling.hex(theme.border)(borderChars.vertical);

        this.columns.forEach((column, index) => {
            const width = columnWidths[index];
            let header = column.label;

            // Sort indicator
            if (this.config.sortable && column.sortable && this.sortColumn === column.name) {
                header += this.sortDirection === 'asc' ? ' ↑' : ' ↓';
            }

            // Format header
            const padding = width - header.length;
            const leftPad = column.align === 'center' ? Math.floor(padding / 2) :
                           column.align === 'right' ? padding - 1 : 1;
            const rightPad = padding - leftPad;

            row += ' '.repeat(leftPad) +
                   this.styling.hex(theme.primary).bold(header) +
                   ' '.repeat(rightPad) +
                   this.styling.hex(theme.border)(borderChars.vertical);
        });

        return row + '\n';
    }

    // Merged renderDataRow with wrapping and multi/single selection highlighting
    renderDataRow(rowData, rowIndex, columnWidths, borderChars, theme, config) {
        // Determine selection for highlighting
        const isInteractiveSelected = this.interactive && (rowIndex === this.selectedRow);
        const isMultiSelected = this.selectedRows.has(rowIndex);
        const isSelected = isInteractiveSelected || isMultiSelected;

        const rowColor = config.alternateRows ?
            (rowIndex % 2 === 0 ? theme.text : theme.muted) : theme.text;
        const bgColor = isSelected ? theme.primary : null;

        let rowLines = [];

        // Wrap text per column
        const wrappedColumns = this.columns.map((col, colIndex) => {
            let cellValue = rowData[col.name] || '';
            if (col.formatter && typeof col.formatter === 'function') {
                cellValue = col.formatter(cellValue, rowData, rowIndex);
            }
            return this.wrapText(String(cellValue), columnWidths[colIndex] - 2);
        });

        const maxLines = Math.max(...wrappedColumns.map(col => col.length));

        for (let lineNum = 0; lineNum < maxLines; lineNum++) {
            let rowLine = this.styling.hex(theme.border)(borderChars.vertical);

            this.columns.forEach((column, colIndex) => {
                const width = columnWidths[colIndex];
                const line = wrappedColumns[colIndex][lineNum] || '';
                const padding = width - line.length - 2; // spaces

                let styledValue = line;
                if (bgColor) {
                    styledValue = this.styling.hex(theme.background).bgHex(bgColor)(styledValue);
                } else {
                    styledValue = this.styling.hex(rowColor)(styledValue);
                }

                rowLine += ` ${styledValue}${' '.repeat(padding)} ${this.styling.hex(theme.border)(borderChars.vertical)}`;
            });

            rowLines.push(rowLine);
        }

        return rowLines.join('\n') + '\n';
    }

    renderHorizontalBorder(position, columnWidths, borderChars) {
        const theme = this.styling.getTheme();
        let border = '';

        // Left corner
        if (position === 'top') {
            border += borderChars.topLeft;
        } else if (position === 'bottom') {
            border += borderChars.bottomLeft;
        } else {
            border += borderChars.leftTee;
        }

        // Column separators and lines
        columnWidths.forEach((width, index) => {
            border += borderChars.horizontal.repeat(width);

            if (index < columnWidths.length - 1) {
                if (position === 'top') {
                    border += borderChars.horizontal; // Top T
                } else if (position === 'bottom') {
                    border += borderChars.horizontal; // Bottom T
                } else {
                    border += '┼'; // Cross
                }
            }
        });

        // Right corner
        if (position === 'top') {
            border += borderChars.topRight;
        } else if (position === 'bottom') {
            border += borderChars.bottomRight;
        } else {
            border += borderChars.rightTee;
        }

        return this.styling.hex(theme.border)(border) + '\n';
    }

    calculateColumnWidths(rows, config) {
        const terminalWidth = process.stdout.columns || 80;
        const availableWidth = terminalWidth - (this.columns.length + 1); // Account for borders

        const widths = this.columns.map((column, index) => {
            // Fixed width
            if (typeof column.width === 'number') {
                return column.width;
            }

            // Calculate based on content
            let maxWidth = column.label.length;

            rows.forEach(row => {
                const cellValue = String(row[column.name] || '');
                maxWidth = Math.max(maxWidth, cellValue.length);
            });

            return Math.min(maxWidth + 2, Math.floor(availableWidth / this.columns.length));
        });

        return widths;
    }

    getProcessedRows() {
        let processedRows = [...this.rows];

        // Apply filters
        Object.keys(this.filters).forEach(columnName => {
            const filterValue = this.filters[columnName];
            if (filterValue) {
                processedRows = processedRows.filter(row => {
                    const cellValue = String(row[columnName] || '').toLowerCase();
                    return cellValue.includes(filterValue.toLowerCase());
                });
            }
        });

        // Apply sorting
        if (this.sortColumn) {
            processedRows.sort((a, b) => {
                const aValue = a[this.sortColumn];
                const bValue = b[this.sortColumn];

                let comparison = 0;
                if (aValue < bValue) comparison = -1;
                if (aValue > bValue) comparison = 1;

                return this.sortDirection === 'desc' ? -comparison : comparison;
            });
        }

        return processedRows;
    }

    renderPaginationInfo() {
        const theme = this.styling.getTheme();
        const totalRows = this.getProcessedRows().length;
        const totalPages = Math.ceil(totalRows / this.config.pageSize);
        const startRow = (this.currentPage * this.config.pageSize) + 1;
        const endRow = Math.min(startRow + this.config.pageSize - 1, totalRows);

        return this.styling.hex(theme.muted)(
            `Page ${this.currentPage + 1} of ${totalPages} | Showing ${startRow}-${endRow} of ${totalRows} rows`
        );
    }

    renderSelectionInfo() {
        const theme = this.styling.getTheme();
        return this.styling.hex(theme.info)(`Selected: ${this.selectedRows.size} rows`);
    }

    // Interactive features
    sort(columnName, direction = 'asc') {
        this.sortColumn = columnName;
        this.sortDirection = direction;
        return this;
    }

    filter(columnName, value) {
        if (value) {
            this.filters[columnName] = value;
        } else {
            delete this.filters[columnName];
        }
        return this;
    }

    selectRow(index) {
        if (this.config.multiSelect) {
            if (this.selectedRows.has(index)) {
                this.selectedRows.delete(index);
            } else {
                this.selectedRows.add(index);
            }
        } else {
            this.selectedRows.clear();
            this.selectedRows.add(index);
        }
        return this;
    }

    clearSelection() {
        this.selectedRows.clear();
        return this;
    }

    getSelectedRows() {
        return Array.from(this.selectedRows).map(index => this.rows[index]);
    }

    nextPage() {
        const totalPages = Math.ceil(this.getProcessedRows().length / this.config.pageSize);
        if (this.currentPage < totalPages - 1) {
            this.currentPage++;
        }
        return this;
    }

    previousPage() {
        if (this.currentPage > 0) {
            this.currentPage--;
        }
        return this;
    }

    goToPage(page) {
        const totalPages = Math.ceil(this.getProcessedRows().length / this.config.pageSize);
        if (page >= 0 && page < totalPages) {
            this.currentPage = page;
        }
        return this;
    }

    // Export functionality
    toCSV() {
        const headers = this.columns.map(col => col.label).join(',');
        const rows = this.getProcessedRows().map(row =>
            this.columns.map(col => {
                const value = row[col.name] || '';
                return `"${String(value).replace(/"/g, '""')}"`;
            }).join(',')
        );

        return [headers, ...rows].join('\n');
    }

    toJSON() {
        return {
            columns: this.columns,
            rows: this.getProcessedRows(),
            selectedRows: Array.from(this.selectedRows),
            pagination: {
                currentPage: this.currentPage,
                pageSize: this.config.pageSize,
                totalRows: this.getProcessedRows().length
            }
        };
    }
}

module.exports = InteractiveTable;
