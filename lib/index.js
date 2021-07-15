import { DEFAULT_STATE, MAX_ZOOM, MIN_ZOOM } from './constants';
import { getClientXY, getScale, getTouchesRange, getWheelDelta, isTouch, isTouchEvent, limitZoom } from './helpers';
export class PinchZoomPan {
    constructor(element, minZoom = MIN_ZOOM, maxZoom = MAX_ZOOM, captureWheel = false) {
        this._state = DEFAULT_STATE;
        this._action = 'none';
        this._minZoom = minZoom;
        this._maxZoom = maxZoom;
        this._captureWheel = captureWheel;
        this._current = { x: 0, y: 0, z: 0, range: 0 };
        this._touch = isTouch();
        this._element = element;
        this._events = [
            { type: this._touch ? 'touchstart' : 'mousedown', listener: this._onStart },
            { type: this._touch ? 'touchmove' : 'mousemove', listener: this._onMove },
            { type: this._touch ? 'touchend' : 'mouseup', listener: this._onEnd },
            { type: this._touch ? 'touchleave' : 'mouseleave', listener: this._onEnd },
            { type: 'touchcancel', listener: this._onEnd },
            { type: 'wheel', listener: this.onWheel },
        ];
        const { width, height } = element.getBoundingClientRect();
        this.setState({ x: width / 2, y: height / 2, z: this._state.z });
        element.addEventListener(this._touch ? 'touchstart' : 'mousedown', (event) => this._onStart(event));
        element.addEventListener(this._touch ? 'touchmove' : 'mousemove', (event) => this._onMove(event));
        element.addEventListener(this._touch ? 'touchend' : 'mouseup', (event) => this._onEnd(event));
        element.addEventListener(this._touch ? 'touchleave' : 'mouseleave', (event) => this._onEnd(event));
        element.addEventListener('touchcancel', (event) => this._onEnd(event));
        element.addEventListener('wheel', (event) => this.onWheel(event));
    }
    resetState() {
        const { width, height } = this._element.getBoundingClientRect();
        this.setState({ x: width / 2 - 30, y: height / 2 - 175, z: this._state.z });
        this._current = { x: 0, y: 0, z: 0, range: 0 };
    }
    setState(value) {
        this._state = value;
        const point = this._element.children.item(0);
        if (point)
            point.style.transform = `translate(${value.x}px, ${value.y}px) scale(${value.z})`;
    }
    setCurrentXY({ X, Y }) {
        this._current.x = X;
        this._current.y = Y;
    }
    unsubscribe() {
        this._events.forEach(({ type, listener }) => this._element.removeEventListener(type, listener));
    }
    _startMoving(event) {
        this._action = 'move';
        this.setCurrentXY(getClientXY(event));
    }
    _setPosition(z, pageX, pageY) {
        const { left, top } = this._element.getBoundingClientRect();
        const ratio = z / this._state.z;
        const offsetX = (pageX - left - window.pageXOffset) - this._state.x;
        const offsetY = (pageY - top - window.pageYOffset) - this._state.y;
        this.setState({
            x: this._state.x - ((offsetX * ratio) - offsetX),
            y: this._state.y - ((offsetY * ratio) - offsetY),
            z,
        });
    }
    _onStart(event) {
        event.preventDefault();
        if (isTouchEvent(event) && event.touches.length === 2) {
            this._action = 'pinch';
            this._current.z = this._state.z;
            this._current.range = getTouchesRange(event);
        }
        else
            this._startMoving(event);
    }
    _onMove(event) {
        event.stopImmediatePropagation();
        event.preventDefault();
        if (this._action === 'move') {
            const clientXY = getClientXY(event);
            const x = this._state.x - (this._current.x - clientXY.X);
            const y = this._state.y - (this._current.y - clientXY.Y);
            this.setCurrentXY(clientXY);
            this.setState({ x, y, z: this._state.z });
        }
        else if (this._action === 'pinch') {
            const { scale, pageX, pageY } = getScale(event, this._current.range);
            const z = limitZoom(this._current.z * scale, this._minZoom, this._maxZoom);
            this._setPosition(z, pageX, pageY);
        }
    }
    _onEnd(event) {
        if (this._action === 'pinch' && isTouchEvent(event) && event.touches.length === 1)
            this._startMoving(event);
        else
            this._action = 'none';
    }
    onWheel(event) {
        if (!this._captureWheel && !event.altKey)
            return;
        event.preventDefault();
        event.stopPropagation();
        const delta = getWheelDelta(event) * -1;
        const z = limitZoom(this._state.z + delta, this._minZoom, this._maxZoom);
        this._setPosition(z, event.pageX, event.pageY);
    }
}
//# sourceMappingURL=index.js.map