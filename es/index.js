/*! *****************************************************************************
Copyright (c) Microsoft Corporation. All rights reserved.
Licensed under the Apache License, Version 2.0 (the "License"); you may not use
this file except in compliance with the License. You may obtain a copy of the
License at http://www.apache.org/licenses/LICENSE-2.0

THIS CODE IS PROVIDED ON AN *AS IS* BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
KIND, EITHER EXPRESS OR IMPLIED, INCLUDING WITHOUT LIMITATION ANY IMPLIED
WARRANTIES OR CONDITIONS OF TITLE, FITNESS FOR A PARTICULAR PURPOSE,
MERCHANTABLITY OR NON-INFRINGEMENT.

See the Apache Version 2.0 License for specific language governing permissions
and limitations under the License.
***************************************************************************** */

function __spreadArrays() {
    for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
    for (var r = Array(s), k = 0, i = 0; i < il; i++)
        for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
            r[k] = a[j];
    return r;
}

var DEFAULT_SEGMENT_POINTS_NUM = 50;

function getBezierCurveStartPoint(bezierCurve) {
  return bezierCurve[0];
}

function getBezierCurveEndPoint(bezierCurve) {
  return bezierCurve.slice(-1)[2];
}

function getBezierCurveSegments(bezierCurve) {
  return bezierCurve.slice(1);
}
/**
 * @description  Generate a function to calculate the point coordinates at time t
 * @param {Point} beginPoint    BezierCurve begin point. [x, y]
 * @param {Point} controlPoint1 BezierCurve controlPoint1. [x, y]
 * @param {Point} controlPoint2 BezierCurve controlPoint2. [x, y]
 * @param {Point} endPoint      BezierCurve end point. [x, y]
 * @return {GetBezierCurveTPointFunction} Expected function
 */


function createGetBezierCurveTPointFun(beginPoint, controlPoint1, controlPoint2, endPoint) {
  var cache = new Map([]);
  return function (t) {
    if (cache.has(t)) return cache.get(t);
    var subtractedT = 1 - t;
    var subtractedTPow3 = Math.pow(subtractedT, 3);
    var subtractedTPow2 = Math.pow(subtractedT, 2);
    var tPow3 = Math.pow(t, 3);
    var tPow2 = Math.pow(t, 2);
    var point = [beginPoint[0] * subtractedTPow3 + 3 * controlPoint1[0] * t * subtractedTPow2 + 3 * controlPoint2[0] * tPow2 * subtractedT + endPoint[0] * tPow3, beginPoint[1] * subtractedTPow3 + 3 * controlPoint1[1] * t * subtractedTPow2 + 3 * controlPoint2[1] * tPow2 * subtractedT + endPoint[1] * tPow3];
    cache.set(t, point);
    return point;
  };
}

function createGetSegmentTPointFuns(bezierCurve) {
  var segments = getBezierCurveSegments(bezierCurve);
  var startPoint = getBezierCurveStartPoint(bezierCurve);
  return segments.map(function (segment, i) {
    var beginPoint = i === 0 ? startPoint : segments[i - 1][2];
    return createGetBezierCurveTPointFun.apply(void 0, __spreadArrays([beginPoint], segment));
  });
}
/**
 * @description Get segment points by
 * @param {GetBezierCurveTPointFunction[]} getSegmentTPointFuns Multiple sets of point data
 * @param {number[]} segmentPointsNum Multiple sets of point data
 * @return {Point[][]} Segment points
 */


function getSegmentPointsByNum(getSegmentTPointFuns, segmentPointsNum) {
  return getSegmentTPointFuns.map(function (getSegmentTPointFun, i) {
    var tGap = 1 / (segmentPointsNum[i] - 1);
    return new Array(segmentPointsNum[i]).fill(0).map(function (_, j) {
      return getSegmentTPointFun(j * tGap);
    });
  });
}

function createSegmentPoints(getSegmentTPointFuns) {
  var length = getSegmentTPointFuns.length; // Initialize the curve to a polyline

  var segmentPointsNum = new Array(length).fill(DEFAULT_SEGMENT_POINTS_NUM);
  return getSegmentPointsByNum(getSegmentTPointFuns, segmentPointsNum);
}
/**
 * @description Get the distance between two points
 * @param {Point} point1 BezierCurve begin point. [x, y]
 * @param {Point} point2 BezierCurve controlPoint1. [x, y]
 * @return {Number} Expected distance
 */


