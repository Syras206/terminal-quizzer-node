const Colours = require("./colours")

class Table {

	colour = Colours.NORMAL
	columns = []
	rows = []
	title = ''
	tableRender = ''
	selectedRow = null

	/**
	 * Adds a string to the table render
	 */
	addToRender(str) {
		this.tableRender += str + '\n'
	}

	/**
	 * Renders the table within the console
	 */
	render() {
		const columns = this.columns
		const borderColour = this.colour || Colours.WHITE

		// Extract column labels and widths
		const columnLabels = columns.map(col => col.label)
		const colWidths = columns.map(col => col.width)

		const border = `${borderColour}+${colWidths.map(w => '-'.repeat(w + 2)).join('+')}+${Colours.NORMAL}`

		// print the title
		if (this.title.length > 0) {
			this.addToRender(`${Colours.WHITE}${this.title}\n`)
		}

		// Print header with table colour
		this.addToRender(border)
		this.addToRender(`${borderColour}|${Colours.BOLD} ${columnLabels.map((label, i) => label.padEnd(colWidths[i])).join(` ${borderColour}|${Colours.BOLD} `)} ${borderColour}|${Colours.NORMAL}`)
		this.addToRender(border)

		// Print each row with wrapped text
		this.rows.forEach((row, rowIndex) => {
			let isSelected = rowIndex === this.selectedRow
			let wrappedColumns = columns.map(col => this.wrapText(String(row[col.name]), col.width, isSelected))
			let rowLines = Math.max(...wrappedColumns.map(col => col.length))
			let cellColour = isSelected
				? Colours.BOLD
				: Colours.NORMAL // Default to normal if no colour is set

			for (let i = 0; i < rowLines; i++) {
				let line = columns.map((col, j) => {
					return `${cellColour}${(wrappedColumns[j][i] || '').padEnd(col.width)}${Colours.NORMAL}`
				})
				this.addToRender(`${borderColour}| ${line.join(` ${borderColour}| `)} ${borderColour}|${Colours.NORMAL}`)
			}
			this.addToRender(border)
		})

		console.clear()
		console.log(this.tableRender)
	}

	setColour(colour) {
		this.colour = colour
		return this
	}

	setColumns(columns) {
		this.columns = columns
		return this
	}

	setRows(rows) {
		this.rows = rows
		return this
	}

	setSelectedRow(selectedRow) {
		this.selectedRow = selectedRow
		return this
	}

	setTitle(titleString) {
		this.title = titleString
		return this
	}

	/**
	 * Takes a string of text and ensures that it wraps / truncates to fit within the given width
	 */
	wrapText(text, width, isSelected = false) {
		if (isSelected) {
			text = `[${text}]`
		}
		const words = text.split(' ')
		let lines = []
		let currentLine = ''

		for (let word of words) {
			if ((currentLine.length + word.length + 1) > width) {
				if (currentLine.length === 0) {
					lines.push(word.slice(0, width - 1) + '…')
				} else {
					lines.push(currentLine.trim())
					currentLine = word + ' '
				}
			} else {
				currentLine += word + ' '
			}
		}

		if (currentLine.trim().length > 0) {
			lines.push(currentLine.trim())
		}

		return lines
	}

}

module.exports = Table