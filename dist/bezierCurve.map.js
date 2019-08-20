(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
var bezierCurve = require('../lib/index')

window.bezierCurve = bezierCurve
},{"../lib/index":4}],2:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.bezierCurveToPolyline = bezierCurveToPolyline;
exports.getBezierCurveLength = getBezierCurveLength;
exports["default"] = void 0;

function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _nonIterableRest(); }

function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance"); }

function _iterableToArrayLimit(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"] != null) _i["return"](); } finally { if (_d) throw _e; } } return _arr; }

function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }

function _toConsumableArray(arr) { return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _nonIterableSpread(); }

function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance"); }

function _iterableToArray(iter) { if (Symbol.iterator in Object(iter) || Object.prototype.toString.call(iter) === "[object Arguments]") return Array.from(iter); }

function _arrayWithoutHoles(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = new Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } }

var sqrt = Math.sqrt,
    pow = Math.pow,
    ceil = Math.ceil,
    abs = Math.abs; // Initialize the number of points per curve

var defaultSegmentPointsNum = 50;
/**
 * @example data structure of bezierCurve
 * bezierCurve = [
 *  // Starting point of the curve
 *  [10, 10],
 *  // BezierCurve segment data (controlPoint1, controlPoint2, endPoint)
 *  [
 *    [20, 20], [40, 20], [50, 10]
 *  ],
 *  ...
 * ]
 */

/**
 * @description               Abstract the curve as a polyline consisting of N points
 * @param {Array} bezierCurve bezierCurve data
 * @param {Number} precision  calculation accuracy. Recommended for 1-20. Default = 5
 * @return {Object}           Calculation results and related data
 * @return {Array}            Option.segmentPoints Point data that constitutes a polyline after calculation
 * @return {Number}           Option.cycles Number of iterations
 * @return {Number}           Option.rounds The number of recursions for the last iteration
 */

function abstractBezierCurveToPolyline(bezierCurve) {
  var precision = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 5;
  var segmentsNum = bezierCurve.length - 1;
  var startPoint = bezierCurve[0];
  var endPoint = bezierCurve[segmentsNum][2];
  var segments = bezierCurve.slice(1);
  var getSegmentTPointFuns = segments.map(function (seg, i) {
    var beginPoint = i === 0 ? startPoint : segments[i - 1][2];
    return createGetBezierCurveTPointFun.apply(void 0, [beginPoint].concat(_toConsumableArray(seg)));
  }); // Initialize the curve to a polyline

  var segmentPointsNum = new Array(segmentsNum).fill(defaultSegmentPointsNum);
  var segmentPoints = getSegmentPointsByNum(getSegmentTPointFuns, segmentPointsNum); // Calculate uniformly distributed points by iteratively

  var result = calcUniformPointsByIteration(segmentPoints, getSegmentTPointFuns, segments, precision);
  result.segmentPoints.push(endPoint);
  return result;
}
/**
 * @description  Generate a method for obtaining corresponding point by t according to curve data
 * @param {Array} beginPoint    BezierCurve begin point. [x, y]
 * @param {Array} controlPoint1 BezierCurve controlPoint1. [x, y]
 * @param {Array} controlPoint2 BezierCurve controlPoint2. [x, y]
 * @param {Array} endPoint      BezierCurve end point. [x, y]
 * @return {Function} Expected function
 */


function createGetBezierCurveTPointFun(beginPoint, controlPoint1, controlPoint2, endPoint) {
  return function (t) {
    var tSubed1 = 1 - t;
    var tSubed1Pow3 = pow(tSubed1, 3);
    var tSubed1Pow2 = pow(tSubed1, 2);
    var tPow3 = pow(t, 3);
    var tPow2 = pow(t, 2);
    return [beginPoint[0] * tSubed1Pow3 + 3 * controlPoint1[0] * t * tSubed1Pow2 + 3 * controlPoint2[0] * tPow2 * tSubed1 + endPoint[0] * tPow3, beginPoint[1] * tSubed1Pow3 + 3 * controlPoint1[1] * t * tSubed1Pow2 + 3 * controlPoint2[1] * tPow2 * tSubed1 + endPoint[1] * tPow3];
  };
}
/**
 * @description Get the distance between two points
 * @param {Array} point1 BezierCurve begin point. [x, y]
 * @param {Array} point2 BezierCurve controlPoint1. [x, y]
 * @return {Number} Expected distance
 */


