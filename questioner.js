const readline = require('readline')

class Questioner {

	// colours used in logs
	NORMAL='\x1b[0m'
	GREEN='\x1b[32;01m'
	CYAN='\x1b[0;36m'
	RED='\x1b[0;31m'

	// set the default properties for this class
	defaultResponsePrefix = '\n' // a string which prefixes each line of the response from a question
	promptPrefix = '> ' // a string which prefixes the prompt for user's input
	rl = null // the readline instance used to get user input

	/**
	 * Asks a question to the user in the console which requires a single-line response and returns
	 * a promise that resolves with the user's input.
	 *
	 * @param {string} question - The question to ask the user.
	 * @param {string} [colour=this.GREEN] - The color to use for the question text. Defaults to green.
	 * @returns {Promise<string>} A promise that resolves with the user's input.
	 *
	 * @example
	 * 	questioner.askQuestion('What is your name?', questioner.CYAN)
	 * 		.then(answer => console.log(`Hello, ${answer}`))
	 */
	askQuestion(question, colour = this.GREEN) {
		// store the instance as self so we can access it within the promise
		let self = this

		// log out the question to the user
		console.log(`${colour}${question}${this.NORMAL}`);

		// use a promise to wait for the user's input
		return new Promise((resolve, reject) => {
			// get the input from the user and use it to resolve the question promise
			self.getInput(resolve, reject)
		});
	}

	/**
	 * Asks a question to the user in the console which requires a multi-line response and returns
	 * a promise that resolves with the user's input. New lines are created by hitting return, the
	 * user can finish asking the questions by entering 'Q'
	 *
	 * @param {string} question - The question to ask the user.
	 * @param {string} responsePrefix [responsePrefix=this.defaultResponsePrefix]
	 * @param {string} [colour=this.GREEN] - The color to use for the question text. Defaults to green.
	 * @returns {Promise<string>} A promise that resolves with the user's input.
	 *
	 * @example
	 * 	questioner.askQuestion('List each of your tasks for today', ' ~ ')
	 * 		.then(answer => console.log(`Your tasks for today are:\n${answer}`))
	 */
	askMultilineQuestion(question, responsePrefix = this.defaultResponsePrefix, colour = this.GREEN) {
		// store the instance as self so we can access it within the promise
		let self = this

		// log out the question to the user
		console.log(`${colour}${question}${this.NORMAL}`);
		console.log(`${this.CYAN}['Q' to move on]:${this.NORMAL}`);

		// use a promise to wait for the user's input
		return new Promise((resolve, reject) => {
			// get the input from the user
			self.getMultilineInput(responsePrefix, "", resolve, reject)
		});
	}

	/**
	 * allows the readline instance to be closed after resolving a question
	 *
	 * @private
	 */
	closeReadline() {
		// close readline
		this.rl.close()
		// unset the rl property
		this.rl = null
	}

	/**
	 * Retrieves user input from the console using a readline interface.
	 *
	 * @param resolve - The promise resolve function to call with the user's input.
	 * @param reject - The promise reject function to call if an error occurs while getting input.
	 * @private
	 */
	getInput(resolve, reject) {
		// ensure we have a readline instance running
		if (!this.readlineInitialised()) this.startReadline()

		// ask for the user's input
		this.rl.question(this.promptPrefix, (answer) => {
			// close readline
			this.closeReadline()
			// resolve once we have an answer
			resolve(answer)
		})
	}

	/**
	 * Retrieves multi-line input from the console using a readline interface. Each line
	 * entered is concatenated into a single string prefixed by a given responsePrefix.
	 *
	 * @param responsePrefix - a string which prefixes each line of the response
	 * @param response - the string onto which all response lines are appended.
	 * @param resolve - The promise resolve function to call with the user's input.
	 * @param reject - The promise reject function to call if an error occurs while getting input.
	 * @private
	 */
	getMultilineInput(responsePrefix, response, resolve, reject) {
		// ensure we have a readline instance running
		if (!this.readlineInitialised()) this.startReadline()

		// store the instance as self so we can access it within the promise
		let self = this

		// ask for the user's input
		this.rl.question(this.promptPrefix, (answer) => {
			if (answer === "Q") {
				// close readline
				this.closeReadline()
				// if the user entered 'Q' then resolve the question with the response we already have
				resolve(response);
			} else {
				// otherwise append the answer to the response
				response += responsePrefix + answer + "\n"
				// now run this method again using the updated response string
				self.getMultilineInput(responsePrefix, response, resolve, reject)
			}
		})
	}

	/**
	 * performs a check to see whether readline has been initialised
	 *
	 * @private
	 */
	readlineInitialised() {
		return this.rl !== null
	}

	/**
	 * creates a readline instance so that the user can be prompted for a response
	 *
	 * @private
	 */
	startReadline() {
		this.rl = readline.createInterface({
			input: process.stdin,
			output: process.stdout
		})
	}

}

module.exports = Questioner