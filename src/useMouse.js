const robot = require('robotjs')

// export const a = (dPoint) => {
// 	robot.scrollMouse(dPoint.x, dPoint.y)
// }

module.exports.useMouse = () => {
	let timer = null
	let scrollPoint = { x: 0, y: 0 }
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
		const resPos = getResultPosition(scrollPoint, dPoint)
		robot.scrollMouse(resPos.x, resPos.y);
		scrollPoint = resPos
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
	const sinMouse = () => {	
		// Speed up the mouse.
		robot.setMouseDelay(2);
	
		const twoPI = Math.PI * 2.0;
		const screenSize = robot.getScreenSize();
		const height = (screenSize.height / 2) - 10;
		const width = screenSize.width;
	
		for (let x = 0; x < width; x++) {
			const y = height * Math.sin((twoPI * x) / width) + height;
			robot.moveMouse(x, y);
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
