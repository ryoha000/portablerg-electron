import type { Setting } from '../@types/Original'

const useWebRTC = () => {
  let localStream: null | MediaStream = null;
  let peerConnection: null | RTCPeerConnection = null;
  let negotiationneededCounter = 0;
  let remoteVideoStream: null | MediaStream = null
  let ws: WebSocket | null = null
  let mouseMoveChannel: RTCDataChannel | null = null
  const setupWS = (setting: Setting) => {
    const wsUrl = `ws://${setting.privateIP}:${setting.browserPort + 1}/`;
    console.log(wsUrl)
    ws = new WebSocket(wsUrl);
    ws.onopen = (evt) => {
      console.log(' ws open()');
    };
    ws.onerror = (err) => {
      console.error(' ws onerror() ERR:', err);
    };
    ws.onmessage = (evt) => {
      console.log(' ws onmessage() data:', evt.data);
      const message = JSON.parse(evt.data);
      switch(message.type){
        case 'offer': {
          console.log('Received offer ...');
          console.log(message.sdp)
          setOffer(message);
          break;
        }
        case 'answer': {
          console.log('Received answer ...');
          console.log(message.sdp)
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
  function addIceCandidate(candidate: RTCIceCandidate) {
    if (peerConnection) {
      peerConnection.addIceCandidate(candidate);
    }
    else {
      console.error('PeerConnection not exist!');
      return;
    }
  }

  // ICE candidate生成時に送信する
  function sendIceCandidate(candidate: RTCIceCandidate) {
    console.log('---sending ICE candidate ---');
    const message = JSON.stringify({ type: 'candidate', ice: candidate });
    console.log('sending candidate=' + message);
    ws?.send(message);
  }

  // getUserMediaでカメラ、マイクにアクセス
  async function startVideo(localVideo: HTMLMediaElement) {
    try{
      localStream = await navigator.mediaDevices.getDisplayMedia({ video: true, audio: true })
      // localStream = await navigator.mediaDevices.getUserMedia({video: true, audio: false});
      if (localStream) {
        playVideo(localVideo, localStream);
      } else {
        console.error("localstream not found")
      }
    } catch(err){
      console.error('mediaDevice.getUserMedia() error:', err);
    }
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
    localStream = stream
    console.log('setted localStream: ', localStream)
    playVideo(localVideo, stream)
  }

  // Videoの再生を開始する
  async function playVideo(element : HTMLMediaElement, stream: MediaStream) {
    console.log(element.srcObject)
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
      console.log(evt.streams)
      remoteVideoStream = evt.streams[0]
      // playVideo(remoteVideo, evt.streams[0]);
    };

    // ICE Candidateを収集したときのイベント
    peer.onicecandidate = evt => {
      if (evt.candidate) {
        console.log(evt.candidate);
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
          if(negotiationneededCounter === 0){
            let offer = await peer.createOffer();
            console.log('createOffer() succsess in promise');
            await peer.setLocalDescription(offer);
            console.log('setLocalDescription() succsess in promise');
            sendSdp(peer.localDescription);
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
    mouseMoveChannel = peer.createDataChannel('mouseMove')
    mouseMoveChannel.onmessage = function (event) {
      console.log("データチャネルメッセージ取得:", event.data);
    };
    
    mouseMoveChannel.onopen = function () {
      // mouseMoveChannel?.send(new Blob([JSON.stringify({ x: 0, y: -10 })], { type: 'text/plain' }));
      mouseMoveChannel?.send(JSON.stringify({ x: 0, y: -10 }));
    };
    
    mouseMoveChannel.onclose = function () {
      console.log("データチャネルのクローズ");
    };

    console.log(localStream)
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
    console.log('---sending sdp ---');
    // textForSendSdp.value = sessionDescription?.sdp ?? '';
    /*---
      textForSendSdp.focus();
      textForSendSdp.select();
    ----*/
    const message = JSON.stringify(sessionDescription);
    console.log('sending SDP=' + message);
    ws?.send(message);     
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
    if (! peerConnection) {
      console.error('peerConnection NOT exist!');
      return;
    }
    try{
      let answer = await peerConnection.createAnswer();
      console.log('createAnswer() succsess in promise');
      await peerConnection.setLocalDescription(answer);
      console.log('setLocalDescription() succsess in promise');
      sendSdp(peerConnection.localDescription);
    } catch(err){
      console.error(err);
    }
  }

  // Receive remote SDPボタンが押されたらOffer側とAnswer側で処理を分岐
  function onSdpText(textToReceiveSdp: HTMLTextAreaElement) {
    const text = textToReceiveSdp.value;
    if (peerConnection) {
      console.log('Received answer text...');
      const answer = new RTCSessionDescription({
        type : 'answer',
        sdp : text,
      });
      setAnswer(answer);
    }
    else {
      console.log('Received offer text...');
      const offer = new RTCSessionDescription({
        type : 'offer',
        sdp : text,
      });
      setOffer(offer);
    }
    textToReceiveSdp.value ='';
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
        ws?.send(message);
        remoteVideoStream = null
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

  function playRemoteVideo(remoteVideo: HTMLMediaElement) {
    if (remoteVideoStream) {
      playVideo(remoteVideo, remoteVideoStream)
    } else {
      alert('not set remote video stream')
    }
  }

  function sendMouseMove(dPoint: { x: number, y: number }) {
    // mouseMoveChannel?.send(new Blob([ JSON.stringify(dPoint) ], { type: 'text/plain' }))
  }
  return {
    setupWS,
    setStreamByID,
    startVideo,
    hangUp,
    connect,
    playRemoteVideo,
    sendMouseMove
  }
}

export default useWebRTC
