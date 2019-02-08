import { join, dirname, resolve } from 'path'
import { realpathSync, readdir, stat } from 'fs'
import { promisify } from 'util'

import { spawn } from 'cross-spawn'
import chalk from 'chalk'
import which from 'which'

const asyncReaddir = promisify(readdir)
const asyncStat = promisify(stat)

/**
 * @description
 * To trim up long pathnames to a more manageable
 * path — relative to the project root
 */
const buildDirectoryLabel = (dir: string) => {
  const [folder, projectDir] = resolve(__dirname, '..', dir)
    .split('/')
    .reverse()

  return chalk.underline(`${projectDir}/${chalk.bold(folder)}`)
}

const resolveBin = (modName: string, { executable = modName, cwd = process.cwd() } = {}) => {
  let pathFromWhich
  try {
    pathFromWhich = realpathSync(which.sync(executable))
  } catch (_error) {
    // ignore _error
  }
  try {
    const modPkgPath = require.resolve(`${modName}/package.json`)
    const modPkgDir = dirname(modPkgPath)
    const { bin } = require(modPkgPath)
    const binPath = typeof bin === 'string' ? bin : bin[executable]
    const fullPathToBin = join(modPkgDir, binPath)

    if (fullPathToBin === pathFromWhich) return executable

    return fullPathToBin.replace(cwd, '.')
  } catch (error) {
    if (pathFromWhich) return executable

    throw error
  }
}

const removeOldFiles = async (dir: string) => {
  const directoryLabel = buildDirectoryLabel(dir)

  try {
    await spawn.sync('rm', ['-rf', dir], { stdio: 'inherit' })

    process.stdout.write(`✨ Cleaned out all them old files from ${directoryLabel} ✨\n`)
  } catch (error) {
    process.stdout.write('Unable to remove old files')
  }
}

/**
 * @description
 * Recursively search through a directory for all files
 */
const recursiveReadDir = async (dir: string, pattern?: RegExp): Promise<string[]> => {
  const subDirectories = await asyncReaddir(dir)
  const files = await Promise.all(
    subDirectories.map(async subDir => {
      const res = resolve(dir, subDir)
      return (await asyncStat(res)).isDirectory() ? recursiveReadDir(res) : res
    })
  )

  // @ts-ignore
  const allFiles = files.reduce((a, f) => a.concat(f), [])

  if (pattern) return allFiles.filter(path => pattern.test(path))

  return allFiles
}

export { resolveBin, removeOldFiles, recursiveReadDir }
