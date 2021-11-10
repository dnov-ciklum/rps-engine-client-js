module.exports = {
  env: {
    browser: true,
    es2021: true,
    node: true,
    'jest/globals': true
  },
  extends: [
    'standard'
  ],
  parser: '@babel/eslint-parser',
  parserOptions: {
    ecmaVersion: 12,
    sourceType: 'module'
  },
  plugins: ['jest'],
  rules: {
    'object-curly-spacing': 'off',
    'no-unused-vars': 'off',
    'handle-callback-err': 'off',
    'no-extra-boolean-cast': 'off',
    'no-multiple-empty-lines': 'off',
    'indent': 'off',
    'quote-props': 'off',
    'node/handle-callback-err': 'off',
    'prefer-promise-reject-errors': 'off',
    'quotes': ['error', 'single', {'allowTemplateLiterals': true}]
  },
  ignorePatterns: ['**/lib/*.js']
}
