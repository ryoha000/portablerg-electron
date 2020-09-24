import ZingTouch from '../../lib/ZingTouch/ZingTouch'
import { TabletSetting, Rect, ControlType, Control, ControlStyle } from './useSetting'
import { get, writable } from 'svelte/store'

export const controls = writable<Control[]>([])

const REM = 16
const useTemplate = () => {
  const region: Region = new ZingTouch.Region(document.body, true, true);
  const rects: { x: number, y: number, width: number, height: number }[] = []
  const distanceCenters: { x: number, y: number }[] = []

  const init = () => {
    const initialControls :Control[] = []
    for (const type of Object.values(ControlType)) {
      initialControls.push({
        rect: {
          start: {
            x: `${REM * 6 * type + REM}px`,
            y: '0px'
          },
          width: `${5 * REM}px`,
          height: `${5 * REM}px`
        },
        color: [0, 0, 0, 0.1],
        type: type,
        zIndex: 1
      })
      rects.push({
        x: REM * 6 * type + REM,
        y: 0,
        width: 5 * REM,
        height: 5 * REM
      })
      distanceCenters.push({
        x: 0,
        y: 0
      })
    }
    controls.set(initialControls)
  }
  const setupHandler = (ele: HTMLElement, type: ControlType) => {
    if (rects.length < 4) {
      console.error('not initialize')
      return
    }

    region.bind(ele, 'pan', (e: PanEvent) => {
      if (e.detail.data.length === 0) {
        return
      }
      console.log('move')
      const data = e.detail.data[0]

      rects[type].x += data.change.x
      rects[type].y += data.change.y
      const prev: Control[] = get(controls)
      prev[type].rect.start.x = `${rects[type].x}px`
      prev[type].rect.start.y = `${rects[type].y}px`
      controls.set(prev)
    })
  
    const onDistanceStart = (inputs: ZingInput[], state: any, element: HTMLElement) => {
      console.log('distance move')
      if (inputs.length < 2) {
        return
      }
      distanceCenters[type] = {
        x: (inputs[0].current.x + inputs[1].current.x) / 2,
        y: (inputs[0].current.y + inputs[1].current.y) / 2,
      }
    }
    const onDistanceMove = (inputs: ZingInput[], state: any, element: HTMLElement, movement: DistanceData) => {
      console.log('distance move')
      if (!movement || inputs.length < 2) {
        return
      }
      const change1 = getChange(distanceCenters[type], inputs[0])
      const change2 = getChange(distanceCenters[type], inputs[1])
      if (inputs[0].current.x < inputs[1].current.x) {
        rects[type].x -= change1.x
        rects[type].y -= change1.y
        rects[type].width += change1.x + change2.x
        rects[type].height += change1.y + change2.y
      } else {
        rects[type].x -= change2.x
        rects[type].y -= change2.y
        rects[type].width += change1.x + change2.x
        rects[type].height += change1.y + change2.y
      }
      // // ele.style.transform = ele.style.transform.replace(getScale(), '')
      // ele.style.transform += getScale()
      const prev: Control[] = get(controls)
      prev[type].rect.start.x = `${rects[type].x}px`
      prev[type].rect.start.y = `${rects[type].y}px`
      prev[type].rect.width = `${rects[type].width}px`
      prev[type].rect.height = `${rects[type].height}px`
      controls.set(prev)
    }
    const customDistance: Distance = new ZingTouch.Distance({ onStart: onDistanceStart, onMove: onDistanceMove })
    region.bind(ele, customDistance, () => {})
  }
  return { init, setupHandler }
};

const getXYFromTransform = (str: string) => {
  const arr = str.split(' ')
  const res = { x: 0, y: 0 }
  for (const v of arr) {
    const content = v.slice(10, -3)
    if (v.startsWith('translateX')) {
      res.x = Number(content)
    }
    if (v.startsWith('translateY')) {
      res.y = Number(content)
    }
  }
  return res
}

const getChange = (center: { x: number, y: number }, input: ZingInput) => {
  return {
    x: Math.abs(input.current.x - center.x) - Math.abs(input.previous.x - center.x),
    y: Math.abs(input.current.y - center.y) - Math.abs(input.previous.y - center.y)
  }
}

export default useTemplate
