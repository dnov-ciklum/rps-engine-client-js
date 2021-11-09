# rps-engine-client-js

Regdata RPS Engine Client library (JS)

[![npm version](https://badge.fury.io/js/rps-engine-client-js.svg)](https://badge.fury.io/js/rps-engine-client-js)

## Installation

Use `npm` to install the RPS Engine Client library:

```sh
npm i rps-engine-client-js
```

## Usage

### Simple example

```js
const {
  EngineClient,
  RequestBuilder,
  TokenProvider,
  RPSContext,
  RPSValue,
  RPSEvidence
} = require('rps-engine-client-js/lib')

const ENGINE_AUTH_ENDPOINT = 'https://identity.rpsdev.net/connect/token'
const ENGINE_BASE_API_URL = 'https://engine.rpsdev.net/api'

const CLIENT_ID = 'c6cbde13-542d-4849-a69e-3962ed09bc10'
const CLIENT_SECRET = '37571534bf6d40878fa77cb7b354b3274e6c047bd6404468b0fa2345cb7ebe61'

const secrets = {
  clientId: CLIENT_ID,
  clientSecret: CLIENT_SECRET
}
const rightsContext = new RPSContext([
  new RPSEvidence({name: 'Role', value: 'Admin'})
])

const encryptProcessingContext = new RPSContext([
  new RPSEvidence({name: 'Action', value: 'Protect'})
])

const decryptProcessingContext = new RPSContext([
  new RPSEvidence({name: 'Action', value: 'Deprotect'})
])

const tokenProvider = new TokenProvider({
  engineAuthEndpoint: ENGINE_AUTH_ENDPOINT,
  ...secrets
})

const engineClient = new EngineClient({
  config: {baseURL: ENGINE_BASE_API_URL},
  tokenProvider
})

const instances = [
  new RPSValue({className: 'Template', propertyName: 'name', value: 'New Template'}),
  new RPSValue({className: 'Template', propertyName: 'description', value: 'Example'})
]

const requestData = new RequestBuilder()
  .addRequest({instances, rightsContext, processingContext})
  .build()

const response = await engineClient.transform(requestBody)
console.log(response)
```

## RPS Engine Client library documentation

- [Docs](https://community.rpsdev.net/)
