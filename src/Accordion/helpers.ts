const DEFAULT = 0

let counter = DEFAULT

export const nextUuid = () => {
  const current = counter
  counter = counter + 1

  return current
}

export const resetNextUuid = () => {
  counter = DEFAULT
}
