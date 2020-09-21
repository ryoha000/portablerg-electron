/**
 * @file Tap.js
 * Contains the Tap class
 */

import Gesture from './Gesture.js';
import util from './../core/util.js';

const DEFAULT_MIN_DELAY_MS = 0;
const DEFAULT_MAX_DELAY_MS = 300;
const DEFAULT_INPUTS = 1;
const DEFAULT_MOVE_PX_TOLERANCE = 10;

/**
 * A Tap is defined as a touchstart to touchend event in quick succession.
 * @class Tap
 */
class Tap extends Gesture {
  /**
   * Constructor function for the Tap class.
   * @param {Object} [options] - The options object.
   * @param {Number} [options.minDelay=0] - The minimum delay between a
   * touchstart and touchend can be configured in milliseconds.
   * @param {Number} [options.maxDelay=300] - The maximum delay between a
   * touchstart and touchend can be configured in milliseconds.
   * @param {Number} [options.numInputs=1] - Number of inputs for Tap gesture.
   * @param {Number} [options.tolerance=10] - The tolerance in pixels
   *  a user can move.
   * @param {Function} [options.onStart] - The on start callback
   * @param {Function} [options.onMove] - The on move callback
   * @param {Function} [options.onEnd] - The on end callback
   */
  constructor(options: {
    minDelay?: number,
    maxDelay?: number,
    numInputs?: number,
    tolerance?: number,
    onEnd?: () => void
  }) {
    super();

    /**
     * The type of the Gesture.
     * @type {String}
     */
    // @ts-expect-error ts-migrate(2339) FIXME: Property 'type' does not exist on type 'Tap'.
    this.type = 'tap';

    /**
     * The minimum amount between a touchstart and a touchend can be configured
     * in milliseconds. The minimum delay starts to count down when the expected
     * number of inputs are on the screen, and ends when ALL inputs are off the
     * screen.
     * @type {Number}
     */
    // @ts-expect-error ts-migrate(2339) FIXME: Property 'minDelay' does not exist on type 'Tap'.
    this.minDelay = (options && options.minDelay) ?
      options.minDelay : DEFAULT_MIN_DELAY_MS;

    /**
     * The maximum delay between a touchstart and touchend can be configured in
     * milliseconds. The maximum delay starts to count down when the expected
     * number of inputs are on the screen, and ends when ALL inputs are off the
     * screen.
     * @type {Number}
     */
    // @ts-expect-error ts-migrate(2339) FIXME: Property 'maxDelay' does not exist on type 'Tap'.
    this.maxDelay = (options && options.maxDelay) ?
      options.maxDelay : DEFAULT_MAX_DELAY_MS;

    /**
     * The number of inputs to trigger a Tap can be variable,
     * and the maximum number being a factor of the browser.
     * @type {Number}
     */
    // @ts-expect-error ts-migrate(2339) FIXME: Property 'numInputs' does not exist on type 'Tap'.
    this.numInputs = (options && options.numInputs) ?
      options.numInputs : DEFAULT_INPUTS;

    /**
     * A move tolerance in pixels allows some slop between a user's start to end
     * events. This allows the Tap gesture to be triggered more easily.
     * @type {number}
     */
    // @ts-expect-error ts-migrate(2339) FIXME: Property 'tolerance' does not exist on type 'Tap'.
    this.tolerance = (options && options.tolerance) ?
      options.tolerance : DEFAULT_MOVE_PX_TOLERANCE;

    /**
     * The on end callback
     */
    if (options && options.onEnd && typeof options.onEnd === 'function') {
      // @ts-expect-error ts-migrate(2339) FIXME: Property 'onEnd' does not exist on type 'Tap'.
      this.onEnd = options.onEnd
    }
  }

  /* constructor*/

  /**
   * Event hook for the start of a gesture. Keeps track of when the inputs
   * trigger the start event.
   * @param {Array} inputs - The array of Inputs on the screen.
   * @return {null} - Tap does not trigger on a start event.
   */
  start(inputs: any) {
    // @ts-expect-error ts-migrate(2339) FIXME: Property 'numInputs' does not exist on type 'Tap'.
    if (inputs.length === this.numInputs) {
      inputs.forEach((input: any) => {
        let progress = input.getGestureProgress(this.getId());
        progress.start = new Date().getTime();
      });
    }
    return null;
  }

  /* start*/

  /**
   * Event hook for the move of a gesture. The Tap event reaches here if the
   * user starts to move their input before an 'end' event is reached.
   * @param {Array} inputs - The array of Inputs on the screen.
   * @param {Object} state - The state object of the current region.
   * @param {Element} element - The element associated to the binding.
   * @return {null} - Tap does not trigger on a move event.
   */
  move(inputs: any, state: any, element: any) {
    for (let i = 0; i < inputs.length; i++) {
      if (inputs[i].getCurrentEventType() === 'move') {
        let current = inputs[i].current;
        let previous = inputs[i].previous;
        if (!util.isWithin(
            current.x,
            current.y,
            previous.x,
            previous.y,
            // @ts-expect-error ts-migrate(2339) FIXME: Property 'tolerance' does not exist on type 'Tap'.
            this.tolerance)) {
          // @ts-expect-error ts-migrate(2339) FIXME: Property 'type' does not exist on type 'Tap'.
          let type = this.type;
          inputs.forEach(function(input: any) {
            input.resetProgress(type);
          });

          return null;
        }
      }
    }
    return null;
  }

  /* move*/

  /**
   * Event hook for the end of a gesture.
   * Determines if this the tap event can be fired if the delay and tolerance
   * constraints are met. Also waits for all of the inputs to be off the screen
   * before determining if the gesture is triggered.
   * @param {Array} inputs - The array of Inputs on the screen.
   * @return {null|Object} - null if the gesture is not to be emitted,
   * Object with information otherwise. Returns the interval time between start
   * and end events.
   */
  // @ts-expect-error ts-migrate(2416) FIXME: Type '{ interval: number; }' is not assignable to ... Remove this comment to see the full error message
  end(inputs: any) {
    // @ts-expect-error ts-migrate(2339) FIXME: Property 'numInputs' does not exist on type 'Tap'.
    if (inputs.length !== this.numInputs) {
      return null;
    }
    let startTime = Number.MAX_VALUE;
    for (let i = 0; i < inputs.length; i++) {
      if (inputs[i].getCurrentEventType() !== 'end') {
        return null;
      }

      let progress = inputs[i].getGestureProgress(this.getId());
      if (!progress.start) {
        return null;
      }

      // Find the most recent input's startTime
      if (progress.start < startTime) {
        startTime = progress.start;
      }
    }

    let interval = new Date().getTime() - startTime;
    // @ts-expect-error ts-migrate(2339) FIXME: Property 'minDelay' does not exist on type 'Tap'.
    if ((this.minDelay <= interval) && (this.maxDelay >= interval)) {

      const timing = { interval }
      // @ts-expect-error ts-migrate(2339) FIXME: Property 'onEnd' does not exist on type 'Tap'.
      if(this.onEnd) {
        // @ts-expect-error ts-migrate(2339) FIXME: Property 'onEnd' does not exist on type 'Tap'.
        this.onEnd(inputs, timing);
      }
      return timing;
    } else {
      // @ts-expect-error ts-migrate(2339) FIXME: Property 'type' does not exist on type 'Tap'.
      let type = this.type;
      inputs.forEach(function(input: any) {
        input.resetProgress(type);
      });

      return null;
    }
  }

  /* end*/
}

export default Tap;
