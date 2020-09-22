class Gesture {
  constructor();
  end(e: any): any;
  getId(): any;
  getType(): any;
  isValid(e: any, t: any, n: any): any;
  move(e: any, t: any, n: any): any;
  setId(e: any): void;
  setType(e: any): void;
  start(e: any, t: any, n: any): any;
  update(e: any): void;
}
class Pan extends Gesture {
  constructor(options?: PanOptions);
  end(e: any): any;
  move(e: any, t: any, n: any): any;
  start(e: any): void;
}
class Rotate extends Gesture{
  constructor(options?: any);
  move(e: any, t: any, n: any): any;
}
class Swipe extends Gesture{
  constructor(options?: SwipeOptions);
  end(e: any): any;
  move(e: any, t: any, n: any): any;
}
class Tap extends Gesture{
  constructor(options?: TapOptions);
  end(e: any): any;
  move(e: any, t: any, n: any): any;
  start(e: any): any;
}
class Distance extends Gesture{
  constructor(options?: TapOptions);
  // end(e: any): any;
  // move(e: any, t: any, n: any): any;
  // start(e: any): any;
}
class Expand extends Gesture {
  constructor(options?: any);
}
class Pinch extends Gesture {
  constructor(options?: any)
}

class Region {
  constructor(element: HTMLElement, capture?: boolean, preventDefault?: boolean)
  bind(
    element: HTMLElement,
    gesture: 'swipe' | 'pan' | 'tap' | 'pinch' | 'expand' | Gesture,
    handler: (e: CustomEvent<ActionEvent>) => void,
    capture?: boolean,
    bindOnce?:boolean
  ): void;
  bind(element: HTMLElement): ZingChainable;
  bindOnce(element: HTMLElement, gesture: string, handler: () => void, capture?: boolean): void;
  bindOnce(element: HTMLElement): ZingChainable;
  unbind(element: HTMLElement, gesture?: string): string[];
  register(key: string, gesture: Gesture): Gesture;
  unregister(key: string): Gesture;
}

interface ZingChainable {
  tap(handler: () => void, capture?: boolean): ZingChainable;
  swipe(handler: () => void, capture?: boolean): ZingChainable;
  pinch(handler: () => void, capture?: boolean): ZingChainable;
  expand(handler: () => void, capture?: boolean): ZingChainable;
  pan(handler: () => void, capture?: boolean): ZingChainable;
  rotate(handler: () => void, capture?: boolean): ZingChainable;
}

interface TapOptions {
  maxDelay?: number,
  numInputs?: number,
  tolerance?: number
}

interface SwipeOptions {
  numInputs?: number,
  escapeVelocity?: number,
  maxRestTime?: number,
}

interface PanOptions {
  numInputs?: number,
  threshold?: number
}

interface SwipeData {
  data: {
    velocity: number
    currentDirection: number
    distance: number
    duration: number
  }[]
}

type SwipeEvent = CustomEvent<SwipeData>
