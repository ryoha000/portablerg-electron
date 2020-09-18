const { desktopCapturer } = require('electron')

if (window.navigator.mediaDevices) {
  window.navigator.mediaDevices.getDesktopSources = () => {
    return new Promise(async (resolve, reject) => {
      try {
        const sources = await desktopCapturer.getSources({ types: ['screen', 'window'] })
        resolve(sources)
      } catch (e) {
        reject(err)
      }
    })
  }
}
