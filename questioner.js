/**
 * Questioner
 *
 * Modern, promise-based CLI prompt utilities with theming, icons and
 * full backward-compatibility for v1.
 */
const readline = require('readline');
const Styling = require('./UI/Styling');

class Questioner {
    /**
     * Create a Questioner.
     * @param {object} [options]
     * @param {'default'|'dark'|'light'|string} [options.theme='default'] - Theme name to use.
     * @param {boolean} [options.animations=true] - Enable spinner/animation helpers.
     * @param {boolean} [options.icons=true] - Show unicode icons where applicable.
     * @param {boolean} [options.colors=true] - Enable colored output.
     * @param {boolean} [options.fallbackMode=false] - Reserved for reduced-capability terminals.
     */
    constructor(options = {}) {
        // Initialize with backward compatibility
        this.styling = new Styling();
        this.rl = null;

        // Theme and styling options
        this.theme = options.theme || 'default';
        this.styling.setTheme(this.theme);

        this.config = {
            enableAnimations: options.animations !== false,
            enableIcons: options.icons !== false,
            enableColors: options.colors !== false,
            fallbackMode: options.fallbackMode || false,
            ...options
        };

        // Terminal capability detection
        this.capabilities = this.detectTerminalCapabilities();

        // Backward compatibility properties
        this.NORMAL = '\x1b[0m';
        this.GREEN = '\x1b[32;01m';
        this.CYAN = '\x1b[0;36m';
        this.RED = '\x1b[0;31m';
        this.defaultResponsePrefix = '\n';
        this.promptPrefix = '> ';
        this.menuResolver = null;

        // Hidden input tracking for password fields
        this.hiddenInput = '';
    }

    /**
     * Inspect the current TTY/terminal to enable graceful feature toggles.
     * @returns {{supportsColor:boolean,supportsUnicode:boolean,supportsAnsi:boolean,terminalWidth:number,terminalHeight:number}}
     */
    detectTerminalCapabilities() {
        const term = process.env.TERM || '';
        const colorterm = process.env.COLORTERM || '';

        return {
            supportsColor: process.stdout.isTTY && (term.includes('color') || colorterm),
            supportsUnicode: process.env.LANG && process.env.LANG.includes('UTF'),
            supportsAnsi: process.stdout.isTTY,
            terminalWidth: process.stdout.columns || 80,
            terminalHeight: process.stdout.rows || 24
        };
    }

    // ============================================
    // BACKWARD COMPATIBILITY METHODS
    // ============================================

    /**
     * Ask a simple text question (legacy-friendly wrapper around input()).
     * @param {string} question - Prompt message.
     * @param {string} [colour] - ANSI color escape for legacy usage.
     * @returns {Promise<string>} Resolves to the entered text.
     */
    askQuestion(question, colour = this.GREEN) {
        return this.input({
            message: question,
            style: { color: colour }
        });
    }

    /**
     * Ask for multiple lines until the user types 'Q'.
     * @param {string} question - Prompt message.
     * @param {string} [responsePrefix='\n'] - Prefix added before each collected line.
     * @param {string} [colour] - ANSI color escape for legacy usage.
     * @returns {Promise<string>} Combined text with prefixes and newlines.
     */
    askMultilineQuestion(question, responsePrefix = this.defaultResponsePrefix, colour = this.GREEN) {
        return this.multiline({
            message: question,
            prefix: responsePrefix,
            style: { color: colour }
        });
    }

    /**
     * Show a legacy menu based on an object map.
     * @param {string} question - Prompt message.
     * @param {Object.<string,string>} options - key/value pairs for value/name.
     * @param {string|null} [title]
     * @param {string} [colour]
     * @returns {Promise<string|null>} Selected value (key) or null if cancelled.
     */
    showMenu(question, options, title = null, colour = this.GREEN) {
        const choices = Object.entries(options).map(([key, value]) => ({
            name: value,
            value: key
        }));

        return this.select({
            message: question,
            choices: choices,
            title: title,
            style: { color: colour }
        });
    }

    /**
     * Show a yes/no prompt compatible with legacy API.
     * @param {string} question
     * @param {string|null} [title]
     * @param {string} [colour]
     * @returns {Promise<boolean>} true for yes, false for no.
     */
    showYesNoMenu(question, title = null, colour = this.GREEN) {
        return this.confirm({
            message: question,
            title: title,
            style: { color: colour }
        });
    }

