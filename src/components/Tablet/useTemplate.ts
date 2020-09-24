import ZingTouch from '../../lib/ZingTouch/ZingTouch'
import { TabletSetting, Rect, ControlType, Control, ControlStyle } from './useSetting'
import { get, writable } from 'svelte/store'

export const controls = writable<Control[]>([])

const REM = 16
const useTemplate = () => {
  const region: Region = new ZingTouch.Region(document.body, true, true);
  const rects: { x: number, y: number, width: number, height: number }[] = []
  const distanceCenters: { x: number, y: number }[] = []
  const translates: { x: number, y: number }[] = []
  const elements: (null | HTMLElement)[] = Array(Object.values(ControlType).length).map(_ => null)
  let isDragging = Array(Object.values(ControlType).length).map(_ => false)

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
      translates.push({
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
    elements[type] = ele

    const onPanStart = (inputs: ZingInput[]) => {
      if (inputs.length === 0) {
        console.error('pan start error')
        return
      }
      const initial = inputs[0].initial
      isDragging = Array(Object.values(ControlType).length).map(_ => false)
      rects.forEach((rect, i) => {
        if (rect.x < initial.x && initial.x < rect.x + rect.width && rect.y < initial.y && initial.y < rect.y + rect.height) {
          isDragging[i] = true
        }
      })
    }

    const onPanMove = (inputs: ZingInput[], state: any, element: HTMLElement, output: PanData) => {
      if (!output || output.data.length === 0) {
        return
      }
      const draggingIndex = isDragging.findIndex(v => v === true)
      if (draggingIndex === -1) {
        return
      }
      const data = output.data[0]
      rects[draggingIndex].x += data.change.x
      rects[draggingIndex].y += data.change.y
      const prev: Control[] = get(controls)
      prev[draggingIndex].rect.start.x = `${rects[draggingIndex].x}px`
      prev[draggingIndex].rect.start.y = `${rects[draggingIndex].y}px`
      controls.set(prev)
    }

    const customPan = new ZingTouch.Pan({ onStart: onPanStart, onMove: onPanMove })
    region.bind(document.body, customPan, () => {})
  
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

const getChange = (center: { x: number, y: number }, input: ZingInput) => {
  return {
    x: Math.abs(input.current.x - center.x) - Math.abs(input.previous.x - center.x),
    y: Math.abs(input.current.y - center.y) - Math.abs(input.previous.y - center.y)
  }
}

export default useTemplate
