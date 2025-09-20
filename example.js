const { Questioner, Table, Quizzer } = require('./exports');

/**
 * Shows legacy compatibility and modern features in a simple flow.
 */
class ModernQuizExample {
    constructor() {
        this.questioner = new Questioner({
            theme: 'dark',
            animations: true,
            icons: true
        });

        // For backward compatibility demo
        this.quizzer = new Quizzer(this);
        this.stages = {
            'welcome': () => this.stageWelcome(),
            'compatibility': () => this.stageCompatibility(),
            'modern': () => this.stageModern(),
            'table': () => this.stageTable(),
            'form': () => this.stageForm(),
            'final': () => this.stageFinal()
        };

        this.userData = {};
    }

    async init() {
        console.clear();
        console.log(this.questioner.styling.gradient(
            '🚀 Welcome to Enhanced Node-Quizzer!',
            ['#ff6b6b', '#4ecdc4', '#45b7d1']
        ));
        console.log();

        return this.quizzer.start();
    }

    async stageWelcome() {
        console.log(this.questioner.styling.createBox(
            'Node-Quizzer Demo\n\nThis demo showcases both backward compatibility\nand new features!',
            {
                style: 'double',
                borderColor: '#00d4aa',
                padding: 2,
                title: '✨ Welcome ✨'
            }
        ));
        console.log();

        const proceed = await this.questioner.confirm({
            message: 'Ready to explore the new features?',
            default: true
        });

        if (proceed) {
            this.quizzer.runStage('compatibility');
        } else {
            this.quizzer.runStage('final');
        }
    }

    async stageCompatibility() {
        console.clear();
        console.log(this.questioner.styling.hex('#ffd700').bold('📋 Backward Compatibility Demo'));
        console.log(this.questioner.styling.hex('#888888')('Using original API methods...'));
        console.log();

        // Original API still works!
        const name = await this.questioner.askQuestion('What is your name?', this.questioner.GREEN);
        this.userData.name = name;

        const tasks = await this.questioner.askMultilineQuestion(
            'What are your favorite programming languages?',
            ' • '
        );
        this.userData.languages = tasks;

        const framework = await this.questioner.showMenu(
            'Choose your preferred framework:',
            {
                'react': 'React',
                'vue': 'Vue.js',
                'angular': 'Angular',
                'svelte': 'Svelte'
            },
            'Framework Selection'
        );
        this.userData.framework = framework;

        console.log();
        console.log(this.questioner.styling.hex('#00ff7f')('✅ Backward compatibility maintained!'));
        console.log();

        // Continue seamlessly into the modern features demo
        this.quizzer.runStage('modern');
    }

    async stageModern() {
        console.clear();
        console.log(this.questioner.styling.gradient(
            '🎨 Modern Features Demo',
            ['#6b73ff', '#9b59b6', '#3498db']
        ));
        console.log();

        // input with validation
        const email = await this.questioner.input({
            message: 'Enter your email:',
            placeholder: 'user@example.com',
            validate: (value) => {
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                return emailRegex.test(value) || 'Please enter a valid email address';
            },
            required: true
        });
        this.userData.email = email;

        // Password input (hidden)
        const password = await this.questioner.password({
            message: 'Create a password:',
            validate: (value) => {
                return value.length >= 6 || 'Password must be at least 6 characters';
            }
        });

        // Number input with range
        const age = await this.questioner.number({
            message: 'Enter your age:',
            min: 13,
            max: 120,
            validate: (value) => {
                return value >= 13 || 'You must be at least 13 years old';
            }
        });
        this.userData.age = age;

        // Multi-select with checkboxes
        const skills = await this.questioner.multiselect({
            message: 'Select your skills:',
            choices: [
                { name: 'JavaScript', value: 'js' },
                { name: 'TypeScript', value: 'ts' },
                { name: 'Python', value: 'python' },
                { name: 'Go', value: 'go' },
                { name: 'Rust', value: 'rust' },
                { name: 'Docker', value: 'docker' },
                { name: 'Kubernetes', value: 'k8s' }
            ],
            min: 1,
            max: 5
        });
        this.userData.skills = skills;

        // select
        const experience = await this.questioner.select({
            message: 'Years of experience:',
            choices: [
                { name: '0-1 years (Beginner)', value: 'beginner' },
                { name: '2-4 years (Intermediate)', value: 'intermediate' },
                { name: '5-9 years (Advanced)', value: 'advanced' },
                { name: '10+ years (Expert)', value: 'expert' }
            ]
        });
        this.userData.experience = experience;

        console.log();
        console.log(this.questioner.styling.hex('#00ff7f')('✨ Modern features showcased!'));

        this.quizzer.runStage('table');
    }

