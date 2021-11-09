import resolve from '@rollup/plugin-node-resolve'
import babel from '@rollup/plugin-babel'
import commonjs from '@rollup/plugin-commonjs'
// import ignore from "rollup-plugin-ignore"

const config = {
  input: 'src/index.js',
  external: ['uuid'],
  output: {
    dir: 'lib',
    name: 'RpsEngine',
    format: 'umd',
    globals: {
      uuid: 'uuidv4'
    }
  },
  plugins: [
    // ignore(['uuid']),
    resolve(),
    commonjs(),
    babel({exclude: 'node_modules/**', babelHelpers: 'bundled'})
  ]
}

export default config
