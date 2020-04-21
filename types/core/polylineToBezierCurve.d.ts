import { Point, BezierCurve } from 'types/index';
/**
 * @description Abstract the polyline formed by N points into a set of bezier curve
 * @param {Array} polyline A set of points that make up a polyline
 * @param {Boolean} close  Closed curve
 * @param {Number} offsetA Smoothness
 * @param {Number} offsetB Smoothness
 * @return {Array|Boolean} A set of bezier curve (Invalid input will return false)
 */
declare function polylineToBezierCurve(polyline: Point[], close?: boolean, offsetA?: number, offsetB?: number): BezierCurve | null;
export default polylineToBezierCurve;
