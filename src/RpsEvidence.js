import schemaValidator from './schemes'
import Validator from './Validator'

class RPSEvidence {
  /**
   * Evidence class
   *
   * @param {object} evidence - {name: 'name', value: 'value}
   * @param {string} evidence.name - evidence name
   * @param {string} evidence.value - evidence value
   */
  constructor ({name, value}) {
    RPSEvidence.validateEvidence({name, value})
    this.name = name
    this.value = value
  }

  static validateEvidence (evidence, throwError = true) {
    const result = schemaValidator.validate(evidence, {$ref: '/Evidence'})

    const validator = new Validator([
      {
        rule: result.valid,
        message: `Invalid "evidence" format/structure`
      }
    ])

    return !throwError ? validator.validate() : validator.validateWithThrowError()
  }
}

export default RPSEvidence
