[中文](./README.md)

<h1 align="center">Bezier Curve Extension</h1>

<p align="center">
    <a href="https://travis-ci.com/DataV-Team/beziercurve">
      <img src="https://img.shields.io/travis/com/DataV-Team/bezierCurve.svg" alt="Travis CI">
    </a>
    <a href="https://github.com/DataV-Team/beziercurve/blob/master/LICENSE">
      <img src="https://img.shields.io/github/license/DataV-Team/beziercurve.svg" alt="LICENSE" />
    </a>
    <a href="https://www.npmjs.com/package/@jiaminghi/bezier-curve">
      <img src="https://img.shields.io/npm/v/@jiaminghi/bezier-curve.svg" alt="NPM" />
    </a>
</p>

### This plugin provides three extension methods for Bezier curves.

- **[bezierCurveToPolyline](#bezierCurveToPolyline)**

  Ability to abstract a Bezier curve into a polyline consisting of N points.

- **[getBezierCurveLength](#getBezierCurveLength)**

  Get the length of bezier curve.

- **[polylineToBezierCurve](#polylineToBezierCurve)**

  Abstracting a polyline consisting of N points into a Bezier curve.

### Install with npm

```shell
$ npm install @jiaminghi/bezier-curve
```

### Use

```javascript
import { bezierCurveToPolyline } from '@jiaminghi/bezier-curve'

// do something
```

### Quick experience

```html
<!--Debug version-->
<script src="https://unpkg.com/@jiaminghi/color/dist/index.js"></script>
<!--Compression version-->
<script src="https://unpkg.com/@jiaminghi/color/dist/index.min.js"></script>
<script>
  const { bezierCurveToPolyline, getBezierCurveLength, polylineToBezierCurve } = window.BezierCurve
  // do something
</script>
```

---

<h3 align="center">Examples</h3>

#### bezierCurve

```typescript
type Point = [number, number]

/**
 * [controlPoint1, controlPoint2, endPoint]
 */
type BezierCurveSegment = [Point, Point, Point]

/**
 * [start point, Multiple sets of bezier curve, ...]
 * The starting point of the next bezier curve is the end point of the previous bezier curve
 */
type BezierCurve = [Point, BezierCurveSegment, ...BezierCurveSegment[]]

const bezierCurve: BezierCurve = [
  [20, 20],
  [
    [100, 20],
    [100, 80],
    [180, 80],
  ],
]
```

<p align="center">
    <img width="200px" src="./exampleImgs/bezierCurve.png" />
</p>

<p align="center"><i>bezierCurve</i> in <b>SVG</b></p>

#### bezierCurveToPolyline

```typescript
/**
 * @description Transform bezierCurve to polyline
 * @param {BezierCurve} bezierCurve bezier curve
 * @param {number} precision        Wanted precision
 * @param {number} recursiveCount   Recursive count
 * @return {Point[]} Polyline
 */
type bezierCurveToPolyline = (
  bezierCurve: BezierCurve,
  precision = 5,
  resursiveCount = 0
) => Point[]

const polyline = bezierCurveToPolyline(bezierCurve)
// polyline = [
// [[20,20],
// [25.998752507628243,20.11632023466343],[31.698106846035834,20.457189096242345],
// [37.11424670004552,21.010468821119716],[42.263355754480024,21.764021645678454],
// ...]
```

<p align="center">
    <img width="200px" src="./exampleImgs/bezierCurveToPolyline.png" />
</p>

<p align="center"><i>polyline</i> in <b>SVG</b></p>

#### Notice

- The calculation result of _bezierCurveToPolyline_ consists of N points, and N depends on the precision you set.
- Ideally, the distance between two adjacent points in the calculation result is equal to the set accuracy (unit px).
- Recommended precision is 5-10.
- The precision of the setting is usually not achieved, unless the higher the number of recursiveCount, the higher the calculation cost.

#### getBezierCurveLength

```typescript
/**
 * @description Get the length of the bezier curve
 * @param {BezierCurve} bezierCurve bezier curve
 * @param {number} precision        Wanted precision
 * @param {number} recursiveCount   Recursive count
 * @return {number} The length
 */
type getBezierCurveLength = (bezierCurve: BezierCurve, precision = 5, resursiveCount = 0) => number

// Normally the default precision can achieve better visual effects.
const length = getBezierCurveLength(bezierCurve)
```

#### polyline

```typescript
const polyline: Point[] = [
  [20, 70],
  [50, 30],
  [100, 70],
  [150, 30],
  [180, 70],
]
```

<p align="center">
    <img width="200px" src="./exampleImgs/polyline.png" />
</p>

<p align="center"><i>polyline</i> in <b>SVG</b></p>

#### polylineToBezierCurve

```typescript
/**
 * @description Convert polyline to bezierCurve
 * @param {Point[]} polyline A set of points that make up a polyline
 * @param {boolean} close    Closed curve
 * @param {number} offsetA   Smoothness
 * @param {number} offsetB   Smoothness
 * @return {BezierCurve} A set of bezier curve (Invalid input will return false)
 */
type polylineToBezierCurve = (
  polyline: Point[],
  close = false,
  offsetA = 0.25,
  offsetB = 0.25
) => BezierCurve

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
    <img width="200px" src="./exampleImgs/polylineToBezierCurve.png" />
</p>

<p align="center"><i>bezierCurve</i> in <b>SVG</b></p>

<p align="center">
    <img width="200px" src="./exampleImgs/polylineToClosedBezierCurve.png" />
</p>

<p align="center"><i>closedBezierCurve</i> in <b>SVG</b></p>
