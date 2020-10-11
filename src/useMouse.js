const robot = require('robotjs')

// export const a = (dPoint) => {
// 	robot.scrollMouse(dPoint.x, dPoint.y)
// }

module.exports.useMouse = () => {
	let timer = null
	// let scrollPoint = { x: 0, y: 0 }
	let mousePoint = { x: 0, y: 0 }

	const init = () => {
		robot.setMouseDelay(2);
		timer = setInterval(() => {
			mousePoint = robot.getMousePos()
		}, 1000)
	}
	const dispose = () => {
		if (timer) {
			clearInterval(timer)
		}
	}
	const move = (dPoint) => {
		const resPos = getResultPosition(mousePoint, dPoint)
		robot.moveMouse(resPos.x, resPos.y)
		mousePoint = resPos
	}
	const scroll = (dPoint) => {
		// const resPos = getResultPosition(scrollPoint, dPoint)
		// robot.scrollMouse(resPos.x, resPos.y);
		robot.scrollMouse(dPoint.x, dPoint.y);
		// scrollPoint = resPos
	}
	const click = (option = { button: 'left', double: false }) => {
		robot.mouseClick(option.button, option.double)
	}
	const dragEdge = (option = { down: 'down', button: 'left' }) => {
		robot.mouseToggle(option.down, option.button)
	}
	const dragging = (dPoint) => {
		const resPos = getResultPosition(mousePoint, dPoint)
		robot.dragMouse(resPos.x, resPos.y)
		mousePoint = resPos
	}
	const getResultPosition = (p, dPoint) => {
		return {
			x: p.x + dPoint.x,
			y: p.y + dPoint.y
		}
	}
	return {
		init,
		dispose,
		move,
		scroll,
		click,
		dragEdge,
		dragging
	}
}