    showTable(columns = [], rows = [], selectedTask = null, title = null) {
        const Table = require('./UI/table');
        const table = new Table({ theme: this.theme });
        table
            .setTitle(title)
            .setColumns(columns)
            .setSelectedRow(selectedTask)
            .setRows(rows)
            .render();
    }

    showTableMenu(question, columns, rows) {
        const Table = require('./UI/table');
        const table = new Table({ theme: this.theme });
        return table
            .setTitle(question)
            .setColumns(columns)
            .setRows(rows)
            .showTableMenu();
    }

    /**
     * Prompt for a single-line input.
     * @param {object} [options]
     * @param {string} [options.message='Enter value:']
     * @param {string} [options.default]
     * @param {string} [options.placeholder]
     * @param {(value:string)=>true|string|Promise<true|string>} [options.validate]
     * @param {(value:string)=>any} [options.transform]
     * @param {object} [options.style]
     * @param {boolean} [options.required=false]
     * @returns {Promise<any>} The final (possibly transformed) value.
     */
    async input(options = {}) {
        const config = {
            message: options.message || 'Enter value:',
            default: options.default,
            placeholder: options.placeholder,
            validate: options.validate,
            transform: options.transform,
            style: options.style || {},
            required: options.required || false,
            ...options
        };

        return new Promise((resolve, reject) => {
            this.startReadline();

            const theme = this.styling.getTheme();
            const icon = this.config.enableIcons ? this.styling.icons.question + ' ' : '';
            const styledMessage = this.config.enableColors ?
                this.styling.hex(theme.primary)(config.message) : config.message;

            const prompt = icon + styledMessage;
            if (config.placeholder) {
                console.log(this.styling.hex(theme.muted)(`(${config.placeholder})`));
            }

            this.rl.question(prompt + ' ', async (answer) => {
                try {
                    // Apply default value
                    if (!answer && config.default !== undefined) {
                        answer = config.default;
                    }

                    // Validation
                    if (config.required && !answer) {
                        console.log(this.styling.hex(theme.error)('❌ This field is required'));
                        this.closeReadline();
                        return resolve(await this.input(config));
                    }

                    if (config.validate && typeof config.validate === 'function') {
                        const validationResult = await config.validate(answer);
                        if (validationResult !== true) {
                            console.log(this.styling.hex(theme.error)('❌ ' + validationResult));
                            this.closeReadline();
                            return resolve(await this.input(config));
                        }
                    }

                    // Transform
                    if (config.transform && typeof config.transform === 'function') {
                        answer = config.transform(answer);
                    }

                    this.closeReadline();
                    resolve(answer);
                } catch (error) {
                    this.closeReadline();
                    reject(error);
                }
            });
        });
    }

    /**
     * Collect multiple lines until the user types 'Q' (case-sensitive).
     * @param {object} [options]
     * @param {string} [options.message]
     * @param {string} [options.prefix='\n'] - Prefix printed before each captured line.
     * @param {object} [options.style]
     * @returns {Promise<string>} Concatenated lines including prefixes and newlines.
     */
    async multiline(options = {}) {
        const config = {
            message: options.message || "Enter multiple lines (Q to finish):",
            prefix: options.prefix || this.defaultResponsePrefix,
            style: options.style || {},
            ...options
        };

        return new Promise((resolve, reject) => {
            this.startReadline();
            const theme = this.styling.getTheme();
            const icon = this.config.enableIcons ? this.styling.icons.question + ' ' : '';
            const styledMessage = this.config.enableColors ?
                this.styling.hex(theme.primary)(config.message) : config.message;

            console.log(icon + styledMessage);
            console.log(this.styling.hex(theme.muted)("['Q' to finish]"));

            this.getMultilineInput(config.prefix, "", resolve, reject);
        });
    }

    /**
     * Internal helper to recursively collect multiline input.
     * @private
     */
    getMultilineInput(responsePrefix, response, resolve, reject) {
        // ask for the user's input
        this.rl.question(this.promptPrefix, (answer) => {
            if (answer === "Q") {
                // close readline
                this.closeReadline();
                // if the user entered 'Q' then resolve the question with the response we already have
                resolve(response);
            } else {
                // otherwise append the answer to the response
                response += responsePrefix + answer + "\n";
                // now run this method again using the updated response string
                this.getMultilineInput(responsePrefix, response, resolve, reject);
            }
        });
    }

