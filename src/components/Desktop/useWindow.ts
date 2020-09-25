// import type Electron from 'electron'

// export const setupDialog = () => {
//   var ipcRenderer = require('electron').ipcRenderer;
//   ipcRenderer.on('sources', (_: unknown, sources: Electron.DesktopCapturerSource[]) => {
//     return sources
//   })
// }

const useWindow = async () => {
  const sources = await window.navigator.mediaDevices.getDesktopSources()
  const res: { id: string, name: string, url: string }[] = []
  for (const s of sources) {
    res.push({
      id: s.id,
      name: s.name,
      url: s.thumbnail.toDataURL()
    })
  }
  return res
}

export default useWindow
