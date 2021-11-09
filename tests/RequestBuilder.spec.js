import RequestBuilder from '../src/RequestBuilder'
import {
  buildRequest,
  validInstance,
  baseInstances,
  baseProcessingContext,
  baseRightsContext,
  instancesWithDifferentDependenciesStructure,
  instancesWithSameClassNamesAndPropertyNames,
  newInstances,
  newProcessingContext,
  newRightsContext
} from './RequestBuilder.data'

describe('Build request with instance without a class name or property name', () => {
  it(`className === ''`, () => {
    const instances = [{className: '', propertyName: 'propertyName', value: 'value'}]

    expect(buildRequest({instances})).toThrow()
  })

  it(`propertyName === ''`, () => {
    const instances = [{className: 'className', propertyName: '', value: 'value'}]

    expect(buildRequest({instances})).toThrow()
  })
})

describe('Build request with instance with empty value', () => {
  it(`typeof value === undefined`, () => {
    const invalidInstance = {className: 'className', propertyName: 'propertyName'}

    expect(buildRequest({instances: [invalidInstance]})).toThrow()
    expect(buildRequest({instances: [validInstance, invalidInstance]})).not.toThrow()
  })

  it(`value === null || value === ''`, () => {
    const instances = [
      {className: 'className', propertyName: 'propertyName', value: ''},
      {className: 'className 2', propertyName: 'propertyName 2', value: null}
    ]

    expect(buildRequest({instances})).not.toThrow()
  })
})

describe('Build request with an instance with/without a single/multiple dependencies', () => {
  it(`different dependencies structure`, () => {
    expect(buildRequest({instances: instancesWithDifferentDependenciesStructure})).not.toThrow()
  })
})

describe('Build request without/empty rights/processing context', () => {
  it(`processingContext === undefined(not to throw)`, () => {
    expect(buildRequest({
      allowUndefined: true,
      instances: baseInstances,
      rightsContext: baseRightsContext
    })).not.toThrow()
  })
  it(`rightsContext === undefined`, () => {
    expect(buildRequest({
      allowUndefined: true,
      instances: baseInstances,
      processingContext: baseProcessingContext
    })).toThrow()
  })
  it(`empty rightsContext`, () => {
    expect(buildRequest({rightsContext: {evidences: []}})).toThrow()
  })
  it(`empty processingContext`, () => {
    expect(buildRequest({processingContext: {evidences: []}})).toThrow()
  })
})

describe('Build multiple requests with the same rights/processing context', () => {
  const baseParams = {
    instances: baseInstances,
    processingContext: baseProcessingContext,
    rightsContext: baseRightsContext
  }

  it(`Add two the same rights context`, () => {
    const request = new RequestBuilder()
      .addRequest(baseParams)
      .addRequest({
        instances: newInstances,
        processingContext: newProcessingContext,
        rightsContext: baseRightsContext
      })
      .build()

    expect(request.requests.length).toEqual(2)
    expect(request.processingContexts.length).toEqual(2)
    expect(request.rightsContexts.length).toEqual(1)
  })

  it(`Add two the same processing context`, () => {
    const request = new RequestBuilder()
      .addRequest(baseParams)
      .addRequest({
        instances: newInstances,
        processingContext: baseProcessingContext,
        rightsContext: newRightsContext
      })
      .build()

    expect(request.requests.length).toEqual(2)
    expect(request.processingContexts.length).toEqual(1)
    expect(request.rightsContexts.length).toEqual(2)
  })

  it(`Add two the same processing and rights context`, () => {
    const request = new RequestBuilder()
      .addRequest(baseParams)
      .addRequest({
        instances: newInstances,
        processingContext: baseProcessingContext,
        rightsContext: baseRightsContext
      })
      .build()

    expect(request.requests.length).toEqual(1)
    expect(request.processingContexts.length).toEqual(1)
    expect(request.rightsContexts.length).toEqual(1)
  })
})

describe('Build request with several instances of same class name and/or property name', () => {
  it(`same class name and/or property name`, () => {
    expect(buildRequest({instances: instancesWithSameClassNamesAndPropertyNames})).not.toThrow()
  })
})

describe('Build requests or requests with normal instances', () => {
  it(`without errors`, () => {
    expect(buildRequest()).not.toThrow()
  })
})
