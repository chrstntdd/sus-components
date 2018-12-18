import typescript from 'rollup-plugin-typescript'
import resolve from 'rollup-plugin-node-resolve'
import compiler from '@ampproject/rollup-plugin-closure-compiler'
import pkg from '../package.json'

const input = 'src/index.tsx'

const shared = {
  external: ['react'],
  plugins: [
    resolve({
      customResolveOptions: {
        moduleDirectory: 'node_modules'
      }
    }),
    typescript(),
    compiler({
      formatting: 'PRETTY_PRINT'
    })
  ]
}

export default [
  // ESM build
  {
    input,
    output: {
      file: pkg.module,
      format: 'esm'
    },
    ...shared
  },
  // CommonJS build
  {
    input,
    output: {
      file: pkg.main,
      format: 'cjs'
    },
    ...shared
  }
]
