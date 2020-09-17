const { desktopCapturer } = require('electron')
window.navigator.mediaDevices.getDisplayMedia = () => {
  return new Promise(async (resolve, reject) => {
    try {
      const sources = await desktopCapturer.getSources({ types: ['screen', 'window'] })

      const selectionElem = document.createElement('div')
      selectionElem.classList = 'desktop-capturer-selection'
      selectionElem.innerHTML = `
        <div class="desktop-capturer-selection__scroller">
          <ul class="desktop-capturer-selection__list">
            ${sources.map(({id, name, thumbnail, display_id, appIcon}) => `
              <li class="desktop-capturer-selection__item">
                <button class="desktop-capturer-selection__btn" data-id="${id}" title="${name}">
                  <img class="desktop-capturer-selection__thumbnail" src="${thumbnail.toDataURL()}" />
                  <span class="desktop-capturer-selection__name">${name}</span>
                </button>
              </li>
            `).join('')}
          </ul>
        </div>
      `
      document.body.appendChild(selectionElem)

      document.querySelectorAll('.desktop-capturer-selection__btn')
        .forEach(button => {
          button.addEventListener('click', async () => {
            try {
              const id = button.getAttribute('data-id')
              const source = sources.find(source => source.id === id)
              if(!source) {
                throw new Error(`Source with id ${id} does not exist`)
              }
              
              const stream = await window.navigator.mediaDevices.getUserMedia({
                audio: {
                  mandatory: {
                    chromeMediaSource: 'desktop'
                  }
                },
                video: {
                  mandatory: {
                    chromeMediaSource: 'desktop',
                    chromeMediaSourceId: source.id
                  }
                }
              })
              resolve(stream)

              selectionElem.remove()
            } catch (err) {
              console.error('Error selecting desktop capture source:', err)
              reject(err)
            }
          })
        })
    } catch (err) {
      console.error('Error displaying desktop capture sources:', err)
      reject(err)
    }
  })
}
