import schemaValidator from './schemes'
import Validator from './Validator'

class RPSContext {
  /**
   * Context class with evidences as dictionary or list
   *
   * @param {object|object[]} evidences - Array of evidences like [{name: 'name', value: 'value}] or dictionary like {name: value}
   */
  constructor (evidences) {
    RPSContext.validateEvidences(evidences)
    this.evidences = evidences
  }

  static validateEvidences (evidences, throwError = true) {
    const result = schemaValidator.validate(evidences, {$ref: '/ExtendedEvidences'})

    const validator = new Validator([
      {
        rule: !!evidences,
        message: `Required parameter "evidences" is missing`
      },
      {
        rule: result.valid,
        message: `Invalid "evidences" format/structure`
      }
    ])

    return !throwError ? validator.validate() : validator.validateWithThrowError()
  }
}

export default RPSContext
