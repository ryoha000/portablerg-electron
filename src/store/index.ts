import { writable } from 'svelte/store'

export const store = {
  localStream: writable<null | MediaStream>(null),
  remoteVideoElement: writable<null | HTMLMediaElement>(null),
  peerConnection: writable<null | RTCPeerConnection>(null),
  negotiationneededCounter: writable(0),
  remoteVideoStream: writable<null | MediaStream>(null),
  ws: writable<WebSocket | null>(null),
  isSetAnswer: writable(false),
  dataChannel: writable<RTCDataChannel | null>(null),
  movieChannel: writable<RTCDataChannel | null>(null),

  candidates: writable<{ id: string, name: string, url: string }[]>([]),

  chunks: writable<Blob[]>([]),
  recorder: writable<MediaRecorder | null>(null),
  me: writable("originala")
}
