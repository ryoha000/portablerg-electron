import ZingTouch from '../../lib/ZingTouch/ZingTouch'
import { setting, TabletSetting, Rect } from './useSetting'
import { get } from 'svelte/store'
import { getNumRect } from '../../lib/coordinary';

const useLayout = (ele: HTMLElement, type: 'window' | 'controls' | number) => {
  let rect = { x: 0, y: 0, width: 0, height: 0 }
  const base: TabletSetting = get(setting)
  if (type === 'window') {
    rect = getNumRect(base.window.rect)
  }
  if (type === 'controls') {
    rect = getNumRect(base.controlRect)
  }
  let distanceCenter = { x: 0, y: 0 }
  console.log(rect)

  const region: Region = new ZingTouch.Region(document.body, true, true);
  region.bind(ele, 'pan', (e: PanEvent) => {
    if (e.detail.data.length === 0) {
      return
    }
    console.log('move')
    const data = e.detail.data[0]

    rect.x += data.change.x
    rect.y += data.change.y
    const prev: TabletSetting = get(setting)
    if (type === 'window') {
      prev.window.rect.start.x = `${rect.x}px`
      prev.window.rect.start.y = `${rect.y}px`
    }
    if (type === 'controls') {
      prev.controlRect.start.x = `${rect.x}px`
      prev.controlRect.start.y = `${rect.y}px`
    }
    setting.set(prev)
  })

  const onDistanceStart = (inputs: ZingInput[], state: any, element: HTMLElement) => {
    console.log('distance move')
    if (inputs.length < 2) {
      return
    }
    distanceCenter = {
      x: (inputs[0].current.x + inputs[1].current.x) / 2,
      y: (inputs[0].current.y + inputs[1].current.y) / 2,
    }
  }
  const onDistanceMove = (inputs: ZingInput[], state: any, element: HTMLElement, movement: DistanceData) => {
    console.log('distance move')
    if (!movement || inputs.length < 2) {
      return
    }
    const change1 = getChange(distanceCenter, inputs[0])
    const change2 = getChange(distanceCenter, inputs[1])
    if (inputs[0].current.x < inputs[1].current.x) {
      rect.x -= change1.x
      rect.y -= change1.y
      rect.width += change1.x + change2.x
      rect.height += change1.y + change2.y
    } else {
      rect.x -= change2.x
      rect.y -= change2.y
      rect.width += change1.x + change2.x
      rect.height += change1.y + change2.y
    }
    // // ele.style.transform = ele.style.transform.replace(getScale(), '')
    console.log(change1, change2)
    // ele.style.transform += getScale()
    const prev: TabletSetting = get(setting)
    if (type === 'window') {
      prev.window.rect.start.x = `${rect.x}px`
      prev.window.rect.start.y = `${rect.y}px`
      prev.window.rect.width = `${rect.width}px`
      prev.window.rect.height = `${rect.height}px`
    }
    if (type === 'controls') {
      prev.controlRect.start.x = `${rect.x}px`
      prev.controlRect.start.y = `${rect.y}px`
      prev.controlRect.width = `${rect.width}px`
      prev.controlRect.height = `${rect.height}px`
    }
    setting.set(prev)
  }
  const customDistance: Distance = new ZingTouch.Distance({ onStart: onDistanceStart, onMove: onDistanceMove })
  region.bind(ele, customDistance, () => {})
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

export default useLayout
