'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

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
  return bezierCurve.slice(-1)[0][2];
}

function getBezierCurveSegments(bezierCurve) {
  return bezierCurve.slice(1);
}
/**
 * @description Get the sum of the {number[]}
 */


function getNumSum(nums) {
  return nums.reduce(function (sum, num) {
    return sum + num;
  }, 0);
}
/**
 * @description Get the distance between two points
 */


function getTwoPointDistance(_a, _b) {
  var ax = _a[0],
      ay = _a[1];
  var bx = _b[0],
      by = _b[1];
  return Math.sqrt(Math.pow(ax - bx, 2) + Math.pow(ay - by, 2));
}

function flatten(input) {
  return input.reduce(function (_, __) {
    return __spreadArrays(_, __);
  }, []);
}
/**
 * @description  Generate a function to calculate the point coordinates at time t
 * @param {Point} beginPoint    BezierCurve begin point
 * @param {Point} controlPoint1 BezierCurve controlPoint1
 * @param {Point} controlPoint2 BezierCurve controlPoint2
 * @param {Point} endPoint      BezierCurve end point
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
/**
 * @description Create {GetBezierCurveTPointFunction} for every segment of bezierCurve
 */


function createGetSegmentTPointFuns(bezierCurve) {
  var segments = getBezierCurveSegments(bezierCurve);
  var startPoint = getBezierCurveStartPoint(bezierCurve);
  return segments.map(function (segment, i) {
    var beginPoint = i === 0 ? startPoint : segments[i - 1][2];
    return createGetBezierCurveTPointFun.apply(void 0, __spreadArrays([beginPoint], segment));
  });
}

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
 * @description Get the distance of multiple sets of points
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

  return getNumSum(segmentPointsDistance.map(calcDeviation).map(getNumSum));
}

function getSegmentPointsData(segmentPoints) {
  var segmentPointsDistance = getSegmentPointsDistance(segmentPoints);
  var lineSegmentNum = getNumSum(segmentPointsDistance.map(function (_a) {
    var length = _a.length;
    return length;
  }));
  var segmentLength = segmentPointsDistance.map(getNumSum);
  var totalLength = getNumSum(segmentLength);
  var avgDistance = totalLength / lineSegmentNum;
  var deviation = getAllDeviations(segmentPointsDistance, avgDistance);
  return {
    totalLength: totalLength,
    segmentLength: segmentLength,
    avgDistance: avgDistance,
    deviation: deviation
  };
}

function getSegmentPointsCount(segmentPoints) {
  return flatten(segmentPoints).length;
}

function reGetSegmentPoints(segmentPoints, getSegmentTPointFuns, _a, precision) {
  var avgDistance = _a.avgDistance,
      totalLength = _a.totalLength,
      segmentLength = _a.segmentLength;
  var pointsCount = getSegmentPointsCount(segmentPoints); // Add more points to enhance accuracy

  pointsCount = Math.ceil(avgDistance / precision * pointsCount * 1.1); // Redistribution points acount

  var segmentPointsNum = segmentLength.map(function (length) {
    return Math.ceil(length / totalLength * pointsCount);
  }) // At least need two points
  .map(function (_) {
    return _ > 1 ? _ : 2;
  }); // Calculate the points after redistribution

  return getSegmentPointsByNum(getSegmentTPointFuns, segmentPointsNum);
}

