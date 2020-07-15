const $SEARCH_BTN = document.querySelector('.btn-search');
const $USER_INPUT = document.querySelector('#search-input');
const $RESULTS_SECTION = document.querySelector('.results');
const $SUGGESTIONS_SECTION = document.querySelector('.today');
const $TRENDINGS_SECTION = document.querySelector('.tendencies');
const $MY_GIFOS_SECTION = document.querySelector('.my-gifos');
const $TODAY_CONTAINER = document.querySelector('.today__container');
const $TRENDINGS_CONTAINER = document.querySelector('.tendencies-container');
const $RESULTS_CONTAINER = document.querySelector('.results-container');
const $SAVED_CONTAINER = document.querySelector('.saved-container');
const $AUTOCOMPLETE_CONTAINER = document.querySelector('.autocomplete');
const $RELATED_CONTAINER = document.querySelector('.related');
const $LOCAL_GIFS_CONTAINER = document.getElementById('loaded-gifs');
const $RESULTS_TITLE = document.querySelector('.results-title');
const $DROPDOWN_CONTAINER = document.querySelector('.nav__dropdown');
const $MY_GIFOS_BTN = document.querySelector('#myGifos_btn');
const $DAY_THEME_BTN = document.querySelector('#day-theme-btn');
const $NIGHT_THEME_BTN = document.querySelector('#night-theme-btn');
const $THEME_TAG = document.querySelector('#theme');
const $BODY = document.querySelector('body');

const $LOGO = document.querySelector('#logo');
const $FAVICON = document.querySelector('#favicon');
const $SEARCH_ICON = document.querySelector('#search-icon');

const API_KEY = '8pqxEvveACSzdk5vHEf0pTNeDOC2NYOc';
const AUTOCOMPLETE_LIMIT = 5;
const SUGGESTION_TAGS_LIMIT = 5;

(function deleteCachedTheme() {
	const link = document.querySelector('#cache');
	link.remove();
})();

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
			$LOGO.src = './assets/img/gifOF_logo_dark.png';
			$FAVICON.href = './assets/img/favicon/sailor_night.ico';
			$SEARCH_ICON.src = 'assets/svg/lupa_light.svg';
			break;

		case 'sailorDayTheme':
		default:
			$LOGO.src = './assets/img/gifOF_logo.png';
			$FAVICON.href = './assets/img/favicon/sailor_day.ico';
			$SEARCH_ICON.src = 'assets/svg/lupa.svg';
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

function loadFromLocal() {
	let items = JSON.parse(localStorage.getItem('MisGuifos')) || [];

	if (items === []) {
		return console.log('Aún no hay gifs guardados!');
	}

	items.forEach((element) => {
		fetch(`https://api.giphy.com/v1/gifs/${element}?api_key=${API_KEY}`)
			.then((response) => {
				return response.json();
			})
			.then((item) => {
				const gif = item.data.images.original.url;
				const title = item.data.title;
				createLoadedGif(gif, title);
			})
			.catch((error) => {
				console.error('Error al intentar el fetch de gifs guardados');
				return error;
			});
	});
}

function disableButton(btn) {
	btn.disabled = true;
}

function enableButton(btn) {
	btn.disabled = false;
}

function gifWidthAdapter(parentTag, height, width) {
	if (width >= 1.5 * height) {
		parentTag.classList.add('parent-wide-format');
	}
}

function createResultItem(imageSrc, url, title, gifHeight, gifWidth) {
	const $div = document.createElement('div');
	$div.className = 'results-item gif';

	const $img = document.createElement('img');
	$img.className = 'gif__img';
	$img.src = imageSrc;

	const $div2 = document.createElement('div');
	$div2.className = 'gif__text';

	const $p = document.createElement('p');
	$p.textContent = title;

	gifWidthAdapter($div, gifHeight, gifWidth);

	$div2.appendChild($p);
	$div.appendChild($img);
	$div.appendChild($div2);
	$RESULTS_CONTAINER.appendChild($div);
}