    async stageTable() {
        console.clear();
        console.log(this.questioner.styling.hex('#ff6b6b').bold('📊 Table Demo'));
        console.log();

        const tableData = [
            { name: 'John Doe', role: 'Developer', experience: 5, skills: 'JS, React, Node', salary: 75000 },
            { name: 'Jane Smith', role: 'Designer', experience: 3, skills: 'Figma, CSS, UI/UX', salary: 65000 },
            { name: 'Bob Wilson', role: 'DevOps', experience: 7, skills: 'Docker, K8s, AWS', salary: 95000 },
            { name: 'Alice Brown', role: 'Product Manager', experience: 4, skills: 'Agile, Analytics', salary: 85000 },
            { name: 'Charlie Davis', role: 'Full Stack', experience: 6, skills: 'Python, React, SQL', salary: 80000 }
        ];

        const table = new Table({
            theme: 'dark',
            borderStyle: 'rounded',
            alternateRows: true,
            sortable: true
        });

        table
            .setTitle('🏢 Employee Directory')
            .setColumns([
                { name: 'name', label: 'Name', width: 15, align: 'left' },
                { name: 'role', label: 'Role', width: 15, align: 'left' },
                { name: 'experience', label: 'Exp (years)', width: 12, align: 'center' },
                { name: 'skills', label: 'Skills', width: 20, align: 'left' },
                {
                    name: 'salary',
                    label: 'Salary',
                    width: 12,
                    align: 'right',
                    formatter: (value) => '$' + value.toLocaleString()
                }
            ])
            .setRows(tableData)
            .sort('salary', 'desc')
            .render();

        console.log();
        console.log(this.questioner.styling.hex('#00ff7f')('📋 Table features: sorting, formatting, styling, and more!'));

        this.quizzer.runStage('form');
    }

    async stageForm() {
        console.clear();
        console.log(this.questioner.styling.hex('#9b59b6').bold('📝 Form Demo'));
        console.log();

        const formData = await this.questioner.form({
            title: '🚀 Project Setup Form',
            fields: [
                {
                    name: 'projectName',
                    label: 'Project name:',
                    type: 'input',
                    required: true,
                    validate: (value) => {
                        return /^[a-zA-Z0-9-_]+$/.test(value) || 'Only alphanumeric, dash, and underscore allowed';
                    }
                },
                {
                    name: 'description',
                    label: 'Project description:',
                    type: 'input',
                    placeholder: 'Brief description of your project'
                },
                {
                    name: 'type',
                    label: 'Project type:',
                    type: 'select',
                    choices: [
                        { name: 'Web Application', value: 'web' },
                        { name: 'Mobile App', value: 'mobile' },
                        { name: 'Desktop App', value: 'desktop' },
                        { name: 'CLI Tool', value: 'cli' },
                        { name: 'Library/Package', value: 'library' }
                    ]
                },
                {
                    name: 'technologies',
                    label: 'Technologies to use:',
                    type: 'multiselect',
                    choices: [
                        { name: 'React', value: 'react' },
                        { name: 'Vue.js', value: 'vue' },
                        { name: 'Angular', value: 'angular' },
                        { name: 'Node.js', value: 'node' },
                        { name: 'Express', value: 'express' },
                        { name: 'MongoDB', value: 'mongodb' },
                        { name: 'PostgreSQL', value: 'postgresql' }
                    ]
                },
                {
                    name: 'teamSize',
                    label: 'Team size:',
                    type: 'number',
                    min: 1,
                    max: 50
                },
                {
                    name: 'openSource',
                    label: 'Make it open source?',
                    type: 'confirm',
                    default: false
                }
            ]
        });

        this.userData.project = formData;

        console.log(this.questioner.styling.createBox(
            'Form completed successfully!\n\n' +
            Object.entries(formData).map(([key, value]) =>
                `${key}: ${Array.isArray(value) ? value.join(', ') : value}`
            ).join('\n'),
            {
                style: 'double',
                borderColor: '#00ff7f',
                padding: 1,
                title: '✅ Form Results'
            }
        ));

        this.quizzer.runStage('final');
    }

    async stageFinal() {
        console.clear();
        console.log(this.questioner.styling.gradient(
            '🎉 Demo Complete!',
            ['#ff6b6b', '#4ecdc4', '#45b7d1', '#ffd700']
        ));
        console.log();

        console.log(this.questioner.styling.createBox(
            'Thank you for trying Node-Quizzer!\n\n' +
            '✨ Features Demonstrated:\n' +
            '• Full backward compatibility\n' +
            '• Modern prompt types (input, select, multiselect, etc.)\n' +
            '• Styling and theming\n' +
            '• Validation and transformation\n' +
            '• Progress bars and spinners\n' +
            '• Advanced table features\n' +
            '• Forms with multiple field types\n' +
            '• Beautiful visual styling\n\n' +
            'Your data has been collected and processed!',
            {
                style: 'double',
                borderColor: '#ffd700',
                padding: 2,
                title: '🚀 Node-Quizzer'
            }
        ));

        console.log();
        console.log(this.questioner.styling.hex('#888888')('Data collected:'));
        console.log(JSON.stringify(this.userData, null, 2));

        this.quizzer.end();
    }
}

// Run the demo
if (require.main === module) {
    const demo = new ModernQuizExample();
    demo.init().then(() => {
        console.log('\n👋 Thanks for using Node-Quizzer!');
        process.exit(0);
    }).catch(error => {
        console.error('Error:', error);
        process.exit(1);
    });
}

module.exports = ModernQuizExample;