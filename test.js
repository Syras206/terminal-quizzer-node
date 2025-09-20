#!/usr/bin/env node

// Run with: node test.js

const { Questioner, Table } = require('./exports');

async function quickTest() {
    console.clear();
    console.log('🧪 Comprehensive Test of Node-Quizzer\n');

    const questioner = new Questioner({
        theme: 'dark',
        icons: true
    });

    try {
        console.log('Testing basic input...');
        const name = await questioner.input({
            message: 'What is your name?',
            validate: (value) => value.length > 0 || 'Name is required'
        });
        console.log(`✅ Name: ${name}\n`);

        console.log('Testing multiselect...');
        const colors = await questioner.multiselect({
            message: 'Pick your favorite colors:',
            choices: [
                { name: 'Red', value: 'red' },
                { name: 'Green', value: 'green' },
                { name: 'Blue', value: 'blue' },
                { name: 'Yellow', value: 'yellow' }
            ],
            min: 1,
            max: 3
        });
        console.log(`✅ Colors: ${colors.join(', ')}\n`);

        console.log('Testing number input...');
        const age = await questioner.number({
            message: 'Enter your age:',
            min: 1,
            max: 120
        });
        console.log(`✅ Age: ${age}\n`);

        console.log('Testing confirm...');
        const confirmed = await questioner.confirm({
            message: 'Do you like programming?',
            default: true
        });
        console.log(`✅ Likes programming: ${confirmed}\n`);

        console.log('Testing backward compatibility...');
        const backwardName = await questioner.askQuestion('Enter name again (backward compat)?');
        console.log(`✅ Backward compatibility name: ${backwardName}\n`);

        // Test table
        console.log('Testing interactive tables...');
        const table = new Table({ theme: 'dark' });
        table
            .setTitle('🎨 Test Results')
            .setColumns([
                { name: 'field', label: 'Field', width: 15 },
                { name: 'value', label: 'Value', width: 25 }
            ])
            .setRows([
                { field: 'Name', value: name },
                { field: 'Colors', value: colors.join(', ') },
                { field: 'Age', value: age.toString() },
                { field: 'Likes Programming', value: confirmed ? 'Yes' : 'No' }
            ])
            .render();

        console.log('\n✅ All tests completed successfully!');
        console.log('🎉 Node-Quizzer is working perfectly!');

    } catch (error) {
        console.error('❌ Test failed:', error.message);
        console.error(error.stack);
    }
}

if (require.main === module) {
    quickTest().then(() => process.exit(0));
}

module.exports = quickTest;
