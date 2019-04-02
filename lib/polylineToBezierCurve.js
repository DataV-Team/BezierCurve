/**
 * @description Abstract the polyline formed by N points into a set of bezier curve
 * @param {Array} polyline A set of points that make up a polyline
 */
function polylineToBezierCurve (polyline, close = false, offsetA = 0.25, offsetB = 0.25) {
  if (polyline.length <= 2) {
    console.error('Converting to a curve requires at least 3 points!')

    return false
  }

  const startPoint = polyline[0]

  const bezierCurveLineNum = polyline.length - 1

  const bezierCurvePoints = new Array(bezierCurveLineNum).fill(0).map((foo, i) =>
    [...getBezierCurveLineControlPoints(polyline, i, close, offsetA, offsetB), polyline[i + 1]])

  if (close) closeBezierCurve(bezierCurvePoints, startPoint)

  bezierCurvePoints.unshift(polyline[0])

  return bezierCurvePoints
}

function getBezierCurveLineControlPoints (points, index, close = false, offsetA = 0.25, offsetB = 0.25) {
  const pointNum = points.length

  if (pointNum < 3 || index >= pointNum) return

  let beforePointIndex = index - 1
  if (beforePointIndex < 0) beforePointIndex = (close ? pointNum + beforePointIndex : 0)

  let afterPointIndex = index + 1
  if (afterPointIndex >= pointNum) afterPointIndex = (close ? afterPointIndex - pointNum : pointNum - 1)

  let afterNextPointIndex = index + 2
  if (afterNextPointIndex >= pointNum) afterNextPointIndex = (close ? afterNextPointIndex - pointNum : pointNum - 1)

  const pointBefore = points[beforePointIndex]
  const pointMiddle = points[index]
  const pointAfter = points[afterPointIndex]
  const pointAfterNext = points[afterNextPointIndex]

  return [
    [
      pointMiddle[0] + offsetA * (pointAfter[0] - pointBefore[0]),
      pointMiddle[1] + offsetA * (pointAfter[1] - pointBefore[1])
    ],
    [
      pointAfter[0] - offsetB * (pointAfterNext[0] - pointMiddle[0]),
      pointAfter[1] - offsetB * (pointAfterNext[1] - pointMiddle[1])
    ]
  ]
}

function closeBezierCurve (bezierCurve, startPoint) {
  const firstSubCurve = bezierCurve[0]
  const lastSubCurve = bezierCurve.slice(-1)[0]

  bezierCurve.push([
    getSymmetryPoint(lastSubCurve[1], lastSubCurve[2]),
    getSymmetryPoint(firstSubCurve[0], startPoint),
    startPoint
  ])

  return bezierCurve
}

function getSymmetryPoint (point, centerPoint) {
  const [px, py] = point
  const [cx, cy] = centerPoint

  const minusX = cx - px
  const minusY = cy - py

  return [cx + minusX, cy + minusY]
}

export default polylineToBezierCurve