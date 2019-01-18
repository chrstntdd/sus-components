const isProduction = process.env.NODE_ENV === 'production'
const prefix = '🔥'

/**
 * @description
 *  - Throw an error if the condition fails
 *  - Strip out error messages for production
 */
const invariant = (condition: any, message?: string): void => {
  if (condition) return

  if (isProduction) {
    throw new Error(prefix)
  }

  throw new Error(`${prefix}: ${message || ''}`)
}

export { isProduction, invariant }
