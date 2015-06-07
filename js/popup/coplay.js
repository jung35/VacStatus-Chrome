function fetchCoplay(pageNumber)
{
	var url = "http://steamcommunity.com/my/friends/coplay";

	if(typeof pageNumber == 'number')
	{
		url += "?p=" + pageNumber;
	}

	var xhr = new XMLHttpRequest();
	xhr.open("GET", url);
	xhr.onreadystatechange = function ()
	{
		if (xhr.readyState != 4) return;
		var parser, page, numberOfPages, coplayGroups, coplayGroup, matches, match;

		var gameListRowItem, gameTitle;

		parser = new DOMParser();
		page = parser.parseFromString(xhr.responseText, "text/html");

		coplayGroups = page.getElementsByClassName('coplayGroup');

		matches = [];
		for(var i = 0; i < coplayGroups.length; i++)
		{
			match = {};
			coplayGroup = coplayGroups.item(i);

			gameListRowItem = coplayGroup.getElementsByClassName('gameListRowItem').item(0);
			gameTitle = gameListRowItem.getElementsByTagName('h4').item(0).innerText;
			gameTime = gameListRowItem.childNodes[4].nodeValue.trim().replace('\t','');

			console.log([coplayGroup], [gameListRowItem], gameTitle, gameTime);
		}
		
		if(typeof pageNumber != 'number') {
			numberOfPages = page.getElementsByClassName('pagingPageLink').length + 1;
			for(var p = 2; p <= numberOfPages; p++)
			{
				fetchCoplay(p);
			}
		}
	}
	xhr.send();
}

document.getElementById('fetch-coplay').addEventListener('click', fetchCoplay);