    /**
     * Hidden password input with masking and validation.
     * @param {object} [options]
     * @param {string} [options.message='Enter password:']
     * @param {string} [options.mask='*'] - Character to echo for each typed char.
     * @param {(value:string)=>true|string} [options.validate]
     * @param {boolean} [options.required=true]
     * @returns {Promise<string>} The entered password.
     */
    async password(options = {}) {
        const config = {
            message: options.message || 'Enter password:',
            mask: options.mask || '*',
            validate: options.validate,
            required: options.required !== false,
            ...options
        };

        return new Promise((resolve, reject) => {
            const theme = this.styling.getTheme();
            const icon = this.config.enableIcons ? '🔒 ' : '';
            const styledMessage = this.config.enableColors ?
                this.styling.hex(theme.primary)(config.message) : config.message;

            process.stdout.write(icon + styledMessage + ' ');

            this.startReadline();
            readline.emitKeypressEvents(process.stdin, this.rl);

            if (process.stdin.isTTY) {
                process.stdin.setRawMode(true);
            }

            this.hiddenInput = '';

            const keyPressHandler = (char, key) => {
                if (key && key.ctrl && key.name === 'c') {
                    process.exit();
                }

                if (key && key.name === 'return') {
                    process.stdout.write('\n');
                    this.rl.input.off('keypress', keyPressHandler);
                    if (process.stdin.isTTY) {
                        process.stdin.setRawMode(false);
                    }
                    this.closeReadline();

                    // Validate password
                    if (config.required && !this.hiddenInput) {
                        console.log(this.styling.hex(theme.error)('❌ Password is required'));
                        return resolve(this.password(config));
                    }

                    if (config.validate && typeof config.validate === 'function') {
                        const validationResult = config.validate(this.hiddenInput);
                        if (validationResult !== true) {
                            console.log(this.styling.hex(theme.error)('❌ ' + validationResult));
                            return resolve(this.password(config));
                        }
                    }

                    resolve(this.hiddenInput);
                    return;
                }

                if (key && key.name === 'backspace') {
                    if (this.hiddenInput.length > 0) {
                        this.hiddenInput = this.hiddenInput.slice(0, -1);
                        process.stdout.write('\b \b');
                    }
                    return;
                }

                if (char) {
                    this.hiddenInput += char;
                    process.stdout.write(config.mask);
                }
            };

            this.rl.input.on('keypress', keyPressHandler);
        });
    }

    /**
     * Numeric input with optional min/max and integer/float parsing.
     * @param {object} [options]
     * @param {string} [options.message='Enter number:']
     * @param {number} [options.min]
     * @param {number} [options.max]
     * @param {boolean} [options.float=false] - Parse as float instead of integer.
     * @param {(value:number)=>true|string} [options.validate]
     * @returns {Promise<number>} The parsed number.
     */
    async number(options = {}) {
        const config = {
            message: options.message || 'Enter number:',
            min: options.min,
            max: options.max,
            float: options.float || false,
            validate: options.validate,
            ...options
        };

        config.validate = (value) => {
            const num = config.float ? parseFloat(value) : parseInt(value);

            if (isNaN(num)) {
                return 'Please enter a valid number';
            }

            if (config.min !== undefined && num < config.min) {
                return `Number must be at least ${config.min}`;
            }

            if (config.max !== undefined && num > config.max) {
                return `Number must be at most ${config.max}`;
            }

            if (options.validate) {
                return options.validate(num);
            }

            return true;
        };

        config.transform = (value) => {
            return config.float ? parseFloat(value) : parseInt(value);
        };

        return this.input(config);
    }

