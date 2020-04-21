export declare type Point = [number, number];
/**
 * [controlPoint1, controlPoint2, endPoint]
 */
export declare type BezierCurveSegment = [Point, Point, Point];
export declare type BezierCurve = [Point, BezierCurveSegment, ...BezierCurveSegment[]];
export declare type GetBezierCurveTPointFunction = (t: number) => Point;
export declare type SegmentPointsData = {
    totalLength: number;
    segmentLength: number[];
    avgDistance: number;
    deviation: number;
};
