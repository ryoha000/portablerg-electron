const robot = require('./robotjs.node')

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
