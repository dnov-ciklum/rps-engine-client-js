import {isObject} from './utils'
import Validator from './Validator'
import schemaValidator from './schemes'

class RPSValue {
  /**
   * RPSValue class
   *
   * @param {string} className - required
   * @param {string} propertyName - required
   * @param {*} value - required, can be empty, but undefined is not valid
   * @param {object} dependencies - not required, e.g. {name: 'value', name2: 'value2'}
   *
   */
  constructor ({className, propertyName, value, dependencies = null} = {}) {
    RPSValue.validateValue({className, propertyName, value})

    this.className = className
    this.propertyName = propertyName
    this.value = value
    this.dependencies = isObject(dependencies) ? dependencies : null
    this.error = null
    this.transformed = null
  }

  get original () {
    return this.value
  }

  setError (error) {
    this.error = error
  }

  setTransformedValue (transformedValue) {
    this.transformed = transformedValue
  }

  static validateValue (params, throwError = true) {
    const {className, propertyName, value} = params

    const result = schemaValidator.validate(params, {$ref: '/Instance'})

    const validator = new Validator([
      {
        rule: !!className,
        message: `Required property "className" is missing or empty`
      },
      {
        rule: !!propertyName,
        message: `Required property "propertyName" is missing or empty`
      },
      {
        rule: typeof value !== 'undefined',
        message: `Required property "value" is undefined`
      },
      {
        rule: result.valid,
        message: `Invalid "requestData" format/structure`
      }
    ])

    return !throwError ? validator.validate() : validator.validateWithThrowError()
  }
}

export default RPSValue
