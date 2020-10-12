import type { Setting, URI } from './@types/Original'

let ipc: any
try {
  const { ipcRenderer } = window.require('electron');
  ipc = ipcRenderer
} catch (e) {
}

export const openDialog = async (sources: { id: string, name: string, url: string }[]) =>{
  await ipc?.invoke('openDialog', sources)
}

export const decideWindow = async (id: string, name: string) =>{
  await ipc?.invoke('decideWindow', id, name)
}

export const listenID = (callback: (id: string, name: string) => Promise<void>) => {
  ipc?.on('id', async (e: unknown, id: string, name: string) => {
    console.log('id: ', id, 'name: ', name)
    await callback(id, name)
  })
}

export const getSources = (callback: (sources: { id: string, name: string, url: string }[]) => void) => {
  ipc?.on('sources', (e: unknown, sources: { id: string, name: string, url: string }[]) => {
    console.log('sources: ', sources)
    callback(sources)
  })
}

export const getWindowRect = async (): Promise<{ top: number, left: number, buttom: number, right: number }> => {
  const rect = await ipc?.invoke('getWindowRect')
  console.log(rect)
  return rect
}

export const copy = (text: string) => {
  const { clipboard } = require('electron').remote
  clipboard.writeText(text)
}

interface Point {
  x: number
  y: number
}

export const mouseInit = async () => {
  await ipc?.invoke("init");
};

export const mouseDispose = async () => {
  await ipc?.invoke("dispose");
};

export const mouseMove = async (dPoint: Point) => {
  await ipc?.invoke("move", dPoint);
};

export const mouseScroll = async (dPoint: Point) => {
  await ipc?.invoke("scroll", dPoint);
};

export const mouseDragStart = async () => {
  await ipc?.invoke('dragStart')
}

export const mouseDragEnd = async () => {
  await ipc?.invoke('dragEnd')
}

export const mouseDragging = async (dPoint: Point) => {
  await ipc?.invoke('dragging', dPoint)
}

export const mouseClick = async () => {
  console.log('click from renderLogic')
  await ipc?.invoke('click')
}

export const mouseMoveDragStart = async (point: Point) => {
  await ipc?.invoke('moveDragStart', point)
}

export const mouseMoveDragging = async (point: Point) => {
  await ipc?.invoke('moveDragging', point)
}

export const mouseMoveClick = async (point: Point) => {
  console.log('moveClick from renderLogic: ', point)
  await ipc?.invoke('moveClick', point)
}

export const keyTap = async (type: 'enter' | 'up' | 'down' | 'control') => {
  await ipc?.invoke('keyTap', type)
}

export const keyDown = async (type: 'enter' | 'up' | 'down' | 'control') => {
  await ipc?.invoke('keyDown', type)
}

export const keyUp = async (type: 'enter' | 'up' | 'down' | 'control') => {
  await ipc?.invoke('keyUp', type)
}

export const login = async () => {
  const url: string = await ipc?.invoke('login')
  return url.slice(1)
}
