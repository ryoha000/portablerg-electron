import type { Setting } from '../@types/Original'

let isOffer = false;

const useWebRTC = (
  remoteVideo: HTMLMediaElement | undefined
) => {
  let negotiationneededCounter = 0;
  let localStream: null | MediaStream = null;
  let remoteStream: null | MediaStream = null;
  let peerConnection: null | RTCPeerConnection = null;
  let ws: WebSocket | null = null
  const setupWS = (setting: Setting) => {
    const wsUrl = `ws://${setting.privateIP}:${setting.browserPort + 1}/`;
    ws = new WebSocket(wsUrl);
    ws.onopen = (evt) => {
      console.log('ws open()');
    };
    ws.onerror = (err) => {
      console.error('ws onerror() ERR:', err);
    };
    ws.onmessage = (evt) => {
      console.log('ws onmessage() data:', evt.data);
      const message = JSON.parse(evt.data);
      switch(message.type){
        case 'offer': {
          console.log('Received offer ...');
          // textToReceiveSdp.value = message.sdp;
          setOffer(message);
          break;
        }
        case 'answer': {
          console.log('Received answer ...');
          // textToReceiveSdp.value = message.sdp;
          setAnswer(message);
          break;
        }
        case 'candidate': {
          console.log('Received ICE candidate ...');
          const candidate = new RTCIceCandidate(message.ice);
          console.log(candidate);
          addIceCandidate(candidate);
          break;
        }
        case 'close': {
          console.log('peer is closed ...');
          hangUp();
          break;
        }      
        default: { 
          console.log("Invalid message"); 
          break;              
        }         
      }
    };
  }
  // ICE candaidate受信時にセットする
  function addIceCandidate(candidate: RTCIceCandidate | RTCIceCandidateInit) {
    if (peerConnection) {
      peerConnection.addIceCandidate(candidate);
    }
    else {
      console.error('PeerConnection not exist!');
      return;
    }
  }

  // ICE candidate生成時に送信する
  function sendIceCandidate(candidate: RTCIceCandidate | RTCIceCandidateInit) {
    console.log('---sending ICE candidate ---');
    const message = JSON.stringify({ type: 'candidate', ice: candidate });
    console.log('sending candidate=' + message);
    if (!ws) {
      console.error('ws is null !!!!!')
      return
    }
    ws.send(message);
  }
  // getUserMediaでカメラ、マイクにアクセス
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
    localStream = stream
    console.log('setted localStream: ', localStream)
    await playVideo(localVideo, stream)
  }
  // Videoの再生を開始する
  async function playVideo(element: HTMLMediaElement, stream: MediaStream) {
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

    // リモートのMediStreamTrackを受信した時
    peer.ontrack = evt => {
      console.log('-- peer.ontrack()');
      if (evt.streams.length > 0 && remoteVideo) {
        remoteStream = evt.streams[0]
        playVideo(remoteVideo, evt.streams[0]);
      } else {
        console.error('ERR stream length === 0 || remoteVideo === undefind')
      }
    };

    // ICE Candidateを収集したときのイベント
    peer.onicecandidate = evt => {
      if (evt.candidate) {
        console.log(evt.candidate);
        sendIceCandidate(evt.candidate);            
      } else {
        console.log('empty ice event');
      }
    };

    // Offer側でネゴシエーションが必要になったときの処理
    peer.onnegotiationneeded = async () => {
      try {
        if(isOffer){
          if(negotiationneededCounter === 0){
            let offer = await peer.createOffer();
            console.log('createOffer() succsess in promise');
            await peer.setLocalDescription(offer);
            console.log('setLocalDescription() succsess in promise');
            if (peer.localDescription) {
              sendSdp(peer.localDescription);
            } else {
              console.error('peer.localDescription is NULL !!!!')
            }
            negotiationneededCounter++;
          }
        }
      } catch(err){
        console.error('setLocalDescription(offer) ERROR: ', err);
      }
    }

    // ICEのステータスが変更になったときの処理
    peer.oniceconnectionstatechange = function() {
      console.log('ICE connection Status has changed to ' + peer.iceConnectionState);
      switch (peer.iceConnectionState) {
        case 'closed':
        case 'failed':
          if (peerConnection) {
            hangUp();
          }
          break;
        case 'disconnected':
          break;
      }
    };

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
  function sendSdp(sessionDescription: RTCSessionDescription) {
    console.log('---sending sdp ---');
    const message = JSON.stringify(sessionDescription);
    console.log('sending SDP=' + message);
    if (!ws) {
      console.error('ws is null !!!!!')
      return
    }
    ws.send(message);     
  }
  // Connectボタンが押されたらWebRTCのOffer処理を開始
  function connect() {
    if (!peerConnection) {
      console.log('make Offer');
      peerConnection = prepareNewConnection(true);
    }
    else {
      console.warn('peer already exist.');
    }
  }
  // Answer SDPを生成する
  async function makeAnswer() {
    console.log('sending Answer. Creating remote session description...' );
    if (!peerConnection) {
      console.error('peerConnection NOT exist!');
      return;
    }
    try{
      let answer = await peerConnection.createAnswer();
      console.log('createAnswer() succsess in promise');
      await peerConnection.setLocalDescription(answer);
      console.log('setLocalDescription() succsess in promise');
      if (peerConnection.localDescription) {
        sendSdp(peerConnection.localDescription);
      } else {
        console.error('peerConnection.localDescription is NULL !!!!')
      }
    } catch(err){
      console.error(err);
    }
  }

  // Offer側のSDPをセットする処理
  async function setOffer(sessionDescription: RTCSessionDescription) {
    if (peerConnection) {
      console.error('peerConnection alreay exist!');
    }
    peerConnection = prepareNewConnection(false);
    try{
      await peerConnection.setRemoteDescription(sessionDescription);
      console.log('setRemoteDescription(answer) succsess in promise');
      makeAnswer();
    } catch(err){
      console.error('setRemoteDescription(offer) ERROR: ', err);
    }
  }

  // Answer側のSDPをセットする場合
  async function setAnswer(sessionDescription: RTCSessionDescription) {
    if (! peerConnection) {
      console.error('peerConnection NOT exist!');
      return;
    }
    try{
      await peerConnection.setRemoteDescription(sessionDescription);
      console.log('setRemoteDescription(answer) succsess in promise');
    } catch(err){
      console.error('setRemoteDescription(answer) ERROR: ', err);
    }
  }
  
  // P2P通信を切断する
  function hangUp(){
    if (peerConnection) {
      if(peerConnection.iceConnectionState !== 'closed'){
        peerConnection.close();
        peerConnection = null;
        negotiationneededCounter = 0;
        const message = JSON.stringify({ type: 'close' });
        console.log('sending close message');
        if (!ws) {
          console.error('ws is null !!!!!')
          return
        }
        ws.send(message);
        if (remoteVideo) {
          cleanupVideoElement(remoteVideo);
        }
        return;
      }
    }
    console.log('peerConnection is closed.');
  }
  
  // ビデオエレメントを初期化する
  function cleanupVideoElement(element: HTMLMediaElement) {
    element.pause();
    element.srcObject = null;
  }

  const playRemote = () => {
    if (remoteVideo && remoteStream) {
      playVideo(remoteVideo, remoteStream)
    }
  }
  return {
    setStreamByID,
    setupWS,
    connect,
    hangUp,
    playRemote
  }
}

export default useWebRTC
