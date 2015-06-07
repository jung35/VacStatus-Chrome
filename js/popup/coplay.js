var matches = [];

function fetchCoplay(pageNumber)
{
	showLoading(true);
	hideElement('fetch-coplay');

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
		var parser, page, numberOfPages, coplayGroups, coplayGroup, match,
			friendHolder, player;

		var gameListRow;

		parser = new DOMParser();
		page = parser.parseFromString(xhr.responseText, "text/html");

		coplayGroups = page.getElementsByClassName('coplayGroup');

		if(typeof pageNumber != 'number')
		{
			matches = [];
		}

		for(var i = 0; i < coplayGroups.length; i++)
		{
			coplayGroup = coplayGroups.item(i);

			gameListRow = coplayGroup.getElementsByClassName('gameListRow').item(0);

			match = {
				gameImg: gameListRow.getElementsByTagName('img').item(0).getAttribute('src'),
				gameTitle: gameListRow.getElementsByTagName('h4').item(0).innerText,
				gameTime: gameListRow.getElementsByClassName('gameListRowItem')
							.item(0).childNodes[4].nodeValue.trim()
							.replace('\t','').replace('Played on ', '').replace(' @', ','),
				players: []
			};

			friendHolder = coplayGroup.getElementsByClassName('friendHolder');

			for(var x = 0; x < friendHolder.length; x++)
			{
				player = coplayGroups.item(i);
				match.players.push({
					steam_id: player.getElementsByClassName('friendCheckboxLabel').item(0).getAttribute('name').replace('friendbox_[','').replace(']',''),
					avatar: player.getElementsByTagName('img').item(0).getAttribute('src'),
					display_name: player.getElementsByTagName('p').item(0).getElementsByTagName('a').item(0).innerText
				});
			}

			matches.push(match)
		}
		
		numberOfPages = page.getElementsByClassName('pagingPageLink').length + 1;

		if(typeof pageNumber != 'number')
		{
			for(var p = 2; p <= numberOfPages; p++) fetchCoplay(p);
		} else if(pageNumber == numberOfPages) {
			chrome.storage.local.set({ matches: matches }, function () {
		        fetchMatches();
		    });
		}
	}
	xhr.send();
}

function fetchMatches()
{
    chrome.storage.local.get("matches", function (data) {
    	var storedMatches = data['matches'];
    	if(storedMatches != undefined) displayMatches(storedMatches);
    });
}

function displayMatches(myMatches)
{
	showLoading(false);
	showElement('fetch-coplay');
	showElement('matches');

	var matchesContainer = document.getElementById('matches');

	matchesContainer.innerHTML = "";

	myMatches.forEach(function (match, key) {
		var matchElement, imgElement, matchTitleElement, matchTimeElement, playerCountElement;

		matchElement = document.createElement('div');
        matchElement.className = "match-item";
        matchElement.setAttribute("data-id", key);

        // imgElement = document.createElement('div');
        // imgElement.className = "background";
        // imgElement.setAttribute('style', "background-image: url("+match.gameImg+");");
        // matchElement.appendChild(imgElement);

		matchTitleElement = document.createElement('div');
        matchTitleElement.className = "title";
        matchTitleElement.innerHTML = match.gameTitle;

		matchTimeElement = document.createElement('div');
        matchTimeElement.className = "time";
        matchTimeElement.innerHTML = match.gameTime;
        matchTitleElement.appendChild(matchTimeElement);
        
        matchElement.appendChild(matchTitleElement);


		playerCountElement = document.createElement('div');
        playerCountElement.className = "player-count";
        playerCountElement.innerHTML = match.players.length;
        matchElement.appendChild(playerCountElement);

        matchesContainer.appendChild(matchElement);
	});
}

document.getElementById('getCoplayMatches').addEventListener('click', fetchCoplay);