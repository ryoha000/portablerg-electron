import ZingTouch from '../../lib/ZingTouch/ZingTouch'
import { TabletSetting, Rect, setting } from './useSetting'
import { get, writable } from 'svelte/store'
import type { NumRect } from './useLayout';

export const overIndex = writable(-1)

const PADDING = 16
const HEIGHT = 64

const useLayout = (container: HTMLElement) => {
  const region: Region = new ZingTouch.Region(container, false, true);
  const tops: number[] = []
  const elements: (null | HTMLElement)[] = []
  let dragBuffer = 0
  let isDragging: boolean[] = []

  const init = () => {
    console.log('init')
    const s: TabletSetting = get(setting)
    for (const [i, template] of s.controlTemplates.entries()) {
      tops.push((HEIGHT + PADDING * 2) * (i + 1) + PADDING)
      elements.push(null)
    }
    const onPanStart = (inputs: ZingInput[]) => {
      console.log('start')
      if (inputs.length === 0) {
        console.error('pan start error')
        return
      }
      const initial = inputs[0].initial
      dragBuffer = 0
      isDragging =isDragging.map(_ => false)
      console.log(tops, initial)
      tops.forEach((top, i) => {
        if (top < initial.y && initial.y < top + HEIGHT) {
          isDragging[i] = true
        }
      })
    }
  
    const onPanMove = (inputs: ZingInput[], state: any, element: HTMLElement, output: PanData) => {
      if (!output || output.data.length === 0) {
        return
      }
      const draggingIndex = isDragging.findIndex(v => v === true)
      console.log(draggingIndex)
      const elem = elements[draggingIndex]
      if (draggingIndex === -1 || !elem) {
        return
      }
      const data = output.data[0]
      dragBuffer += data.change.y
      elem.style.transform = `translateY(${dragBuffer}px)`
      const dOver = Math.floor(dragBuffer / (HEIGHT + PADDING * 2))
      const oIndex = draggingIndex + dOver
      if (oIndex > tops.length + 1 || oIndex < 0) {
        onPanEnd()
        return
      }
      const newOverIndex = oIndex < 0 ? 0 : oIndex + 1 > tops.length ? tops.length : oIndex
      overIndex.set(newOverIndex)
    }
  
    const onPanEnd = () => {
      const draggingIndex = isDragging.findIndex(v => v === true)
      const elem = elements[draggingIndex]
      if (draggingIndex === -1 || !elem) {
        return
      }
      isDragging.map(() => false)
      elem.style.transform = ''
      console.log(draggingIndex)
      updateList(draggingIndex)
      overIndex.set(-1)
    }
  
    const customPan = new ZingTouch.Pan({ onStart: onPanStart, onMove: onPanMove, onEnd: onPanEnd })
    region.bind(container, customPan, () => {})
  }

  const setupElements = (ele: HTMLElement, index: number) => {
    elements[index] = ele
  }
  const updateList = (draggingIndex: number) => {
    const prev: TabletSetting = get(setting)
    console.log(prev)
    const tmp = prev.controlTemplates[draggingIndex]
    prev.controlTemplates[draggingIndex] = prev.controlTemplates[get(overIndex)]
    prev.controlTemplates[get(overIndex)] = tmp
    setting.set(prev)
    console.log(get(setting))
  }
  return { init, setupElements }
};

export const setTouch = (ele: HTMLElement, callback: () => Promise<void>) => {
  const region: Region = new ZingTouch.Region(ele, false, true)
  region.bind(ele, 'tap', callback)
}

const getChange = (center: { x: number, y: number }, input: ZingInput) => {
  return {
    x: Math.abs(input.current.x - center.x) - Math.abs(input.previous.x - center.x),
    y: Math.abs(input.current.y - center.y) - Math.abs(input.previous.y - center.y)
  }
}

const getNumRect = (rect: Rect) => {
  return {
    x: conversionPX(rect.start.x, window?.innerWidth),
    y: conversionPX(rect.start.y, window?.innerHeight),
    width: conversionPX(rect.width, window?.innerWidth),
    height: conversionPX(rect.height, window?.innerHeight)
  }
}

const getRect = (numRect: NumRect): Rect => {
  return {
    start: {
      x: `${numRect.x}px`,
      y: `${numRect.y}px`
    },
    width: `${numRect.width}px`,
    height: `${numRect.height}px`
  }
}

const conversionPX = (str: string, base?: number) => {
  if (str.endsWith('px')) {
    return Number(str.replace('px', ''))
  }
  if (str.endsWith('%')) {
    if (!base) return 500
    return base * Number(str.replace('%', '')) / 100
  }
  return 0
}

export default useLayout
