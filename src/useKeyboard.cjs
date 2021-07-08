const robot = require("robotjs");

module.exports.useKeyboard = () => {
  const keyTap = (type) => {
    robot.keyTap(type)
  }
  const keyDown = (type) => {
    robot.keyToggle(type, 'down')
  }
  const keyUp = (type) => {
    robot.keyToggle(type, 'up')
  }
  return {
    keyTap,
    keyDown,
    keyUp
  };
};
