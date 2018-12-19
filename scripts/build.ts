/* tslint:disable */
import { rollup } from 'rollup'
import typescript from 'rollup-plugin-typescript'
import resolve from 'rollup-plugin-node-resolve'

import pkg from '../package.json'

const input = 'src/index.tsx'

const bundleTypes = ['esm', 'cjs']

const shared = {
  external: ['react', 'react-dom'],
  plugins: [
    resolve({
      customResolveOptions: {
        moduleDirectory: 'node_modules'
      }
    }),
    typescript()
  ]
}

const buildLib = () => {
  bundleTypes.forEach(async type => {
    // create a bundle
    const bundle = await rollup({ input, ...shared })

    const outputOptions = {
      file: type === 'esm' ? pkg.module : pkg.main,
      format: type,
      sourcemap: true
    }

    // write bundle to disk
    // @ts-ignore
    await bundle.write(outputOptions)
  })
}

buildLib()
