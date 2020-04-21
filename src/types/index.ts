export type Point = [number, number]

/**
 * [controlPoint1, controlPoint2, endPoint]
 */
export type BezierCurveSegment = [Point, Point, Point]

export type BezierCurve = [Point, BezierCurveSegment, ...BezierCurveSegment[]]

export type GetBezierCurveTPointFunction = (t: number) => Point

export type SegmentPointsData = {
  totalLength: number
  segmentLength: number[]
  avgDistance: number
  deviation: number
}