const Quizzer = require('./quizzer')
const Questioner = require('./questioner')

class exampleQuiz {

	// Instantiate a questioner class so we can ask questions
	questioner = new Questioner()
	// Instantiate the quizzer class so we can run stage methods
	quizzer = new Quizzer(this)

	// Define the stages which the quizer has access to
	stages = {
		'name': () => this.stageName(),
		'tasks': () => this.stageTasks(),
		'again': () => this.stageAgain(),
		'final': () => this.stageFinal(),
	}

	// Define the properties which will be used by the stage responses
	name = ''
	tasks = ''

	/**
	 * Performs a check to see whether readline has been initialised
	 */
	init() {
		return this.quizzer.start()
	}

	stageAgain() {
		this.questioner.askQuestion('Do you want to run this again? [Y/N]')
			.then(answer => {
				if (answer === 'Y') {
					this.quizzer.runStage('name')
				} else {
					this.quizzer.runStage('final')
				}
			})
	}

	stageFinal() {
		this.quizzer.end()
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
				this.quizzer.runStage('again')
			})
	}
}

quiz = new exampleQuiz()
quiz.init()
	.then(() => {
		console.log(`Hello, ${quiz.name}!\nToday you want to:\n${quiz.tasks}`)
	})