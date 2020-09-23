import { writable, get, derived } from 'svelte/store';

interface TabletSetting {
  window: {
    rect: Rect
  }
  controlRect: Rect
  controlTemplates: ControlTemplate[]
}

type RGBA = [number, number, number, number]

interface ControlTemplate {
  id: number
  controls: Control[]
}

interface Control {
  rect: Rect
  color: RGBA
  zIndex: number
  type: ControlType
}

export enum ControlType {
  Panel,
  Scroller,
  Enter,
  Up,
  Down
}

interface Rect {
  width: string
  height: string
  start: Point
}

interface Point {
  x: string
  y: string
}

export interface ControlStyle {
  id: number
  controls: {
    type: ControlType
    style: string
  }[]
}

const setting = writable<TabletSetting | null>(null)

export const windowStyle = derived(setting, ($setting) => {
  if (!$setting) {
    return ''
  }
  return `position: absolute; ${getStyleFromRect($setting.window.rect)}`
})

export const controlsStyle = derived(setting, ($setting) => {
  if (!$setting) {
    return ''
  }
  return `position: absolute; ${getStyleFromRect($setting.controlRect)}`
})

export const controlStyles = derived(setting, ($setting) => {
  if (!$setting) {
    return []
  }
  const res: ControlStyle[] = []
  for (const template of $setting.controlTemplates) {
    const controlStyle: ControlStyle = { id: template.id, controls: [] }
    for (const control of template.controls) {
      controlStyle.controls.push({
        type: control.type,
        style: getStyleFromControl(control)
      })
    }
    res.push(controlStyle)
  }
  return res
})

const getStyleFromRect = (rect: Rect) => {
  return `
    width: ${rect.width}; height: ${rect.height}; left: ${rect.start.x}; top: ${rect.start.y};
  `
}

const getRGBA = (rgba: RGBA) => {
  return `rgba(${rgba.join(',')})`
}

const getStyleFromControl = (control: Control) => {
  return `position: absolute; ${getStyleFromRect(control.rect)} z-index: ${control.zIndex}; background-color: ${getRGBA(control.color)};`
}

const path = '/public/clientSetting.json'

const useSetting = () => {
  const init = async () => {
    const res = await fetch(path, {
      headers: { 'Content-Type': 'application/json' },
      method: 'GET'
    })
    const s = await res.json()
    setting.set(s)
    console.log('setting: ', s)
  }
  const update = async (newSetting: TabletSetting) => {
    const res = await fetch(path, {
      headers: { 'Content-Type': 'application/json' },
      method: 'POST',
      body: JSON.stringify(newSetting)
    })
    console.log(res)
  }
  return {
    init,
    update
  }
}

export default useSetting
