/**
 * Minimal stage runner.
 *
 * quizzer orchestrates a series of named "stages" exposed on a host object.
 * Each stage is a function; start() invokes the first stage, and the stage code
 * advances the flow by calling quizzer.runStage('nextStage') or quizzer.end().
 *
 * This class intentionally remains tiny and synchronous in its stage dispatch;
 * stages can still await prompts from Questioner as needed.
 */
class quizzer {

	// The question class instance used for asking questions.
	questionClass = null
	quizReject = null
	quizResolve = null

	/**
	 * Create a new quizzer.
	 * @param {object} questionClass - Host object that exposes a `stages` map of functions.
	 */
	constructor(questionClass) {
		this.questionClass = questionClass
	}

	/**
	 * Resolve the pending start() promise, signalling the end of the flow.
	 */
	end() {
		// resolve the quiz promise, so any scripts using this quiz know that the quiz is complete
		this.quizResolve()
	}

	/**
	 * Run a specific stage by key.
	 * @param {string} stageKey - The key of the stage to run.
	 * @throws {Error} If the stageKey does not exist on the host's stages object.
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
	 * Start the quiz by running the first stage.
	 * @returns {Promise<void>} Resolves when end() is called by a stage.
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