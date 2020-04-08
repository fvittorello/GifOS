const API_KEY = '8pqxEvveACSzdk5vHEf0pTNeDOC2NYOc';

const $SEARCH_BTN = document.querySelector('.search-btn');
const $USER_INPUT = document.querySelector('#search-input');

const $TODAY_CONTAINER = document.querySelector('.today__container');
const $TRENDINGS_CONTAINER = document.querySelector('.tendencies-container');
const $RESULTS_CONTAINER = document.querySelector('.results-container');
const $SAVED_CONTAINER = document.querySelector('.saved-container');

function cleanSearchInput() {
	$USER_INPUT.value = '';
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

	$div2.appendChild($p);
	$div.appendChild($img);
	$div.appendChild($div2);
	$RESULTS_CONTAINER.appendChild($div);
}

/* 

<div class="results-container">
	<div class="results-item gif">
		<img class="gif__img" src="" alt="" />
		<div class="gif__text">
			<p>text content test</p>
		</div>
	</div>
</div>

*/

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

	$div2.appendChild($p);
	$div.appendChild($img);
	$div.appendChild($div2);
	$TRENDINGS_CONTAINER.appendChild($div);
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
}

function hideSuggestions() {
	const $suggestions = document.querySelector('.today');
	$suggestions.style.display = 'none';
}

function hideTrendings() {
	const $trendings = document.querySelector('.tendencies');
	$trendings.style.display = 'none';
}

function cleanPreviousSuggestions() {
	const $suggestions = document.querySelectorAll('.today__item');
	for (let i = 0; i < $suggestions.length; i++) {
		$suggestions[i].remove();
	}
}

function cleanPreviousSearchItems() {
	const $results = document.querySelectorAll('.results-item');
	for (let i = 0; i < $results.length; i++) {
		$results[i].remove();
	}
}

function refreshSuggestions() {
	cleanPreviousSuggestions();
	fetchSugestions(4);
}

function fetchSugestions(numberOfSuggestions) {
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
			return error;
		});
}

function fetchUserInput(userInput, offset) {
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
		.catch((error) => {
			return error;
		});
}

$SEARCH_BTN.addEventListener('click', function (event) {
	let userInput = $USER_INPUT.value;

	cleanPreviousSearchItems();
	hideTrendings();
	hideSuggestions();
	fetchUserInput(userInput);
	cleanSearchInput();

	event.preventDefault();
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
