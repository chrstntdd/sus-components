#!/usr/bin/env ts-node

import { join } from 'path'
import chalk from 'chalk'
import crossSpawn from 'cross-spawn'
import * as ts from 'typescript'

import { resolveBin, removeOldFiles, recursiveReadDir } from './utils'
import { exists, mkdir, readFile, writeFile } from 'fs'
import { promisify } from 'util'

const asyncExists = promisify(exists)
const asyncMkdir = promisify(mkdir)
const asyncReadFile = promisify(readFile)
const asyncWriteFile = promisify(writeFile)

const rollupBin = resolveBin('rollup')
const microBundleBin = resolveBin('microbundle')
const concurrentlyBin = resolveBin('concurrently')

const paths = {
  src: join(__dirname, '../src'),
  lib: join(__dirname, '../lib'),
  rollupConfig: join(__dirname, 'rollup.config.js')
}

const sharedRollupArgs = ['-c', paths.rollupConfig, '-m']
const sharedMicrobundleArgs = ['--external', 'react,react-dom', '-f', 'es,cjs', '--no-compress']

const [, , script, ...args] = process.argv

type ScriptTypes = {
  'build-lib': string
  'dev-lib': string
  'transpile-only': string
  'build-single-lib': string
}

const SCRIPTS: ScriptTypes = {
  'build-lib': 'build-lib',
  'dev-lib': 'dev-lib',
  'transpile-only': 'transpile-only',
  'build-single-lib': 'build-single-lib'
}

const rando = () =>
  Math.random()
    .toString(32)
    .substr(2, 6)

// \\

const emitTypeDefs = async () => {
    try {
      await crossSpawn.spawn(
        resolveBin('tsc'),
        ['--declaration', '--outDir', `${paths.lib}/types`, '--emitDeclarationOnly'],
        { stdio: 'inherit' }
      )
    } catch (error) {
      console.log('Unable to create type definitions', { error })
    }
  }

  // \\
  // Map script type to handler
;(async (s: keyof ScriptTypes) => {
  // clear console
  // process.stdout.write('\x1Bc')

  switch (s) {
    // accept an --all flag to bundle all components
    // this script isn't meant for production, more just to see the size
    // of a particular bundled component
    case SCRIPTS['build-single-lib']: {
      await removeOldFiles(paths.lib)
      await emitTypeDefs()

      if (args.length) {
        // handle args
      }

      const allComponents = await recursiveReadDir(paths.src, /\.tsx$/)

      Promise.all(
        allComponents.map(path => {
          const [file] = path.split('/').reverse()

          const [fileNameWithoutExtension] = file.split('.')

          return crossSpawn.spawn(
            microBundleBin,
            [
              '-i',
              `${paths.src}/${file}`,
              '--output',
              `${paths.lib}/${fileNameWithoutExtension}`,
              '--name',
              fileNameWithoutExtension,
              ...sharedMicrobundleArgs
            ],
            {
              stdio: 'inherit'
            }
          )
        })
      )

      break
    }
    /**
     * @description
     * unstable script to transpile TypeScript source to Javascript — without
     * any typechecking
     */
    case SCRIPTS['transpile-only']: {
      await removeOldFiles(paths.lib)
      await emitTypeDefs()

      const sources = (await recursiveReadDir(paths.src, /\.(ts|tsx)$/)).filter(
        path => !path.includes('index.')
      )

      const fnSet = new Set()

      sources.forEach(async s => {
        const content = await asyncReadFile(s, 'UTF-8')
        let fileName = /([^\/]+$)/gi.exec(s)[0] // everything after the final `/`

        // check structure for existing name to avoid overwriting
        if (fnSet.has(fileName)) {
          const [fn, extension] = fileName.split('.')
          fileName = `${fn}-${rando()}.${extension}`
        }

        fnSet.add(fileName)

        const { outputText, sourceMapText } = ts.transpileModule(content, {
          compilerOptions: {
            declaration: true,
            declarationMap: true,
            jsx: ts.JsxEmit.Preserve,
            pretty: true,
            sourceMap: true,
            target: ts.ScriptTarget.ESNext
          }
        })

        if (!(await asyncExists(paths.lib))) {
          await asyncMkdir(paths.lib, { recursive: true })
        }

        fileName = fileName.replace('.tsx', '.js')

        await Promise.all([
          asyncWriteFile(`${paths.lib}/${fileName}`, outputText, 'UTF-8'),
          asyncWriteFile(`${paths.lib}/${fileName}.map`, sourceMapText, 'UTF-8')
        ])

        console.log(`✍️  Wrote ${fileName}`)
      })

      break
    }
    case SCRIPTS['build-lib']: {
      await removeOldFiles(paths.lib)
      await emitTypeDefs()

      await crossSpawn.spawn(microBundleBin, sharedMicrobundleArgs, {
        stdio: 'inherit'
      })

      break
    }

    case SCRIPTS['dev-lib']: {
      // await removeOldFiles(paths.lib)
      // omit emitting type defs since this isn't needed for development
      // and it also breaks the concurrent nature of the 'dev' script

      setTimeout(() => {}, 0)

      await crossSpawn.spawn(rollupBin, [...sharedRollupArgs, '-w'], { stdio: 'inherit' })

      break
    }

    default:
      console.log(
        `script: ${chalk.redBright(
          script
        )} does not exist. \nPlease choose one of the following: \n\n${Object.keys(SCRIPTS)
          .map(i => chalk.yellow(`* `) + chalk.underline(i))
          .join('\n')}\n`
      )

      process.exit(1)
  }
})(SCRIPTS[script])
