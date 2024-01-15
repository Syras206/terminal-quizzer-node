# terminal-quizzer
A promise based Node.js package for creating interactive quizzes within a terminal.


## Installation
```
npm install terminal-quizzer
```

## Usage

### Asking Questions in any Node.js script:
Getting user input within any Node.js script can be handled with the questioner class:
```
const { Questioner } = require('terminal-quizzer')
questioner = new Questioner()

questioner.askQuestion('Do you want continue? [Y/N]')
	.then(answer => {
		if (answer === 'Y') {
			// do something
		} else {
			// do something else
		}
	})
```

### Creating a QuestionClass:
A question class is a stage based collection of questions which will be handled by the Quizzer class. Here's an example:
```
const { Quizzer, Questioner } = require('terminal-quizzer')

class exampleQuiz {

	// Instantiate a questioner class so we can ask questions
	questioner = new Questioner()
	// Instantiate the quizzer class so we can run stage methods
	quizzer = new Quizzer(this)

	// Define the stages which the quizer has access to
	stages = {
		'name': () => this.stageName(),
		'tasks': () => this.stageTasks(),
		'final': () => this.stageFinal(),
	}

	// Define the properties which will be used by the stage responses
	name = ''
	tasks = ''

	/**
	 * Performs a check to see whether readline has been initialised
	 */
	init() {
		this.quizzer.start()
	}

	stageFinal() {
		console.log(`Hello, ${this.name}!\nToday you want to:\n${this.tasks}`)
	}

	stageName() {
		this.questioner.askQuestion('What is your name?')
			.then(name => {
				this.name = name
				this.quizzer.runStage('tasks')
			})
	}

	stageTasks() {
		this.questioner.askMultilineQuestion('What tasks do you need to do today?', ' - ')
			.then(tasks => {
				this.tasks = tasks
				this.quizzer.runStage('final')
			})
	}

}

const quiz = new exampleQuiz();
quiz.init();
```

## Example Output:

```
What is your name?
> John Doe
What tasks do you need to do today?
> - Write a blog post
> - Review code
> - Attend meeting
Hello, John Doe!
Today you want to:
- Write a blog post
- Review code
- Attend meeting
```

## Features

    Ask questions in the terminal: Make your Node.js scripts more interactive
    Stage-based structure: Organize quiz logic into distinct stages.
    Multi-line responses: Allow for detailed answers.

## Classes


### Questioner:

    Handles user prompts and input.
    Supports both single-line and multi-line questions.

### Quizzer:

    Executes quiz stages based on user responses.
    Controls stage transitions and flow.

## Examples

    See the example.js file for a practical demonstration.


### Contributing

Pull requests are welcome!