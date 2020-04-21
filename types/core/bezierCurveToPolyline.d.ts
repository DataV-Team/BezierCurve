import { BezierCurve, Point } from '../types/index';
/**
 * @description Transform bezierCurve to polyline
 * @param {BezierCurve} bezierCurve bezier curve
 * @param {number} precision        Wanted precision (Not always achieveable)
 * @param {number} recursiveCount   Recursive count
 */
export declare function bezierCurveToPolyline(bezierCurve: BezierCurve, precision?: number, recursiveCount?: number): Point[];
export declare function getBezierCurveLength(bezierCurve: BezierCurve, precision?: number, recursiveCount?: number): number;
export default bezierCurveToPolyline;