function getTwoPointDistance(_a, _b) {
  var ax = _a[0],
      ay = _a[1];
  var bx = _b[0],
      by = _b[1];
  return Math.sqrt(Math.pow(ax - bx, 2) + Math.pow(ay - by, 2));
}
/**
 * @description Get the distance of multiple sets of points
 * @param {Point[]} segmentPoints Multiple sets of point data
 * @return {number[]} Distance of multiple sets of point data
 */


function getPointsDistance(points) {
  return new Array(points.length - 1).fill(0).map(function (_, j) {
    return getTwoPointDistance(points[j], points[j + 1]);
  });
}

function getSegmentPointsDistance(segmentPoints) {
  return segmentPoints.map(getPointsDistance);
}
/**
 * @description Get the sum of the array of numbers
 * @param {Array} nums An array of numbers
 * @return {Number} Expected sum
 */


function getNumsSum(nums) {
  return nums.reduce(function (sum, num) {
    return sum + num;
  }, 0);
}
/**
 * @description Get the sum of deviations between line segment and the average length
 * @param {Array} segmentPointsDistance Segment length of polyline
 * @param {Number} avgLength            Average length of the line segment
 * @return {Number} Deviations
 */


function getAllDeviations(segmentPointsDistance, avgLength) {
  var calcDeviation = function calcDeviation(distance) {
    return distance.map(function (d) {
      return Math.abs(d - avgLength);
    });
  };

  return getNumsSum(segmentPointsDistance.map(calcDeviation).map(getNumsSum));
}

function getSegmentPointsData(segmentPoints) {
  var segmentPointsDistance = getSegmentPointsDistance(segmentPoints);
  var lineSegmentNum = getNumsSum(segmentPointsDistance.map(function (_a) {
    var length = _a.length;
    return length;
  }));
  var segmentLength = segmentPointsDistance.map(getNumsSum);
  var totalLength = getNumsSum(segmentLength);
  var avgDistance = totalLength / lineSegmentNum;
  var deviation = getAllDeviations(segmentPointsDistance, avgDistance);
  return {
    totalLength: totalLength,
    segmentLength: segmentLength,
    avgDistance: avgDistance,
    deviation: deviation
  };
}

function mergeSegmentPoints(segmentPoints) {
  return segmentPoints.reduce(function (_, __) {
    return __spreadArrays(_, __);
  }, []);
}

function getSegmentPointsCount(segmentPoints) {
  return mergeSegmentPoints(segmentPoints).length;
}

function reGetSegmentPoints(segmentPoints, getSegmentTPointFuns, _a, precision) {
  var avgDistance = _a.avgDistance,
      totalLength = _a.totalLength,
      segmentLength = _a.segmentLength;
  var pointsCount = getSegmentPointsCount(segmentPoints); // 多加一些点 便于精确计算

  pointsCount = Math.ceil(avgDistance / precision * pointsCount * 1.1); // 细分到每大段折线段的points总数

  var segmentPointsNum = segmentLength.map(function (length) {
    return Math.ceil(length / totalLength * pointsCount);
  }); // 再次获取每大段折线的points坐标
  // Calculate the points after redistribution

  return getSegmentPointsByNum(getSegmentTPointFuns, segmentPointsNum);
}

