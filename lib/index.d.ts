declare type Action = 'none' | 'move' | 'pinch';
interface ICoordinates {
    x: number;
    y: number;
    z: number;
}
export declare class PinchZoomPan {
    protected _element: HTMLElement;
    protected _minZoom: number;
    protected _maxZoom: number;
    protected _captureWheel: boolean;
    protected _state: Readonly<ICoordinates>;
    protected _action: Action;
    protected _current: ICoordinates & {
        range: number;
    };
    protected _events: ReadonlyArray<{
        type: any;
        listener: (e?: any) => void;
    }>;
    protected readonly _touch: boolean;
    constructor(element: HTMLElement, minZoom?: number, maxZoom?: number, captureWheel?: boolean);
    resetState(): void;
    setState(value: Readonly<ICoordinates>): void;
    setCurrentXY({ X, Y }: {
        X: number;
        Y: number;
    }): void;
    unsubscribe(): void;
    protected _startMoving(event: TouchEvent | MouseEvent): void;
    protected _setPosition(z: number, pageX: number, pageY: number): void;
    protected _onStart(event: TouchEvent | MouseEvent): void;
    protected _onMove(event: TouchEvent | MouseEvent): void;
    protected _onEnd(event: TouchEvent | MouseEvent): void;
    protected onWheel(event: WheelEvent): void;
}
export {};
