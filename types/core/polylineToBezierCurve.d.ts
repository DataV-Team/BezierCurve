import { Point, BezierCurve } from '../types';
/**
 * @description Convert polyline to bezierCurve
 * @param {Point[]} polyline A set of points that make up a polyline
 * @param {boolean} close    Closed curve
 * @param {number} offsetA   Smoothness
 * @param {number} offsetB   Smoothness
 * @return {BezierCurve} A set of bezier curve (Invalid input will return false)
 */
declare function polylineToBezierCurve(polyline: Point[], close?: boolean, offsetA?: number, offsetB?: number): BezierCurve;
export default polylineToBezierCurve;
