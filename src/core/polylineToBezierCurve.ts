import { Point, BezierCurve } from '../types'

/**
 * @description Get the control points of the Bezier curve
 * @param {Point[]} polyline A set of points that make up a polyline
 * @param {number} index   The index of which get controls points's point in polyline
 * @param {boolean} close  Closed curve
 * @param {number} offsetA Smoothness
 * @param {number} offsetB Smoothness
 * @return {Point[]|null} Control points
 */
function getBezierCurveLineControlPoints(
  polyline: Point[],
  index: number,
  close = false,
  offsetA = 0.25,
  offsetB = 0.25
): Point[] | null {
  const pointNum = polyline.length

  if (pointNum < 3 || index >= pointNum) return null

  let beforePointIndex = index - 1
  if (beforePointIndex < 0) beforePointIndex = close ? pointNum + beforePointIndex : 0

  let afterPointIndex = index + 1
  if (afterPointIndex >= pointNum)
    afterPointIndex = close ? afterPointIndex - pointNum : pointNum - 1

  let afterNextPointIndex = index + 2
  if (afterNextPointIndex >= pointNum)
    afterNextPointIndex = close ? afterNextPointIndex - pointNum : pointNum - 1

  const pointBefore = polyline[beforePointIndex]
  const pointMiddle = polyline[index]
  const pointAfter = polyline[afterPointIndex]
  const pointAfterNext = polyline[afterNextPointIndex]

  return [
    [
      pointMiddle[0] + offsetA * (pointAfter[0] - pointBefore[0]),
      pointMiddle[1] + offsetA * (pointAfter[1] - pointBefore[1]),
    ],
    [
      pointAfter[0] - offsetB * (pointAfterNext[0] - pointMiddle[0]),
      pointAfter[1] - offsetB * (pointAfterNext[1] - pointMiddle[1]),
    ],
  ]
}

/**
 * @description Get the symmetry point
 * @param {Point} point       Symmetric point
 * @param {Point} centerPoint Symmetric center
 * @return {Point} Symmetric point
 */
function getSymmetryPoint([px, py]: Point, [cx, cy]: Point): Point {
  const minusX = cx - px
  const minusY = cy - py

  return [cx + minusX, cy + minusY]
}

/**
 * @description Get the last curve of the closure
 */
function closeBezierCurve(bezierCurve: BezierCurve, startPoint: Point): BezierCurve {
  const firstSubCurve = bezierCurve[0]
  const lastSubCurve = bezierCurve.slice(-1)[0]

  bezierCurve.push([
    getSymmetryPoint(lastSubCurve[1] as Point, lastSubCurve[2] as Point),
    getSymmetryPoint((firstSubCurve[0] as unknown) as Point, startPoint),
    startPoint,
  ])

  return bezierCurve
}

/**
 * @description Convert polyline to bezierCurve
 * @param {Point[]} polyline A set of points that make up a polyline
 * @param {boolean} close  Closed curve
 * @param {number} offsetA Smoothness
 * @param {number} offsetB Smoothness
 * @return {BezierCurve|null} A set of bezier curve (Invalid input will return false)
 */
function polylineToBezierCurve(
  polyline: Point[],
  close = false,
  offsetA = 0.25,
  offsetB = 0.25
): BezierCurve | null {
  if (!(polyline instanceof Array)) return null

  if (polyline.length <= 2) return null

  const startPoint = polyline[0]

  const bezierCurveLineNum = polyline.length - 1

  const bezierCurvePoints = new Array(bezierCurveLineNum)
    .fill(0)
    .map((_, i) => [
      ...getBezierCurveLineControlPoints(polyline, i, close, offsetA, offsetB)!,
      polyline[i + 1],
    ]) as BezierCurve

  if (close) closeBezierCurve(bezierCurvePoints, startPoint)

  bezierCurvePoints.unshift(polyline[0])

  return bezierCurvePoints
}

export default polylineToBezierCurve
