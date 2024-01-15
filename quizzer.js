class quizzer {

	// The question class instance used for asking questions.
	questionClass = null

	/**
	 * Creates a new quizzer instance.
	 *
	 * @param {questionClass} questionClass - The questionClass object to use for asking questions.
	 */
	constructor(questionClass) {
		this.questionClass = questionClass
	}

	/**
	 * Runs the method for a specific stage.
	 *
	 * @param {string} stageKey - The key of the stage to run.
	 * @throws {Error} If the stageKey does not exist in the questionClass' stages object.
	 */
	runStage(stageKey) {
		// Check the key exists in the questionClass' stages object
		if (this.questionClass.stages.hasOwnProperty(stageKey)) {
			// The key exists, now run the stage method
			this.questionClass.stages[stageKey]();
		} else {
			// The key doesn't exist, so throw an errors
			throw new Error(`Stage ${stageKey} does not exist`)
		}
	}

	/**
	 * Starts the quiz by running the first stage.
	 */
	start() {
		// Get the first item in the stages array
		let firstStage = Object.keys(this.questionClass.stages)[0]
		// Run the first stage
		this.runStage(firstStage)
	}

}

module.exports = quizzer;