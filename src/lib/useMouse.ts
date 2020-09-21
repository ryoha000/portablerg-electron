import robot from 'robotjs'

export interface Point {
	x: number
	y: number
}

const useMouse = () => {
	let timer: NodeJS.Timeout | null = null
	let mousePoint: Point = { x: 0, y: 0 }

	const init = () => {
		timer = setInterval(() => {
			robot.setMouseDelay(2);
			mousePoint = robot.getMousePos()
			console.log(`now mouse position: ${mousePoint}`)
		}, 1000)
	}
	const dispose = () => {
		if (timer) {
			clearInterval(timer)
		}
	}
	const move = (dPoint: Point) => {
		const resPos = getResultPosition(dPoint)
		robot.moveMouse(resPos.x, resPos.y)
	}
	const scroll = (dPoint: Point) => {
		robot.scrollMouse(dPoint.x, dPoint.y)
	}
	const click = (option: {
		button: 'left' | 'right' | 'middle',
		double: boolean
	} = { button: 'left', double: false }) => {
		robot.mouseClick(option.button, option.double)
	}
	const dragEdge = (option: {
		down: 'down' | 'up',
		button: 'left' | 'right' | 'middle'
	} = { down: 'down', button: 'left' }) => {
		robot.mouseToggle(option.down, option.button)
	}
	const dragging = (dPoint: Point) => {
		const resPos = getResultPosition(dPoint)
		robot.dragMouse(resPos.x, resPos.y)
	}
	const getResultPosition = (dPoint: Point) => {
		return {
			x: mousePoint.x + dPoint.x,
			y: mousePoint.y + dPoint.y
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

export default useMouse
