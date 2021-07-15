export function isTouch() {
    return window.matchMedia('(hover: none) and (pointer: coarse)').matches;
}
export function isTouchEvent(event) {
    return typeof TouchEvent !== 'undefined' && event instanceof TouchEvent;
}
export function getClientXY(event) {
    const point = event instanceof MouseEvent ? event : event.touches[0];
    return { X: point.clientX, Y: point.clientY };
}
export function getMidXY(event) {
    const [a, b] = Array.from(event.touches);
    return {
        mX: (a.pageX + b.pageX) / 2,
        mY: (a.pageY + b.pageY) / 2,
    };
}
export function limitZoom(z, min, max) {
    return Math.max(Math.min(z, max), min);
}
export function getTouchesRange(event) {
    const [a, b] = Array.from(event.touches);
    return Math.hypot(b.clientX - a.clientX, b.clientY - a.clientY);
}
export function getScale(event, currRange) {
    let scale = event.scale;
    let pageX = event.pageX;
    let pageY = event.pageY;
    if ([scale, pageX, pageY].some(val => val === undefined)) {
        scale = getTouchesRange(event) / currRange;
        const { mX, mY } = getMidXY(event);
        pageX = mX;
        pageY = mY;
    }
    return { scale, pageX, pageY };
}
export function getWheelDelta(event) {
    const delta = event.deltaY;
    switch (event.deltaMode) {
        case WheelEvent.DOM_DELTA_LINE:
            return Math.abs(delta) >= 1
                ? delta / 100
                : delta / 100 * 2;
        case WheelEvent.DOM_DELTA_PAGE:
            return Math.abs(delta) >= 1
                ? delta / 100
                : delta / 10;
        default:
            return Math.abs(delta) > 600
                ? delta / 10000
                : delta / 1000;
    }
}
//# sourceMappingURL=helpers.js.map