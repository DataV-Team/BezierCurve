<h1 align="center">Bezier Curve Extension</h1>

<p align="center">
    <a href="https://github.com/jiaming743/BezierCurve/blob/master/LICENSE"><img src="https://img.shields.io/github/license/jiaming743/bezierCurve.svg" alt="LICENSE" /> </a>
    <a href="https://www.npmjs.com/package/@jiaminghi/bezier-curve"><img src="https://img.shields.io/npm/v/@jiaminghi/bezier-curve.svg" alt="LICENSE" /> </a>
</p>

### This plugin provides three extension methods for Bezier curves.

* **bezierCurveToPolyline**

  Ability to abstract a Bezier curve into a polyline consisting of N **uniformly distributed** points.

* **getBezierCurveLength**

  Get the Bezier length

* **polylineToBezierCurve**

  Abstracting a polyline consisting of N points into a Bezier curve

****

<h3 align="center">Examples</h3>

#### bezierCurve

```javascript
// Bezier curve data structure
const bezierCurve = [
    // Start point
	[20, 20],
    // Multiple sets of bezier curve
    [
        // controlPoint1,controlPoint2,endPoint
        [100, 20],[100, 80],[180,80]
    ],
    // [...],[...]
]
```

<p align="center">
    <svg x="0px" y="0px" width="200px" height="100px" viewBox="0 0 200 100">
		<path fill="#FFFFFF" stroke="#000000" stroke-width="3" d="M20, 20 C100, 20 ,100, 80 ,180,80"/>
	</svg>
</p>

<p align="center"><i>bezierCurve</i> in <b>SVG</b></p>

#### bezierCurveToPolyline

```javascript
/**
 * @description     Get the polyline corresponding to the Bezier curve
 * @param {Array}   bezierCurve BezierCurve data
 * @param {Number}  precision Calculation accuracy. Recommended for 1-20. Default = 5
 * @return {Array}  Point data that constitutes a polyline after calculation
 */
function bezierCurveToPolyline (bezierCurve, precision = 5) {
  // ...
}

const precision = 5

const polyline = bezierCurveToPolyline(bezierCurve, precision)
// polyline = [
// [[20,20],
// [25.998752507628243,20.11632023466343],[31.698106846035834,20.457189096242345],
// [37.11424670004552,21.010468821119716],[42.263355754480024,21.764021645678454],
// ...]
```

<p align="center">
    <svg x="0px" y="0px" width="200px" height="100px" viewBox="0 0 200 100">
		<polyline stroke="#000000" stroke-width="3" fill="#FFFFFF"
                  points="20,20 25.998752507628243,20.11632023466343 31.698106846035834,20.457189096242345 37.11424670004552,21.010468821119716 42.263355754480024,21.764021645678454 47.16161769416207,22.705709806301524 51.82521620391443,23.82339553937187 56.27033496855981,25.10494108127244 60.51315767292099,26.538208668386183 64.56986800182067,28.11106053709604 68.4566496400816,29.811358923784958 72.18968627252652,31.62696606483589 75.78516158397815,33.54574419663177 79.25925925925928,35.55555555555556 82.62816298319257,37.64426237799019 85.90805644060082,39.79972690031862 89.11512331630674,42.009811358923784 92.26554729513309,44.26237799018864 95.37551206190261,46.545289030496136 98.461201301438,48.8464067162292 101.538798698562,51.15359328377079 104.6244879380974,53.454710969503864 107.73445270486692,55.73762200981136 110.88487668369325,57.990188641076216 114.09194355939918,60.20027309968138 117.37183701680742,62.3557376220098 120.74074074074073,64.44444444444446 124.21483841602185,66.45425580336823 127.8103137274735,68.37303393516412 131.5433503599184,70.18864107621505 135.43013199817932,71.88893946290396 139.48684232707902,73.46179133161382 143.72966503144016,74.89505891872756 148.1747837960856,76.17660446062813 152.83838230583794,77.29429019369849 157.73664424551995,78.23597835432155 162.88575329995447,78.98953117888028 168.30189315396416,79.54281090375764 174.00124749237176,79.88367976533658 180,80"
		/>
	</svg>
</p>

<p align="center"><i>polyline</i> in <b>SVG</b></p>

#### Notice

* The calculation result of *bezierCurveToPolyline* consists of N points, and N depends on the precision you set.
* Recommended precision is 5-10.
* If the setting precision is less than 1 or too large, the calculation result may be abnormal.
* Sometimes it is **impossible** to achieve precision



#### getBezierCurveLength

```js
/**
 * @description     Get the polyline corresponding to the Bezier curve
 * @param {Array}   bezierCurve bezierCurve data
 * @param {Number}  precision calculation accuracy. Recommended for 5-10. Default = 5
 * @return {Number} BezierCurve length
 */
export function getBezierCurveLength (bezierCurve, precision = 5) {
  // ...
}

// Normally the default precision can achieve better visual effects.
const length = bezierCurveToPolyline(bezierCurve)
```