function getTwoPointDistance(_ref, _ref2) {
  var _ref3 = _slicedToArray(_ref, 2),
      ax = _ref3[0],
      ay = _ref3[1];

  var _ref4 = _slicedToArray(_ref2, 2),
      bx = _ref4[0],
      by = _ref4[1];

  return sqrt(pow(ax - bx, 2) + pow(ay - by, 2));
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
 * @description Get the distance of multiple sets of points
 * @param {Array} segmentPoints Multiple sets of point data
 * @return {Array} Distance of multiple sets of point data
 */


function getSegmentPointsDistance(segmentPoints) {
  return segmentPoints.map(function (points, i) {
    return new Array(points.length - 1).fill(0).map(function (temp, j) {
      return getTwoPointDistance(points[j], points[j + 1]);
    });
  });
}
/**
 * @description Get the distance of multiple sets of points
 * @param {Array} segmentPoints Multiple sets of point data
 * @return {Array} Distance of multiple sets of point data
 */


function getSegmentPointsByNum(getSegmentTPointFuns, segmentPointsNum) {
  return getSegmentTPointFuns.map(function (getSegmentTPointFun, i) {
    var tGap = 1 / segmentPointsNum[i];
    return new Array(segmentPointsNum[i]).fill('').map(function (foo, j) {
      return getSegmentTPointFun(j * tGap);
    });
  });
}
/**
 * @description Get the sum of deviations between line segment and the average length
 * @param {Array} segmentPointsDistance Segment length of polyline
 * @param {Number} avgLength            Average length of the line segment
 * @return {Number} Deviations
 */


function getAllDeviations(segmentPointsDistance, avgLength) {
  return segmentPointsDistance.map(function (seg) {
    return seg.map(function (s) {
      return abs(s - avgLength);
    });
  }).map(function (seg) {
    return getNumsSum(seg);
  }).reduce(function (total, v) {
    return total + v;
  }, 0);
}
/**
 * @description Calculate uniformly distributed points by iteratively
 * @param {Array} segmentPoints        Multiple setd of points that make up a polyline
 * @param {Array} getSegmentTPointFuns Functions of get a point on the curve with t
 * @param {Array} segments             BezierCurve data
 * @param {Number} precision           Calculation accuracy
 * @return {Object} Calculation results and related data
 * @return {Array}  Option.segmentPoints Point data that constitutes a polyline after calculation
 * @return {Number} Option.cycles Number of iterations
 * @return {Number} Option.rounds The number of recursions for the last iteration
 */


function calcUniformPointsByIteration(segmentPoints, getSegmentTPointFuns, segments, precision) {
  // The number of loops for the current iteration
  var rounds = 4; // Number of iterations

  var cycles = 1;

  var _loop = function _loop() {
    // Recalculate the number of points per curve based on the last iteration data
    var totalPointsNum = segmentPoints.reduce(function (total, seg) {
      return total + seg.length;
    }, 0); // Add last points of segment to calc exact segment length

    segmentPoints.forEach(function (seg, i) {
      return seg.push(segments[i][2]);
    });
    var segmentPointsDistance = getSegmentPointsDistance(segmentPoints);
    var lineSegmentNum = segmentPointsDistance.reduce(function (total, seg) {
      return total + seg.length;
    }, 0);
    var segmentlength = segmentPointsDistance.map(function (seg) {
      return getNumsSum(seg);
    });
    var totalLength = getNumsSum(segmentlength);
    var avgLength = totalLength / lineSegmentNum; // Check if precision is reached

    var allDeviations = getAllDeviations(segmentPointsDistance, avgLength);
    if (allDeviations <= precision) return "break";
    totalPointsNum = ceil(avgLength / precision * totalPointsNum * 1.1);
    var segmentPointsNum = segmentlength.map(function (length) {
      return ceil(length / totalLength * totalPointsNum);
    }); // Calculate the points after redistribution

    segmentPoints = getSegmentPointsByNum(getSegmentTPointFuns, segmentPointsNum);
    totalPointsNum = segmentPoints.reduce(function (total, seg) {
      return total + seg.length;
    }, 0);
    var segmentPointsForLength = JSON.parse(JSON.stringify(segmentPoints));
    segmentPointsForLength.forEach(function (seg, i) {
      return seg.push(segments[i][2]);
    });
    segmentPointsDistance = getSegmentPointsDistance(segmentPointsForLength);
    lineSegmentNum = segmentPointsDistance.reduce(function (total, seg) {
      return total + seg.length;
    }, 0);
    segmentlength = segmentPointsDistance.map(function (seg) {
      return getNumsSum(seg);
    });
    totalLength = getNumsSum(segmentlength);
    avgLength = totalLength / lineSegmentNum;
    var stepSize = 1 / totalPointsNum / 10; // Recursively for each segment of the polyline

    getSegmentTPointFuns.forEach(function (getSegmentTPointFun, i) {
      var currentSegmentPointsNum = segmentPointsNum[i];
      var t = new Array(currentSegmentPointsNum).fill('').map(function (foo, j) {
        return j / segmentPointsNum[i];
      }); // Repeated recursive offset

      for (var r = 0; r < rounds; r++) {
        var distance = getSegmentPointsDistance([segmentPoints[i]])[0];
        var deviations = distance.map(function (d) {
          return d - avgLength;
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
    rounds *= 4;
    cycles++;
  };

  do {
    var _ret = _loop();

    if (_ret === "break") break;
  } while (rounds <= 1025);

  segmentPoints = segmentPoints.reduce(function (all, seg) {
    return all.concat(seg);
  }, []);
  return {
    segmentPoints: segmentPoints,
    cycles: cycles,
    rounds: rounds
  };
}
/**
 * @description Get the polyline corresponding to the Bezier curve
 * @param {Array} bezierCurve BezierCurve data
 * @param {Number} precision  Calculation accuracy. Recommended for 1-20. Default = 5
 * @return {Array|Boolean} Point data that constitutes a polyline after calculation (Invalid input will return false)
 */


function bezierCurveToPolyline(bezierCurve) {
  var precision = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 5;

  if (!bezierCurve) {
    console.error('bezierCurveToPolyline: Missing parameters!');
    return false;
  }

  if (!(bezierCurve instanceof Array)) {
    console.error('bezierCurveToPolyline: Parameter bezierCurve must be an array!');
    return false;
  }

  if (typeof precision !== 'number') {
    console.error('bezierCurveToPolyline: Parameter precision must be a number!');
    return false;
  }

  var _abstractBezierCurveT = abstractBezierCurveToPolyline(bezierCurve, precision),
      segmentPoints = _abstractBezierCurveT.segmentPoints;

  return segmentPoints;
}
/**
 * @description Get the bezier curve length
 * @param {Array} bezierCurve bezierCurve data
 * @param {Number} precision  calculation accuracy. Recommended for 5-10. Default = 5
 * @return {Number|Boolean} BezierCurve length (Invalid input will return false)
 */


function getBezierCurveLength(bezierCurve) {
  var precision = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 5;

  if (!bezierCurve) {
    console.error('getBezierCurveLength: Missing parameters!');
    return false;
  }

  if (!(bezierCurve instanceof Array)) {
    console.error('getBezierCurveLength: Parameter bezierCurve must be an array!');
    return false;
  }

  if (typeof precision !== 'number') {
    console.error('getBezierCurveLength: Parameter precision must be a number!');
    return false;
  }

  var _abstractBezierCurveT2 = abstractBezierCurveToPolyline(bezierCurve, precision),
      segmentPoints = _abstractBezierCurveT2.segmentPoints; // Calculate the total length of the points that make up the polyline


  var pointsDistance = getSegmentPointsDistance([segmentPoints])[0];
  var length = getNumsSum(pointsDistance);
  return length;
}

var _default = bezierCurveToPolyline;
exports["default"] = _default;
},{}],3:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _nonIterableRest(); }

function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance"); }

function _iterableToArrayLimit(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"] != null) _i["return"](); } finally { if (_d) throw _e; } } return _arr; }

function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }

function _toConsumableArray(arr) { return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _nonIterableSpread(); }

function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance"); }

function _iterableToArray(iter) { if (Symbol.iterator in Object(iter) || Object.prototype.toString.call(iter) === "[object Arguments]") return Array.from(iter); }

function _arrayWithoutHoles(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = new Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } }

/**
 * @description Abstract the polyline formed by N points into a set of bezier curve
 * @param {Array} polyline A set of points that make up a polyline
 * @param {Boolean} close  Closed curve
 * @param {Number} offsetA Smoothness
 * @param {Number} offsetB Smoothness
 * @return {Array|Boolean} A set of bezier curve (Invalid input will return false)
 */
function polylineToBezierCurve(polyline) {
  var close = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;
  var offsetA = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 0.25;
  var offsetB = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : 0.25;

  if (!(polyline instanceof Array)) {
    console.error('polylineToBezierCurve: Parameter polyline must be an array!');
    return false;
  }

  if (polyline.length <= 2) {
    console.error('polylineToBezierCurve: Converting to a curve requires at least 3 points!');
    return false;
  }

  var startPoint = polyline[0];
  var bezierCurveLineNum = polyline.length - 1;
  var bezierCurvePoints = new Array(bezierCurveLineNum).fill(0).map(function (foo, i) {
    return [].concat(_toConsumableArray(getBezierCurveLineControlPoints(polyline, i, close, offsetA, offsetB)), [polyline[i + 1]]);
  });
  if (close) closeBezierCurve(bezierCurvePoints, startPoint);
  bezierCurvePoints.unshift(polyline[0]);
  return bezierCurvePoints;
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


function getBezierCurveLineControlPoints(polyline, index) {
  var close = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;
  var offsetA = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : 0.25;
  var offsetB = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : 0.25;
  var pointNum = polyline.length;
  if (pointNum < 3 || index >= pointNum) return;
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
 * @description Get the symmetry point
 * @param {Array} point       Symmetric point
 * @param {Array} centerPoint Symmetric center
 * @return {Array} Symmetric point
 */


function getSymmetryPoint(point, centerPoint) {
  var _point = _slicedToArray(point, 2),
      px = _point[0],
      py = _point[1];

  var _centerPoint = _slicedToArray(centerPoint, 2),
      cx = _centerPoint[0],
      cy = _centerPoint[1];

  var minusX = cx - px;
  var minusY = cy - py;
  return [cx + minusX, cy + minusY];
}

var _default = polylineToBezierCurve;
exports["default"] = _default;
},{}],4:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
Object.defineProperty(exports, "bezierCurveToPolyline", {
  enumerable: true,
  get: function get() {
    return _bezierCurveToPolyline.bezierCurveToPolyline;
  }
});
Object.defineProperty(exports, "getBezierCurveLength", {
  enumerable: true,
  get: function get() {
    return _bezierCurveToPolyline.getBezierCurveLength;
  }
});
Object.defineProperty(exports, "polylineToBezierCurve", {
  enumerable: true,
  get: function get() {
    return _polylineToBezierCurve["default"];
  }
});
exports["default"] = void 0;

var _bezierCurveToPolyline = require("./core/bezierCurveToPolyline");

var _polylineToBezierCurve = _interopRequireDefault(require("./core/polylineToBezierCurve"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

var _default = {
  bezierCurveToPolyline: _bezierCurveToPolyline.bezierCurveToPolyline,
  getBezierCurveLength: _bezierCurveToPolyline.getBezierCurveLength,
  polylineToBezierCurve: _polylineToBezierCurve["default"]
};
exports["default"] = _default;
},{"./core/bezierCurveToPolyline":2,"./core/polylineToBezierCurve":3}]},{},[1])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIkM6L1VzZXJzL0FkbWluaXN0cmF0b3IvQXBwRGF0YS9Sb2FtaW5nL25wbS9ub2RlX21vZHVsZXMvYnJvd3NlcmlmeS9ub2RlX21vZHVsZXMvYnJvd3Nlci1wYWNrL19wcmVsdWRlLmpzIiwiYnVpbGQvZW50cnkuanMiLCJsaWIvY29yZS9iZXppZXJDdXJ2ZVRvUG9seWxpbmUuanMiLCJsaWIvY29yZS9wb2x5bGluZVRvQmV6aWVyQ3VydmUuanMiLCJsaWIvaW5kZXguanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQTtBQUNBO0FBQ0E7O0FDRkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3hWQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3pIQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uKCl7ZnVuY3Rpb24gcihlLG4sdCl7ZnVuY3Rpb24gbyhpLGYpe2lmKCFuW2ldKXtpZighZVtpXSl7dmFyIGM9XCJmdW5jdGlvblwiPT10eXBlb2YgcmVxdWlyZSYmcmVxdWlyZTtpZighZiYmYylyZXR1cm4gYyhpLCEwKTtpZih1KXJldHVybiB1KGksITApO3ZhciBhPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIraStcIidcIik7dGhyb3cgYS5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGF9dmFyIHA9bltpXT17ZXhwb3J0czp7fX07ZVtpXVswXS5jYWxsKHAuZXhwb3J0cyxmdW5jdGlvbihyKXt2YXIgbj1lW2ldWzFdW3JdO3JldHVybiBvKG58fHIpfSxwLHAuZXhwb3J0cyxyLGUsbix0KX1yZXR1cm4gbltpXS5leHBvcnRzfWZvcih2YXIgdT1cImZ1bmN0aW9uXCI9PXR5cGVvZiByZXF1aXJlJiZyZXF1aXJlLGk9MDtpPHQubGVuZ3RoO2krKylvKHRbaV0pO3JldHVybiBvfXJldHVybiByfSkoKSIsInZhciBiZXppZXJDdXJ2ZSA9IHJlcXVpcmUoJy4uL2xpYi9pbmRleCcpXHJcblxyXG53aW5kb3cuYmV6aWVyQ3VydmUgPSBiZXppZXJDdXJ2ZSIsIlwidXNlIHN0cmljdFwiO1xuXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHtcbiAgdmFsdWU6IHRydWVcbn0pO1xuZXhwb3J0cy5iZXppZXJDdXJ2ZVRvUG9seWxpbmUgPSBiZXppZXJDdXJ2ZVRvUG9seWxpbmU7XG5leHBvcnRzLmdldEJlemllckN1cnZlTGVuZ3RoID0gZ2V0QmV6aWVyQ3VydmVMZW5ndGg7XG5leHBvcnRzW1wiZGVmYXVsdFwiXSA9IHZvaWQgMDtcblxuZnVuY3Rpb24gX3NsaWNlZFRvQXJyYXkoYXJyLCBpKSB7IHJldHVybiBfYXJyYXlXaXRoSG9sZXMoYXJyKSB8fCBfaXRlcmFibGVUb0FycmF5TGltaXQoYXJyLCBpKSB8fCBfbm9uSXRlcmFibGVSZXN0KCk7IH1cblxuZnVuY3Rpb24gX25vbkl0ZXJhYmxlUmVzdCgpIHsgdGhyb3cgbmV3IFR5cGVFcnJvcihcIkludmFsaWQgYXR0ZW1wdCB0byBkZXN0cnVjdHVyZSBub24taXRlcmFibGUgaW5zdGFuY2VcIik7IH1cblxuZnVuY3Rpb24gX2l0ZXJhYmxlVG9BcnJheUxpbWl0KGFyciwgaSkgeyB2YXIgX2FyciA9IFtdOyB2YXIgX24gPSB0cnVlOyB2YXIgX2QgPSBmYWxzZTsgdmFyIF9lID0gdW5kZWZpbmVkOyB0cnkgeyBmb3IgKHZhciBfaSA9IGFycltTeW1ib2wuaXRlcmF0b3JdKCksIF9zOyAhKF9uID0gKF9zID0gX2kubmV4dCgpKS5kb25lKTsgX24gPSB0cnVlKSB7IF9hcnIucHVzaChfcy52YWx1ZSk7IGlmIChpICYmIF9hcnIubGVuZ3RoID09PSBpKSBicmVhazsgfSB9IGNhdGNoIChlcnIpIHsgX2QgPSB0cnVlOyBfZSA9IGVycjsgfSBmaW5hbGx5IHsgdHJ5IHsgaWYgKCFfbiAmJiBfaVtcInJldHVyblwiXSAhPSBudWxsKSBfaVtcInJldHVyblwiXSgpOyB9IGZpbmFsbHkgeyBpZiAoX2QpIHRocm93IF9lOyB9IH0gcmV0dXJuIF9hcnI7IH1cblxuZnVuY3Rpb24gX2FycmF5V2l0aEhvbGVzKGFycikgeyBpZiAoQXJyYXkuaXNBcnJheShhcnIpKSByZXR1cm4gYXJyOyB9XG5cbmZ1bmN0aW9uIF90b0NvbnN1bWFibGVBcnJheShhcnIpIHsgcmV0dXJuIF9hcnJheVdpdGhvdXRIb2xlcyhhcnIpIHx8IF9pdGVyYWJsZVRvQXJyYXkoYXJyKSB8fCBfbm9uSXRlcmFibGVTcHJlYWQoKTsgfVxuXG5mdW5jdGlvbiBfbm9uSXRlcmFibGVTcHJlYWQoKSB7IHRocm93IG5ldyBUeXBlRXJyb3IoXCJJbnZhbGlkIGF0dGVtcHQgdG8gc3ByZWFkIG5vbi1pdGVyYWJsZSBpbnN0YW5jZVwiKTsgfVxuXG5mdW5jdGlvbiBfaXRlcmFibGVUb0FycmF5KGl0ZXIpIHsgaWYgKFN5bWJvbC5pdGVyYXRvciBpbiBPYmplY3QoaXRlcikgfHwgT2JqZWN0LnByb3RvdHlwZS50b1N0cmluZy5jYWxsKGl0ZXIpID09PSBcIltvYmplY3QgQXJndW1lbnRzXVwiKSByZXR1cm4gQXJyYXkuZnJvbShpdGVyKTsgfVxuXG5mdW5jdGlvbiBfYXJyYXlXaXRob3V0SG9sZXMoYXJyKSB7IGlmIChBcnJheS5pc0FycmF5KGFycikpIHsgZm9yICh2YXIgaSA9IDAsIGFycjIgPSBuZXcgQXJyYXkoYXJyLmxlbmd0aCk7IGkgPCBhcnIubGVuZ3RoOyBpKyspIHsgYXJyMltpXSA9IGFycltpXTsgfSByZXR1cm4gYXJyMjsgfSB9XG5cbnZhciBzcXJ0ID0gTWF0aC5zcXJ0LFxuICAgIHBvdyA9IE1hdGgucG93LFxuICAgIGNlaWwgPSBNYXRoLmNlaWwsXG4gICAgYWJzID0gTWF0aC5hYnM7IC8vIEluaXRpYWxpemUgdGhlIG51bWJlciBvZiBwb2ludHMgcGVyIGN1cnZlXG5cbnZhciBkZWZhdWx0U2VnbWVudFBvaW50c051bSA9IDUwO1xuLyoqXHJcbiAqIEBleGFtcGxlIGRhdGEgc3RydWN0dXJlIG9mIGJlemllckN1cnZlXHJcbiAqIGJlemllckN1cnZlID0gW1xyXG4gKiAgLy8gU3RhcnRpbmcgcG9pbnQgb2YgdGhlIGN1cnZlXHJcbiAqICBbMTAsIDEwXSxcclxuICogIC8vIEJlemllckN1cnZlIHNlZ21lbnQgZGF0YSAoY29udHJvbFBvaW50MSwgY29udHJvbFBvaW50MiwgZW5kUG9pbnQpXHJcbiAqICBbXHJcbiAqICAgIFsyMCwgMjBdLCBbNDAsIDIwXSwgWzUwLCAxMF1cclxuICogIF0sXHJcbiAqICAuLi5cclxuICogXVxyXG4gKi9cblxuLyoqXHJcbiAqIEBkZXNjcmlwdGlvbiAgICAgICAgICAgICAgIEFic3RyYWN0IHRoZSBjdXJ2ZSBhcyBhIHBvbHlsaW5lIGNvbnNpc3Rpbmcgb2YgTiBwb2ludHNcclxuICogQHBhcmFtIHtBcnJheX0gYmV6aWVyQ3VydmUgYmV6aWVyQ3VydmUgZGF0YVxyXG4gKiBAcGFyYW0ge051bWJlcn0gcHJlY2lzaW9uICBjYWxjdWxhdGlvbiBhY2N1cmFjeS4gUmVjb21tZW5kZWQgZm9yIDEtMjAuIERlZmF1bHQgPSA1XHJcbiAqIEByZXR1cm4ge09iamVjdH0gICAgICAgICAgIENhbGN1bGF0aW9uIHJlc3VsdHMgYW5kIHJlbGF0ZWQgZGF0YVxyXG4gKiBAcmV0dXJuIHtBcnJheX0gICAgICAgICAgICBPcHRpb24uc2VnbWVudFBvaW50cyBQb2ludCBkYXRhIHRoYXQgY29uc3RpdHV0ZXMgYSBwb2x5bGluZSBhZnRlciBjYWxjdWxhdGlvblxyXG4gKiBAcmV0dXJuIHtOdW1iZXJ9ICAgICAgICAgICBPcHRpb24uY3ljbGVzIE51bWJlciBvZiBpdGVyYXRpb25zXHJcbiAqIEByZXR1cm4ge051bWJlcn0gICAgICAgICAgIE9wdGlvbi5yb3VuZHMgVGhlIG51bWJlciBvZiByZWN1cnNpb25zIGZvciB0aGUgbGFzdCBpdGVyYXRpb25cclxuICovXG5cbmZ1bmN0aW9uIGFic3RyYWN0QmV6aWVyQ3VydmVUb1BvbHlsaW5lKGJlemllckN1cnZlKSB7XG4gIHZhciBwcmVjaXNpb24gPSBhcmd1bWVudHMubGVuZ3RoID4gMSAmJiBhcmd1bWVudHNbMV0gIT09IHVuZGVmaW5lZCA/IGFyZ3VtZW50c1sxXSA6IDU7XG4gIHZhciBzZWdtZW50c051bSA9IGJlemllckN1cnZlLmxlbmd0aCAtIDE7XG4gIHZhciBzdGFydFBvaW50ID0gYmV6aWVyQ3VydmVbMF07XG4gIHZhciBlbmRQb2ludCA9IGJlemllckN1cnZlW3NlZ21lbnRzTnVtXVsyXTtcbiAgdmFyIHNlZ21lbnRzID0gYmV6aWVyQ3VydmUuc2xpY2UoMSk7XG4gIHZhciBnZXRTZWdtZW50VFBvaW50RnVucyA9IHNlZ21lbnRzLm1hcChmdW5jdGlvbiAoc2VnLCBpKSB7XG4gICAgdmFyIGJlZ2luUG9pbnQgPSBpID09PSAwID8gc3RhcnRQb2ludCA6IHNlZ21lbnRzW2kgLSAxXVsyXTtcbiAgICByZXR1cm4gY3JlYXRlR2V0QmV6aWVyQ3VydmVUUG9pbnRGdW4uYXBwbHkodm9pZCAwLCBbYmVnaW5Qb2ludF0uY29uY2F0KF90b0NvbnN1bWFibGVBcnJheShzZWcpKSk7XG4gIH0pOyAvLyBJbml0aWFsaXplIHRoZSBjdXJ2ZSB0byBhIHBvbHlsaW5lXG5cbiAgdmFyIHNlZ21lbnRQb2ludHNOdW0gPSBuZXcgQXJyYXkoc2VnbWVudHNOdW0pLmZpbGwoZGVmYXVsdFNlZ21lbnRQb2ludHNOdW0pO1xuICB2YXIgc2VnbWVudFBvaW50cyA9IGdldFNlZ21lbnRQb2ludHNCeU51bShnZXRTZWdtZW50VFBvaW50RnVucywgc2VnbWVudFBvaW50c051bSk7IC8vIENhbGN1bGF0ZSB1bmlmb3JtbHkgZGlzdHJpYnV0ZWQgcG9pbnRzIGJ5IGl0ZXJhdGl2ZWx5XG5cbiAgdmFyIHJlc3VsdCA9IGNhbGNVbmlmb3JtUG9pbnRzQnlJdGVyYXRpb24oc2VnbWVudFBvaW50cywgZ2V0U2VnbWVudFRQb2ludEZ1bnMsIHNlZ21lbnRzLCBwcmVjaXNpb24pO1xuICByZXN1bHQuc2VnbWVudFBvaW50cy5wdXNoKGVuZFBvaW50KTtcbiAgcmV0dXJuIHJlc3VsdDtcbn1cbi8qKlxyXG4gKiBAZGVzY3JpcHRpb24gIEdlbmVyYXRlIGEgbWV0aG9kIGZvciBvYnRhaW5pbmcgY29ycmVzcG9uZGluZyBwb2ludCBieSB0IGFjY29yZGluZyB0byBjdXJ2ZSBkYXRhXHJcbiAqIEBwYXJhbSB7QXJyYXl9IGJlZ2luUG9pbnQgICAgQmV6aWVyQ3VydmUgYmVnaW4gcG9pbnQuIFt4LCB5XVxyXG4gKiBAcGFyYW0ge0FycmF5fSBjb250cm9sUG9pbnQxIEJlemllckN1cnZlIGNvbnRyb2xQb2ludDEuIFt4LCB5XVxyXG4gKiBAcGFyYW0ge0FycmF5fSBjb250cm9sUG9pbnQyIEJlemllckN1cnZlIGNvbnRyb2xQb2ludDIuIFt4LCB5XVxyXG4gKiBAcGFyYW0ge0FycmF5fSBlbmRQb2ludCAgICAgIEJlemllckN1cnZlIGVuZCBwb2ludC4gW3gsIHldXHJcbiAqIEByZXR1cm4ge0Z1bmN0aW9ufSBFeHBlY3RlZCBmdW5jdGlvblxyXG4gKi9cblxuXG5mdW5jdGlvbiBjcmVhdGVHZXRCZXppZXJDdXJ2ZVRQb2ludEZ1bihiZWdpblBvaW50LCBjb250cm9sUG9pbnQxLCBjb250cm9sUG9pbnQyLCBlbmRQb2ludCkge1xuICByZXR1cm4gZnVuY3Rpb24gKHQpIHtcbiAgICB2YXIgdFN1YmVkMSA9IDEgLSB0O1xuICAgIHZhciB0U3ViZWQxUG93MyA9IHBvdyh0U3ViZWQxLCAzKTtcbiAgICB2YXIgdFN1YmVkMVBvdzIgPSBwb3codFN1YmVkMSwgMik7XG4gICAgdmFyIHRQb3czID0gcG93KHQsIDMpO1xuICAgIHZhciB0UG93MiA9IHBvdyh0LCAyKTtcbiAgICByZXR1cm4gW2JlZ2luUG9pbnRbMF0gKiB0U3ViZWQxUG93MyArIDMgKiBjb250cm9sUG9pbnQxWzBdICogdCAqIHRTdWJlZDFQb3cyICsgMyAqIGNvbnRyb2xQb2ludDJbMF0gKiB0UG93MiAqIHRTdWJlZDEgKyBlbmRQb2ludFswXSAqIHRQb3czLCBiZWdpblBvaW50WzFdICogdFN1YmVkMVBvdzMgKyAzICogY29udHJvbFBvaW50MVsxXSAqIHQgKiB0U3ViZWQxUG93MiArIDMgKiBjb250cm9sUG9pbnQyWzFdICogdFBvdzIgKiB0U3ViZWQxICsgZW5kUG9pbnRbMV0gKiB0UG93M107XG4gIH07XG59XG4vKipcclxuICogQGRlc2NyaXB0aW9uIEdldCB0aGUgZGlzdGFuY2UgYmV0d2VlbiB0d28gcG9pbnRzXHJcbiAqIEBwYXJhbSB7QXJyYXl9IHBvaW50MSBCZXppZXJDdXJ2ZSBiZWdpbiBwb2ludC4gW3gsIHldXHJcbiAqIEBwYXJhbSB7QXJyYXl9IHBvaW50MiBCZXppZXJDdXJ2ZSBjb250cm9sUG9pbnQxLiBbeCwgeV1cclxuICogQHJldHVybiB7TnVtYmVyfSBFeHBlY3RlZCBkaXN0YW5jZVxyXG4gKi9cblxuXG5mdW5jdGlvbiBnZXRUd29Qb2ludERpc3RhbmNlKF9yZWYsIF9yZWYyKSB7XG4gIHZhciBfcmVmMyA9IF9zbGljZWRUb0FycmF5KF9yZWYsIDIpLFxuICAgICAgYXggPSBfcmVmM1swXSxcbiAgICAgIGF5ID0gX3JlZjNbMV07XG5cbiAgdmFyIF9yZWY0ID0gX3NsaWNlZFRvQXJyYXkoX3JlZjIsIDIpLFxuICAgICAgYnggPSBfcmVmNFswXSxcbiAgICAgIGJ5ID0gX3JlZjRbMV07XG5cbiAgcmV0dXJuIHNxcnQocG93KGF4IC0gYngsIDIpICsgcG93KGF5IC0gYnksIDIpKTtcbn1cbi8qKlxyXG4gKiBAZGVzY3JpcHRpb24gR2V0IHRoZSBzdW0gb2YgdGhlIGFycmF5IG9mIG51bWJlcnNcclxuICogQHBhcmFtIHtBcnJheX0gbnVtcyBBbiBhcnJheSBvZiBudW1iZXJzXHJcbiAqIEByZXR1cm4ge051bWJlcn0gRXhwZWN0ZWQgc3VtXHJcbiAqL1xuXG5cbmZ1bmN0aW9uIGdldE51bXNTdW0obnVtcykge1xuICByZXR1cm4gbnVtcy5yZWR1Y2UoZnVuY3Rpb24gKHN1bSwgbnVtKSB7XG4gICAgcmV0dXJuIHN1bSArIG51bTtcbiAgfSwgMCk7XG59XG4vKipcclxuICogQGRlc2NyaXB0aW9uIEdldCB0aGUgZGlzdGFuY2Ugb2YgbXVsdGlwbGUgc2V0cyBvZiBwb2ludHNcclxuICogQHBhcmFtIHtBcnJheX0gc2VnbWVudFBvaW50cyBNdWx0aXBsZSBzZXRzIG9mIHBvaW50IGRhdGFcclxuICogQHJldHVybiB7QXJyYXl9IERpc3RhbmNlIG9mIG11bHRpcGxlIHNldHMgb2YgcG9pbnQgZGF0YVxyXG4gKi9cblxuXG5mdW5jdGlvbiBnZXRTZWdtZW50UG9pbnRzRGlzdGFuY2Uoc2VnbWVudFBvaW50cykge1xuICByZXR1cm4gc2VnbWVudFBvaW50cy5tYXAoZnVuY3Rpb24gKHBvaW50cywgaSkge1xuICAgIHJldHVybiBuZXcgQXJyYXkocG9pbnRzLmxlbmd0aCAtIDEpLmZpbGwoMCkubWFwKGZ1bmN0aW9uICh0ZW1wLCBqKSB7XG4gICAgICByZXR1cm4gZ2V0VHdvUG9pbnREaXN0YW5jZShwb2ludHNbal0sIHBvaW50c1tqICsgMV0pO1xuICAgIH0pO1xuICB9KTtcbn1cbi8qKlxyXG4gKiBAZGVzY3JpcHRpb24gR2V0IHRoZSBkaXN0YW5jZSBvZiBtdWx0aXBsZSBzZXRzIG9mIHBvaW50c1xyXG4gKiBAcGFyYW0ge0FycmF5fSBzZWdtZW50UG9pbnRzIE11bHRpcGxlIHNldHMgb2YgcG9pbnQgZGF0YVxyXG4gKiBAcmV0dXJuIHtBcnJheX0gRGlzdGFuY2Ugb2YgbXVsdGlwbGUgc2V0cyBvZiBwb2ludCBkYXRhXHJcbiAqL1xuXG5cbmZ1bmN0aW9uIGdldFNlZ21lbnRQb2ludHNCeU51bShnZXRTZWdtZW50VFBvaW50RnVucywgc2VnbWVudFBvaW50c051bSkge1xuICByZXR1cm4gZ2V0U2VnbWVudFRQb2ludEZ1bnMubWFwKGZ1bmN0aW9uIChnZXRTZWdtZW50VFBvaW50RnVuLCBpKSB7XG4gICAgdmFyIHRHYXAgPSAxIC8gc2VnbWVudFBvaW50c051bVtpXTtcbiAgICByZXR1cm4gbmV3IEFycmF5KHNlZ21lbnRQb2ludHNOdW1baV0pLmZpbGwoJycpLm1hcChmdW5jdGlvbiAoZm9vLCBqKSB7XG4gICAgICByZXR1cm4gZ2V0U2VnbWVudFRQb2ludEZ1bihqICogdEdhcCk7XG4gICAgfSk7XG4gIH0pO1xufVxuLyoqXHJcbiAqIEBkZXNjcmlwdGlvbiBHZXQgdGhlIHN1bSBvZiBkZXZpYXRpb25zIGJldHdlZW4gbGluZSBzZWdtZW50IGFuZCB0aGUgYXZlcmFnZSBsZW5ndGhcclxuICogQHBhcmFtIHtBcnJheX0gc2VnbWVudFBvaW50c0Rpc3RhbmNlIFNlZ21lbnQgbGVuZ3RoIG9mIHBvbHlsaW5lXHJcbiAqIEBwYXJhbSB7TnVtYmVyfSBhdmdMZW5ndGggICAgICAgICAgICBBdmVyYWdlIGxlbmd0aCBvZiB0aGUgbGluZSBzZWdtZW50XHJcbiAqIEByZXR1cm4ge051bWJlcn0gRGV2aWF0aW9uc1xyXG4gKi9cblxuXG5mdW5jdGlvbiBnZXRBbGxEZXZpYXRpb25zKHNlZ21lbnRQb2ludHNEaXN0YW5jZSwgYXZnTGVuZ3RoKSB7XG4gIHJldHVybiBzZWdtZW50UG9pbnRzRGlzdGFuY2UubWFwKGZ1bmN0aW9uIChzZWcpIHtcbiAgICByZXR1cm4gc2VnLm1hcChmdW5jdGlvbiAocykge1xuICAgICAgcmV0dXJuIGFicyhzIC0gYXZnTGVuZ3RoKTtcbiAgICB9KTtcbiAgfSkubWFwKGZ1bmN0aW9uIChzZWcpIHtcbiAgICByZXR1cm4gZ2V0TnVtc1N1bShzZWcpO1xuICB9KS5yZWR1Y2UoZnVuY3Rpb24gKHRvdGFsLCB2KSB7XG4gICAgcmV0dXJuIHRvdGFsICsgdjtcbiAgfSwgMCk7XG59XG4vKipcclxuICogQGRlc2NyaXB0aW9uIENhbGN1bGF0ZSB1bmlmb3JtbHkgZGlzdHJpYnV0ZWQgcG9pbnRzIGJ5IGl0ZXJhdGl2ZWx5XHJcbiAqIEBwYXJhbSB7QXJyYXl9IHNlZ21lbnRQb2ludHMgICAgICAgIE11bHRpcGxlIHNldGQgb2YgcG9pbnRzIHRoYXQgbWFrZSB1cCBhIHBvbHlsaW5lXHJcbiAqIEBwYXJhbSB7QXJyYXl9IGdldFNlZ21lbnRUUG9pbnRGdW5zIEZ1bmN0aW9ucyBvZiBnZXQgYSBwb2ludCBvbiB0aGUgY3VydmUgd2l0aCB0XHJcbiAqIEBwYXJhbSB7QXJyYXl9IHNlZ21lbnRzICAgICAgICAgICAgIEJlemllckN1cnZlIGRhdGFcclxuICogQHBhcmFtIHtOdW1iZXJ9IHByZWNpc2lvbiAgICAgICAgICAgQ2FsY3VsYXRpb24gYWNjdXJhY3lcclxuICogQHJldHVybiB7T2JqZWN0fSBDYWxjdWxhdGlvbiByZXN1bHRzIGFuZCByZWxhdGVkIGRhdGFcclxuICogQHJldHVybiB7QXJyYXl9ICBPcHRpb24uc2VnbWVudFBvaW50cyBQb2ludCBkYXRhIHRoYXQgY29uc3RpdHV0ZXMgYSBwb2x5bGluZSBhZnRlciBjYWxjdWxhdGlvblxyXG4gKiBAcmV0dXJuIHtOdW1iZXJ9IE9wdGlvbi5jeWNsZXMgTnVtYmVyIG9mIGl0ZXJhdGlvbnNcclxuICogQHJldHVybiB7TnVtYmVyfSBPcHRpb24ucm91bmRzIFRoZSBudW1iZXIgb2YgcmVjdXJzaW9ucyBmb3IgdGhlIGxhc3QgaXRlcmF0aW9uXHJcbiAqL1xuXG5cbmZ1bmN0aW9uIGNhbGNVbmlmb3JtUG9pbnRzQnlJdGVyYXRpb24oc2VnbWVudFBvaW50cywgZ2V0U2VnbWVudFRQb2ludEZ1bnMsIHNlZ21lbnRzLCBwcmVjaXNpb24pIHtcbiAgLy8gVGhlIG51bWJlciBvZiBsb29wcyBmb3IgdGhlIGN1cnJlbnQgaXRlcmF0aW9uXG4gIHZhciByb3VuZHMgPSA0OyAvLyBOdW1iZXIgb2YgaXRlcmF0aW9uc1xuXG4gIHZhciBjeWNsZXMgPSAxO1xuXG4gIHZhciBfbG9vcCA9IGZ1bmN0aW9uIF9sb29wKCkge1xuICAgIC8vIFJlY2FsY3VsYXRlIHRoZSBudW1iZXIgb2YgcG9pbnRzIHBlciBjdXJ2ZSBiYXNlZCBvbiB0aGUgbGFzdCBpdGVyYXRpb24gZGF0YVxuICAgIHZhciB0b3RhbFBvaW50c051bSA9IHNlZ21lbnRQb2ludHMucmVkdWNlKGZ1bmN0aW9uICh0b3RhbCwgc2VnKSB7XG4gICAgICByZXR1cm4gdG90YWwgKyBzZWcubGVuZ3RoO1xuICAgIH0sIDApOyAvLyBBZGQgbGFzdCBwb2ludHMgb2Ygc2VnbWVudCB0byBjYWxjIGV4YWN0IHNlZ21lbnQgbGVuZ3RoXG5cbiAgICBzZWdtZW50UG9pbnRzLmZvckVhY2goZnVuY3Rpb24gKHNlZywgaSkge1xuICAgICAgcmV0dXJuIHNlZy5wdXNoKHNlZ21lbnRzW2ldWzJdKTtcbiAgICB9KTtcbiAgICB2YXIgc2VnbWVudFBvaW50c0Rpc3RhbmNlID0gZ2V0U2VnbWVudFBvaW50c0Rpc3RhbmNlKHNlZ21lbnRQb2ludHMpO1xuICAgIHZhciBsaW5lU2VnbWVudE51bSA9IHNlZ21lbnRQb2ludHNEaXN0YW5jZS5yZWR1Y2UoZnVuY3Rpb24gKHRvdGFsLCBzZWcpIHtcbiAgICAgIHJldHVybiB0b3RhbCArIHNlZy5sZW5ndGg7XG4gICAgfSwgMCk7XG4gICAgdmFyIHNlZ21lbnRsZW5ndGggPSBzZWdtZW50UG9pbnRzRGlzdGFuY2UubWFwKGZ1bmN0aW9uIChzZWcpIHtcbiAgICAgIHJldHVybiBnZXROdW1zU3VtKHNlZyk7XG4gICAgfSk7XG4gICAgdmFyIHRvdGFsTGVuZ3RoID0gZ2V0TnVtc1N1bShzZWdtZW50bGVuZ3RoKTtcbiAgICB2YXIgYXZnTGVuZ3RoID0gdG90YWxMZW5ndGggLyBsaW5lU2VnbWVudE51bTsgLy8gQ2hlY2sgaWYgcHJlY2lzaW9uIGlzIHJlYWNoZWRcblxuICAgIHZhciBhbGxEZXZpYXRpb25zID0gZ2V0QWxsRGV2aWF0aW9ucyhzZWdtZW50UG9pbnRzRGlzdGFuY2UsIGF2Z0xlbmd0aCk7XG4gICAgaWYgKGFsbERldmlhdGlvbnMgPD0gcHJlY2lzaW9uKSByZXR1cm4gXCJicmVha1wiO1xuICAgIHRvdGFsUG9pbnRzTnVtID0gY2VpbChhdmdMZW5ndGggLyBwcmVjaXNpb24gKiB0b3RhbFBvaW50c051bSAqIDEuMSk7XG4gICAgdmFyIHNlZ21lbnRQb2ludHNOdW0gPSBzZWdtZW50bGVuZ3RoLm1hcChmdW5jdGlvbiAobGVuZ3RoKSB7XG4gICAgICByZXR1cm4gY2VpbChsZW5ndGggLyB0b3RhbExlbmd0aCAqIHRvdGFsUG9pbnRzTnVtKTtcbiAgICB9KTsgLy8gQ2FsY3VsYXRlIHRoZSBwb2ludHMgYWZ0ZXIgcmVkaXN0cmlidXRpb25cblxuICAgIHNlZ21lbnRQb2ludHMgPSBnZXRTZWdtZW50UG9pbnRzQnlOdW0oZ2V0U2VnbWVudFRQb2ludEZ1bnMsIHNlZ21lbnRQb2ludHNOdW0pO1xuICAgIHRvdGFsUG9pbnRzTnVtID0gc2VnbWVudFBvaW50cy5yZWR1Y2UoZnVuY3Rpb24gKHRvdGFsLCBzZWcpIHtcbiAgICAgIHJldHVybiB0b3RhbCArIHNlZy5sZW5ndGg7XG4gICAgfSwgMCk7XG4gICAgdmFyIHNlZ21lbnRQb2ludHNGb3JMZW5ndGggPSBKU09OLnBhcnNlKEpTT04uc3RyaW5naWZ5KHNlZ21lbnRQb2ludHMpKTtcbiAgICBzZWdtZW50UG9pbnRzRm9yTGVuZ3RoLmZvckVhY2goZnVuY3Rpb24gKHNlZywgaSkge1xuICAgICAgcmV0dXJuIHNlZy5wdXNoKHNlZ21lbnRzW2ldWzJdKTtcbiAgICB9KTtcbiAgICBzZWdtZW50UG9pbnRzRGlzdGFuY2UgPSBnZXRTZWdtZW50UG9pbnRzRGlzdGFuY2Uoc2VnbWVudFBvaW50c0Zvckxlbmd0aCk7XG4gICAgbGluZVNlZ21lbnROdW0gPSBzZWdtZW50UG9pbnRzRGlzdGFuY2UucmVkdWNlKGZ1bmN0aW9uICh0b3RhbCwgc2VnKSB7XG4gICAgICByZXR1cm4gdG90YWwgKyBzZWcubGVuZ3RoO1xuICAgIH0sIDApO1xuICAgIHNlZ21lbnRsZW5ndGggPSBzZWdtZW50UG9pbnRzRGlzdGFuY2UubWFwKGZ1bmN0aW9uIChzZWcpIHtcbiAgICAgIHJldHVybiBnZXROdW1zU3VtKHNlZyk7XG4gICAgfSk7XG4gICAgdG90YWxMZW5ndGggPSBnZXROdW1zU3VtKHNlZ21lbnRsZW5ndGgpO1xuICAgIGF2Z0xlbmd0aCA9IHRvdGFsTGVuZ3RoIC8gbGluZVNlZ21lbnROdW07XG4gICAgdmFyIHN0ZXBTaXplID0gMSAvIHRvdGFsUG9pbnRzTnVtIC8gMTA7IC8vIFJlY3Vyc2l2ZWx5IGZvciBlYWNoIHNlZ21lbnQgb2YgdGhlIHBvbHlsaW5lXG5cbiAgICBnZXRTZWdtZW50VFBvaW50RnVucy5mb3JFYWNoKGZ1bmN0aW9uIChnZXRTZWdtZW50VFBvaW50RnVuLCBpKSB7XG4gICAgICB2YXIgY3VycmVudFNlZ21lbnRQb2ludHNOdW0gPSBzZWdtZW50UG9pbnRzTnVtW2ldO1xuICAgICAgdmFyIHQgPSBuZXcgQXJyYXkoY3VycmVudFNlZ21lbnRQb2ludHNOdW0pLmZpbGwoJycpLm1hcChmdW5jdGlvbiAoZm9vLCBqKSB7XG4gICAgICAgIHJldHVybiBqIC8gc2VnbWVudFBvaW50c051bVtpXTtcbiAgICAgIH0pOyAvLyBSZXBlYXRlZCByZWN1cnNpdmUgb2Zmc2V0XG5cbiAgICAgIGZvciAodmFyIHIgPSAwOyByIDwgcm91bmRzOyByKyspIHtcbiAgICAgICAgdmFyIGRpc3RhbmNlID0gZ2V0U2VnbWVudFBvaW50c0Rpc3RhbmNlKFtzZWdtZW50UG9pbnRzW2ldXSlbMF07XG4gICAgICAgIHZhciBkZXZpYXRpb25zID0gZGlzdGFuY2UubWFwKGZ1bmN0aW9uIChkKSB7XG4gICAgICAgICAgcmV0dXJuIGQgLSBhdmdMZW5ndGg7XG4gICAgICAgIH0pO1xuICAgICAgICB2YXIgb2Zmc2V0ID0gMDtcblxuICAgICAgICBmb3IgKHZhciBqID0gMDsgaiA8IGN1cnJlbnRTZWdtZW50UG9pbnRzTnVtOyBqKyspIHtcbiAgICAgICAgICBpZiAoaiA9PT0gMCkgcmV0dXJuO1xuICAgICAgICAgIG9mZnNldCArPSBkZXZpYXRpb25zW2ogLSAxXTtcbiAgICAgICAgICB0W2pdIC09IHN0ZXBTaXplICogb2Zmc2V0O1xuICAgICAgICAgIGlmICh0W2pdID4gMSkgdFtqXSA9IDE7XG4gICAgICAgICAgaWYgKHRbal0gPCAwKSB0W2pdID0gMDtcbiAgICAgICAgICBzZWdtZW50UG9pbnRzW2ldW2pdID0gZ2V0U2VnbWVudFRQb2ludEZ1bih0W2pdKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0pO1xuICAgIHJvdW5kcyAqPSA0O1xuICAgIGN5Y2xlcysrO1xuICB9O1xuXG4gIGRvIHtcbiAgICB2YXIgX3JldCA9IF9sb29wKCk7XG5cbiAgICBpZiAoX3JldCA9PT0gXCJicmVha1wiKSBicmVhaztcbiAgfSB3aGlsZSAocm91bmRzIDw9IDEwMjUpO1xuXG4gIHNlZ21lbnRQb2ludHMgPSBzZWdtZW50UG9pbnRzLnJlZHVjZShmdW5jdGlvbiAoYWxsLCBzZWcpIHtcbiAgICByZXR1cm4gYWxsLmNvbmNhdChzZWcpO1xuICB9LCBbXSk7XG4gIHJldHVybiB7XG4gICAgc2VnbWVudFBvaW50czogc2VnbWVudFBvaW50cyxcbiAgICBjeWNsZXM6IGN5Y2xlcyxcbiAgICByb3VuZHM6IHJvdW5kc1xuICB9O1xufVxuLyoqXHJcbiAqIEBkZXNjcmlwdGlvbiBHZXQgdGhlIHBvbHlsaW5lIGNvcnJlc3BvbmRpbmcgdG8gdGhlIEJlemllciBjdXJ2ZVxyXG4gKiBAcGFyYW0ge0FycmF5fSBiZXppZXJDdXJ2ZSBCZXppZXJDdXJ2ZSBkYXRhXHJcbiAqIEBwYXJhbSB7TnVtYmVyfSBwcmVjaXNpb24gIENhbGN1bGF0aW9uIGFjY3VyYWN5LiBSZWNvbW1lbmRlZCBmb3IgMS0yMC4gRGVmYXVsdCA9IDVcclxuICogQHJldHVybiB7QXJyYXl8Qm9vbGVhbn0gUG9pbnQgZGF0YSB0aGF0IGNvbnN0aXR1dGVzIGEgcG9seWxpbmUgYWZ0ZXIgY2FsY3VsYXRpb24gKEludmFsaWQgaW5wdXQgd2lsbCByZXR1cm4gZmFsc2UpXHJcbiAqL1xuXG5cbmZ1bmN0aW9uIGJlemllckN1cnZlVG9Qb2x5bGluZShiZXppZXJDdXJ2ZSkge1xuICB2YXIgcHJlY2lzaW9uID0gYXJndW1lbnRzLmxlbmd0aCA+IDEgJiYgYXJndW1lbnRzWzFdICE9PSB1bmRlZmluZWQgPyBhcmd1bWVudHNbMV0gOiA1O1xuXG4gIGlmICghYmV6aWVyQ3VydmUpIHtcbiAgICBjb25zb2xlLmVycm9yKCdiZXppZXJDdXJ2ZVRvUG9seWxpbmU6IE1pc3NpbmcgcGFyYW1ldGVycyEnKTtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cblxuICBpZiAoIShiZXppZXJDdXJ2ZSBpbnN0YW5jZW9mIEFycmF5KSkge1xuICAgIGNvbnNvbGUuZXJyb3IoJ2JlemllckN1cnZlVG9Qb2x5bGluZTogUGFyYW1ldGVyIGJlemllckN1cnZlIG11c3QgYmUgYW4gYXJyYXkhJyk7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG5cbiAgaWYgKHR5cGVvZiBwcmVjaXNpb24gIT09ICdudW1iZXInKSB7XG4gICAgY29uc29sZS5lcnJvcignYmV6aWVyQ3VydmVUb1BvbHlsaW5lOiBQYXJhbWV0ZXIgcHJlY2lzaW9uIG11c3QgYmUgYSBudW1iZXIhJyk7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG5cbiAgdmFyIF9hYnN0cmFjdEJlemllckN1cnZlVCA9IGFic3RyYWN0QmV6aWVyQ3VydmVUb1BvbHlsaW5lKGJlemllckN1cnZlLCBwcmVjaXNpb24pLFxuICAgICAgc2VnbWVudFBvaW50cyA9IF9hYnN0cmFjdEJlemllckN1cnZlVC5zZWdtZW50UG9pbnRzO1xuXG4gIHJldHVybiBzZWdtZW50UG9pbnRzO1xufVxuLyoqXHJcbiAqIEBkZXNjcmlwdGlvbiBHZXQgdGhlIGJlemllciBjdXJ2ZSBsZW5ndGhcclxuICogQHBhcmFtIHtBcnJheX0gYmV6aWVyQ3VydmUgYmV6aWVyQ3VydmUgZGF0YVxyXG4gKiBAcGFyYW0ge051bWJlcn0gcHJlY2lzaW9uICBjYWxjdWxhdGlvbiBhY2N1cmFjeS4gUmVjb21tZW5kZWQgZm9yIDUtMTAuIERlZmF1bHQgPSA1XHJcbiAqIEByZXR1cm4ge051bWJlcnxCb29sZWFufSBCZXppZXJDdXJ2ZSBsZW5ndGggKEludmFsaWQgaW5wdXQgd2lsbCByZXR1cm4gZmFsc2UpXHJcbiAqL1xuXG5cbmZ1bmN0aW9uIGdldEJlemllckN1cnZlTGVuZ3RoKGJlemllckN1cnZlKSB7XG4gIHZhciBwcmVjaXNpb24gPSBhcmd1bWVudHMubGVuZ3RoID4gMSAmJiBhcmd1bWVudHNbMV0gIT09IHVuZGVmaW5lZCA/IGFyZ3VtZW50c1sxXSA6IDU7XG5cbiAgaWYgKCFiZXppZXJDdXJ2ZSkge1xuICAgIGNvbnNvbGUuZXJyb3IoJ2dldEJlemllckN1cnZlTGVuZ3RoOiBNaXNzaW5nIHBhcmFtZXRlcnMhJyk7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG5cbiAgaWYgKCEoYmV6aWVyQ3VydmUgaW5zdGFuY2VvZiBBcnJheSkpIHtcbiAgICBjb25zb2xlLmVycm9yKCdnZXRCZXppZXJDdXJ2ZUxlbmd0aDogUGFyYW1ldGVyIGJlemllckN1cnZlIG11c3QgYmUgYW4gYXJyYXkhJyk7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG5cbiAgaWYgKHR5cGVvZiBwcmVjaXNpb24gIT09ICdudW1iZXInKSB7XG4gICAgY29uc29sZS5lcnJvcignZ2V0QmV6aWVyQ3VydmVMZW5ndGg6IFBhcmFtZXRlciBwcmVjaXNpb24gbXVzdCBiZSBhIG51bWJlciEnKTtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cblxuICB2YXIgX2Fic3RyYWN0QmV6aWVyQ3VydmVUMiA9IGFic3RyYWN0QmV6aWVyQ3VydmVUb1BvbHlsaW5lKGJlemllckN1cnZlLCBwcmVjaXNpb24pLFxuICAgICAgc2VnbWVudFBvaW50cyA9IF9hYnN0cmFjdEJlemllckN1cnZlVDIuc2VnbWVudFBvaW50czsgLy8gQ2FsY3VsYXRlIHRoZSB0b3RhbCBsZW5ndGggb2YgdGhlIHBvaW50cyB0aGF0IG1ha2UgdXAgdGhlIHBvbHlsaW5lXG5cblxuICB2YXIgcG9pbnRzRGlzdGFuY2UgPSBnZXRTZWdtZW50UG9pbnRzRGlzdGFuY2UoW3NlZ21lbnRQb2ludHNdKVswXTtcbiAgdmFyIGxlbmd0aCA9IGdldE51bXNTdW0ocG9pbnRzRGlzdGFuY2UpO1xuICByZXR1cm4gbGVuZ3RoO1xufVxuXG52YXIgX2RlZmF1bHQgPSBiZXppZXJDdXJ2ZVRvUG9seWxpbmU7XG5leHBvcnRzW1wiZGVmYXVsdFwiXSA9IF9kZWZhdWx0OyIsIlwidXNlIHN0cmljdFwiO1xuXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHtcbiAgdmFsdWU6IHRydWVcbn0pO1xuZXhwb3J0c1tcImRlZmF1bHRcIl0gPSB2b2lkIDA7XG5cbmZ1bmN0aW9uIF9zbGljZWRUb0FycmF5KGFyciwgaSkgeyByZXR1cm4gX2FycmF5V2l0aEhvbGVzKGFycikgfHwgX2l0ZXJhYmxlVG9BcnJheUxpbWl0KGFyciwgaSkgfHwgX25vbkl0ZXJhYmxlUmVzdCgpOyB9XG5cbmZ1bmN0aW9uIF9ub25JdGVyYWJsZVJlc3QoKSB7IHRocm93IG5ldyBUeXBlRXJyb3IoXCJJbnZhbGlkIGF0dGVtcHQgdG8gZGVzdHJ1Y3R1cmUgbm9uLWl0ZXJhYmxlIGluc3RhbmNlXCIpOyB9XG5cbmZ1bmN0aW9uIF9pdGVyYWJsZVRvQXJyYXlMaW1pdChhcnIsIGkpIHsgdmFyIF9hcnIgPSBbXTsgdmFyIF9uID0gdHJ1ZTsgdmFyIF9kID0gZmFsc2U7IHZhciBfZSA9IHVuZGVmaW5lZDsgdHJ5IHsgZm9yICh2YXIgX2kgPSBhcnJbU3ltYm9sLml0ZXJhdG9yXSgpLCBfczsgIShfbiA9IChfcyA9IF9pLm5leHQoKSkuZG9uZSk7IF9uID0gdHJ1ZSkgeyBfYXJyLnB1c2goX3MudmFsdWUpOyBpZiAoaSAmJiBfYXJyLmxlbmd0aCA9PT0gaSkgYnJlYWs7IH0gfSBjYXRjaCAoZXJyKSB7IF9kID0gdHJ1ZTsgX2UgPSBlcnI7IH0gZmluYWxseSB7IHRyeSB7IGlmICghX24gJiYgX2lbXCJyZXR1cm5cIl0gIT0gbnVsbCkgX2lbXCJyZXR1cm5cIl0oKTsgfSBmaW5hbGx5IHsgaWYgKF9kKSB0aHJvdyBfZTsgfSB9IHJldHVybiBfYXJyOyB9XG5cbmZ1bmN0aW9uIF9hcnJheVdpdGhIb2xlcyhhcnIpIHsgaWYgKEFycmF5LmlzQXJyYXkoYXJyKSkgcmV0dXJuIGFycjsgfVxuXG5mdW5jdGlvbiBfdG9Db25zdW1hYmxlQXJyYXkoYXJyKSB7IHJldHVybiBfYXJyYXlXaXRob3V0SG9sZXMoYXJyKSB8fCBfaXRlcmFibGVUb0FycmF5KGFycikgfHwgX25vbkl0ZXJhYmxlU3ByZWFkKCk7IH1cblxuZnVuY3Rpb24gX25vbkl0ZXJhYmxlU3ByZWFkKCkgeyB0aHJvdyBuZXcgVHlwZUVycm9yKFwiSW52YWxpZCBhdHRlbXB0IHRvIHNwcmVhZCBub24taXRlcmFibGUgaW5zdGFuY2VcIik7IH1cblxuZnVuY3Rpb24gX2l0ZXJhYmxlVG9BcnJheShpdGVyKSB7IGlmIChTeW1ib2wuaXRlcmF0b3IgaW4gT2JqZWN0KGl0ZXIpIHx8IE9iamVjdC5wcm90b3R5cGUudG9TdHJpbmcuY2FsbChpdGVyKSA9PT0gXCJbb2JqZWN0IEFyZ3VtZW50c11cIikgcmV0dXJuIEFycmF5LmZyb20oaXRlcik7IH1cblxuZnVuY3Rpb24gX2FycmF5V2l0aG91dEhvbGVzKGFycikgeyBpZiAoQXJyYXkuaXNBcnJheShhcnIpKSB7IGZvciAodmFyIGkgPSAwLCBhcnIyID0gbmV3IEFycmF5KGFyci5sZW5ndGgpOyBpIDwgYXJyLmxlbmd0aDsgaSsrKSB7IGFycjJbaV0gPSBhcnJbaV07IH0gcmV0dXJuIGFycjI7IH0gfVxuXG4vKipcclxuICogQGRlc2NyaXB0aW9uIEFic3RyYWN0IHRoZSBwb2x5bGluZSBmb3JtZWQgYnkgTiBwb2ludHMgaW50byBhIHNldCBvZiBiZXppZXIgY3VydmVcclxuICogQHBhcmFtIHtBcnJheX0gcG9seWxpbmUgQSBzZXQgb2YgcG9pbnRzIHRoYXQgbWFrZSB1cCBhIHBvbHlsaW5lXHJcbiAqIEBwYXJhbSB7Qm9vbGVhbn0gY2xvc2UgIENsb3NlZCBjdXJ2ZVxyXG4gKiBAcGFyYW0ge051bWJlcn0gb2Zmc2V0QSBTbW9vdGhuZXNzXHJcbiAqIEBwYXJhbSB7TnVtYmVyfSBvZmZzZXRCIFNtb290aG5lc3NcclxuICogQHJldHVybiB7QXJyYXl8Qm9vbGVhbn0gQSBzZXQgb2YgYmV6aWVyIGN1cnZlIChJbnZhbGlkIGlucHV0IHdpbGwgcmV0dXJuIGZhbHNlKVxyXG4gKi9cbmZ1bmN0aW9uIHBvbHlsaW5lVG9CZXppZXJDdXJ2ZShwb2x5bGluZSkge1xuICB2YXIgY2xvc2UgPSBhcmd1bWVudHMubGVuZ3RoID4gMSAmJiBhcmd1bWVudHNbMV0gIT09IHVuZGVmaW5lZCA/IGFyZ3VtZW50c1sxXSA6IGZhbHNlO1xuICB2YXIgb2Zmc2V0QSA9IGFyZ3VtZW50cy5sZW5ndGggPiAyICYmIGFyZ3VtZW50c1syXSAhPT0gdW5kZWZpbmVkID8gYXJndW1lbnRzWzJdIDogMC4yNTtcbiAgdmFyIG9mZnNldEIgPSBhcmd1bWVudHMubGVuZ3RoID4gMyAmJiBhcmd1bWVudHNbM10gIT09IHVuZGVmaW5lZCA/IGFyZ3VtZW50c1szXSA6IDAuMjU7XG5cbiAgaWYgKCEocG9seWxpbmUgaW5zdGFuY2VvZiBBcnJheSkpIHtcbiAgICBjb25zb2xlLmVycm9yKCdwb2x5bGluZVRvQmV6aWVyQ3VydmU6IFBhcmFtZXRlciBwb2x5bGluZSBtdXN0IGJlIGFuIGFycmF5IScpO1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuXG4gIGlmIChwb2x5bGluZS5sZW5ndGggPD0gMikge1xuICAgIGNvbnNvbGUuZXJyb3IoJ3BvbHlsaW5lVG9CZXppZXJDdXJ2ZTogQ29udmVydGluZyB0byBhIGN1cnZlIHJlcXVpcmVzIGF0IGxlYXN0IDMgcG9pbnRzIScpO1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuXG4gIHZhciBzdGFydFBvaW50ID0gcG9seWxpbmVbMF07XG4gIHZhciBiZXppZXJDdXJ2ZUxpbmVOdW0gPSBwb2x5bGluZS5sZW5ndGggLSAxO1xuICB2YXIgYmV6aWVyQ3VydmVQb2ludHMgPSBuZXcgQXJyYXkoYmV6aWVyQ3VydmVMaW5lTnVtKS5maWxsKDApLm1hcChmdW5jdGlvbiAoZm9vLCBpKSB7XG4gICAgcmV0dXJuIFtdLmNvbmNhdChfdG9Db25zdW1hYmxlQXJyYXkoZ2V0QmV6aWVyQ3VydmVMaW5lQ29udHJvbFBvaW50cyhwb2x5bGluZSwgaSwgY2xvc2UsIG9mZnNldEEsIG9mZnNldEIpKSwgW3BvbHlsaW5lW2kgKyAxXV0pO1xuICB9KTtcbiAgaWYgKGNsb3NlKSBjbG9zZUJlemllckN1cnZlKGJlemllckN1cnZlUG9pbnRzLCBzdGFydFBvaW50KTtcbiAgYmV6aWVyQ3VydmVQb2ludHMudW5zaGlmdChwb2x5bGluZVswXSk7XG4gIHJldHVybiBiZXppZXJDdXJ2ZVBvaW50cztcbn1cbi8qKlxyXG4gKiBAZGVzY3JpcHRpb24gR2V0IHRoZSBjb250cm9sIHBvaW50cyBvZiB0aGUgQmV6aWVyIGN1cnZlXHJcbiAqIEBwYXJhbSB7QXJyYXl9IHBvbHlsaW5lIEEgc2V0IG9mIHBvaW50cyB0aGF0IG1ha2UgdXAgYSBwb2x5bGluZVxyXG4gKiBAcGFyYW0ge051bWJlcn0gaW5kZXggICBUaGUgaW5kZXggb2Ygd2hpY2ggZ2V0IGNvbnRyb2xzIHBvaW50cydzIHBvaW50IGluIHBvbHlsaW5lXHJcbiAqIEBwYXJhbSB7Qm9vbGVhbn0gY2xvc2UgIENsb3NlZCBjdXJ2ZVxyXG4gKiBAcGFyYW0ge051bWJlcn0gb2Zmc2V0QSBTbW9vdGhuZXNzXHJcbiAqIEBwYXJhbSB7TnVtYmVyfSBvZmZzZXRCIFNtb290aG5lc3NcclxuICogQHJldHVybiB7QXJyYXl9IENvbnRyb2wgcG9pbnRzXHJcbiAqL1xuXG5cbmZ1bmN0aW9uIGdldEJlemllckN1cnZlTGluZUNvbnRyb2xQb2ludHMocG9seWxpbmUsIGluZGV4KSB7XG4gIHZhciBjbG9zZSA9IGFyZ3VtZW50cy5sZW5ndGggPiAyICYmIGFyZ3VtZW50c1syXSAhPT0gdW5kZWZpbmVkID8gYXJndW1lbnRzWzJdIDogZmFsc2U7XG4gIHZhciBvZmZzZXRBID0gYXJndW1lbnRzLmxlbmd0aCA+IDMgJiYgYXJndW1lbnRzWzNdICE9PSB1bmRlZmluZWQgPyBhcmd1bWVudHNbM10gOiAwLjI1O1xuICB2YXIgb2Zmc2V0QiA9IGFyZ3VtZW50cy5sZW5ndGggPiA0ICYmIGFyZ3VtZW50c1s0XSAhPT0gdW5kZWZpbmVkID8gYXJndW1lbnRzWzRdIDogMC4yNTtcbiAgdmFyIHBvaW50TnVtID0gcG9seWxpbmUubGVuZ3RoO1xuICBpZiAocG9pbnROdW0gPCAzIHx8IGluZGV4ID49IHBvaW50TnVtKSByZXR1cm47XG4gIHZhciBiZWZvcmVQb2ludEluZGV4ID0gaW5kZXggLSAxO1xuICBpZiAoYmVmb3JlUG9pbnRJbmRleCA8IDApIGJlZm9yZVBvaW50SW5kZXggPSBjbG9zZSA/IHBvaW50TnVtICsgYmVmb3JlUG9pbnRJbmRleCA6IDA7XG4gIHZhciBhZnRlclBvaW50SW5kZXggPSBpbmRleCArIDE7XG4gIGlmIChhZnRlclBvaW50SW5kZXggPj0gcG9pbnROdW0pIGFmdGVyUG9pbnRJbmRleCA9IGNsb3NlID8gYWZ0ZXJQb2ludEluZGV4IC0gcG9pbnROdW0gOiBwb2ludE51bSAtIDE7XG4gIHZhciBhZnRlck5leHRQb2ludEluZGV4ID0gaW5kZXggKyAyO1xuICBpZiAoYWZ0ZXJOZXh0UG9pbnRJbmRleCA+PSBwb2ludE51bSkgYWZ0ZXJOZXh0UG9pbnRJbmRleCA9IGNsb3NlID8gYWZ0ZXJOZXh0UG9pbnRJbmRleCAtIHBvaW50TnVtIDogcG9pbnROdW0gLSAxO1xuICB2YXIgcG9pbnRCZWZvcmUgPSBwb2x5bGluZVtiZWZvcmVQb2ludEluZGV4XTtcbiAgdmFyIHBvaW50TWlkZGxlID0gcG9seWxpbmVbaW5kZXhdO1xuICB2YXIgcG9pbnRBZnRlciA9IHBvbHlsaW5lW2FmdGVyUG9pbnRJbmRleF07XG4gIHZhciBwb2ludEFmdGVyTmV4dCA9IHBvbHlsaW5lW2FmdGVyTmV4dFBvaW50SW5kZXhdO1xuICByZXR1cm4gW1twb2ludE1pZGRsZVswXSArIG9mZnNldEEgKiAocG9pbnRBZnRlclswXSAtIHBvaW50QmVmb3JlWzBdKSwgcG9pbnRNaWRkbGVbMV0gKyBvZmZzZXRBICogKHBvaW50QWZ0ZXJbMV0gLSBwb2ludEJlZm9yZVsxXSldLCBbcG9pbnRBZnRlclswXSAtIG9mZnNldEIgKiAocG9pbnRBZnRlck5leHRbMF0gLSBwb2ludE1pZGRsZVswXSksIHBvaW50QWZ0ZXJbMV0gLSBvZmZzZXRCICogKHBvaW50QWZ0ZXJOZXh0WzFdIC0gcG9pbnRNaWRkbGVbMV0pXV07XG59XG4vKipcclxuICogQGRlc2NyaXB0aW9uIEdldCB0aGUgbGFzdCBjdXJ2ZSBvZiB0aGUgY2xvc3VyZVxyXG4gKiBAcGFyYW0ge0FycmF5fSBiZXppZXJDdXJ2ZSBBIHNldCBvZiBzdWItY3VydmVcclxuICogQHBhcmFtIHtBcnJheX0gc3RhcnRQb2ludCAgU3RhcnQgcG9pbnRcclxuICogQHJldHVybiB7QXJyYXl9IFRoZSBsYXN0IGN1cnZlIGZvciBjbG9zdXJlXHJcbiAqL1xuXG5cbmZ1bmN0aW9uIGNsb3NlQmV6aWVyQ3VydmUoYmV6aWVyQ3VydmUsIHN0YXJ0UG9pbnQpIHtcbiAgdmFyIGZpcnN0U3ViQ3VydmUgPSBiZXppZXJDdXJ2ZVswXTtcbiAgdmFyIGxhc3RTdWJDdXJ2ZSA9IGJlemllckN1cnZlLnNsaWNlKC0xKVswXTtcbiAgYmV6aWVyQ3VydmUucHVzaChbZ2V0U3ltbWV0cnlQb2ludChsYXN0U3ViQ3VydmVbMV0sIGxhc3RTdWJDdXJ2ZVsyXSksIGdldFN5bW1ldHJ5UG9pbnQoZmlyc3RTdWJDdXJ2ZVswXSwgc3RhcnRQb2ludCksIHN0YXJ0UG9pbnRdKTtcbiAgcmV0dXJuIGJlemllckN1cnZlO1xufVxuLyoqXHJcbiAqIEBkZXNjcmlwdGlvbiBHZXQgdGhlIHN5bW1ldHJ5IHBvaW50XHJcbiAqIEBwYXJhbSB7QXJyYXl9IHBvaW50ICAgICAgIFN5bW1ldHJpYyBwb2ludFxyXG4gKiBAcGFyYW0ge0FycmF5fSBjZW50ZXJQb2ludCBTeW1tZXRyaWMgY2VudGVyXHJcbiAqIEByZXR1cm4ge0FycmF5fSBTeW1tZXRyaWMgcG9pbnRcclxuICovXG5cblxuZnVuY3Rpb24gZ2V0U3ltbWV0cnlQb2ludChwb2ludCwgY2VudGVyUG9pbnQpIHtcbiAgdmFyIF9wb2ludCA9IF9zbGljZWRUb0FycmF5KHBvaW50LCAyKSxcbiAgICAgIHB4ID0gX3BvaW50WzBdLFxuICAgICAgcHkgPSBfcG9pbnRbMV07XG5cbiAgdmFyIF9jZW50ZXJQb2ludCA9IF9zbGljZWRUb0FycmF5KGNlbnRlclBvaW50LCAyKSxcbiAgICAgIGN4ID0gX2NlbnRlclBvaW50WzBdLFxuICAgICAgY3kgPSBfY2VudGVyUG9pbnRbMV07XG5cbiAgdmFyIG1pbnVzWCA9IGN4IC0gcHg7XG4gIHZhciBtaW51c1kgPSBjeSAtIHB5O1xuICByZXR1cm4gW2N4ICsgbWludXNYLCBjeSArIG1pbnVzWV07XG59XG5cbnZhciBfZGVmYXVsdCA9IHBvbHlsaW5lVG9CZXppZXJDdXJ2ZTtcbmV4cG9ydHNbXCJkZWZhdWx0XCJdID0gX2RlZmF1bHQ7IiwiXCJ1c2Ugc3RyaWN0XCI7XG5cbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwge1xuICB2YWx1ZTogdHJ1ZVxufSk7XG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJiZXppZXJDdXJ2ZVRvUG9seWxpbmVcIiwge1xuICBlbnVtZXJhYmxlOiB0cnVlLFxuICBnZXQ6IGZ1bmN0aW9uIGdldCgpIHtcbiAgICByZXR1cm4gX2JlemllckN1cnZlVG9Qb2x5bGluZS5iZXppZXJDdXJ2ZVRvUG9seWxpbmU7XG4gIH1cbn0pO1xuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiZ2V0QmV6aWVyQ3VydmVMZW5ndGhcIiwge1xuICBlbnVtZXJhYmxlOiB0cnVlLFxuICBnZXQ6IGZ1bmN0aW9uIGdldCgpIHtcbiAgICByZXR1cm4gX2JlemllckN1cnZlVG9Qb2x5bGluZS5nZXRCZXppZXJDdXJ2ZUxlbmd0aDtcbiAgfVxufSk7XG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJwb2x5bGluZVRvQmV6aWVyQ3VydmVcIiwge1xuICBlbnVtZXJhYmxlOiB0cnVlLFxuICBnZXQ6IGZ1bmN0aW9uIGdldCgpIHtcbiAgICByZXR1cm4gX3BvbHlsaW5lVG9CZXppZXJDdXJ2ZVtcImRlZmF1bHRcIl07XG4gIH1cbn0pO1xuZXhwb3J0c1tcImRlZmF1bHRcIl0gPSB2b2lkIDA7XG5cbnZhciBfYmV6aWVyQ3VydmVUb1BvbHlsaW5lID0gcmVxdWlyZShcIi4vY29yZS9iZXppZXJDdXJ2ZVRvUG9seWxpbmVcIik7XG5cbnZhciBfcG9seWxpbmVUb0JlemllckN1cnZlID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChyZXF1aXJlKFwiLi9jb3JlL3BvbHlsaW5lVG9CZXppZXJDdXJ2ZVwiKSk7XG5cbmZ1bmN0aW9uIF9pbnRlcm9wUmVxdWlyZURlZmF1bHQob2JqKSB7IHJldHVybiBvYmogJiYgb2JqLl9fZXNNb2R1bGUgPyBvYmogOiB7IFwiZGVmYXVsdFwiOiBvYmogfTsgfVxuXG52YXIgX2RlZmF1bHQgPSB7XG4gIGJlemllckN1cnZlVG9Qb2x5bGluZTogX2JlemllckN1cnZlVG9Qb2x5bGluZS5iZXppZXJDdXJ2ZVRvUG9seWxpbmUsXG4gIGdldEJlemllckN1cnZlTGVuZ3RoOiBfYmV6aWVyQ3VydmVUb1BvbHlsaW5lLmdldEJlemllckN1cnZlTGVuZ3RoLFxuICBwb2x5bGluZVRvQmV6aWVyQ3VydmU6IF9wb2x5bGluZVRvQmV6aWVyQ3VydmVbXCJkZWZhdWx0XCJdXG59O1xuZXhwb3J0c1tcImRlZmF1bHRcIl0gPSBfZGVmYXVsdDsiXX0=