    /**
     * Select a single option from a list. Supports optional search.
     * @param {object} [options]
     * @param {string} [options.message='Select an option:']
     * @param {{name:string,value?:any}[]} [options.choices=[]]
     * @param {any} [options.default]
     * @param {boolean} [options.searchable=false]
     * @param {number} [options.pageSize=10]
     * @returns {Promise<any|null>} The selected value (or name) or null if cancelled.
     */
    async select(options = {}) {
        const config = {
            message: options.message || 'Select an option:',
            choices: options.choices || [],
            default: options.default,
            searchable: options.searchable || false,
            pageSize: options.pageSize || 10,
            ...options
        };

        if (config.searchable) {
            return this.searchableSelect(config);
        }

        return new Promise((resolve) => {
            const theme = this.styling.getTheme();
            let selectedIndex = 0;
            const choices = config.choices;

            const render = () => {
                console.clear();

                if (config.title) {
                    console.log(this.styling.createBox(config.title, {
                        style: 'rounded',
                        borderColor: theme.primary,
                        padding: 1
                    }));
                    console.log();
                }

                const icon = this.config.enableIcons ? this.styling.icons.question + ' ' : '';
                console.log(this.styling.hex(theme.primary)(icon + config.message));
                console.log();

                choices.forEach((choice, index) => {
                    const isSelected = index === selectedIndex;
                    const cursor = isSelected ? '→ ' : '  ';
                    const color = isSelected ? theme.primary : theme.text;

                    let display = cursor + choice.name;
                    if (isSelected) {
                        display = this.styling.hex(color).bold(display);
                    } else {
                        display = this.styling.hex(color)(display);
                    }

                    console.log(display);
                });

                console.log();
                console.log(this.styling.hex(theme.muted)('Use ↑/↓ to navigate, Enter to select'));
            };

            render();
            this.startReadline();
            readline.emitKeypressEvents(process.stdin, this.rl);

            if (process.stdin.isTTY) {
                process.stdin.setRawMode(true);
            }

            const keyPressHandler = (char, key) => {
                switch (key?.name) {
                    case 'up':
                        selectedIndex = selectedIndex > 0 ? selectedIndex - 1 : choices.length - 1;
                        render();
                        break;
                    case 'down':
                        selectedIndex = selectedIndex < choices.length - 1 ? selectedIndex + 1 : 0;
                        render();
                        break;
                    case 'return':
                        this.rl.input.removeAllListeners('keypress');
                        if (process.stdin.isTTY) {
                            process.stdin.setRawMode(false);
                        }
                        this.closeReadline();
                        resolve(choices[selectedIndex].value || choices[selectedIndex].name);
                        break;
                    case 'escape':
                    case 'q':
                        this.rl.input.removeAllListeners('keypress');
                        if (process.stdin.isTTY) {
                            process.stdin.setRawMode(false);
                        }
                        this.closeReadline();
                        resolve(null);
                        break;
                }
            };

            this.rl.input.on('keypress', keyPressHandler);
        });
    }

    /**
     * Internal implementation of the searchable variant of select().
     * @private
     */
    // Searchable select implementation
    async searchableSelect(config) {
        return new Promise((resolve) => {
            const theme = this.styling.getTheme();
            let selectedIndex = 0;
            let query = '';
            const allChoices = config.choices;

            const getFiltered = () => {
                if (!query) return allChoices;
                const q = query.toLowerCase();
                return allChoices.filter(c => String(c.name).toLowerCase().includes(q));
            };

            const render = () => {
                console.clear();

                if (config.title) {
                    console.log(this.styling.createBox(config.title, {
                        style: 'rounded',
                        borderColor: theme.primary,
                        padding: 1
                    }));
                    console.log();
                }

                const icon = this.config.enableIcons ? this.styling.icons.question + ' ' : '';
                console.log(this.styling.hex(theme.primary)(icon + (config.message || 'Select an option:')));
                console.log(this.styling.hex(theme.muted)('Type to search, ↑/↓ navigate, Enter select, Esc cancel'));
                console.log(this.styling.hex(theme.info)(`Search: ${query || ''}`));
                console.log();

                const filtered = getFiltered();
                if (filtered.length === 0) {
                    console.log(this.styling.hex(theme.muted)('No matches'));
                }

                filtered.slice(0, config.pageSize || 10).forEach((choice, index) => {
                    const isSelected = index === selectedIndex;
                    const cursor = isSelected ? '→ ' : '  ';
                    const color = isSelected ? theme.primary : theme.text;

                    let display = cursor + choice.name;
                    display = isSelected ? this.styling.hex(color).bold(display) : this.styling.hex(color)(display);
                    console.log(display);
                });
            };

            render();
            this.startReadline();
            readline.emitKeypressEvents(process.stdin, this.rl);
            if (process.stdin.isTTY) {
                process.stdin.setRawMode(true);
            }

            const keyPressHandler = (char, key) => {
                const filtered = getFiltered();
                switch (key?.name) {
                    case 'up':
                        selectedIndex = selectedIndex > 0 ? selectedIndex - 1 : Math.max(0, filtered.length - 1);
                        render();
                        break;
                    case 'down':
                        selectedIndex = selectedIndex < Math.max(0, filtered.length - 1) ? selectedIndex + 1 : 0;
                        render();
                        break;
                    case 'backspace':
                        query = query.slice(0, -1);
                        selectedIndex = 0;
                        render();
                        break;
                    case 'escape':
                    case 'q':
                        this.rl.input.removeAllListeners('keypress');
                        if (process.stdin.isTTY) process.stdin.setRawMode(false);
                        this.closeReadline();
                        resolve(null);
                        break;
                    case 'return':
                        const finalChoices = getFiltered();
                        const choice = finalChoices[selectedIndex];
                        this.rl.input.removeAllListeners('keypress');
                        if (process.stdin.isTTY) process.stdin.setRawMode(false);
                        this.closeReadline();
                        resolve(choice ? (choice.value ?? choice.name) : null);
                        break;
                    default:
                        if (char && char.length === 1 && !key?.ctrl && !key?.meta) {
                            query += char;
                            selectedIndex = 0;
                            render();
                        }
                }
            };

            this.rl.input.on('keypress', keyPressHandler);
        });
    }

