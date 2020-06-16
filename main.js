'use strict';

const API_KEY = '8pqxEvveACSzdk5vHEf0pTNeDOC2NYOc';
const AUTOCOMPLETE_LIMIT = 5;
const SUGGESTION_TAGS_LIMIT = 5;

const $SEARCH_BTN = document.querySelector('.search-btn');
const $USER_INPUT = document.querySelector('#search-input');

const $TODAY_CONTAINER = document.querySelector('.today__container');
const $TRENDINGS_CONTAINER = document.querySelector('.tendencies-container');
const $RESULTS_SECTION = document.querySelector('.results');
const $RESULTS_CONTAINER = document.querySelector('.results-container');
const $SAVED_CONTAINER = document.querySelector('.saved-container');
const $AUTOCOMPLETE_CONTAINER = document.querySelector('.autocomplete');
const $RELATED_CONTAINER = document.querySelector('.related');
const $RESULTS_TITLE = document.querySelector('.results-title');

const $DROPDOWN_HANDLER = document.querySelector('.nav__secondary-btn');
const $DROPDOWN_CONTAINER = document.querySelector('.nav__dropdown');

function gifWidthAdapter(parentTag, childTag, childTag2, height, width) {
	if (width >= 1.5 * height) {
		childTag.classList.add('child-wide-format');
		childTag2.classList.add('child-wide-format');
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

	gifWidthAdapter($div, $img, $div2, gifHeight, gifWidth);

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
	$btn.className = 'item__btn';
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
		hideTrendings();
		hideSuggestions();
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

	gifWidthAdapter($div, $img, $div2, gifHeight, gifWidth);

	$div2.appendChild($p);
	$div.appendChild($img);
	$div.appendChild($div2);
	$TRENDINGS_CONTAINER.appendChild($div);
}

function modifyResultsTitle(text) {
	$RESULTS_TITLE.innerHTML = `<p>${text} (resultados)</p>`;
}

function createSavedItem(imageSrc, url, title, gifHeight, gifWidth) {
	const $div = document.createElement('div');
	$div.className = 'results-item gif';

	const $img = document.createElement('img');
	$img.className = 'gif__img';
	$img.src = imageSrc;

	const $div2 = document.createElement('div');
	$div2.className = 'gif__text';

	const $p = document.createElement('p');
	$p.textContent = title;

	$div2.appendChild($p);
	$div.appendChild($img);
	$div.appendChild($div2);
	$SAVED_CONTAINER.appendChild($div);

	// OTRA OPCION
	// $div.innerHTML = `<div class="results-item gif"><img class="gif__img" src="${imageSrc}"><div class="img__text"><p>${title}</p></div></div>`;
}

function hideSuggestions() {
	const $suggestions = document.querySelector('.today');
	$suggestions.style.display = 'none';
	if (!$suggestions.classList.contains('hidden')) {
		$suggestions.classList.add('hidden');
	}
}

function hideTrendings() {
	const $trendings = document.querySelector('.tendencies');
	if (!$trendings.classList.contains('hidden')) {
		$trendings.classList.add('hidden');
	}
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
				const imageSrc = array.data.images.preview_webp.url;
				const url = array.data.url;
				const title = array.data.title;

				createSuggestionItem(imageSrc, url, title);
			})
			.catch((error) => {
				console.log(`Something went wrong on the fetchSuggestions`);
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
				const imageSrc = array.data[i].images.preview_webp.url;
				const url = array.data[i].url;
				const title = array.data[i].title;
				const gifHeight = array.data[i].images.preview_webp.height;
				const gifWidth = array.data[i].images.preview_webp.width;

				createTrendingItem(imageSrc, url, title, gifHeight, gifWidth);
			}
		})
		.catch((error) => {
			console.log(`Something went wrong on the fetchTrendings`);
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
				const imageSrc = array.data[i].images.preview_webp.url;
				const url = array.data[i].url;
				const title = array.data[i].title;
				const gifHeight = array.data[i].images.preview_webp.height;
				const gifWidth = array.data[i].images.preview_webp.width;

				createResultItem(imageSrc, url, title, gifHeight, gifWidth);
			}
		})
		.then(() => {
			resultsVisibility();
			modifyResultsTitle(userInput);
			fetchSuggestionTags(userInput);
		})
		.catch((error) => {
			console.log(`Something went wrong on the fetchUserInput`);
			return error;
		});
}

function fetchAutocompleteTags(userInput) {
	if (!userInput) {
		return;
	}
	fetch('https://api.giphy.com/v1/gifs/search/tags?api_key=' + API_KEY + '&q=' + userInput)
		.then((Response) => {
			return Response.json();
		})
		.then((array) => {
			wipePreviousAutocompleteItems();

			if (array.data != []) {
				for (let i = 0; i < array.data.length && i < AUTOCOMPLETE_LIMIT; i++) {
					const name = array.data[i].name;

					createAutocompleteItem(name);
				}
			}
		});
}

function fetchSuggestionTags(userSearchInput) {
	fetch(`https://api.giphy.com/v1/tags/related/${userSearchInput}?api_key=${API_KEY}`)
		.then((Response) => {
			return Response.json();
		})
		.then((array) => {
			wipePreviousSuggestionTags();

			if (array.data != []) {
				for (let i = 0; i < array.data.length && i < SUGGESTION_TAGS_LIMIT; i++) {
					const name = array.data[i].name;

					createSuggestionTag(name);
				}
			}
		})
		.catch((error) => {
			console.log(`Something went wrong on the fetchSuggestionTags`);
			return error;
		});
}

$DROPDOWN_HANDLER.addEventListener('click', function () {
	if ($DROPDOWN_CONTAINER.classList.contains('hidden')) {
		$DROPDOWN_CONTAINER.classList.remove('hidden');
	} else {
		$DROPDOWN_CONTAINER.classList.add('hidden');
	}
});

$SEARCH_BTN.addEventListener('click', function (event) {
	let userInput = $USER_INPUT.value;

	wipePreviousSearchItems();
	hideTrendings();
	hideSuggestions();
	fetchUserInput(userInput);
	wipeSearchInput();
	autocompleteVisibility();

	event.preventDefault();
});

$USER_INPUT.addEventListener('input', function () {
	fetchAutocompleteTags($USER_INPUT.value);
	autocompleteVisibility();
});

refreshSuggestions();
fetchTrendings();

/* 
-ENDPOINTS-
	Search:
	https://api.giphy.com/v1/gifs/search?api_key=8pqxEvveACSzdk5vHEf0pTNeDOC2NYOc&q=&limit=25&offset=0

	Trending:
	https://api.giphy.com/v1/gifs/trending?api_key=8pqxEvveACSzdk5vHEf0pTNeDOC2NYOc&limit=25

	Random:
	https://api.giphy.com/v1/gifs/random?api_key=8pqxEvveACSzdk5vHEf0pTNeDOC2NYOc&tag=

	Get by ID:
	https://api.giphy.com/v1/gifs/?api_key=8pqxEvveACSzdk5vHEf0pTNeDOC2NYOc

	Get by IDs (comma separated):
	https://api.giphy.com/v1/gifs/?api_key=8pqxEvveACSzdk5vHEf0pTNeDOC2NYOc

*/
