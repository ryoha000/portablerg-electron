/**
 * @file Gesture.js
 * Contains the Gesture class
 */

import util from './../core/util.js';

/**
 * The Gesture class that all gestures inherit from.
 */
class Gesture {
  /**
   * Constructor function for the Gesture class.
   * @class Gesture
   */
  constructor() {
    /**
     * The generic string type of gesture ('expand'|'distance'|
     *  'rotate'|'swipe'|'tap').
     * @type {String}
     */
    // @ts-expect-error ts-migrate(2339) FIXME: Property 'type' does not exist on type 'Gesture'.
    this.type = null;

    /**
     * The unique identifier for each gesture determined at bind time by the
     * state object. This allows for distinctions across instance variables of
     * Gestures that are created on the fly (e.g. Tap-1, Tap-2, etc).
     * @type {String|null}
     */
    // @ts-expect-error ts-migrate(2339) FIXME: Property 'id' does not exist on type 'Gesture'.
    this.id = null;
  }

  /**
   * Set the type of the gesture to be called during an event
   * @param {String} type - The unique identifier of the gesture being created.
   */
  setType(type: any) {
    // @ts-expect-error ts-migrate(2339) FIXME: Property 'type' does not exist on type 'Gesture'.
    this.type = type;
  }

  /**
   * getType() - Returns the generic type of the gesture
   * @return {String} - The type of gesture
   */
  getType() {
    // @ts-expect-error ts-migrate(2339) FIXME: Property 'type' does not exist on type 'Gesture'.
    return this.type;
  }

  /**
   * Set the id of the gesture to be called during an event
   * @param {String} id - The unique identifier of the gesture being created.
   */
  setId(id: any) {
    // @ts-expect-error ts-migrate(2339) FIXME: Property 'id' does not exist on type 'Gesture'.
    this.id = id;
  }

  /**
   * Return the id of the event. If the id does not exist, return the type.
   * @return {String}
   */
  getId() {
    // @ts-expect-error ts-migrate(2339) FIXME: Property 'id' does not exist on type 'Gesture'.
    return (this.id !== null) ? this.id : this.type;
  }

  /**
   * Updates internal properties with new ones, only if the properties exist.
   * @param {Object} object
   */
  update(object: any) {
    Object.keys(object).forEach( key => {
      // @ts-expect-error ts-migrate(7053) FIXME: No index signature with a parameter of type 'strin... Remove this comment to see the full error message
      this[key] = object[key];
    });
  }

  /**
   * start() - Event hook for the start of a gesture
   * @param {Array} inputs - The array of Inputs on the screen
	 * @param {Object} state - The state object of the current region.
	 * @param {Element} element - The element associated to the binding.
   * @return {null|Object}  - Default of null
   */
  // @ts-expect-error ts-migrate(7006) FIXME: Parameter 'inputs' implicitly has an 'any' type.
  start(inputs, state, element) {
    return null;
  }

  /**
   * move() - Event hook for the move of a gesture
   * @param {Array} inputs - The array of Inputs on the screen
   * @param {Object} state - The state object of the current region.
   * @param {Element} element - The element associated to the binding.
   * @return {null|Object} - Default of null
   */
  // @ts-expect-error ts-migrate(7006) FIXME: Parameter 'inputs' implicitly has an 'any' type.
  move(inputs, state, element) {
    return null;
  }

  /**
   * end() - Event hook for the move of a gesture
   * @param {Array} inputs - The array of Inputs on the screen
   * @return {null|Object}  - Default of null
   */
  // @ts-expect-error ts-migrate(7006) FIXME: Parameter 'inputs' implicitly has an 'any' type.
  end(inputs) {
    return null;
  }

	/**
	* isValid() - Pre-checks to ensure the invariants of a gesture are satisfied.
	* @param {Array} inputs - The array of Inputs on the screen
	* @param {Object} state - The state object of the current region.
	* @param {Element} element - The element associated to the binding.
	* @return {boolean} - If the gesture is valid
	*/
// @ts-expect-error ts-migrate(7006) FIXME: Parameter 'inputs' implicitly has an 'any' type.
	isValid(inputs, state, element) {
    // @ts-expect-error ts-migrate(7006) FIXME: Parameter 'input' implicitly has an 'any' type.
    return inputs.every( input => {
        return util.isInside(input.initial.x, input.initial.y, element);
    });
  }

}

export default Gesture;
