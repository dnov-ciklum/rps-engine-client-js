import RPSValue from '../src/RpsValue'

const createRPSValue = (params) => () => new RPSValue(params)
describe(`Required parameters`, () => {
  it(`create without params must throw error`, () => {
    expect(createRPSValue()).toThrow()
  })
  it(`"value" not specified`, () => {
    const params = {className: 'className', propertyName: 'propertyName'}
    expect(createRPSValue(params)).toThrow()
  })
  it(`"className" empty or not specified`, () => {
    const invalidParams = [
      {className: '', propertyName: 'propertyName', value: ''},
      {propertyName: 'propertyName', value: ''}
    ]

    invalidParams.forEach((params) => {
      expect(createRPSValue(params)).toThrow()
    })
  })
  it(`"propertyName" empty or not specified`, () => {
    const invalidParams = [
      {className: 'className', propertyName: '', value: ''},
      {className: 'className', value: ''}
    ]

    invalidParams.forEach((params) => {
      expect(createRPSValue(params)).toThrow()
    })
  })
  it(`"dependencies" empty or not specified`, () => {
    const dependenciesValues = [{}, undefined, {evidences: [{name: 'name', value: 'value'}]}]

    for (const dependencies of dependenciesValues) {
      expect(createRPSValue({className: 'c', propertyName: 'p', value: '', dependencies})).not.toThrow()
    }
  })
  it(`"value" === ''`, () => {
    const params = {className: 'className', propertyName: 'propertyName', value: ''}
    expect(createRPSValue(params)).not.toThrow()
  })
})
