const $DROPDOWN_CONTAINER = document.querySelector('.nav__dropdown');
const $PREVIEW_BAR_CONTAINER = document.getElementById('preview-container');
const $LOCAL_GIFS_CONTAINER = document.getElementById('loaded-gifs');
const $THEME_TAG = document.querySelector('#theme');
const $DAY_THEME_BTN = document.querySelector('#day-theme-btn');
const $NIGHT_THEME_BTN = document.querySelector('#night-theme-btn');
const $MY_GIFOS_BTN = document.querySelector('#myGifos_btn');
const $STREAM_BTN = document.getElementById('streamBtn');
const $START_BTN = document.getElementById('startBtn');
const $STOP_BTN = document.getElementById('stopBtn');
const $REPEAT_BTN = document.getElementById('repeatBtn');
const $UPLOAD_BTN = document.getElementById('uploadBtn');
const $DOWNLOAD_BTN = document.querySelector('#download_btn');
const $CLIPBOARD_BTN = document.querySelector('#clipboard_btn');
const $DONE_BTN = document.querySelector('#done_btn');
const $REPEAT_UPLOAD_BTNS = document.getElementById('repeat-upload-btns');
const $MY_GIFOS_SECTION = document.querySelector('.my-gifos');
const $CREATE_SECTION = document.querySelector('.create-gifos');
const $VIDEO_TAG = document.getElementById('video-tag');
const $GIF_UPLOADED = document.getElementById('uploaded-gif-container');
const $CREATE_WINDOW = document.getElementById('create-window');
const $STREAM_WINDOW = document.getElementById('stream-window');
const $UPLOAD_WINDOW = document.getElementById('upload-window');
const $SUCCESS_WINDOW = document.getElementById('success-window');

const $LOGO = document.querySelector('#logo');
const $FAVICON = document.querySelector('#favicon');
const $CAMERA_ICON = document.querySelector('#camera-icon');

const API_KEY_sec = '8pqxEvveACSzdk5vHEf0pTNeDOC2NYOc';

let streamContainer;
let recorder;
let recorderAux;
let gifBlob;
let uploadedGifID;

const timer_text = document.querySelector('#timer');
const timerRefreshRate = 30;
let interval;

(function deleteCachedTheme() {
	const link = document.querySelector('#cache');
	link.remove();
})();

function initializeTheme() {
	const actualTheme = $THEME_TAG.attributes.href.textContent;
	const check = localStorageThemeCheck();
	if (actualTheme !== `styles/${check}.css`) {
		$THEME_TAG.setAttribute('href', `styles/${check}.css`);
	}

	changeImages(check);
}

function changeImages(theme) {
	switch (theme) {
		case 'sailorNightTheme':
			$LOGO.src = 'assets/img/gifOF_logo_dark.png';
			$FAVICON.href = 'assets/img/favicon/sailor_night.ico';
			$CAMERA_ICON.src = 'assets/svg/camera_light.svg';
			break;

		case 'sailorDayTheme':
		default:
			$LOGO.src = 'assets/img/gifOF_logo.png';
			$FAVICON.href = 'assets/img/favicon/sailor_day.ico';
			$CAMERA_ICON.src = 'assets/svg/camera_light.svg';
			break;
	}
}

function localStorageThemeCheck() {
	const themeSettings = localStorage.getItem('GifosThemePreference');
	if (!themeSettings) {
		localStorage.setItem('GifosThemePreference', 'sailorDayTheme');
	}
	return themeSettings || 'sailorDayTheme';
}

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

function togglePlayPause() {
	if ($VIDEO_TAG.paused) {
		$VIDEO_TAG.play();
	} else {
		$VIDEO_TAG.pause();
	}
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
		fetch(`https://api.giphy.com/v1/gifs/${element}?api_key=${API_KEY_sec}`)
			.then((response) => {
				return response.json();
			})
			.then((item) => {
				const gif = item.data.images.original.url;
				const title = item.data.title || '#miGuifo';
				createLoadedGif(gif, title);
			})
			.catch((error) => {
				console.error(`Something went wrong trying to bring the stored gifs, ${error}`);
			});
	});
}

function createLoadedGif(localGif, tags) {
	const $div = document.createElement('div');
	$div.className = 'results-item gif parent-wide-format';

	const $img = document.createElement('img');
	$img.className = 'gif__img';
	$img.src = localGif;

	const $div2 = document.createElement('div');
	$div2.className = 'gif__text';

	const $p = document.createElement('p');
	$p.textContent = tags;

	$div2.appendChild($p);
	$div.appendChild($img);
	$div.appendChild($div2);
	$LOCAL_GIFS_CONTAINER.appendChild($div);
}

function secondsToMilliseconds(seconds) {
	return seconds % 1000;
}

function captureCamera() {
	navigator.mediaDevices
		.getUserMedia({
			audio: false,
			video: {
				height: { max: 480 },
			},
		})
		.then((stream) => {
			streamContainer = stream;
			$VIDEO_TAG.srcObject = stream;
			$VIDEO_TAG.play();
		})
		.then(() => {
			enableButton($START_BTN);
			showElement($START_BTN);
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
		width: 480,
		hidden: 240,
	});

	recorder.startRecording();
	recorderAux.startRecording();

	recorder.camera = userStream;
	recorderAux.camera = userStream;
}

function stopRecordingCallback() {
	console.log('Gif recording stopped: ' + bytesToSize(recorder.getBlob().size));

	gifBlob = recorder.getBlob();

	recorder.camera.stop();
	recorder.destroy();
	recorder = null;
}

