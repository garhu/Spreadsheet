import evaluate, { registerFunction } from 'ts-expression-evaluator'
import {
  getIndexOfFirstNumber,
  lettersToIndex,
  parseFloatIfPossible,
  REFERENCE_EXPR_REGEX,
} from '../../utils'
import Coordinates from '../Coordinates'
import { ISheet } from '../Sheet'
import { Range } from '../types'

/**
 * Formula evaluator that uses the ts-expression-evaluator library.
 * This class is a singleton
 */
class FormulaEvaluator {
  private context: { sheet: ISheet | null } = { sheet: null }

  private constructor() {
    registerFunction('REF', (rngExpr1: string, rngExpr2: string) => {
      const indexOfFirstNumber = getIndexOfFirstNumber(rngExpr1)
      const col1 = rngExpr1.substring(0, indexOfFirstNumber)
      const row1 = rngExpr1.substring(indexOfFirstNumber)

      let range: Range
      if (rngExpr2) {
        const indexOfFirstNumber = getIndexOfFirstNumber(rngExpr2)
        const col2 = rngExpr2.substring(0, indexOfFirstNumber)
        const row2 = rngExpr2.substring(indexOfFirstNumber)

        range = [
          new Coordinates(parseInt(row1), lettersToIndex(col1) + 1),
          new Coordinates(parseInt(row2), lettersToIndex(col2) + 1),
        ]

        const cells = this.context.sheet?.getCellRange(range)
        return [...cells!].map((cell) =>
          parseFloatIfPossible(cell.getDisplayContent())
        )
      } else {
        range = [
          new Coordinates(parseInt(row1), lettersToIndex(col1) + 1),
          new Coordinates(parseInt(row1), lettersToIndex(col1) + 1),
        ]

        const cells = this.context.sheet?.getCellRange(range)
        const displayContent = cells!
          .getCellAt(new Coordinates(1, 1))
          .getDisplayContent()
        return parseFloatIfPossible(displayContent)
      }
    })
    registerFunction('SUM', (...operands: Array<string | number>) => {
      let sum: string | number | undefined = undefined
      const addOperand = (
        operand: Array<string | number> | string | number
      ) => {
        if (Array.isArray(operand)) {
          operand.forEach((subOperand) => {
            addOperand(subOperand)
          })
        } else if (typeof operand === 'string') {
          if (sum === undefined) {
            sum = operand
          } else if (typeof sum === 'string' && typeof operand === 'string') {
            sum += operand
          } else if (typeof sum === 'number' && !isNaN(parseFloat(operand))) {
            sum += parseFloat(operand)
          } else {
            throw new Error('SUM: cannot add string and number together')
          }
        } else if (typeof operand === 'number') {
          if (sum === undefined) {
            sum = operand
          } else if (typeof sum === 'number') {
            sum += operand
          } else {
            throw new Error('SUM: cannot add string and number together')
          }
        } else {
          throw new Error('SUM: can only add numbers or strings')
        }
      }
      operands.forEach(addOperand)
      return sum
    })
    registerFunction('AVG', (...operands: Array<number>) => {
      let sum: number | undefined = undefined
      let numOperands = 0
      const addOperand = (
        operand: Array<string | number> | string | number
      ) => {
        if (Array.isArray(operand)) {
          operand.forEach((subOperand) => {
            addOperand(subOperand)
          })
        } else if (typeof operand === 'number') {
          if (sum === undefined) {
            sum = operand
            numOperands++
          } else if (typeof sum === 'number') {
            sum += operand
            numOperands++
          } else {
            throw new Error('AVG: cannot add number and non-number together')
          }
        } else {
          throw new Error('AVG: operands to AVG must be number')
        }
      }
      operands.forEach(addOperand)
      return sum! / numOperands
    })
  }

  /**
   * Evaluates the given formula
   * @param formula The formula string
   * @param sheet The sheet is the context within which the formula is evaluated (for cell references)
   * @returns
   */
  evaluate(formula: string, sheet: ISheet) {
    this.context.sheet = sheet

    formula = formula.replace(REFERENCE_EXPR_REGEX, (match, p1, p2, p3, p4) =>
      p1
        ? `REF("${p1}"${p2 ? `,"${p2}"` : ''})`
        : `REF("${p3}"${p4 ? `,"${p4}"` : ''})`
    )
    return evaluate(formula)
  }

  // Singleton pattern
  private static instance: FormulaEvaluator | undefined

  static getInstance(): FormulaEvaluator {
    if (!this.instance) {
      this.instance = new FormulaEvaluator()
    }
    return this.instance
  }
}

export default FormulaEvaluator