function recursiveCalcSegmentPoints(segmentPoints, getSegmentTPointFuns, _a) {
  var avgDistance = _a.avgDistance;
  var pointsCount = getSegmentPointsCount(segmentPoints); // 每次增量

  var stepSize = 1 / pointsCount / 10; // Recursively for each segment of the polyline

  getSegmentTPointFuns.forEach(function (getSegmentTPointFun, i) {
    var currentSegmentPointsNum = segmentPoints[i].length;
    var tGap = 1 / (currentSegmentPointsNum - 1); // t数组

    var t = new Array(currentSegmentPointsNum).fill(0).map(function (_, j) {
      return j * tGap;
    }); // Repeated recursive offset

    for (var r = 0; r < 10; r++) {
      var distance = getPointsDistance(segmentPoints[i]);
      var deviations = distance.map(function (d) {
        return d - avgDistance;
      });
      var offset = 0;

      for (var j = 0; j < currentSegmentPointsNum; j++) {
        if (j === 0) return;
        offset += deviations[j - 1];
        t[j] -= stepSize * offset;
        if (t[j] > 1) t[j] = 1;
        if (t[j] < 0) t[j] = 0;
        segmentPoints[i][j] = getSegmentTPointFun(t[j]);
      }
    }
  });
  return segmentPoints;
}

function calcUniformPointsByIteration(segmentPoints, getSegmentTPointFuns, precision, number) {
  if (number === void 0) {
    number = 0;
  }

  var segmentPointsData = getSegmentPointsData(segmentPoints);
  if (segmentPointsData.deviation <= precision) return mergeSegmentPoints(segmentPoints);
  segmentPoints = reGetSegmentPoints(segmentPoints, getSegmentTPointFuns, segmentPointsData, precision);
  segmentPointsData = getSegmentPointsData(segmentPoints);
  segmentPoints = recursiveCalcSegmentPoints(segmentPoints, getSegmentTPointFuns, segmentPointsData);
  if (number++ > 10) return mergeSegmentPoints(segmentPoints);
  return calcUniformPointsByIteration(segmentPoints, getSegmentTPointFuns, precision, number);
}
/**
 * @description               Abstract the curve as a polyline consisting of N points
 * @param {BezierCurve} bezierCurve bezierCurve data
 * @param {Number} precision  calculation accuracy. Recommended for 1-20. Default = 5
 * @return {Object}           Calculation results and related data
 * @return {Array}            Option.segmentPoints Point data that constitutes a polyline after calculation
 * @return {Number}           Option.cycles Number of iterations
 * @return {Number}           Option.rounds The number of recursions for the last iteration
 */


function abstractBezierCurveToPolyline(bezierCurve, precision) {
  if (precision === void 0) {
    precision = 5;
  }

  var getSegmentTPointFuns = createGetSegmentTPointFuns(bezierCurve);
  var segmentPoints = createSegmentPoints(getSegmentTPointFuns); // Calculate uniformly distributed points by iteratively

  var polyline = calcUniformPointsByIteration(segmentPoints, getSegmentTPointFuns, precision);
  var endPoint = getBezierCurveEndPoint(bezierCurve);
  polyline.push(endPoint);
  return polyline;
}
/**
 * @description Get the polyline corresponding to the Bezier curve
 * @param {BezierCurve} bezierCurve BezierCurve data
 * @param {Number} precision  Calculation accuracy. Recommended for 1-20. Default = 5
 * @return {Array|null} Point data that constitutes a polyline after calculation (Invalid input will return null)
 */


function bezierCurveToPolyline(bezierCurve, precision) {
  if (precision === void 0) {
    precision = 5;
  }

  if (!bezierCurve) return null;
  if (!(bezierCurve instanceof Array)) return null;
  if (bezierCurve.length <= 1) return null;
  if (typeof precision !== 'number') return null;
  return abstractBezierCurveToPolyline(bezierCurve, precision);
}
/**
 * @description Get the bezier curve length
 * @param {Array} bezierCurve bezierCurve data
 * @param {Number} precision  calculation accuracy. Recommended for 5-10. Default = 5
 * @return {Number|Boolean} BezierCurve length (Invalid input will return false)
 */

function getBezierCurveLength(bezierCurve, precision) {
  if (precision === void 0) {
    precision = 5;
  }

  var polyline = bezierCurveToPolyline(bezierCurve, precision);
  if (polyline) return null; // Calculate the total length of the points that make up the polyline

  var pointsDistance = getPointsDistance(polyline);
  return getNumsSum(pointsDistance);
}

/**
 * @description Get the control points of the Bezier curve
 * @param {Array} polyline A set of points that make up a polyline
 * @param {Number} index   The index of which get controls points's point in polyline
 * @param {Boolean} close  Closed curve
 * @param {Number} offsetA Smoothness
 * @param {Number} offsetB Smoothness
 * @return {Array} Control points
 */

