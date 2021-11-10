import RPSContext from '../src/RpsContext'

const createRPSContext = (params) => () => new RPSContext(params)

describe(`Required parameters`, () => {
  it(`create without params must throw error`, () => {
    expect(createRPSContext()).toThrow()
  })
  it(`empty evidences`, () => {
    expect(createRPSContext([])).toThrow()
    expect(createRPSContext({})).toThrow()
  })
  it(`valid evidences`, () => {
    const validParams = [
      {'name': 'value', 'name2': 'value2'},
      [{name: 'name', value: 'value'}]
    ]

    validParams.forEach(evidences => {
      expect(createRPSContext(evidences)).not.toThrow()
    })
  })
  describe(`invalid evidences`, () => {
    const invalidParams = [
      undefined,
      {},
      [],
      [{name: 'name'}],
      [{value: 'value'}],
      [{name: 'name', foo: 'foo'}],
      [{value: 'value', bar: 'bar'}]
    ]

    invalidParams.forEach(evidences => {
      it(`${JSON.stringify(evidences)}`, () => {
        expect(createRPSContext(evidences)).toThrow()
      })
    })
  })
})
