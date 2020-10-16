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
const MAX_RECORD_MINUTES = 2
const MAX_CHUNK_LENGTH = MAX_RECORD_MINUTES * 60 * 1000 / CHUNK_BEHINDE

export const playVideo = async (element : HTMLMediaElement, stream: MediaStream) => {
  if (element.srcObject) {
    return
  }
  element.srcObject = stream;
  try {
    element.onloadeddata = async (e) => {
      await element.play()
      startRecord(stream)
    }
  } catch(error) {
    console.error('error auto play:' + error);
  }
}

const startRecord = (stream: MediaStream) => {
  const prevRecorder: MediaRecorder | null = get(store.recorder)
  if (prevRecorder && prevRecorder.state === 'recording') {
    prevRecorder.stop()
  }
  const option = {
    mimeType: 'video/webm;codecs=h264'
  }
  try {
    const recorder = new MediaRecorder(stream, option)
    store.recorder.set(recorder)
    recorder.ondataavailable = (e) => {
      store.chunks.update(v => {
        v.push(e.data)
        if (v.length > MAX_CHUNK_LENGTH) {
          v.shift()
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

export const getRecordData = async () => {
  try {
    const chunks: Blob[] = get(store.chunks)
    console.log(`${chunks.length}秒`)
    const allChunks = new Blob(chunks)
    console.log(allChunks)
    const arrbuf = await allChunks.arrayBuffer()
    return arrbuf
  } catch (e) {
    console.error(e)
  }
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
