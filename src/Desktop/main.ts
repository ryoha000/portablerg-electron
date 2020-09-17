// import { desktopCapturer } from 'electron'
// const { ipcRenderer } = window.require('electron');
// import { remote } from 'electron'

// const desktopCapture = remote.desktopCapturer
// const ipcRenderer = remote.ipcRenderer
export const capture = async (video: HTMLMediaElement) => {
  const handleStream = (stream: MediaStream) => {
    video.srcObject = stream
  }
  // const a = await ipcRenderer.invoke('test', 'popipa')
  // console.log(a)
  // console.log('po')
  try {
    const devices = await navigator.mediaDevices.enumerateDevices()
    console.log(devices)
  }
  catch (e) {
    console.error('enumerateDevicesErr: ', e)
  }
  try {
    const mediaStream = await navigator.mediaDevices.getDisplayMedia({
      audio: true,
      video: true
    })
    handleStream(mediaStream)
  } catch (e) {
    console.error('getUserMediaErr: ', e)
  }
  // const srcs = await desktopCapturer.getSources({ types: ['screen'] })
  // for (let i = 0; i < srcs.length; ++i) {
  //   if (srcs[i].name === 'Electron') {
  //     return
  //   }
  // }
}
