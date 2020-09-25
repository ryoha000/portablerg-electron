const robot = require("robotjs");

module.exports.useKeyboard = () => {
    const keyTap = (type) => {
        console.log('keyTap', type)
        robot.keyTap(type)
    }
    return {
        keyTap
    };
};
