export declare function isTouch(): boolean;
export declare function isTouchEvent(event: any): event is TouchEvent;
export declare function getClientXY(event: TouchEvent | MouseEvent): {
    X: number;
    Y: number;
};
export declare function getMidXY(event: TouchEvent): {
    mX: number;
    mY: number;
};
export declare function limitZoom(z: number, min: number, max: number): number;
export declare function getTouchesRange(event: TouchEvent): number;
export declare function getScale(event: TouchEvent, currRange: number): {
    scale: number;
    pageX: number;
    pageY: number;
};
export declare function getWheelDelta(event: WheelEvent): number;