function recursiveCalcSegmentPoints(segmentPoints, getSegmentTPointFuns, _a, recursiveCount) {
  var avgDistance = _a.avgDistance;
  var pointsCount = getSegmentPointsCount(segmentPoints);
  var stepSize = 1 / pointsCount / 10; // Recursively for each segment of the polyline

  getSegmentTPointFuns.forEach(function (getSegmentTPointFun, i) {
    var currentSegmentPointsNum = segmentPoints[i].length;
    var tGap = 1 / (currentSegmentPointsNum - 1);
    var t = new Array(currentSegmentPointsNum).fill(0).map(function (_, j) {
      return j * tGap;
    }); // Repeated recursive offset

    for (var r = 0; r < recursiveCount; r++) {
      var distance = getPointsDistance(segmentPoints[i]);
      var deviations = distance.map(function (d) {
        return d - avgDistance;
      });
      var offset = 0;

      for (var j = 0; j < currentSegmentPointsNum; j++) {
        if (j === 0) continue;
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

function calcUniformPointsByIteration(segmentPoints, getSegmentTPointFuns, precision, recursiveCount) {
  console.warn('-------------start-------------');
  var segmentPointsData = getSegmentPointsData(segmentPoints);
  if (segmentPointsData.deviation <= precision) return flatten(segmentPoints);
  segmentPoints = reGetSegmentPoints(segmentPoints, getSegmentTPointFuns, segmentPointsData, precision);
  if (recursiveCount <= 0) return flatten(segmentPoints);
  segmentPointsData = getSegmentPointsData(segmentPoints);
  segmentPoints = recursiveCalcSegmentPoints(segmentPoints, getSegmentTPointFuns, segmentPointsData, recursiveCount);
  return flatten(segmentPoints);
}
/**
 * @description Convert bezierCurve to polyline.
 * Calculation results cannot guarantee accuracy！
 * Recusive calculation can get more accurate results
 * @param {BezierCurve} bezierCurve bezierCurve data
 * @param {number} precision        calculation accuracy. Recommended for 1-20
 * @param {number} recursiveCount   Recursive count
 */


function convertBezierCurveToPolyline(bezierCurve, precision, recursiveCount) {
  if (precision === void 0) {
    precision = 5;
  }

  if (recursiveCount === void 0) {
    recursiveCount = 0;
  }

  var getSegmentTPointFuns = createGetSegmentTPointFuns(bezierCurve);
  var segmentPoints = createSegmentPoints(getSegmentTPointFuns); // Calculate uniformly distributed points by iteratively

  var polyline = calcUniformPointsByIteration(segmentPoints, getSegmentTPointFuns, precision, recursiveCount);
  var endPoint = getBezierCurveEndPoint(bezierCurve);
  polyline.push(endPoint);
  return polyline;
}
/**
 * @description Transform bezierCurve to polyline
 * @param {BezierCurve} bezierCurve bezier curve
 * @param {number} precision        Wanted precision (Not always achieveable)
 * @param {number} recursiveCount   Recursive count
 */


function bezierCurveToPolyline(bezierCurve, precision, recursiveCount) {
  if (precision === void 0) {
    precision = 5;
  }

  if (recursiveCount === void 0) {
    recursiveCount = 0;
  }

  if (!(bezierCurve instanceof Array)) throw new Error("bezierCurveToPolyline: Invalid input of " + bezierCurve);
  if (bezierCurve.length <= 1) throw new Error("bezierCurveToPolyline: The length of the bezierCurve should be greater than 1");
  if (typeof precision !== 'number') throw new Error("bezierCurveToPolyline: Type of precision must be number");
  return convertBezierCurveToPolyline(bezierCurve, precision, recursiveCount);
}
function getBezierCurveLength(bezierCurve, precision, recursiveCount) {
  if (precision === void 0) {
    precision = 5;
  }

  if (recursiveCount === void 0) {
    recursiveCount = 0;
  }

  var polyline = bezierCurveToPolyline(bezierCurve, precision, recursiveCount);
  var pointsDistance = getPointsDistance(polyline);
  return getNumSum(pointsDistance);
}

/**
 * @description Get the control points of the Bezier curve
 * @param {Point[]} polyline A set of points that make up a polyline
 * @param {number} index   The index of which get controls points's point in polyline
 * @param {boolean} close  Closed curve
 * @param {number} offsetA Smoothness
 * @param {number} offsetB Smoothness
 * @return {Point[]|null} Control points
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
 * @param {Point} point       Symmetric point
 * @param {Point} centerPoint Symmetric center
 * @return {Point} Symmetric point
 */


function getSymmetryPoint(_a, _b) {
  var px = _a[0],
      py = _a[1];
  var cx = _b[0],
      cy = _b[1];
  var minusX = cx - px;
  var minusY = cy - py;
  return [cx + minusX, cy + minusY];
}
/**
 * @description Get the last curve of the closure
 */


function closeBezierCurve(bezierCurve, startPoint) {
  var firstSubCurve = bezierCurve[0];
  var lastSubCurve = bezierCurve.slice(-1)[0];
  bezierCurve.push([getSymmetryPoint(lastSubCurve[1], lastSubCurve[2]), getSymmetryPoint(firstSubCurve[0], startPoint), startPoint]);
  return bezierCurve;
}
/**
 * @description Convert polyline to bezierCurve
 * @param {Point[]} polyline A set of points that make up a polyline
 * @param {boolean} close    Closed curve
 * @param {number} offsetA   Smoothness
 * @param {number} offsetB   Smoothness
 * @return {BezierCurve} A set of bezier curve (Invalid input will return false)
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

  if (!(polyline instanceof Array)) throw new Error("polylineToBezierCurve: Invalid input of " + polyline);
  if (polyline.length <= 2) throw new Error("polylineToBezierCurve: The length of the polyline should be greater than 2");
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

exports.bezierCurveToPolyline = bezierCurveToPolyline;
exports.default = index;
exports.getBezierCurveLength = getBezierCurveLength;
exports.polylineToBezierCurve = polylineToBezierCurve;