function stopRecordingCallbackAux() {
	console.log('Video recording stopped: ' + bytesToSize(recorderAux.getBlob().size));
	$VIDEO_TAG.src = $VIDEO_TAG.srcObject = null;
	$VIDEO_TAG.src = URL.createObjectURL(recorderAux.getBlob());
	$VIDEO_TAG.play();

	recorderAux.camera.stop();
	recorderAux.destroy();
	recorderAux = null;
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
			uploadedGifID = result.data.id;
			saveToLocal(uploadedGifID);
			$GIF_UPLOADED.src = `https://media.giphy.com/media/${uploadedGifID}/giphy.gif`;
			hideElement($UPLOAD_WINDOW);
			showElement($SUCCESS_WINDOW);
		})
		.catch((error) => {
			alert('Algo salió mal, más información en la consola del inspector');
			console.error(error);
		});
}

function searchGifByID(gifID) {
	fetch(`https://api.giphy.com/v1/gifs/${gifID}?api_key=${API_KEY_sec}`)
		.then((response) => {
			return response.json();
		})
		.then((result) => {
			const gif = result.data.images.original.url;
			return gif;
		})
		.catch((error) => {
			console.error(`Something went wrong on the searchGifByID fetch, ${error}`);
		});
}

function copyCreatedGifLink() {
	const tempElement = document.createElement('textarea');
	tempElement.value = `https://giphy.com/gifs/${uploadedGifID}`;
	tempElement.setAttribute('readonly', '');
	tempElement.style = 'display: "none"';
	document.body.appendChild(tempElement);
	tempElement.select();
	document.execCommand('copy');
	console.log('Copied data to clipboard!');
	document.body.removeChild(tempElement);
}

function downloadCreatedGif() {
	fetch(`https://media.giphy.com/media/${uploadedGifID}/giphy.gif`)
		.then((response) => {
			return response.blob();
		})
		.then((blob) => {
			const urlGif = URL.createObjectURL(blob);

			const saveImg = document.createElement('a');
			saveImg.href = urlGif;
			saveImg.download = 'downloaded-guifo.gif';
			saveImg.style = 'display: "none"';
			document.body.appendChild(saveImg);
			saveImg.click();
			document.body.removeChild(saveImg);
		})
		.catch((error) => {
			alert('Algo salio mal al intentar descargar el archivo, revisa la consola del inspector para mas información');
			console.error(error);
		});
}

$STREAM_BTN.onclick = function () {
	hideElement($CREATE_WINDOW);
	captureCamera();
	showElement($STREAM_WINDOW);
};

$START_BTN.onclick = function () {
	hideElement(this);
	recordCamera(streamContainer);
	showElement($STOP_BTN);
	initTimer();
};

$STOP_BTN.onclick = function () {
	hideElement(this);
	showElement($REPEAT_UPLOAD_BTNS);
	showElement($PREVIEW_BAR_CONTAINER);
	stopTimer();
	recorder.stopRecording(stopRecordingCallback);
	recorderAux.stopRecording(stopRecordingCallbackAux);
};

$REPEAT_BTN.onclick = function () {
	timer_text.innerText = '00:00:00:00';
	hideElement($START_BTN);
	captureCamera();
	hideElement($STOP_BTN);
	hideElement($REPEAT_UPLOAD_BTNS);
	hideElement($PREVIEW_BAR_CONTAINER);
	showElement($STREAM_WINDOW);
};

$UPLOAD_BTN.onclick = function () {
	hideElement($STREAM_WINDOW);
	showElement($UPLOAD_WINDOW);
	uploadGif(gifBlob);
};

$PREVIEW_BAR_CONTAINER.onclick = function () {
	togglePlayPause();
};

$CLIPBOARD_BTN.addEventListener('click', copyCreatedGifLink);

$DOWNLOAD_BTN.addEventListener('click', downloadCreatedGif);

$MY_GIFOS_BTN.addEventListener('click', () => {
	hideElement($CREATE_SECTION);
	showElement($MY_GIFOS_SECTION);
});

$DONE_BTN.addEventListener('click', () => {
	loadFromLocal();
	hideElement($CREATE_SECTION);
});

$DAY_THEME_BTN.addEventListener('click', function () {
	localStorage.setItem('GifosThemePreference', 'sailorDayTheme');
	initializeTheme();
});

$NIGHT_THEME_BTN.addEventListener('click', function () {
	localStorage.setItem('GifosThemePreference', 'sailorNightTheme');
	initializeTheme();
});

initializeTheme();
loadFromLocal();

//	Timer Feature
function initTimer() {
	let initialDate = Date.now();

	interval = setInterval(() => {
		let currentDate = Date.now();
		let deltaTime = currentDate - initialDate;
		msToFormat(deltaTime);
	}, timerRefreshRate);
}

function stopTimer() {
	clearInterval(interval);
}

function msToFormat(milliseconds) {
	const mss = Math.floor((milliseconds % 1000) / 10);
	const sec = Math.floor((milliseconds / 1000) % 60);
	const min = Math.floor((milliseconds / (1000 * 60)) % 60);
	const hs = Math.floor((milliseconds / (1000 * 60 * 60)) % 24);

	renderTime(hs, min, sec, mss);
}

function renderTime(hs, min, sec, mss) {
	hs = hs < 10 ? '0' + hs : hs;
	min = min < 10 ? '0' + min : min;
	sec = sec < 10 ? '0' + sec : sec;
	mss = mss < 10 ? '0' + mss : mss;

	timer_text.innerText = `${hs}:${min}:${sec}:${mss}`;
}
