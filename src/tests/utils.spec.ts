import { lettersToIndex, indexToLetters } from '../utils'

describe('utils tests', () => {
  it('index to letters works', () => {
    expect(indexToLetters(0)).toEqual('A')
    expect(indexToLetters(1)).toEqual('B')
  })
  it('transforming back and forth works', () => {
    expect(indexToLetters(lettersToIndex('A'))).toEqual('A')
  })
})
