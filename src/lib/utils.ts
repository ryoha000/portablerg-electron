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

const CHUNK_BEHINDE = 50

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
    mimeType: 'video/webm;codecs=h264,opus'
  }
  try {
    const recorder = new MediaRecorder(stream, option)
    recorder.ondataavailable = async (e) => {
      const mc: RTCDataChannel | null = get(store.movieChannel)
      if (mc) {
        const arrayBuffer = await e.data.arrayBuffer()
        mc.send(arrayBuffer)
      }
    }
    recorder.onerror = (e) => { console.error(e) }
    recorder.start(CHUNK_BEHINDE)
    console.log('start recording')
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
