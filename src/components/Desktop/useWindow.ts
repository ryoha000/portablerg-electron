// import type Electron from 'electron'

// export const setupDialog = () => {
//   var ipcRenderer = require('electron').ipcRenderer;
//   ipcRenderer.on('sources', (_: unknown, sources: Electron.DesktopCapturerSource[]) => {
//     return sources
//   })
// }

const useWindow = async () => {
  const sources = await window.navigator.mediaDevices.getDesktopSources()
  return { sources }
}

export default useWindow
