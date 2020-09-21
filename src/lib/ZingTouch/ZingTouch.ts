/**
 * @file ZingTouch.js
 * Main object containing API methods and Gesture constructors
 */

// @ts-ignore
import Region from './core/classes/Region.js';
// @ts-ignore
import Gesture from './gestures/Gesture.js';
// @ts-ignore
import Pan from './gestures/Pan.js';
// @ts-ignore
import Distance from './gestures/Distance.js';
// @ts-ignore
import Rotate from './gestures/Rotate.js';
// @ts-ignore
import Swipe from './gestures/Swipe.js';
// @ts-ignore
import Tap from './gestures/Tap.js';

/**
 * The global API interface for ZingTouch. Contains a constructor for the
 * Region Object, and constructors for each predefined Gesture.
 * @type {Object}
 * @namespace ZingTouch
 */
let ZingTouch: any = {
  _regions: [],

  // Constructors
  Gesture,
  Pan,
  Distance,
  Rotate,
  Swipe,
  Tap,
  Region: function(element: HTMLElement, capture?: boolean, preventDefault?: boolean) {
    let id = ZingTouch._regions.length;
    let region = new Region(element, capture, preventDefault, id);
    // @ts-ignore
    ZingTouch._regions.push(region);
    return region;
  },
};

export default ZingTouch;