function createSuggestionItem(imageSrc, url, title) {
	const $div = document.createElement('div');
	$div.className = 'today__item';

	const $div2 = document.createElement('div');
	$div2.className = 'item-header';

	const $p = document.createElement('p');
	$p.className = 'item-header__text';
	$p.textContent = `#${title}`;

	const $cross = document.createElement('img');
	$cross.className = 'item-header__img';
	$cross.src = 'assets/svg/button3.svg';
	$cross.alt = 'close button';

	const $img = document.createElement('img');
	$img.className = 'item__img';
	$img.src = imageSrc;

	const $btn = document.createElement('button');
	$btn.type = 'button';
	$btn.className = 'btn btn-related item__btn';
	$btn.textContent = 'Ver más...';

	const $link = document.createElement('a');
	$link.href = url;

	$link.appendChild($btn);
	$div2.appendChild($p);
	$div2.appendChild($cross);
	$div.appendChild($div2);
	$div.appendChild($img);
	$div.appendChild($link);

	$TODAY_CONTAINER.appendChild($div);
}

function createAutocompleteItem(tags) {
	const $button = document.createElement('button');
	$button.className = 'btn-adaptable-secondary autocomplete-tag';
	$button.type = 'button';
	$button.textContent = `${tags}`;

	$button.addEventListener('click', function () {
		wipePreviousSearchItems();
		hideElement($TRENDINGS_SECTION);
		hideElement($SUGGESTIONS_SECTION);
		fetchUserInput(this.textContent);
		wipeSearchInput();
		autocompleteVisibility();
	});

	$AUTOCOMPLETE_CONTAINER.appendChild($button);
}

function createSuggestionTag(tags) {
	const $button = document.createElement('button');
	$button.className = 'related__tag';
	$button.type = 'button';
	$button.textContent = `${tags}`;

	$button.addEventListener('click', function () {
		wipePreviousSearchItems();
		fetchUserInput(this.textContent);
	});

	$RELATED_CONTAINER.appendChild($button);
}

function createTrendingItem(imageSrc, url, title, gifHeight, gifWidth) {
	const $div = document.createElement('div');
	$div.className = 'tendencies-item gif';

	const $img = document.createElement('img');
	$img.className = 'gif__img';
	$img.src = imageSrc;

	const $div2 = document.createElement('div');
	$div2.className = 'gif__text';

	const $p = document.createElement('p');
	$p.textContent = title;

	gifWidthAdapter($div, gifHeight, gifWidth);

	$div2.appendChild($p);
	$div.appendChild($img);
	$div.appendChild($div2);
	$TRENDINGS_CONTAINER.appendChild($div);
}

function modifyResultsTitle(text) {
	$RESULTS_TITLE.innerHTML = `<h2 class="section-header__title">${text} (resultados)</h2>`;
}

