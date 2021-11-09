class Validator {
  constructor (rules) {
    this.rules = rules
    this.errors = []
  }

  validate () {
    this.errors = this.rules
      .filter(({rule}) => !rule)
      .map(({message}) => message)

    return this.errors.length === 0
  }

  validateWithThrowError () {
    const isValid = this.validate()
    const error = this.errors.join('\r\n')

    if (!isValid) {
      throw new Error(error)
    } else {
      return isValid
    }
  }
}

export default Validator
