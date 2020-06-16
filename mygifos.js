'use strict';

const $STREAM_BTN = document.getElementById('streamBtn');
const $START_BTN = document.getElementById('startBtn');
const $STOP_BTN = document.getElementById('stopBtn');
const $REPEAT_UPLOAD_BTNS = document.getElementById('repeat-upload-btns');
const $PREVIEW_BAR_CONTAINER = document.getElementById('preview-container');
const $REPEAT_BTN = document.getElementById('repeatBtn');
const $UPLOAD_BTN = document.getElementById('uploadBtn');
const $VIDEO_TAG = document.getElementById('video-tag');
const $GIF_UPLOADED = document.getElementById('gif-uploaded');
const $LOCAL_GIFS_CONTAINER = document.getElementById('loaded-gifs');

const $CREATE_WINDOW = document.getElementById('create-window');
const $STREAM_WINDOW = document.getElementById('stream-window');
const $UPLOAD_WINDOW = document.getElementById('upload-window');
const $SUCCESS_WINDOW = document.getElementById('success-window');

const API_KEY_sec = '8pqxEvveACSzdk5vHEf0pTNeDOC2NYOc';

let streamContainer;
let recorder;
let recorderAux;
let gifBlob;

function hideElement(element) {
	if (element.classList.contains('hidden')) {
		return;
	}
	element.classList.add('hidden');
}

function showElement(element) {
	if (!element.classList.contains('hidden')) {
		return;
	}
	element.classList.remove('hidden');
}

function disableButton(btn) {
	btn.disabled = true;
}

function enableButton(btn) {
	btn.disabled = false;
}

function saveToLocal(newItem) {
	let oldItems = JSON.parse(localStorage.getItem('MisGuifos')) || [];

	oldItems.push(newItem);

	localStorage.setItem('MisGuifos', JSON.stringify(oldItems));
}

function loadFromLocal() {
	let items = JSON.parse(localStorage.getItem('MisGuifos')) || [];

	if (items === []) {
		return console.log('Aún no hay gifs guardados!');
	}

	items.forEach((element) => {
		//	Antes de createLoadedGif() hay que mandar un fetch por ID
		//	luego traer data.images y data.title de cada elemento
		fetch(`https://api.giphy.com/v1/gifs/${element}?api_key=${API_KEY_sec}`)
			.then((response) => {
				return response.json();
			})
			.then((item) => {
				const gif = item.data.images.original.url;
				const title = item.data.title;
				createLoadedGif(gif, title);
			})
			.catch((error) => {
				console.log('Error al intentar el fetch de gifs guardados');
				return error;
			});
	});
}

function createLoadedGif(localGif, tags) {
	//	Antes de createLoadedGif() hay que mandar un fetch por ID
	//	luego traer data.images y data.title de cada elemento

	const $div = document.createElement('div');
	$div.className = 'results-item gif parent-wide-format';

	const $img = document.createElement('img');
	$img.className = 'gif__img child-wide-format';
	$img.src = localGif;

	const $div2 = document.createElement('div');
	$div2.className = 'gif__text child-wide-format';

	const $p = document.createElement('p');
	$p.textContent = tags;

	// gifWidthAdapter($div, $img, $div2, gifHeight, gifWidth);

	$div2.appendChild($p);
	$div.appendChild($img);
	$div.appendChild($div2);
	$LOCAL_GIFS_CONTAINER.appendChild($div);
}

function captureCamera() {
	navigator.mediaDevices
		.getUserMedia({
			audio: false,
			video: {
				// height: { max: 600 },
				height: { max: 480 },
				// width: { max: 800 },
			},
		})
		.then((stream) => {
			streamContainer = stream;
			$VIDEO_TAG.srcObject = stream;
			$VIDEO_TAG.play();
		})
		.catch(function (error) {
			alert('Unable to capture your camera. Please check console logs.');
			console.error(error);
		});
}