#### polyline

```javascript
// polyline data structure
const polyline = [
    [20, 70],
    [50, 30],
    [100, 70],
    [150, 30],
    [180, 70]
]
```

<p align="center">
    <svg x="0px" y="0px" width="200px" height="100px" viewBox="0 0 200 100">
		<polyline stroke="#000000" stroke-width="3" fill="#FFFFFF"
                  points="20, 70, 50, 30, 100, 70, 150, 30, 180, 70"
		/>
	</svg>
</p>

<p align="center"><i>polyline</i> in <b>SVG</b></p>



#### polylineToBezierCurve

```javascript
/**
 * @description            Abstract the polyline formed by N points into a set of bezier curve
 * @param {Array} polyline A set of points that make up a polyline
 * @param {Boolean} close  Closed curve
 * @param {Number} offsetA Smoothness
 * @param {Number} offsetB Smoothness
 * @return {Array}         A set of bezier curve
 */
function polylineToBezierCurve (polyline, close = false, offsetA = 0.25, offsetB = 0.25) {
	// ...
}

const bezierCurve = polylineToBezierCurve(polyline)
// bezierCurve = [
// [
// 	[20,70],
// 	[[27.5,60],[30,30],[50,30]],
// 	[[70,30],[75,70],[100,70]],
// 	[[125,70],[130,30],[150,30]],
// 	[[170,30],[172.5,60],[180,70]]]
//]

const closedBezierCurve = polylineToBezierCurve(polyline, true)
// closedBezerCurve = [
// 	[20,70],
// 	[[-12.5,60],[30,30],[50,30]],
// 	[[70,30],[75,70],[100,70]],
// 	[[125,70],[130,30],[150,30]],
// 	[[170,30],[212.5,60],[180,70]],
// 	[[147.5,80],[52.5,80],[20,70]]
// ]
```

<p align="center">
    <svg x="0px" y="0px" width="200px" height="100px" viewBox="0 0 200 100">
		<path fill="#FFFFFF" stroke="#000000" stroke-width="3"
              d="M20, 70
                 C27.5,60 ,30,30 ,50,30
                 C70,30 ,75,70 ,100,70
                 C125,70 ,130,30 ,150,30
                 C170,30 ,172.5,60 ,180,70"
        />
	</svg>
</p>

<p align="center"><i>bezierCurve</i> in <b>SVG</b></p>

<p align="center">
    <svg x="0px" y="0px" width="200px" height="100px" viewBox="0 0 200 100">
		<path fill="#FFFFFF" stroke="#000000" stroke-width="3"
              d="M20, 70
                 C-12.5,60 ,30,30 ,50,30
                 C70,30 ,75,70 ,100,70
                 C125,70 ,130,30 ,150,30
                 C170,30 ,212.5,60 ,180,70
                 C147.5,80 ,52.5,80 ,20,70Z"
        />
	</svg>
</p>

<p align="center"><i>closedBezierCurve</i> in <b>SVG</b></p>

<div>
<?xml version="1.0" encoding="utf-8"?>
<!-- Generator: Adobe Illustrator 21.0.0, SVG Export Plug-In . SVG Version: 6.00 Build 0)  -->
<svg version="1.1" id="图层_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px"
	 viewBox="0 0 702 630" style="enable-background:new 0 0 702 630;" xml:space="preserve">
<style type="text/css">
	.st0{fill:#FFFFFF;stroke:#231815;stroke-miterlimit:10;}
</style>
<path class="st0" d="M473.8,358.4c-42.4-24.5-88.5-30.5-115.1-31.8c26.7-1.3,72.7-7.3,115.1-31.8c64.7-37.3,107.8-83.6,96.4-103.4
	s-73.1-5.6-137.8,31.8c-42.4,24.5-70.7,61.3-85.1,83.8c12.2-23.7,30-66.6,30-115.6c0-74.7-18.5-135.2-41.4-135.2
	c-22.8,0-41.4,60.5-41.4,135.2c0,49,17.8,91.9,30,115.6c-14.4-22.5-42.7-59.3-85.1-83.8c-64.7-37.3-126.3-51.6-137.8-31.8
	s31.7,66.1,96.4,103.4c42.4,24.5,88.5,30.5,115.1,31.8c-26.7,1.3-72.7,7.3-115.1,31.8c-64.7,37.3-107.8,83.6-96.4,103.4
	s73.1,5.6,137.8-31.8c42.4-24.5,70.7-61.3,85.1-83.8c-12.2,23.7-30,66.6-30,115.6c0,74.7,18.5,135.2,41.4,135.2
	c22.8,0,41.4-60.5,41.4-135.2c0-49-17.8-91.9-30-115.6c14.4,22.5,42.7,59.3,85.1,83.8c64.7,37.3,126.3,51.6,137.8,31.8
	S538.4,395.7,473.8,358.4z"/>
</svg>
</div>
