# terminal-quizzer

**A beautiful, modern, promise-based Node.js CLI framework with full backward compatibility**

[![npm version](https://badge.fury.io/js/terminal-quizzer.svg)](https://badge.fury.io/js/terminal-quizzer)
[![License: ISC](https://img.shields.io/badge/License-ISC-blue.svg)](https://opensource.org/licenses/ISC)
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D12.0.0-brightgreen)](https://nodejs.org/)

## ✨ What's New in v2

Node-Quizzer v2 introduces powerful modern features while maintaining **100% backward compatibility** with existing v1.x code:

- 🎨 **Beautiful styling** with themes and gradients
- 📝 **Modern prompt types** (multiselect, password, number, form)
- ✅ **Built-in validation** and transformation
- 📊 **Advanced tables** with sorting, filtering, and pagination
- 🎭 **Progress bars** and spinners
- 🖼️ **Rich visual elements** with icons and borders
- 🔄 **Full backward compatibility** - your existing code works unchanged!

## 🚀 Quick Start

### Installation

```bash
npm install terminal-quizzer
```

### Basic Example

```javascript
const { Questioner } = require('terminal-quizzer');

const questioner = new Questioner({
    theme: 'dark',
    icons: true
});

async function example() {
    // Input with validation
    const name = await questioner.input({
        message: 'What is your name?',
        validate: (value) => value.length > 0 || 'Name is required'
    });

    // Multi-select with checkboxes
    const skills = await questioner.multiselect({
        message: 'Select your skills:',
        choices: [
            { name: 'JavaScript', value: 'js' },
            { name: 'Python', value: 'python' },
            { name: 'Go', value: 'go' }
        ]
    });

    // Confirmation
    const deploy = await questioner.confirm({
        message: 'Deploy to production?',
        default: false
    });

    console.log({ name, skills, deploy });
}

example();
```

### Legacy Example (100% Compatible)

```javascript
// Your existing v1.x code works exactly the same!
const { Questioner, Quizzer } = require('terminal-quizzer');

class MyQuiz {
    constructor() {
        this.questioner = new Questioner();
        this.quizzer = new Quizzer(this);
        this.stages = {
            'start': () => this.askName()
        };
    }

    async askName() {
        const name = await this.questioner.askQuestion('What is your name?');
        console.log(`Hello, ${name}!`);
        this.quizzer.end();
    }

    init() {
        return this.quizzer.start();
    }
}

new MyQuiz().init();
```

## 📚 Features

### 🎨 Styling & Theming

```javascript
const questioner = new Questioner({
    theme: 'dark', // 'default', 'dark', 'light'
    icons: true,   // Beautiful Unicode icons
    animations: true // Smooth animations
});

// Gradient text
console.log(questioner.styling.gradient('Rainbow Text!', ['#ff0000', '#00ff00', '#0000ff']));

// Styled boxes
console.log(questioner.styling.createBox('Important Message', {
    style: 'double',
    borderColor: '#ffd700',
    padding: 2
}));
```

### 📝 Modern Prompt Types

#### Input
```javascript
const email = await questioner.input({
    message: 'Enter your email:',
    placeholder: 'user@example.com',
    validate: (value) => {
        return /\S+@\S+\.\S+/.test(value) || 'Please enter a valid email';
    },
    transform: (value) => value.toLowerCase(),
    required: true
});
```

#### Password Input
```javascript
const password = await questioner.password({
    message: 'Enter password:',
    mask: '*',
    validate: (value) => value.length >= 6 || 'Password must be at least 6 characters'
});
```

#### Number Input
```javascript
const age = await questioner.number({
    message: 'Enter your age:',
    min: 18,
    max: 100,
    float: false
});
```

#### Multi-Select
```javascript
const technologies = await questioner.multiselect({
    message: 'Select technologies you use:',
    choices: [
        { name: 'React', value: 'react' },
        { name: 'Vue.js', value: 'vue' },
        { name: 'Angular', value: 'angular' },
        { name: 'Svelte', value: 'svelte' }
    ],
    min: 1, // Minimum selections required
    max: 3  // Maximum selections allowed
});
```

#### Select
```javascript
const framework = await questioner.select({
    message: 'Choose your preferred framework:',
    choices: [
        { name: 'React', value: 'react' },
        { name: 'Vue.js', value: 'vue' },
        { name: 'Angular', value: 'angular' }
    ],
    searchable: true // Enable search functionality
});
```

#### Confirmation
```javascript
const confirmed = await questioner.confirm({
    message: 'Are you sure?',
    default: true
});
```

### 📄 Forms

Collect multiple related fields in one go:

```javascript
const userData = await questioner.form({
    title: '👤 User Registration',
    fields: [
        {
            name: 'name',
            label: 'Full Name:',
            type: 'input',
            required: true
        },
        {
            name: 'email',
            label: 'Email Address:',
            type: 'input',
            validate: (value) => /\S+@\S+\.\S+/.test(value) || 'Invalid email'
        },
        {
            name: 'age',
            label: 'Age:',
            type: 'number',
            min: 18,
            max: 120
        },
        {
            name: 'skills',
            label: 'Programming Skills:',
            type: 'multiselect',
            choices: [
                { name: 'JavaScript', value: 'js' },
                { name: 'Python', value: 'python' },
                { name: 'Java', value: 'java' }
            ]
        },
        {
            name: 'newsletter',
            label: 'Subscribe to newsletter?',
            type: 'confirm',
            default: false
        }
    ]
});
```

### 📊 Tables

Create beautiful, interactive tables:

```javascript
const { Table } = require('terminal-quizzer');

const table = new Table({
    theme: 'dark',
    borderStyle: 'rounded', // 'single', 'double', 'rounded', 'thick'
    alternateRows: true,
    sortable: true
});

table
    .setTitle('📊 Sales Report')
    .setColumns([
        { name: 'product', label: 'Product', width: 20, align: 'left' },
        { name: 'sales', label: 'Sales', width: 10, align: 'right' },
        {
            name: 'revenue',
            label: 'Revenue',
            width: 12,
            align: 'right',
            formatter: (value) => '$' + value.toLocaleString()
        }
    ])
    .setRows([
        { product: 'Widget A', sales: 150, revenue: 15000 },
        { product: 'Widget B', sales: 200, revenue: 25000 },
        { product: 'Widget C', sales: 75, revenue: 9000 }
    ])
    .sort('revenue', 'desc')
    .render();
```

### 🎭 Progress & Loading

#### Progress Bars
```javascript
const progress = questioner.showProgress(100, 'Processing files...');

for (let i = 0; i <= 100; i += 10) {
    await new Promise(resolve => setTimeout(resolve, 200));
    progress.increment(10);
}
```

#### Spinners
```javascript
await questioner.showSpinner('Loading data...', 3000);
```

## 🎨 Themes

Choose from built-in themes or create custom ones:

```javascript
// Built-in themes
const questioner = new Questioner({ theme: 'dark' });

// Custom theme
questioner.styling.setTheme('custom');
questioner.styling.themes.custom = {
    primary: '#ff6b6b',
    secondary: '#4ecdc4',
    success: '#45b7d1',
    warning: '#ffa726',
    error: '#ef5350',
    info: '#42a5f5',
    muted: '#78909c',
    background: '#263238',
    text: '#eceff1',
    border: '#546e7a'
};
```

## 🔄 Migration from v1.x

**Zero code changes required!** Your existing code continues to work:

```javascript
// v1.x code (still works in v2.x)
const { Questioner } = require('terminal-quizzer');
const questioner = new Questioner();

const name = await questioner.askQuestion('What is your name?');
const tasks = await questioner.askMultilineQuestion('Your tasks:', ' - ');
const choice = await questioner.showMenu('Choose:', { a: 'Option A', b: 'Option B' });
```

For new features, use the updated API:

```javascript
// v2.x updated features
const { Questioner } = require('terminal-quizzer');
const questioner = new Questioner({ theme: 'dark' });

const email = await questioner.input({
    message: 'Email:',
    validate: (v) => v.includes('@') || 'Invalid email'
});
```

## 📦 API Reference

### Questioner

| Method | Description | Returns |
|--------|-------------|---------|
| `input(options)` | Text input with validation | `Promise<string>` |
| `password(options)` | Hidden password input | `Promise<string>` |
| `number(options)` | Numeric input with range validation | `Promise<number>` |
| `select(options)` | Single choice selection | `Promise<any>` |
| `multiselect(options)` | Multiple choice selection | `Promise<array>` |
| `confirm(options)` | Yes/No confirmation | `Promise<boolean>` |
| `form(options)` | Multi-field form | `Promise<object>` |
| `showProgress(total, message)` | Progress bar | `ProgressBar` |
| `showSpinner(message, duration)` | Loading spinner | `Promise<void>` |

### Backward Compatible Methods

| Method | Description | Returns |
|--------|-------------|---------|
| `askQuestion(question, color)` | Basic question (v1.x compatible) | `Promise<string>` |
| `askMultilineQuestion(question, prefix, color)` | Multi-line input (v1.x compatible) | `Promise<string>` |
| `showMenu(question, options, title, color)` | Menu selection (v1.x compatible) | `Promise<string>` |
| `showYesNoMenu(question, title, color)` | Yes/No menu (v1.x compatible) | `Promise<string>` |

### Table

| Method | Description | Returns |
|--------|-------------|---------|
| `setTitle(title)` | Set table title | `this` |
| `setColumns(columns)` | Define columns | `this` |
| `setRows(rows)` | Set table data | `this` |
| `sort(column, direction)` | Sort by column | `this` |
| `filter(column, value)` | Filter rows | `this` |
| `render(options)` | Display table | `this` |
| `toCSV()` | Export as CSV | `string` |
| `toJSON()` | Export as JSON | `object` |

## 🎯 Examples

Check out the comprehensive examples:

```bash
# Run the demo
npm run demo
```

## 📖 Documentation

- This README contains the core usage and API reference for v2.x.
- See example.js for a full, runnable demo: npm run demo
- Legacy-compatible flow is demonstrated in the README and supported by the same Questioner class.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the ISC License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Inspired by modern CLI tools like Inquirer.js, Prompts, and Enquirer

---

**Node-Quizzer** - Making CLI interfaces beautiful and interactive! 🚀