function getBezierCurveLineControlPoints(polyline, index, close, offsetA, offsetB) {
  if (close === void 0) {
    close = false;
  }

  if (offsetA === void 0) {
    offsetA = 0.25;
  }

  if (offsetB === void 0) {
    offsetB = 0.25;
  }

  var pointNum = polyline.length;
  if (pointNum < 3 || index >= pointNum) return null;
  var beforePointIndex = index - 1;
  if (beforePointIndex < 0) beforePointIndex = close ? pointNum + beforePointIndex : 0;
  var afterPointIndex = index + 1;
  if (afterPointIndex >= pointNum) afterPointIndex = close ? afterPointIndex - pointNum : pointNum - 1;
  var afterNextPointIndex = index + 2;
  if (afterNextPointIndex >= pointNum) afterNextPointIndex = close ? afterNextPointIndex - pointNum : pointNum - 1;
  var pointBefore = polyline[beforePointIndex];
  var pointMiddle = polyline[index];
  var pointAfter = polyline[afterPointIndex];
  var pointAfterNext = polyline[afterNextPointIndex];
  return [[pointMiddle[0] + offsetA * (pointAfter[0] - pointBefore[0]), pointMiddle[1] + offsetA * (pointAfter[1] - pointBefore[1])], [pointAfter[0] - offsetB * (pointAfterNext[0] - pointMiddle[0]), pointAfter[1] - offsetB * (pointAfterNext[1] - pointMiddle[1])]];
}
/**
 * @description Get the symmetry point
 * @param {Array} point       Symmetric point
 * @param {Array} centerPoint Symmetric center
 * @return {Array} Symmetric point
 */


function getSymmetryPoint(point, centerPoint) {
  var px = point[0],
      py = point[1];
  var cx = centerPoint[0],
      cy = centerPoint[1];
  var minusX = cx - px;
  var minusY = cy - py;
  return [cx + minusX, cy + minusY];
}
/**
 * @description Get the last curve of the closure
 * @param {Array} bezierCurve A set of sub-curve
 * @param {Array} startPoint  Start point
 * @return {Array} The last curve for closure
 */


function closeBezierCurve(bezierCurve, startPoint) {
  var firstSubCurve = bezierCurve[0];
  var lastSubCurve = bezierCurve.slice(-1)[0];
  bezierCurve.push([getSymmetryPoint(lastSubCurve[1], lastSubCurve[2]), getSymmetryPoint(firstSubCurve[0], startPoint), startPoint]);
  return bezierCurve;
}
/**
 * @description Abstract the polyline formed by N points into a set of bezier curve
 * @param {Array} polyline A set of points that make up a polyline
 * @param {Boolean} close  Closed curve
 * @param {Number} offsetA Smoothness
 * @param {Number} offsetB Smoothness
 * @return {Array|Boolean} A set of bezier curve (Invalid input will return false)
 */


function polylineToBezierCurve(polyline, close, offsetA, offsetB) {
  if (close === void 0) {
    close = false;
  }

  if (offsetA === void 0) {
    offsetA = 0.25;
  }

  if (offsetB === void 0) {
    offsetB = 0.25;
  }

  if (!(polyline instanceof Array)) return null;
  if (polyline.length <= 2) return null;
  var startPoint = polyline[0];
  var bezierCurveLineNum = polyline.length - 1;
  var bezierCurvePoints = new Array(bezierCurveLineNum).fill(0).map(function (_, i) {
    return __spreadArrays(getBezierCurveLineControlPoints(polyline, i, close, offsetA, offsetB), [polyline[i + 1]]);
  });
  if (close) closeBezierCurve(bezierCurvePoints, startPoint);
  bezierCurvePoints.unshift(polyline[0]);
  return bezierCurvePoints;
}

var index = {
  bezierCurveToPolyline: bezierCurveToPolyline,
  getBezierCurveLength: getBezierCurveLength,
  polylineToBezierCurve: polylineToBezierCurve
};

export default index;
export { bezierCurveToPolyline, getBezierCurveLength, polylineToBezierCurve };