    /**
     * Choose multiple options via space to toggle and enter to confirm.
     * @param {object} [options]
     * @param {string} [options.message]
     * @param {{name:string,value?:any,checked?:boolean}[]} [options.choices=[]]
     * @param {(selected:any[])=>true|string} [options.validate]
     * @param {number} [options.min=0]
     * @param {number} [options.max]
     * @returns {Promise<any[]>} Array of selected values or names.
     */
    async multiselect(options = {}) {
        const config = {
            message: options.message || 'Select options (space to toggle, enter to confirm):',
            choices: options.choices || [],
            validate: options.validate,
            min: options.min || 0,
            max: options.max,
            ...options
        };

        return new Promise((resolve, reject) => {
            const theme = this.styling.getTheme();
            let selectedIndex = 0;
            const choices = config.choices.map(choice => ({
                ...choice,
                checked: choice.checked || false
            }));

            const render = () => {
                console.clear();

                const icon = this.config.enableIcons ? this.styling.icons.question + ' ' : '';
                console.log(this.styling.hex(theme.primary)(icon + config.message));
                console.log();

                choices.forEach((choice, index) => {
                    const isSelected = index === selectedIndex;
                    const cursor = isSelected ? '→ ' : '  ';
                    const checkbox = choice.checked ?
                        this.styling.icons.checked : this.styling.icons.unchecked;
                    const color = isSelected ? theme.primary : theme.text;

                    let display = cursor + checkbox + ' ' + choice.name;
                    if (isSelected) {
                        display = this.styling.hex(color).bold(display);
                    } else {
                        display = this.styling.hex(color)(display);
                    }

                    console.log(display);
                });

                const selectedCount = choices.filter(c => c.checked).length;
                console.log();
                console.log(this.styling.hex(theme.muted)(`Selected: ${selectedCount}`));
                console.log(this.styling.hex(theme.muted)('Use ↑/↓ to navigate, Space to toggle, Enter to confirm'));
            };

            render();
            this.startReadline();
            readline.emitKeypressEvents(process.stdin, this.rl);

            if (process.stdin.isTTY) {
                process.stdin.setRawMode(true);
            }

            const keyPressHandler = (char, key) => {
                switch (key?.name) {
                    case 'up':
                        selectedIndex = selectedIndex > 0 ? selectedIndex - 1 : choices.length - 1;
                        render();
                        break;
                    case 'down':
                        selectedIndex = selectedIndex < choices.length - 1 ? selectedIndex + 1 : 0;
                        render();
                        break;
                    case 'space':
                        choices[selectedIndex].checked = !choices[selectedIndex].checked;
                        render();
                        break;
                    case 'return':
                        const selected = choices.filter(c => c.checked);

                        // Validation
                        if (selected.length < config.min) {
                            console.log(this.styling.hex(theme.error)(`Please select at least ${config.min} options`));
                            setTimeout(render, 1500);
                            return;
                        }

                        if (config.max && selected.length > config.max) {
                            console.log(this.styling.hex(theme.error)(`Please select at most ${config.max} options`));
                            setTimeout(render, 1500);
                            return;
                        }

                        this.rl.input.removeAllListeners('keypress');
                        if (process.stdin.isTTY) {
                            process.stdin.setRawMode(false);
                        }
                        this.closeReadline();
                        resolve(selected.map(choice => choice.value || choice.name));
                        break;
                    case 'escape':
                        this.rl.input.removeAllListeners('keypress');
                        if (process.stdin.isTTY) {
                            process.stdin.setRawMode(false);
                        }
                        this.closeReadline();
                        resolve([]);
                        break;
                }
            };

            this.rl.input.on('keypress', keyPressHandler);
        });
    }

