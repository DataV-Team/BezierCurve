import { expect } from 'chai'
import { bezierCurveToPolyline, getBezierCurveLength, polylineToBezierCurve } from '../src/index'
// import { BezierCurve } from '../src/types'

// const bezierCurve: BezierCurve = [
//   [20, 20],
//   [
//     [100, 20],
//     [100, 80],
//     [180, 80],
//   ],
// ]

// const polylinePrecision5 = bezierCurveToPolyline(bezierCurve)
// const polylinePrecision10 = bezierCurveToPolyline(bezierCurve, 10)

const INVALID_ERROR_REGEXP = /Invalid input of/
const LENGTH_ERROR_REGEXP = /should be greater/

describe('bezierCurveToPolyline', () => {
  it('bezierCurveToPolyline()', () => {
    expect(() => {
      // @ts-ignore
      bezierCurveToPolyline()
    }).to.throw(INVALID_ERROR_REGEXP)
  })

  it('bezierCurveToPolyline({})', () => {
    expect(() => {
      // @ts-ignore
      bezierCurveToPolyline({})
    }).to.throw(INVALID_ERROR_REGEXP)
  })

  it(`bezierCurveToPolyline([], '1')`, () => {
    expect(() => {
      // @ts-ignore
      bezierCurveToPolyline([], '1')
    }).to.throw(LENGTH_ERROR_REGEXP)
  })
})

describe('getBezierCurveLength', () => {
  it('getBezierCurveLength()', () => {
    expect(() => {
      // @ts-ignore
      getBezierCurveLength()
    }).to.throw(INVALID_ERROR_REGEXP)
  })

  it('getBezierCurveLength({})', () => {
    expect(() => {
      // @ts-ignore
      getBezierCurveLength({})
    }).to.throw(INVALID_ERROR_REGEXP)
  })

  it(`getBezierCurveLength([], '1')`, () => {
    expect(() => {
      // @ts-ignore
      getBezierCurveLength([], '1')
    }).to.throw(LENGTH_ERROR_REGEXP)
  })
})

describe('polylineToBezierCurve', () => {
  it('polylineToBezierCurve()', () => {
    expect(() => {
      // @ts-ignore
      polylineToBezierCurve()
    }).to.throw(INVALID_ERROR_REGEXP)
  })

  it('polylineToBezierCurve({})', () => {
    expect(() => {
      // @ts-ignore
      polylineToBezierCurve({})
    }).to.throw(INVALID_ERROR_REGEXP)
  })
})
