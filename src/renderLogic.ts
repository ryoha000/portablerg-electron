const { ipcRenderer } = window.require('electron');

export const openDialog = async () =>{
  await ipcRenderer.invoke('openDialog')
}

export const decideWindow = async (id: string, name: string) =>{
  await ipcRenderer.invoke('decideWindow', id, name)
}

export const listenID = (callback: (id: string, name: string) => void) => {
  ipcRenderer.on('id', (e: unknown, id: string, name: string) => {
    console.log('id: ', id, 'name: ', name)
    callback(id, name)
  })
}
