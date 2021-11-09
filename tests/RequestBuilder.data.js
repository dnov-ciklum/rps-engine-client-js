import RequestBuilder from '../src/RequestBuilder'

const baseInstances = [{className: 'className', propertyName: 'propertyName', value: 'value'}]
const baseProcessingContext = {'evidences': [{'name': 'Action', 'value': 'Protect'}]}
const baseRightsContext = {'evidences': [{'name': 'Rights', 'value': 'Transform'}]}
const newInstances = [{className: 'className new', propertyName: 'propertyName new', value: 'value new'}]
const newProcessingContext = {'evidences': [{'name': 'Action new', 'value': 'Protect new'}]}
const newRightsContext = {'evidences': [{'name': 'Rights new', 'value': 'Transform new'}]}
const validInstance = {className: 'className', propertyName: 'propertyName', value: 'value'}

const buildRequest = (params) => () => {
  const {instances, rightsContext, processingContext, allowUndefined = false} = params || {}
  return new RequestBuilder()
    .addRequest({
      instances: allowUndefined ? instances : instances || baseInstances,
      rightsContext: allowUndefined ? rightsContext : rightsContext || baseRightsContext,
      processingContext: allowUndefined ? processingContext : processingContext || baseProcessingContext
    })
    .build()
}

const instancesWithDifferentDependenciesStructure = [{
  className: 'className',
  propertyName: 'propertyName',
  value: 'value',
  dependencies: {name: 'value'}
}, {
  className: 'className 2',
  propertyName: 'propertyName 2',
  value: 'value',
  dependencyContext: {name: 'value'}
}, {
  className: 'className 2',
  propertyName: 'propertyName 2',
  value: 'value',
  dependencyContext: {evidences: {name: 'value'}}
}, {
  className: 'className 2',
  propertyName: 'propertyName 2',
  value: 'value',
  dependencyContext: {evidences: [{name: 'name', value: 'value'}]}
}, {
  className: 'className 3',
  propertyName: 'propertyName 3',
  value: 'value',
  evidences: [{name: 'name 1', value: 'value 1'}, {name: 'name 2', value: 'value 2'}]
}, {
  className: 'className 3',
  propertyName: 'propertyName 3',
  value: 'value',
  dependencies: {}
}, {
  className: 'className 3',
  propertyName: 'propertyName 3',
  value: 'value',
  evidences: []
}, {
  className: 'className 3',
  propertyName: 'propertyName 3',
  value: 'value',
  evidences: undefined
}]

const instancesWithSameClassNamesAndPropertyNames = [
  {className: 'className', propertyName: 'propertyName', value: 'value'},
  {className: 'className', propertyName: 'propertyName', value: 'value'},
  {className: 'className 2', propertyName: 'propertyName', value: 'value'}
]

export {
  buildRequest,
  baseInstances,
  baseRightsContext,
  baseProcessingContext,
  newInstances,
  newProcessingContext,
  newRightsContext,
  validInstance,
  instancesWithDifferentDependenciesStructure,
  instancesWithSameClassNamesAndPropertyNames
}
