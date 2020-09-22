import type { Setting, URI } from './@types/Original'

let ipc: any
try {
  const { ipcRenderer } = window.require('electron');
  ipc = ipcRenderer
} catch (e) {
}

export const openDialog = async () =>{
  await ipc?.invoke('openDialog')
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

export const getPrivateIP = async (): Promise<string> => {
  const ip = await ipc?.invoke('getPrivateIP')
  console.log(ip)
  return ip
}

export const changeURI = async (prevURI: URI, newURI: URI) => {
  await ipc?.invoke('removePrevFireWall', prevURI.addr, prevURI.port)
  await ipc?.invoke('addNewFireWall', newURI.addr, newURI.port)
}

export const getSetting = async (): Promise<Setting> => {
  const setting = await ipc?.invoke('getSetting')
  return setting
}

export const updateSetting = async (setting: Setting) => {
  await ipc?.invoke('updateSetting', setting)
  openMessageBox()
}

export const resetSetting = async () => {
  await ipc?.invoke('resetSetting')
  openMessageBox()
}

const openMessageBox = () => {
  const { dialog, getCurrentWindow } = require('electron').remote
  const win = getCurrentWindow();
  const options = {
    type: 'warning',
    title: '注意',
    message: 'IPやポートの設定を変更した際はアプリを再起動してください。',
  };
  dialog.showMessageBox(win, options);
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
  console.log('dPoint: ', dPoint)
  await ipc?.invoke("scroll", dPoint);
  // useMouse(dPoint)
};
