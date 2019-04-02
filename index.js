import bezierCurveToPolyline from './lib/bezierCurveToPolyline'

import { getBezierCurveLength } from './lib/bezierCurveToPolyline'

import polylineToBezierCurve from './lib/polylineToBezierCurve'

export {
  bezierCurveToPolyline,
  getBezierCurveLength,
  polylineToBezierCurve
}

const point = [
  [30, 30],
  [50, 10],
  [70, 30]
]

console.error(1111)

// console.log(polylineToBezierCurve(point))