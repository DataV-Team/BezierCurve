import { BezierCurve, Point } from 'types/index';
/**
 * @description Get the polyline corresponding to the Bezier curve
 * @param {BezierCurve} bezierCurve BezierCurve data
 * @param {Number} precision  Calculation accuracy. Recommended for 1-20. Default = 5
 * @return {Array|null} Point data that constitutes a polyline after calculation (Invalid input will return null)
 */
export declare function bezierCurveToPolyline(bezierCurve: BezierCurve, precision?: number): Point[] | null;
/**
 * @description Get the bezier curve length
 * @param {Array} bezierCurve bezierCurve data
 * @param {Number} precision  calculation accuracy. Recommended for 5-10. Default = 5
 * @return {Number|Boolean} BezierCurve length (Invalid input will return false)
 */
export declare function getBezierCurveLength(bezierCurve: BezierCurve, precision?: number): number | null;
export default bezierCurveToPolyline;
