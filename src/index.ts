import { DEFAULT_STATE, MAX_ZOOM, MIN_ZOOM } from './constants';
import { getClientXY, getScale, getTouchesRange, getWheelDelta, isTouch, isTouchEvent, limitZoom } from './helpers';

type Action = 'none' | 'move' | 'pinch';

interface ICoordinates {
  x: number;
  y: number;
  z: number;
}

export class PinchZoomPan {
  protected _element: HTMLElement
  protected _minZoom: number
  protected _maxZoom: number
  protected _captureWheel: boolean
  protected _state: Readonly<ICoordinates>
  protected _action: Action
  protected _current: ICoordinates & { range: number }
  protected _events: ReadonlyArray<{ type: any, listener: (e?: any) => void }>
  protected readonly _touch: boolean

  constructor(element: HTMLElement, minZoom: number = MIN_ZOOM, maxZoom: number = MAX_ZOOM, captureWheel: boolean = false) {
    this._state = DEFAULT_STATE
    this._action = 'none'
    this._minZoom = minZoom
    this._maxZoom = maxZoom
    this._maxZoom = maxZoom
    this._captureWheel = captureWheel
    this._current = { x: 0, y: 0, z: 0, range: 0 }
    this._touch = isTouch()
    this._element = element
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

    // subscribe
    element.addEventListener(this._touch ? 'touchstart' : 'mousedown', (event: TouchEvent | MouseEvent) => this._onStart(event))
    element.addEventListener(this._touch ? 'touchmove' : 'mousemove', (event: TouchEvent | MouseEvent) => this._onMove(event))
    element.addEventListener(this._touch ? 'touchend' : 'mouseup', (event: TouchEvent | MouseEvent) => this._onEnd(event))
    // @ts-ignore
    element.addEventListener(this._touch ? 'touchleave' : 'mouseleave', (event: TouchEvent | MouseEvent) => this._onEnd(event))
    element.addEventListener('touchcancel', (event: TouchEvent | MouseEvent) => this._onEnd(event))
    element.addEventListener('wheel', (event: WheelEvent) => this.onWheel(event))
  }
  public resetState () {
    const { width, height } = this._element.getBoundingClientRect();
    this.setState({ x: width / 2 - 30, y: height / 2 - 175, z: this._state.z });
    this._current = { x: 0, y: 0, z: 0, range: 0 }
  }
  public setState(value: Readonly<ICoordinates>) {
    this._state = value;
    const point = this._element.children.item(0);
    if (point) (point as HTMLElement).style.transform = `translate(${value.x}px, ${value.y}px) scale(${value.z})`;
  }
  public setCurrentXY({ X, Y }: { X: number, Y: number }) {
    this._current.x = X;
    this._current.y = Y;
  }
  public unsubscribe() {
    this._events.forEach(({ type, listener }) => this._element.removeEventListener(type, listener));
  }

  protected _startMoving(event: TouchEvent | MouseEvent) {
    this._action = 'move';
    this.setCurrentXY(getClientXY(event));
  }
  protected _setPosition(z: number, pageX: number, pageY: number) {
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
  protected _onStart(event: TouchEvent | MouseEvent) {
    event.preventDefault();
    if (isTouchEvent(event) && event.touches.length === 2) {
      this._action = 'pinch';
      this._current.z = this._state.z;
      this._current.range = getTouchesRange(event);
    }
    else this._startMoving(event);
  }
  protected _onMove(event: TouchEvent | MouseEvent) {
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
      const { scale, pageX, pageY } = getScale(event as TouchEvent, this._current.range);
      const z = limitZoom(this._current.z * scale, this._minZoom, this._maxZoom);
      this._setPosition(z, pageX, pageY);
    }
  }
  protected _onEnd(event: TouchEvent | MouseEvent) {
    if (this._action === 'pinch' && isTouchEvent(event) && event.touches.length === 1) this._startMoving(event);
    else this._action = 'none';
  }
  protected onWheel(event: WheelEvent) {
    if (!this._captureWheel && !event.altKey) return;
    event.preventDefault();
    event.stopPropagation();

    const delta = getWheelDelta(event) * -1;
    const z = limitZoom(this._state.z + delta, this._minZoom, this._maxZoom);
    this._setPosition(z, event.pageX, event.pageY);
  }
}
