import { get } from 'svelte/store';
import { mouseMove, mouseScroll, mouseClick, mouseDragStart, mouseDragEnd, mouseDragging, keyDown, keyUp, getWindowRect, mouseMoveClick, mouseMoveDragStart, mouseMoveDragging } from '../renderLogic'
import { store } from '../store';
import { sendWSMessageWithID } from './utils';

const useWebRTC = () => {
  let id: string = ""
  store.me.subscribe(v => id = v)
  let isSetAnswer = false
  store.isSetAnswer.subscribe(v => isSetAnswer = v)

  const setupWS = () => {
    const wsUrl = `wss://ryoha.trap.show/portablerg-server/`;
    const ws = new WebSocket(wsUrl);
    store.ws.set(ws)
    ws.onopen = (evt) => {
    };
    ws.onclose = () => {
      setupWS()
    }
    ws.onerror = (err) => {
      console.error('ws onerror() ERR:', err);
    };
    ws.onmessage = async (evt) => {
      const message = JSON.parse(evt.data);
      switch (message.type) {
        case 'answer': {
          if (!isSetAnswer) {
            console.log('get answer')
            setAnswer(message);
            store.isSetAnswer.set(true)
          } else {
            console.warn('get another answer')
            hangUp()
            setTimeout(() => {
              connect()
            }, 500)
          }
          break;
        }
        case 'candidate': {
          const candidate = new RTCIceCandidate(message.ice);
          addIceCandidate(candidate);
          break;
        }
        case 'close': {
          hangUp();
          break;
        }
        case 'scroll': {
          mouseScroll(message.dPoint)
          break
        }
        case 'move': {
          mouseMove(message.dPoint)
          break
        }
        case 'click': {
          mouseClick()
          break
        }
        case 'dragStart': {
          mouseDragStart()
          break
        }
        case 'dragEnd': {
          mouseDragEnd()
          break
        }
        case 'dragging': {
          mouseDragging(message.dPoint)
          break
        }
        case 'down': {
          keyDown(message.key)
          break
        }
        case 'up': {
          keyUp(message.key)
          break
        }
        case 'tabletMode': {
          const rect = await getWindowRect()
          sendWSMessageWithID(id, { type: 'windowRect', rect: rect }, ws)
          break
        }
        case 'moveTap': {
          const point = message.point
          mouseMoveClick(point)
          break
        }
        case 'moveDragStart': {
          const point = message.point
          mouseMoveDragStart(point)
          break
        }
        case 'moveDragging': {
          const point = message.point
          mouseMoveDragging(point)
          break
        }
        case 'error': {
          console.error(message.data)
          break
        }
        default: { 
          console.log("Invalid message"); 
          break;              
        }         
      }
    };
    return ws
  }

  // ICE candaidate受信時にセットする
  function addIceCandidate(candidate: RTCIceCandidate) {
    const peerConnection: RTCPeerConnection | null = get(store.peerConnection)
    if (peerConnection) {
      peerConnection.addIceCandidate(candidate);
    }
    else {
      console.warn('PeerConnection not exist!');
      return;
    }
  }

  // ICE candidate生成時に送信する
  function sendIceCandidate(candidate: RTCIceCandidate) {
    const message = JSON.stringify({ type: 'candidate', ice: candidate });
    const ws: WebSocket | null = get(store.ws)
    if (!ws) {
      console.error('ws is NULL !!!')
      return
    }
    sendWSMessageWithID(id, { type: 'candidate', ice: candidate }, ws)
  }

  const setStreamByID = async (id: string, localVideo: HTMLMediaElement) => {
    const stream = await window.navigator.mediaDevices.getUserMedia({
      audio: {
        mandatory: {
          chromeMediaSource: 'desktop'
        }
      },
      video: {
        mandatory: {
          chromeMediaSource: 'desktop',
          chromeMediaSourceId: id
        }
      }
    })
    store.localStream.set(stream)
    localVideo.srcObject = null
    playVideo(localVideo, stream)
  }

  // Videoの再生を開始する
  async function playVideo(element : HTMLMediaElement, stream: MediaStream) {
    if (element.srcObject) {
      return
    }
    element.srcObject = stream;
    try {
      await element.play();
    } catch(error) {
      console.error('error auto play:' + error);
    }
  }

  // WebRTCを利用する準備をする
  function prepareNewConnection(isOffer: boolean) {
    const pc_config = {"iceServers":[ {"urls":"stun:stun.webrtc.ecl.ntt.com:3478"} ]};
    const peer = new RTCPeerConnection(pc_config);

    const dataChannel = peer.createDataChannel('mouseMove')
    dataChannel.onmessage = async (event) => {
      const message = JSON.parse(event.data);
      switch (message.type) {
        case 'scroll': {
          mouseScroll(message.dPoint)
          break
        }
        case 'move': {
          mouseMove(message.dPoint)
          break
        }
        case 'click': {
          mouseClick()
          break
        }
        case 'dragStart': {
          mouseDragStart()
          break
        }
        case 'dragEnd': {
          mouseDragEnd()
          break
        }
        case 'dragging': {
          mouseDragging(message.dPoint)
          break
        }
        case 'down': {
          keyDown(message.key)
          break
        }
        case 'up': {
          keyUp(message.key)
          break
        }
        case 'tabletMode': {
          const rect = await getWindowRect()
          const dc: RTCDataChannel | null = get(store.dataChannel)
          if (dc) {
            dc.send(JSON.stringify({ type: 'windowRect', rect: rect }))
          }
          break
        }
        case 'moveTap': {
          const point = message.point
          mouseMoveClick(point)
          break
        }
        case 'moveDragStart': {
          const point = message.point
          mouseMoveDragStart(point)
          break
        }
        case 'moveDragging': {
          const point = message.point
          mouseMoveDragging(point)
          break
        }
        case 'error': {
          console.error(message.data)
          break
        }
        default: { 
          console.log("Invalid message"); 
          break;              
        }         
      }
    };

    dataChannel.onerror = (e) => { console.error(e) }
    store.dataChannel.set(dataChannel)

    // ICE Candidateを収集したときのイベント
    peer.onicecandidate = evt => {
      if (evt.candidate) {
        sendIceCandidate(evt.candidate);            
      } else {
        console.log('empty ice event');
        // sendSdp(peer.localDescription);
      }
    };

    // Offer側でネゴシエーションが必要になったときの処理
    peer.onnegotiationneeded = async () => {
      try {
        if(isOffer){
          const negotiationneededCounter = get(store.negotiationneededCounter)
          if(negotiationneededCounter === 0){
            const offer = await peer.createOffer();
            await peer.setLocalDescription(offer);
            sendSdp(peer.localDescription);
            store.negotiationneededCounter.update(v => v + 1)
          }
        }
      } catch(err){
        console.error('setLocalDescription(offer) ERROR: ', err);
      }
    }

    // ICEのステータスが変更になったときの処理
    peer.oniceconnectionstatechange = function() {
      switch (peer.iceConnectionState) {
        case 'closed':
        case 'failed':
          const peerConnection: RTCPeerConnection | null = get(store.peerConnection)
          if (peerConnection) {
            hangUp();
          }
          break;
        case 'disconnected':
          break;
      }
    };

    const localStream: MediaStream | null = get(store.localStream)
    // ローカルのMediaStreamを利用できるようにする
    if (localStream) {
      console.log('Adding local stream...');
      localStream.getTracks().forEach(track => peer.addTrack(track, (localStream as MediaStream)));
    } else {
      console.warn('no local stream, but continue.');
    }

    return peer;
  }

  // 手動シグナリングのための処理を追加する
  function sendSdp(sessionDescription: RTCSessionDescription | null) {
    if (!sessionDescription) {
      console.error('sessionDescription is NULL')
      return
    }
    const m = { type: sessionDescription.type, sdp: sessionDescription.sdp }
    const ws: WebSocket | null = get(store.ws)
    if (!ws) {
      console.error('ws is NULL !!!')
      return
    }
    sendWSMessageWithID(id, m, ws)
    return
  }

  // Connectボタンが押されたらWebRTCのOffer処理を開始
  function connect() {
    const peerConnection: RTCPeerConnection | null = get(store.peerConnection)
    if (peerConnection) {
      hangUp()
      console.warn('peer already exist.');
    }
    store.peerConnection.set(prepareNewConnection(true))
  }

  // Answer側のSDPをセットする場合
  async function setAnswer(sessionDescription: RTCSessionDescription) {
    const peerConnection: RTCPeerConnection | null = get(store.peerConnection)
    if (!peerConnection) {
      console.error('peerConnection NOT exist!');
      return;
    }
    try {
      await peerConnection.setRemoteDescription(sessionDescription);
    } catch(err){
      console.error('setRemoteDescription(answer) ERROR: ', err);
    }
  }

  // P2P通信を切断する
  function hangUp() {
    const peerConnection: RTCPeerConnection | null = get(store.peerConnection)
    if (peerConnection) {
      if(peerConnection.iceConnectionState !== 'closed'){
        peerConnection.close();
        store.peerConnection.set(null)
        store.negotiationneededCounter.set(0)
        store.remoteVideoStream.set(null)
        store.isSetAnswer.set(false)

        const ws: WebSocket | null = get(store.ws)
        if (!ws) {
          console.error('ws is NULL !!!')
          return
        }
        sendWSMessageWithID(id, { type: 'close' }, ws)
        return;
      }
    }
    console.log('peerConnection is closed.');
  }

  function playRemoteVideo(remoteVideo: HTMLMediaElement) {
    const remoteVideoStream: MediaStream | null = get(store.remoteVideoStream)
    if (remoteVideoStream) {
      playVideo(remoteVideo, remoteVideoStream)
    } else {
      alert('not set remote video stream')
    }
  }

  return {
    setupWS,
    setStreamByID,
    hangUp,
    connect,
    playRemoteVideo,
    playVideo
  }
}

export default useWebRTC
