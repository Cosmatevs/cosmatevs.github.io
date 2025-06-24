function debounce(callback, wait) {
	let timeoutId = null;
	return (...args) => {
		window.clearTimeout(timeoutId);
		timeoutId = window.setTimeout(
			() => callback(...args), wait
		);
	};
}

function removeFromArray(array, object) {
	array.splice(array.indexOf(object), 1);
}

function distinctFilter(value, index, array) {
	return array.indexOf(value) === index;
}

function putPlaceholdersInTitles() {
	document.querySelectorAll('*[placeholder]').forEach(element => {
		element.setAttribute('title', element.getAttribute('placeholder'));
	})
}