function createLoadedGif(localGif, tags) {
	const $div = document.createElement('div');
	$div.className = 'local-item gif parent-wide-format';

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

function wipeSearchInput() {
	$USER_INPUT.value = '';
}

function wipePreviousSuggestions() {
	const $suggestionItems = document.querySelectorAll('.today__item');

	$suggestionItems.forEach((item) => {
		item.remove();
	});
}

function wipePreviousSuggestionTags() {
	const $suggestionTags = document.querySelectorAll('.related__tag');

	$suggestionTags.forEach((tag) => {
		tag.remove();
	});
}

function wipePreviousSearchItems() {
	const $results = document.querySelectorAll('.results-item');
	for (let i = 0; i < $results.length; i++) {
		$results[i].remove();
	}
}

function wipePreviousAutocompleteItems() {
	const $autocomplete_items = document.querySelectorAll('.autocomplete-tag');
	for (let i = 0; i < $autocomplete_items.length; i++) {
		$autocomplete_items[i].remove();
	}
}

function resultsVisibility() {
	if ($RESULTS_CONTAINER.children.length) {
		$RESULTS_SECTION.classList.remove('hidden');
	} else {
		$RESULTS_SECTION.classList.add('hidden');
	}
}

function autocompleteVisibility() {
	if ($USER_INPUT.value == '') {
		$AUTOCOMPLETE_CONTAINER.classList.add('hidden');
	} else {
		$AUTOCOMPLETE_CONTAINER.classList.remove('hidden');
	}
}

function refreshSuggestions() {
	wipePreviousSuggestions();
	fetchSuggestions(4);
}

function fetchSuggestions(numberOfSuggestions) {
	for (let i = 0; i < numberOfSuggestions; i++) {
		fetch('https://api.giphy.com/v1/gifs/random?api_key=' + API_KEY + '&tag=')
			.then((Response) => {
				return Response.json();
			})
			.then((array) => {
				const imageSrc = array.data.images.original.url;
				const url = array.data.url;
				const title = array.data.title;

				createSuggestionItem(imageSrc, url, title);
			})
			.catch((error) => {
				console.error(`Something went wrong on the fetchSuggestions`);
				return error;
			});
	}
}

function fetchTrendings() {
	fetch('https://api.giphy.com/v1/gifs/trending?api_key=' + API_KEY + '&limit=24')
		.then((Response) => {
			return Response.json();
		})
		.then((array) => {
			for (let i = 0; i < array.data.length; i++) {
				const imageSrc = array.data[i].images.original.url;
				const url = array.data[i].url;
				const title = array.data[i].title;
				const gifHeight = array.data[i].images.original.height;
				const gifWidth = array.data[i].images.original.width;

				createTrendingItem(imageSrc, url, title, gifHeight, gifWidth);
			}
		})
		.catch((error) => {
			console.error(`Something went wrong on the fetchTrendings`);
			return error;
		});
}

function fetchUserInput(userInput, offset) {
	if (!userInput) {
		window.location.reload();
	}
	fetch('https://api.giphy.com/v1/gifs/search?api_key=' + API_KEY + '&q=' + userInput + '&limit=24&offset=' + offset)
		.then((Response) => {
			return Response.json();
		})
		.then((array) => {
			for (let i = 0; i < array.data.length; i++) {
				const imageSrc = array.data[i].images.original.url;
				const url = array.data[i].url;
				const title = array.data[i].title;
				const gifHeight = array.data[i].images.original.height;
				const gifWidth = array.data[i].images.original.width;

				createResultItem(imageSrc, url, title, gifHeight, gifWidth);
			}
		})
		.then(() => {
			resultsVisibility();
			modifyResultsTitle(userInput);
			fetchSuggestionTags(userInput);
		})
		.catch((error) => {
			console.error(`Something went wrong on the fetchUserInput`);
			return error;
		});
}

function fetchAutocompleteTags(userInput) {
	if (!userInput) {
		disableButton($SEARCH_BTN);
		return;
	}
	enableButton($SEARCH_BTN);
	fetch('https://api.giphy.com/v1/gifs/search/tags?api_key=' + API_KEY + '&q=' + userInput)
		.then((Response) => {
			return Response.json();
		})
		.then((array) => {
			wipePreviousAutocompleteItems();

			if (array.data !== []) {
				for (let i = 0; i < array.data.length && i < AUTOCOMPLETE_LIMIT; i++) {
					const name = array.data[i].name;

					createAutocompleteItem(name);
				}
			}
		})
		.catch((error) => {
			console.error(`Something went wrong on the autocompleteTags fetch, ${error}`);
		});
}

function fetchSuggestionTags(userSearchInput) {
	fetch(`https://api.giphy.com/v1/tags/related/${userSearchInput}?api_key=${API_KEY}`)
		.then((Response) => {
			return Response.json();
		})
		.then((array) => {
			wipePreviousSuggestionTags();

			if (array.data !== []) {
				for (let i = 0; i < array.data.length && i < SUGGESTION_TAGS_LIMIT; i++) {
					const name = array.data[i].name;

					createSuggestionTag(name);
				}
			}
		})
		.catch((error) => {
			console.error(`Something went wrong on the fetchSuggestionTags`);
			return error;
		});
}

$SEARCH_BTN.addEventListener('click', function (event) {
	let userInput = $USER_INPUT.value;

	wipePreviousSearchItems();
	hideElement($TRENDINGS_SECTION);
	hideElement($SUGGESTIONS_SECTION);
	hideElement($MY_GIFOS_SECTION);
	fetchUserInput(userInput);
	wipeSearchInput();
	autocompleteVisibility();

	event.preventDefault();
});

$MY_GIFOS_BTN.addEventListener('click', () => {
	hideElement($SUGGESTIONS_SECTION);
	hideElement($TRENDINGS_SECTION);
	hideElement($RESULTS_SECTION);
	showElement($MY_GIFOS_SECTION);
});

$USER_INPUT.addEventListener('input', function () {
	fetchAutocompleteTags($USER_INPUT.value);
	autocompleteVisibility();
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
refreshSuggestions();
fetchTrendings();
loadFromLocal();
disableButton($SEARCH_BTN);