    /**
     * Ask for a yes/no confirmation.
     * @param {object} [options]
     * @param {string} [options.message='Confirm?']
     * @param {boolean} [options.default=true]
     * @returns {Promise<boolean>} true for yes, false for no.
     */
    async confirm(options = {}) {
        const config = {
            message: options.message || 'Confirm?',
            default: options.default !== undefined ? options.default : true,
            ...options
        };

        const theme = this.styling.getTheme();
        const defaultText = config.default ? '[Y/n]' : '[y/N]';

        const answer = await this.input({
            message: config.message + ' ' + this.styling.hex(theme.muted)(defaultText),
            validate: (value) => {
                const lower = value.toLowerCase();
                if (value === '' || ['y', 'yes', 'n', 'no'].includes(lower)) {
                    return true;
                }
                return 'Please enter y/yes or n/no';
            },
            transform: (value) => {
                if (value === '') return config.default;
                const lower = value.toLowerCase();
                return ['y', 'yes'].includes(lower);
            }
        });

        return answer;
    }

    /**
     * Run a multi-field form by prompting each field in order.
     * @param {object} [options]
     * @param {string} [options.title]
     * @param {{name:string,label?:string,type?:'input'|'password'|'number'|'confirm'|'select'|'multiselect',choices?:Array,min?:number,max?:number,validate?:Function,required?:boolean}[]} [options.fields=[]]
     * @returns {Promise<object>} Object keyed by field.name with entered values.
     */
    async form(options = {}) {
        const config = {
            title: options.title || 'Form',
            fields: options.fields || [],
            ...options
        };

        const theme = this.styling.getTheme();
        const results = {};

        if (config.title) {
            console.log(this.styling.createBox(config.title, {
                style: 'double',
                borderColor: theme.primary,
                padding: 1
            }));
            console.log();
        }

        for (const field of config.fields) {
            const fieldConfig = {
                message: field.label || field.name,
                ...field
            };

            let value;
            switch (field.type) {
                case 'password':
                    value = await this.password(fieldConfig);
                    break;
                case 'number':
                    value = await this.number(fieldConfig);
                    break;
                case 'confirm':
                    value = await this.confirm(fieldConfig);
                    break;
                case 'select':
                    value = await this.select(fieldConfig);
                    break;
                case 'multiselect':
                    value = await this.multiselect(fieldConfig);
                    break;
                default:
                    value = await this.input(fieldConfig);
            }

            results[field.name] = value;
            console.log(); // Add spacing between fields
        }

        return results;
    }

    // ============================================
    // UTILITY METHODS
    // ============================================

    /**
     * Lazily create the readline interface if not already created.
     * @private
     */
    startReadline() {
        if (!this.rl) {
            this.rl = readline.createInterface({
                input: process.stdin,
                output: process.stdout
            });
        }
    }

    /**
     * Close and reset the readline interface if open.
     * @private
     */
    closeReadline() {
        if (this.rl) {
            this.rl.close();
            this.rl = null;
        }
    }

    // Visual components
    /**
     * Display a spinner for a fixed duration.
     * @param {string} message - Message to show alongside spinner.
     * @param {number} [duration=2000] - Duration in ms.
     * @returns {Promise<void>} Resolves when complete.
     */
    showSpinner(message, duration = 2000) {
        return new Promise((resolve) => {
            const spinner = this.styling.spinners.dots;
            let i = 0;

            const interval = setInterval(() => {
                process.stdout.write('\r' + spinner.frames[i % spinner.frames.length] + ' ' + message);
                i++;
            }, spinner.interval);

            setTimeout(() => {
                clearInterval(interval);
                process.stdout.write('\r✅ ' + message + ' - Complete!\n');
                resolve();
            }, duration);
        });
    }

    /**
     * Create a progress reporter with increment() and complete().
     * @param {number} total - Total units of work.
     * @param {string} [message='Processing...'] - Message prefix.
     * @returns {{increment:(amount?:number)=>void, complete:()=>void}}
     */
    showProgress(total, message = 'Processing...') {
        const theme = this.styling.getTheme();
        let current = 0;

        return {
            increment: (amount = 1) => {
                current += amount;
                const progress = this.styling.createProgressBar(current, total, {
                    color: theme.success,
                    showPercentage: true,
                    showFraction: true
                });
                process.stdout.write('\r' + message + ' ' + progress);

                if (current >= total) {
                    process.stdout.write('\n');
                }
            },
            complete: () => {
                current = total;
                const progress = this.styling.createProgressBar(current, total, {
                    color: theme.success,
                    showPercentage: true,
                    showFraction: true
                });
                process.stdout.write('\r✅ ' + message + ' ' + progress + '\n');
            }
        };
    }
}

module.exports = Questioner