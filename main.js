const API_KEY = '8pqxEvveACSzdk5vHEf0pTNeDOC2NYOc';

const $SEARCH_BTN = document.querySelector('.search-btn');
const $SEARCH_INPUT = document.querySelector('#search-input');

const $RESULTS_CONTAINER = document.querySelector('.results-container');

function getSearchResults(searchInput) {
	const found = 'testeo de string';

	console.log(found);
}

function crearItem(gif) {
	const $div = document.createElement('div');
	$div.className = 'results-item';

	const $img = document.createElement('img');
	$img.className = 'results-item__img';
	$img.src = gif;

	$div.appendChild($img);
	$RESULTS_CONTAINER.appendChild($div);
}

{
	/* 
	<div class="results-container">
		<div class="results-item">
			<img class="results-item__img" src="" alt="" />
			<div class="results-item__text">text content test</div>
		</div>
	</div> 
*/
}

$SEARCH_BTN.addEventListener('click', function(event) {
	let searchInput = $SEARCH_INPUT.value;
	//	Here I should do something with the input (the fetch)

	const found = fetch('https://api.giphy.com/v1/gifs/search?api_key=' + API_KEY + '&q=' + searchInput)
		.then(Response => {
			return Response.json();
		})
		.then(data => {
			for (let i = 0; i < data.data.length; i++) {
				crearItem(`${data.data[i].images.preview_webp.url}`);
			}
		})
		.catch(error => {
			return error;
		});

	$SEARCH_INPUT.value = '';
	searchInput = $SEARCH_INPUT.value;
	event.preventDefault();

	return found;
});
