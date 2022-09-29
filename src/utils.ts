/**
 * Gets the position in the alphabet of a given letter
 * @param letter The letter
 * @returns The position in the alphabet
 */
export const letterToAlphabetPosition = (letter: string) => {
  const alphabet = 'abcdefghijklmnopqrstuvwxyz'
  return alphabet.indexOf(letter.toLowerCase().charAt(0)) + 1
}

/**
 * Converts an index to a letter representation, similar to how Excel labels its columns.
 * This is zero-indexed, meaning that 0 maps to 'A', 1 to 'B', and so on.
 * @param index The index to convert
 * @returns The converted form of the given index
 */
export const indexToLetters = (index: number) => {
  // basically do a base 26 conversion; this supports an infinite number of columns
  // space at front is relevant for the end of this function
  const alphabet = ' ABCDEFGHIJKLMNOPQRSTUVWXYZ'
  const radix = 26

  const changeBase = (
    base: number,
    alphabet: string,
    value: number
  ): string => {
    if (value < base) {
      return alphabet.charAt(value)
    } else {
      return (
        changeBase(base, alphabet, Math.trunc(value / base)) +
        alphabet.charAt(value % base)
      )
    }
  }

  // Little trick to get headers to show up properly after the first 26
  const letters = changeBase(radix, alphabet, index)
  const lastChar = letters.charAt(letters.length - 1)
  return (
    letters.substring(0, letters.length - 1) +
    alphabet.charAt(alphabet.indexOf(lastChar) + 1)
  )
}

/**
 * Converts a string of letters back into an index. This function is the inverse of indexToLetters().
 * @param letters The string of letters to convert
 * @returns The index that the given letters represent
 */
export const lettersToIndex = (letters: string) => {
  letters = letters.toUpperCase()
  const alphabet = ' ABCDEFGHIJKLMNOPQRSTUVWXYZ'
  const radix = 26

  // undo shifting the last char over by 1
  const lastChar = letters.charAt(letters.length - 1)
  const unshiftedString =
    letters.substring(0, letters.length - 1) +
    alphabet.charAt(alphabet.indexOf(lastChar) - 1)

  let result = 0

  for (let i = 0; unshiftedString.length - i - 1 >= 0; i++) {
    const digit = alphabet.indexOf(
      unshiftedString.charAt(unshiftedString.length - i - 1)
    )
    result += Math.pow(radix, i) * digit
  }

  return result
}

/**
 * If the given string can be parsed as a float, returns the float equivalent. Otherwise, this function does nothing
 * @param str The string to try parsing
 * @returns A floating point number of the parse was successful, otherwise str is returned
 */
export const parseFloatIfPossible = (str: string) => {
  if (!isNaN(parseFloat(str))) {
    return parseFloat(str)
  } else {
    return str
  }
}

/**
 * Returns the index of the first number of a string
 * @param str the string to look through
 * @returns the index of the first number
 */
export const getIndexOfFirstNumber = (str: string) => {
  let indexOfFirstNumber = 0
  for (let i = 0; i < str.length; i++) {
    const c = str[i]
    if (!isNaN(Number(c))) {
      indexOfFirstNumber = i
      break
    }
  }
  return indexOfFirstNumber
}

/**
 * Regular expression which encodes cell reference expressions
 *
 * These would all be matched by the regex:
 * * "REF(A3)"
 * * "ref(a1..a2)"
 * * "rEf(b353)"
 * * "Ref(Z45235..H26)"
 * * "REF(AA1)"
 *
 * These would not be matched:
 * * "REF(3)"
 * * "REEF(A2)"
 * * "REF(A2....A535)"
 */
export const REFERENCE_EXPR_REGEX =
  /(?:(?:REF\()([a-zA-Z]+[0-9]+)(?:\.\.([a-zA-Z]+[0-9]+))?\)?)|(?:([a-zA-Z]+[0-9]+)(?:\.\.([a-zA-Z]+[0-9]+))?)/gi

/**
 * Matches cell range strings, such as "A1..A4" or "b5"
 */
export const CELL_RANGE_REGEX = /([a-zA-Z]+[0-9]+)(?:\.\.([a-zA-Z]+[0-9]+))?/gi

/**
 * Matches single cell notation strings, such as "A4" and "ab20"
 */
export const CELL_NOTATION_REGEX = /([a-zA-Z]+)([0-9]+)/g
