#!/usr/bin/env ts-node

import { join } from 'path'
import chalk from 'chalk'
import spawn from 'cross-spawn'
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

const paths = {
  src: join(__dirname, '../src'),
  lib: join(__dirname, '../lib'),
  rollupConfig: join(__dirname, 'rollup.config.js')
}

const sharedRollupArgs = ['-c', paths.rollupConfig, '-m']

const [, , script, ...args] = process.argv

type ScriptTypes = {
  'build-lib': string
  'dev-lib': string
  'transpile-only': string
}

const SCRIPTS: ScriptTypes = {
    'build-lib': 'build-lib',
    'dev-lib': 'dev-lib',
    'transpile-only': 'transpile-only'
  }

  //\\
  // Map script type to handler
;(async (s: keyof ScriptTypes) => {
  // clear console
  // process.stdout.write('\x1Bc')

  switch (s) {
    /**
     * @description
     * unstable script to transpile TypeScript source to Javascript — without
     * any typechecking
     */
    case SCRIPTS['transpile-only']: {
      await removeOldFiles(paths.lib)

      const sources = await recursiveReadDir(paths.src, /\.(ts|tsx)$/)

      const fnSet = new Set()
      let id = 0

      sources.forEach(async s => {
        const content = await asyncReadFile(s, 'UTF-8')
        let fileName = /([^\/]+$)/gi.exec(s)[0] // everything after the final `/`

        // check structure for existing name to avoid overwriting
        if (fnSet.has(fileName)) {
          // TODO: find better mechanism for naming a transpiled file
          const [fn, extension] = fileName.split('.')
          fileName = `${fn}${id++}.${extension}`
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
      await removeOldFiles()

      await spawn.spawn(
        microBundleBin,
        ['--external', 'react,react-dom', '-f', 'cjs,esm', '--no-compress'],
        {
          stdio: 'inherit'
        }
      )

      break
    }

    case SCRIPTS['dev-lib']: {
      await removeOldFiles()

      await spawn.spawn(rollupBin, [...sharedRollupArgs, '-w'], { stdio: 'inherit' })

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
