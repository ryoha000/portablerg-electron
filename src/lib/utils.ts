import { get } from "svelte/store"
import { store } from "../store"

export const sendWSMessageWithID = (
  id: string,
  obj: Object,
  ws: WebSocket
) => {
  try {
    ws.send(JSON.stringify({ ...obj, id: id }))
  } catch (e) {
    console.error(e)
    ws.onopen = () => {
      ws.send(JSON.stringify({ ...obj, id: id }))
      console.log('送れた', JSON.stringify({ ...obj, id: id }))
    }
  }
}

const CHUNK_BEHINDE = 1000
const MAX_RECORD_MINUTES = 3
const MAX_CHUNK_LENGTH = MAX_RECORD_MINUTES * 60 * 1000 / CHUNK_BEHINDE

export const playVideo = async (element : HTMLMediaElement, stream: MediaStream) => {
  if (element.srcObject) {
    return
  }
  element.srcObject = stream;
  try {
    element.onloadeddata = async (e) => {
      await element.play();
      (get(store.recorders) as MediaRecorder[]).forEach(rec => rec.stop());
      store.recorders.update(v => {
        v.forEach(rec => {
          if (rec.state === 'recording') {
            rec.stop()
          } else {
            setTimeout(() => {
              rec.ondataavailable = () => rec.stop()
            }, 500);
          }
        })
        return v
      });
      store.chunks.update(() => [[], [], []])
      const option = {
        mimeType: 'video/webm;codecs=h264,opus'
      }
      for (let i = 0; i < BUFFER_NUM; i++) {
        const recorder = new MediaRecorder(stream, option)
        store.recorders.update(v => {
          v[i] = recorder
          return v
        })
      }
      for (let i = 0; i < BUFFER_NUM; i++) {
        setTimeout(() => {
          startRecord(i)
        }, MAX_RECORD_MINUTES * 60 * 1000 / BUFFER_NUM);
      }
    }
  } catch(error) {
    console.error('error auto play:' + error);
  }
}

const BUFFER_NUM = 3

const startRecord = (index: number) => {
  try {
    const recorder = get(store.recorders)[index]
    try {
      recorder.stop()
    } catch (e) { console.error(e) }
    store.chunks.update(v => {
      v[index] = []
      return v
    })
    recorder.ondataavailable = (e) => {
      store.chunks.update(v => {
        v[index].push(e.data)
        if (v[index].length === MAX_CHUNK_LENGTH / BUFFER_NUM) {
          startRecord(getNextIndex(index))
        }
        if (v[index].length === MAX_CHUNK_LENGTH) {
          recorder.stop()
        }
        return v
      })
    }
    recorder.onerror = (e) => { console.error(e) }
    recorder.start(CHUNK_BEHINDE)
    console.log('start recording')
  } catch (e) {
    console.error(e)
  }
}

const getNextIndex = (nowIndex: number) => {
  if (nowIndex === BUFFER_NUM - 1) {
    return 0
  }
  return nowIndex + 1
}

// TODO
export const getRecordData = async () => {
  try {
    const chunks: Blob[] = getBiggerChunks()
    console.log(`${chunks.length}秒`)
    const allChunks = new Blob(chunks)
    const arrbuf = await allChunks.arrayBuffer()
    return arrbuf
  } catch (e) {
    console.error(e)
  }
}

const getBiggerChunks = () => {
  let res: Blob[] = []
  for (const chunks of get(store.chunks) as Blob[][]) {
    if (res.length < chunks.length) {
      res = chunks
    }
  }
  return res
}

export const segmentation = (arrayBuffer: ArrayBuffer, segmentSize: number) => {
  const segments= [];
  let fi = 0;
  while(fi*segmentSize < arrayBuffer.byteLength){
    segments.push(arrayBuffer.slice(fi * segmentSize, (fi + 1) * segmentSize));
    ++fi;
  }
  return segments;
}

export const sleep = (msec: number) => new Promise(resolve => setTimeout(resolve, msec));