function recordCamera(userStream) {
	console.log('Waiting for Gif Recorder to start...');
	recorder = RecordRTC(userStream, {
		type: 'gif',
		frameRate: 6,
		quality: 10,
		width: 360,
		hidden: 240,
		onGifRecordingStarted: function () {
			console.log('Gif recording started.');
		},
	});

	recorderAux = RecordRTC(userStream, {
		type: 'video',
		frameRate: 1,
		quality: 10,
		// width: 360,
		width: 480,
		hidden: 240,
	});

	$VIDEO_TAG.src = userStream;

	recorder.startRecording();
	recorderAux.startRecording();

	recorder.camera = userStream;
	recorderAux.camera = userStream;

	$STOP_BTN.disabled = false;
}

function stopRecordingCallback() {
	console.log('Gif recording stopped: ' + bytesToSize(recorder.getBlob().size));

	gifBlob = recorder.getBlob();

	// uploadGif(gifBlob); SHOW PREVIEW BEFORE THE UPLOAD

	recorder.camera.stop();
	recorder.destroy();
	recorder = null;
}

function stopRecordingCallbackAux() {
	console.log('Video recording stopped: ' + bytesToSize(recorderAux.getBlob().size));
	$VIDEO_TAG.src = $VIDEO_TAG.srcObject = null;
	$VIDEO_TAG.src = URL.createObjectURL(recorderAux.getBlob());

	recorderAux.camera.stop();
	recorderAux.destroy();
	recorderAux = null;
}

function previewVideo(videoBlob) {
	$VIDEO_TAG.srcObject = videoBlob;
	$VIDEO_TAG.play();
}

function uploadGif(userGifBlob) {
	console.log('*** Upload started ***');
	const formData = new FormData();
	formData.append('file', userGifBlob, 'myGif.gif');

	const parameters = {
		method: 'POST',
		body: formData,
		json: true,
	};
	console.log(formData.get('file'));

	fetch(`https://upload.giphy.com/v1/gifs?api_key=${API_KEY_sec}&tags=MiGuifo`, parameters)
		.then((response) => {
			return response.json();
		})
		.then((result) => {
			console.log(result);
			console.log('*** Upload ended ***');
			const gifID = result.data.id;
			saveToLocal(gifID);
			searchGifByID(gifID);
		})
		.catch((error) => {
			alert('Algo salió mal, más información en el console.log');
			console.log(error);
		});
}

function searchGifByID(gifID) {
	fetch(`https://api.giphy.com/v1/gifs/${gifID}?api_key=${API_KEY_sec}`)
		.then((response) => {
			return response.json();
		})
		.then((result) => {
			console.log(result);
		});
}

$STREAM_BTN.onclick = function () {
	disableButton(this);
	hideElement($CREATE_WINDOW);
	captureCamera();
	showElement($STREAM_WINDOW);
};

$START_BTN.onclick = function () {
	disableButton(this);
	hideElement(this);
	recordCamera(streamContainer);
	showElement($STOP_BTN);
};

$STOP_BTN.onclick = function () {
	disableButton(this);
	hideElement(this);
	showElement($REPEAT_UPLOAD_BTNS);
	showElement($PREVIEW_BAR_CONTAINER);
	recorder.stopRecording(stopRecordingCallback);
	recorderAux.stopRecording(stopRecordingCallbackAux);
	enableButton($START_BTN);
	enableButton($STREAM_BTN);
};

$UPLOAD_BTN.onclick = function () {
	hideElement($STREAM_WINDOW);
	showElement($UPLOAD_WINDOW);
	uploadGif(gifBlob);
	// SET A TIMEOUT TO SHOW AT LEAST SOME SECONDS THE UPLOAD WINDOW?
	hideElement($UPLOAD_WINDOW);
	// searchGifByID(gifID);
	showElement($SUCCESS_WINDOW);
};

loadFromLocal();
