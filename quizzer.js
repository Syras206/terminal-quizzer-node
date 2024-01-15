class quizzer {

	// The question class instance used for asking questions.
	questionClass = null
	quizReject = null
	quizResolve = null

	/**
	 * Creates a new quizzer instance.
	 *
	 * @param {questionClass} questionClass - The questionClass object to use for asking questions.
	 */
	constructor(questionClass) {
		this.questionClass = questionClass
	}

	end() {
		// resolve the quiz promise, so any scripts using this quiz know that the quiz is complete
		this.quizResolve()
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
		return new Promise((resolve, reject) => {
			this.quizResolve = resolve;
			this.quizReject = reject;

			// Get the first item in the stages array
			let firstStage = Object.keys(this.questionClass.stages)[0]
			// Run the first stage
			this.runStage(firstStage)
		})
	}

}

module.exports = quizzer;