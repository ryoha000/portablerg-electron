const robot = require("robotjs");

module.exports.useKeyboard = () => {
  const keyTap = (type) => {
    console.log('keyTap', type)
    robot.keyTap(type)
  }
  const keyDown = (type) => {
    console.log('keyDown', type)
    robot.keyToggle(type, 'down')
  }
  const keyUp = (type) => {
    console.log('keyUp', type)
    robot.keyToggle(type, 'up')
  }
  return {
    keyTap,
    keyDown,
    keyUp
  };
};
