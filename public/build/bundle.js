
(function(l, r) { if (l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (window.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.getElementsByTagName('head')[0].appendChild(r) })(window.document);
var app = (function () {
    'use strict';

    function noop() { }
    function add_location(element, file, line, column, char) {
        element.__svelte_meta = {
            loc: { file, line, column, char }
        };
    }
    function run(fn) {
        return fn();
    }
    function blank_object() {
        return Object.create(null);
    }
    function run_all(fns) {
        fns.forEach(run);
    }
    function is_function(thing) {
        return typeof thing === 'function';
    }
    function safe_not_equal(a, b) {
        return a != a ? b == b : a !== b || ((a && typeof a === 'object') || typeof a === 'function');
    }
    function is_empty(obj) {
        return Object.keys(obj).length === 0;
    }

    function append(target, node) {
        target.appendChild(node);
    }
    function insert(target, node, anchor) {
        target.insertBefore(node, anchor || null);
    }
    function detach(node) {
        node.parentNode.removeChild(node);
    }
    function element(name) {
        return document.createElement(name);
    }
    function text(data) {
        return document.createTextNode(data);
    }
    function space() {
        return text(' ');
    }
    function listen(node, event, handler, options) {
        node.addEventListener(event, handler, options);
        return () => node.removeEventListener(event, handler, options);
    }
    function attr(node, attribute, value) {
        if (value == null)
            node.removeAttribute(attribute);
        else if (node.getAttribute(attribute) !== value)
            node.setAttribute(attribute, value);
    }
    function children(element) {
        return Array.from(element.childNodes);
    }
    function set_style(node, key, value, important) {
        node.style.setProperty(key, value, important ? 'important' : '');
    }
    function custom_event(type, detail) {
        const e = document.createEvent('CustomEvent');
        e.initCustomEvent(type, false, false, detail);
        return e;
    }

    let current_component;
    function set_current_component(component) {
        current_component = component;
    }
    function get_current_component() {
        if (!current_component)
            throw new Error(`Function called outside component initialization`);
        return current_component;
    }
    function onMount(fn) {
        get_current_component().$$.on_mount.push(fn);
    }

    const dirty_components = [];
    const binding_callbacks = [];
    const render_callbacks = [];
    const flush_callbacks = [];
    const resolved_promise = Promise.resolve();
    let update_scheduled = false;
    function schedule_update() {
        if (!update_scheduled) {
            update_scheduled = true;
            resolved_promise.then(flush);
        }
    }
    function add_render_callback(fn) {
        render_callbacks.push(fn);
    }
    let flushing = false;
    const seen_callbacks = new Set();
    function flush() {
        if (flushing)
            return;
        flushing = true;
        do {
            // first, call beforeUpdate functions
            // and update components
            for (let i = 0; i < dirty_components.length; i += 1) {
                const component = dirty_components[i];
                set_current_component(component);
                update(component.$$);
            }
            set_current_component(null);
            dirty_components.length = 0;
            while (binding_callbacks.length)
                binding_callbacks.pop()();
            // then, once components are updated, call
            // afterUpdate functions. This may cause
            // subsequent updates...
            for (let i = 0; i < render_callbacks.length; i += 1) {
                const callback = render_callbacks[i];
                if (!seen_callbacks.has(callback)) {
                    // ...so guard against infinite loops
                    seen_callbacks.add(callback);
                    callback();
                }
            }
            render_callbacks.length = 0;
        } while (dirty_components.length);
        while (flush_callbacks.length) {
            flush_callbacks.pop()();
        }
        update_scheduled = false;
        flushing = false;
        seen_callbacks.clear();
    }
    function update($$) {
        if ($$.fragment !== null) {
            $$.update();
            run_all($$.before_update);
            const dirty = $$.dirty;
            $$.dirty = [-1];
            $$.fragment && $$.fragment.p($$.ctx, dirty);
            $$.after_update.forEach(add_render_callback);
        }
    }
    const outroing = new Set();
    function transition_in(block, local) {
        if (block && block.i) {
            outroing.delete(block);
            block.i(local);
        }
    }

    const globals = (typeof window !== 'undefined'
        ? window
        : typeof globalThis !== 'undefined'
            ? globalThis
            : global);
    function mount_component(component, target, anchor) {
        const { fragment, on_mount, on_destroy, after_update } = component.$$;
        fragment && fragment.m(target, anchor);
        // onMount happens before the initial afterUpdate
        add_render_callback(() => {
            const new_on_destroy = on_mount.map(run).filter(is_function);
            if (on_destroy) {
                on_destroy.push(...new_on_destroy);
            }
            else {
                // Edge case - component was destroyed immediately,
                // most likely as a result of a binding initialising
                run_all(new_on_destroy);
            }
            component.$$.on_mount = [];
        });
        after_update.forEach(add_render_callback);
    }
    function destroy_component(component, detaching) {
        const $$ = component.$$;
        if ($$.fragment !== null) {
            run_all($$.on_destroy);
            $$.fragment && $$.fragment.d(detaching);
            // TODO null out other refs, including component.$$ (but need to
            // preserve final state?)
            $$.on_destroy = $$.fragment = null;
            $$.ctx = [];
        }
    }
    function make_dirty(component, i) {
        if (component.$$.dirty[0] === -1) {
            dirty_components.push(component);
            schedule_update();
            component.$$.dirty.fill(0);
        }
        component.$$.dirty[(i / 31) | 0] |= (1 << (i % 31));
    }
    function init(component, options, instance, create_fragment, not_equal, props, dirty = [-1]) {
        const parent_component = current_component;
        set_current_component(component);
        const prop_values = options.props || {};
        const $$ = component.$$ = {
            fragment: null,
            ctx: null,
            // state
            props,
            update: noop,
            not_equal,
            bound: blank_object(),
            // lifecycle
            on_mount: [],
            on_destroy: [],
            before_update: [],
            after_update: [],
            context: new Map(parent_component ? parent_component.$$.context : []),
            // everything else
            callbacks: blank_object(),
            dirty,
            skip_bound: false
        };
        let ready = false;
        $$.ctx = instance
            ? instance(component, prop_values, (i, ret, ...rest) => {
                const value = rest.length ? rest[0] : ret;
                if ($$.ctx && not_equal($$.ctx[i], $$.ctx[i] = value)) {
                    if (!$$.skip_bound && $$.bound[i])
                        $$.bound[i](value);
                    if (ready)
                        make_dirty(component, i);
                }
                return ret;
            })
            : [];
        $$.update();
        ready = true;
        run_all($$.before_update);
        // `false` as a special case of no DOM component
        $$.fragment = create_fragment ? create_fragment($$.ctx) : false;
        if (options.target) {
            if (options.hydrate) {
                const nodes = children(options.target);
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.l(nodes);
                nodes.forEach(detach);
            }
            else {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.c();
            }
            if (options.intro)
                transition_in(component.$$.fragment);
            mount_component(component, options.target, options.anchor);
            flush();
        }
        set_current_component(parent_component);
    }
    class SvelteComponent {
        $destroy() {
            destroy_component(this, 1);
            this.$destroy = noop;
        }
        $on(type, callback) {
            const callbacks = (this.$$.callbacks[type] || (this.$$.callbacks[type] = []));
            callbacks.push(callback);
            return () => {
                const index = callbacks.indexOf(callback);
                if (index !== -1)
                    callbacks.splice(index, 1);
            };
        }
        $set($$props) {
            if (this.$$set && !is_empty($$props)) {
                this.$$.skip_bound = true;
                this.$$set($$props);
                this.$$.skip_bound = false;
            }
        }
    }

    function dispatch_dev(type, detail) {
        document.dispatchEvent(custom_event(type, Object.assign({ version: '3.25.1' }, detail)));
    }
    function append_dev(target, node) {
        dispatch_dev("SvelteDOMInsert", { target, node });
        append(target, node);
    }
    function insert_dev(target, node, anchor) {
        dispatch_dev("SvelteDOMInsert", { target, node, anchor });
        insert(target, node, anchor);
    }
    function detach_dev(node) {
        dispatch_dev("SvelteDOMRemove", { node });
        detach(node);
    }
    function listen_dev(node, event, handler, options, has_prevent_default, has_stop_propagation) {
        const modifiers = options === true ? ["capture"] : options ? Array.from(Object.keys(options)) : [];
        if (has_prevent_default)
            modifiers.push('preventDefault');
        if (has_stop_propagation)
            modifiers.push('stopPropagation');
        dispatch_dev("SvelteDOMAddEventListener", { node, event, handler, modifiers });
        const dispose = listen(node, event, handler, options);
        return () => {
            dispatch_dev("SvelteDOMRemoveEventListener", { node, event, handler, modifiers });
            dispose();
        };
    }
    function attr_dev(node, attribute, value) {
        attr(node, attribute, value);
        if (value == null)
            dispatch_dev("SvelteDOMRemoveAttribute", { node, attribute });
        else
            dispatch_dev("SvelteDOMSetAttribute", { node, attribute, value });
    }
    function validate_slots(name, slot, keys) {
        for (const slot_key of Object.keys(slot)) {
            if (!~keys.indexOf(slot_key)) {
                console.warn(`<${name}> received an unexpected slot "${slot_key}".`);
            }
        }
    }
    class SvelteComponentDev extends SvelteComponent {
        constructor(options) {
            if (!options || (!options.target && !options.$$inline)) {
                throw new Error(`'target' is a required option`);
            }
            super();
        }
        $destroy() {
            super.$destroy();
            this.$destroy = () => {
                console.warn(`Component was already destroyed`); // eslint-disable-line no-console
            };
        }
        $capture_state() { }
        $inject_state() { }
    }

    const useWebRTC = (localVideo, remoteVideo, textForSendSdp, textToReceiveSdp) => {
        let localStream = null;
        let peerConnection = null;
        let negotiationneededCounter = 0;
        let remoteVideoStream = null;
        const wsUrl = ' ws://192.168.0.4:3001/';
        const ws = new WebSocket(wsUrl);
        ws.onopen = (evt) => {
            console.log(' ws open()');
        };
        ws.onerror = (err) => {
            console.error(' ws onerror() ERR:', err);
        };
        ws.onmessage = (evt) => {
            console.log(' ws onmessage() data:', evt.data);
            const message = JSON.parse(evt.data);
            switch (message.type) {
                case 'offer': {
                    console.log('Received offer ...');
                    textToReceiveSdp.value = message.sdp;
                    setOffer(message);
                    break;
                }
                case 'answer': {
                    console.log('Received answer ...');
                    textToReceiveSdp.value = message.sdp;
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
        // ICE candaidate受信時にセットする
        function addIceCandidate(candidate) {
            if (peerConnection) {
                peerConnection.addIceCandidate(candidate);
            }
            else {
                console.error('PeerConnection not exist!');
                return;
            }
        }
        // ICE candidate生成時に送信する
        function sendIceCandidate(candidate) {
            console.log('---sending ICE candidate ---');
            const message = JSON.stringify({ type: 'candidate', ice: candidate });
            console.log('sending candidate=' + message);
            ws.send(message);
        }
        // getUserMediaでカメラ、マイクにアクセス
        async function startVideo() {
            try {
                localStream = await navigator.mediaDevices.getDisplayMedia({ video: true, audio: true });
                // localStream = await navigator.mediaDevices.getUserMedia({video: true, audio: false});
                if (localStream) {
                    playVideo(localVideo, localStream);
                }
                else {
                    console.error("localstream not found");
                }
            }
            catch (err) {
                console.error('mediaDevice.getUserMedia() error:', err);
            }
        }
        // Videoの再生を開始する
        async function playVideo(element, stream) {
            console.log(element.srcObject);
            element.srcObject = stream;
            try {
                await element.play();
            }
            catch (error) {
                console.log('error auto play:' + error);
            }
        }
        // WebRTCを利用する準備をする
        function prepareNewConnection(isOffer) {
            const peer = new RTCPeerConnection();
            // リモートのMediStreamTrackを受信した時
            peer.ontrack = evt => {
                console.log('-- peer.ontrack()');
                console.log(evt.streams);
                remoteVideoStream = evt.streams[0];
                // playVideo(remoteVideo, evt.streams[0]);
            };
            // ICE Candidateを収集したときのイベント
            peer.onicecandidate = evt => {
                if (evt.candidate) {
                    console.log(evt.candidate);
                    sendIceCandidate(evt.candidate);
                }
                else {
                    console.log('empty ice event');
                    // sendSdp(peer.localDescription);
                }
            };
            // Offer側でネゴシエーションが必要になったときの処理
            peer.onnegotiationneeded = async () => {
                try {
                    if (isOffer) {
                        if (negotiationneededCounter === 0) {
                            let offer = await peer.createOffer();
                            console.log('createOffer() succsess in promise');
                            await peer.setLocalDescription(offer);
                            console.log('setLocalDescription() succsess in promise');
                            sendSdp(peer.localDescription);
                            negotiationneededCounter++;
                        }
                    }
                }
                catch (err) {
                    console.error('setLocalDescription(offer) ERROR: ', err);
                }
            };
            // ICEのステータスが変更になったときの処理
            peer.oniceconnectionstatechange = function () {
                console.log('ICE connection Status has changed to ' + peer.iceConnectionState);
                switch (peer.iceConnectionState) {
                    case 'closed':
                    case 'failed':
                        if (peerConnection) {
                            hangUp();
                        }
                        break;
                }
            };
            // ローカルのMediaStreamを利用できるようにする
            if (localStream) {
                console.log('Adding local stream...');
                localStream.getTracks().forEach(track => peer.addTrack(track, localStream));
            }
            else {
                console.warn('no local stream, but continue.');
            }
            return peer;
        }
        // 手動シグナリングのための処理を追加する
        function sendSdp(sessionDescription) {
            var _a;
            console.log('---sending sdp ---');
            textForSendSdp.value = (_a = sessionDescription === null || sessionDescription === void 0 ? void 0 : sessionDescription.sdp) !== null && _a !== void 0 ? _a : '';
            /*---
              textForSendSdp.focus();
              textForSendSdp.select();
            ----*/
            const message = JSON.stringify(sessionDescription);
            console.log('sending SDP=' + message);
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
            console.log('sending Answer. Creating remote session description...');
            if (!peerConnection) {
                console.error('peerConnection NOT exist!');
                return;
            }
            try {
                let answer = await peerConnection.createAnswer();
                console.log('createAnswer() succsess in promise');
                await peerConnection.setLocalDescription(answer);
                console.log('setLocalDescription() succsess in promise');
                sendSdp(peerConnection.localDescription);
            }
            catch (err) {
                console.error(err);
            }
        }
        // Receive remote SDPボタンが押されたらOffer側とAnswer側で処理を分岐
        function onSdpText() {
            const text = textToReceiveSdp.value;
            if (peerConnection) {
                console.log('Received answer text...');
                const answer = new RTCSessionDescription({
                    type: 'answer',
                    sdp: text,
                });
                setAnswer(answer);
            }
            else {
                console.log('Received offer text...');
                const offer = new RTCSessionDescription({
                    type: 'offer',
                    sdp: text,
                });
                setOffer(offer);
            }
            textToReceiveSdp.value = '';
        }
        // Offer側のSDPをセットする処理
        async function setOffer(sessionDescription) {
            if (peerConnection) {
                console.error('peerConnection alreay exist!');
            }
            peerConnection = prepareNewConnection(false);
            try {
                await peerConnection.setRemoteDescription(sessionDescription);
                console.log('setRemoteDescription(answer) succsess in promise');
                makeAnswer();
            }
            catch (err) {
                console.error('setRemoteDescription(offer) ERROR: ', err);
            }
        }
        // Answer側のSDPをセットする場合
        async function setAnswer(sessionDescription) {
            if (!peerConnection) {
                console.error('peerConnection NOT exist!');
                return;
            }
            try {
                await peerConnection.setRemoteDescription(sessionDescription);
                console.log('setRemoteDescription(answer) succsess in promise');
            }
            catch (err) {
                console.error('setRemoteDescription(answer) ERROR: ', err);
            }
        }
        // P2P通信を切断する
        function hangUp() {
            if (peerConnection) {
                if (peerConnection.iceConnectionState !== 'closed') {
                    peerConnection.close();
                    peerConnection = null;
                    negotiationneededCounter = 0;
                    const message = JSON.stringify({ type: 'close' });
                    console.log('sending close message');
                    ws.send(message);
                    cleanupVideoElement(remoteVideo);
                    textForSendSdp.value = '';
                    textToReceiveSdp.value = '';
                    return;
                }
            }
            console.log('peerConnection is closed.');
        }
        // ビデオエレメントを初期化する
        function cleanupVideoElement(element) {
            element.pause();
            element.srcObject = null;
        }
        function playRemoteVideo() {
            if (remoteVideoStream) {
                playVideo(remoteVideo, remoteVideoStream);
            }
            else {
                alert('not set remote video stream');
            }
        }
        return {
            startVideo,
            hangUp,
            connect,
            onSdpText,
            playRemoteVideo
        };
    };

    /* src\App.svelte generated by Svelte v3.25.1 */

    const { console: console_1 } = globals;
    const file = "src\\App.svelte";

    function create_fragment(ctx) {
    	let main;
    	let button0;
    	let t1;
    	let button1;
    	let t3;
    	let button2;
    	let t5;
    	let button3;
    	let t7;
    	let div;
    	let video0;
    	let video0_muted_value;
    	let t8;
    	let video1;
    	let t9;
    	let p0;
    	let t10;
    	let br0;
    	let t11;
    	let textarea0;
    	let textarea0_readonly_value;
    	let t12;
    	let p1;
    	let t13;
    	let button4;
    	let br1;
    	let t15;
    	let textarea1;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			main = element("main");
    			button0 = element("button");
    			button0.textContent = "Start Video";
    			t1 = space();
    			button1 = element("button");
    			button1.textContent = "Connect";
    			t3 = space();
    			button2 = element("button");
    			button2.textContent = "Hang Up";
    			t5 = space();
    			button3 = element("button");
    			button3.textContent = "startRemote video";
    			t7 = space();
    			div = element("div");
    			video0 = element("video");
    			t8 = space();
    			video1 = element("video");
    			t9 = space();
    			p0 = element("p");
    			t10 = text("SDP to send:");
    			br0 = element("br");
    			t11 = space();
    			textarea0 = element("textarea");
    			t12 = space();
    			p1 = element("p");
    			t13 = text("SDP to receive:\n\t\t");
    			button4 = element("button");
    			button4.textContent = "Receive remote SDP";
    			br1 = element("br");
    			t15 = space();
    			textarea1 = element("textarea");
    			attr_dev(button0, "type", "button");
    			add_location(button0, file, 28, 1, 730);
    			attr_dev(button1, "type", "button");
    			add_location(button1, file, 29, 1, 799);
    			attr_dev(button2, "type", "button");
    			add_location(button2, file, 30, 1, 861);
    			attr_dev(button3, "type", "button");
    			add_location(button3, file, 31, 1, 922);
    			video0.autoplay = true;
    			video0.muted = video0_muted_value = true;
    			set_style(video0, "width", "160px");
    			set_style(video0, "height", "120px");
    			set_style(video0, "border", "1px solid black");
    			add_location(video0, file, 33, 2, 1004);
    			video1.autoplay = true;
    			set_style(video1, "width", "160px");
    			set_style(video1, "height", "120px");
    			set_style(video1, "border", "1px solid black");
    			add_location(video1, file, 34, 2, 1133);
    			add_location(div, file, 32, 1, 996);
    			add_location(br0, file, 36, 16, 1270);
    			attr_dev(textarea0, "rows", "5");
    			attr_dev(textarea0, "cols", "60");
    			textarea0.readOnly = textarea0_readonly_value = true;
    			textarea0.value = "SDP to send";
    			add_location(textarea0, file, 37, 2, 1279);
    			add_location(p0, file, 36, 1, 1255);
    			attr_dev(button4, "type", "button");
    			add_location(button4, file, 40, 2, 1406);
    			add_location(br1, file, 40, 75, 1479);
    			attr_dev(textarea1, "rows", "5");
    			attr_dev(textarea1, "cols", "60");
    			add_location(textarea1, file, 41, 2, 1488);
    			add_location(p1, file, 39, 1, 1385);
    			attr_dev(main, "class", "svelte-2x1evt");
    			add_location(main, file, 27, 0, 722);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, main, anchor);
    			append_dev(main, button0);
    			append_dev(main, t1);
    			append_dev(main, button1);
    			append_dev(main, t3);
    			append_dev(main, button2);
    			append_dev(main, t5);
    			append_dev(main, button3);
    			append_dev(main, t7);
    			append_dev(main, div);
    			append_dev(div, video0);
    			/*video0_binding*/ ctx[9](video0);
    			append_dev(div, t8);
    			append_dev(div, video1);
    			/*video1_binding*/ ctx[10](video1);
    			append_dev(main, t9);
    			append_dev(main, p0);
    			append_dev(p0, t10);
    			append_dev(p0, br0);
    			append_dev(p0, t11);
    			append_dev(p0, textarea0);
    			/*textarea0_binding*/ ctx[11](textarea0);
    			append_dev(main, t12);
    			append_dev(main, p1);
    			append_dev(p1, t13);
    			append_dev(p1, button4);
    			append_dev(p1, br1);
    			append_dev(p1, t15);
    			append_dev(p1, textarea1);
    			/*textarea1_binding*/ ctx[12](textarea1);

    			if (!mounted) {
    				dispose = [
    					listen_dev(
    						button0,
    						"click",
    						function () {
    							if (is_function(/*startVideo1*/ ctx[4])) /*startVideo1*/ ctx[4].apply(this, arguments);
    						},
    						false,
    						false,
    						false
    					),
    					listen_dev(
    						button1,
    						"click",
    						function () {
    							if (is_function(/*connect1*/ ctx[5])) /*connect1*/ ctx[5].apply(this, arguments);
    						},
    						false,
    						false,
    						false
    					),
    					listen_dev(
    						button2,
    						"click",
    						function () {
    							if (is_function(/*hangUp1*/ ctx[6])) /*hangUp1*/ ctx[6].apply(this, arguments);
    						},
    						false,
    						false,
    						false
    					),
    					listen_dev(
    						button3,
    						"click",
    						function () {
    							if (is_function(/*playVideo1*/ ctx[8])) /*playVideo1*/ ctx[8].apply(this, arguments);
    						},
    						false,
    						false,
    						false
    					),
    					listen_dev(
    						button4,
    						"click",
    						function () {
    							if (is_function(/*onSdpText1*/ ctx[7])) /*onSdpText1*/ ctx[7].apply(this, arguments);
    						},
    						false,
    						false,
    						false
    					)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, [dirty]) {
    			ctx = new_ctx;
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(main);
    			/*video0_binding*/ ctx[9](null);
    			/*video1_binding*/ ctx[10](null);
    			/*textarea0_binding*/ ctx[11](null);
    			/*textarea1_binding*/ ctx[12](null);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("App", slots, []);
    	let localVideo;
    	let remoteVideo;
    	let textForSendSdp;
    	let textForReceiveSdp;

    	onMount(() => {
    		try {
    			navigator.mediaDevices.getUserMedia({ video: true, audio: true });
    		} catch(err) {
    			console.error(err);
    		}

    		const { startVideo, connect, hangUp, onSdpText, playRemoteVideo } = useWebRTC(localVideo, remoteVideo, textForSendSdp, textForReceiveSdp);
    		$$invalidate(4, startVideo1 = startVideo);
    		$$invalidate(5, connect1 = connect);
    		$$invalidate(6, hangUp1 = hangUp);
    		$$invalidate(7, onSdpText1 = onSdpText);
    		$$invalidate(8, playVideo1 = playRemoteVideo);
    	});

    	let startVideo1;
    	let connect1;
    	let hangUp1;
    	let onSdpText1;
    	let playVideo1;
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console_1.warn(`<App> was created with unknown prop '${key}'`);
    	});

    	function video0_binding($$value) {
    		binding_callbacks[$$value ? "unshift" : "push"](() => {
    			localVideo = $$value;
    			$$invalidate(0, localVideo);
    		});
    	}

    	function video1_binding($$value) {
    		binding_callbacks[$$value ? "unshift" : "push"](() => {
    			remoteVideo = $$value;
    			$$invalidate(1, remoteVideo);
    		});
    	}

    	function textarea0_binding($$value) {
    		binding_callbacks[$$value ? "unshift" : "push"](() => {
    			textForSendSdp = $$value;
    			$$invalidate(2, textForSendSdp);
    		});
    	}

    	function textarea1_binding($$value) {
    		binding_callbacks[$$value ? "unshift" : "push"](() => {
    			textForReceiveSdp = $$value;
    			$$invalidate(3, textForReceiveSdp);
    		});
    	}

    	$$self.$capture_state = () => ({
    		onMount,
    		useWebRTC,
    		localVideo,
    		remoteVideo,
    		textForSendSdp,
    		textForReceiveSdp,
    		startVideo1,
    		connect1,
    		hangUp1,
    		onSdpText1,
    		playVideo1
    	});

    	$$self.$inject_state = $$props => {
    		if ("localVideo" in $$props) $$invalidate(0, localVideo = $$props.localVideo);
    		if ("remoteVideo" in $$props) $$invalidate(1, remoteVideo = $$props.remoteVideo);
    		if ("textForSendSdp" in $$props) $$invalidate(2, textForSendSdp = $$props.textForSendSdp);
    		if ("textForReceiveSdp" in $$props) $$invalidate(3, textForReceiveSdp = $$props.textForReceiveSdp);
    		if ("startVideo1" in $$props) $$invalidate(4, startVideo1 = $$props.startVideo1);
    		if ("connect1" in $$props) $$invalidate(5, connect1 = $$props.connect1);
    		if ("hangUp1" in $$props) $$invalidate(6, hangUp1 = $$props.hangUp1);
    		if ("onSdpText1" in $$props) $$invalidate(7, onSdpText1 = $$props.onSdpText1);
    		if ("playVideo1" in $$props) $$invalidate(8, playVideo1 = $$props.playVideo1);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		localVideo,
    		remoteVideo,
    		textForSendSdp,
    		textForReceiveSdp,
    		startVideo1,
    		connect1,
    		hangUp1,
    		onSdpText1,
    		playVideo1,
    		video0_binding,
    		video1_binding,
    		textarea0_binding,
    		textarea1_binding
    	];
    }

    class App extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance, create_fragment, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "App",
    			options,
    			id: create_fragment.name
    		});
    	}
    }

    const app = new App({
        target: document.body
    });
    //# sourceMappingURL=svelte.js.map

    return app;

}());
//# sourceMappingURL=bundle.js.map
