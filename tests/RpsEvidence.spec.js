import RPSEvidence from '../src/RpsEvidence'

const createRPSEvidence = (params) => () => new RPSEvidence(params)

describe(`Required parameters`, () => {
  it(`create without params must throw error`, () => {
    expect(createRPSEvidence()).toThrow()
  })
  it(`empty evidence`, () => {
    expect(createRPSEvidence({})).toThrow()
  })
  it(`valid evidence`, () => {
    expect(createRPSEvidence({name: 'name', value: 'value'})).not.toThrow()
  })
  describe(`invalid evidence`, () => {
    const invalidParams = [
      undefined,
      {},
      {name: 'name'},
      {value: 'value'},
      {name: 'name', foo: 'foo'},
      {value: 'value', bar: 'bar'}
    ]

    invalidParams.forEach(evidences => {
      it(`${JSON.stringify(evidences)}`, () => {
        expect(createRPSEvidence(evidences)).toThrow()
      })
    })
  })
})
