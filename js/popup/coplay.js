var matches = [];

function fetchCoplay(pageNumber)
{
	hideMain();
	showLoading();

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
			friendHolder;

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

			friendHolder = coplayGroup.getElementsByClassName('friendBlock');

			for(var x = 0; x < friendHolder.length; x++)
			{
				var player = friendHolder.item(x);

				match.players.push({
					steam_id: "U:1:"+player.getAttribute('data-miniprofile'),
					avatar: player.getElementsByTagName('img').item(0).getAttribute('src'),
					display_name: player.getElementsByTagName('div').item(2).innerText.trim()
							.replace('\t','').replace('\n','').replace(/(\n.+)+/, '').replace('<br />','')
				});
			}

			console.log(match);

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

		matchElement.addEventListener('click', function() {
			displayPlayers(myMatches[key]);
		});

		matchesContainer.appendChild(matchElement);
	});
}

function displayPlayers(thisMatch)
{
	var playersElement, backButton, titleElement,
		timeElement, playerCheckBox, playerElement,
		playerAvatar, playerName, toggleButton,
		addButton, clear, listTextarea;

	hideElement('fetch-coplay');
	hideElement('matches');
	hideElement('links');
	showElement('players');

	playersElement = document.getElementById('players');
	playersElement.innerHTML = "";

	backButton = document.createElement('button');
	backButton.className = "btn btn-cancel";
	backButton.innerHTML = "&larr; Back";
	backButton.addEventListener('click', backToMatches);
	playersElement.appendChild(backButton);

	toggleButton = document.createElement('button');
	toggleButton.className = "btn btn-toggle-select";
	toggleButton.innerHTML = "Un/select All";
	toggleButton.addEventListener('click', toggleSelect);
	playersElement.appendChild(toggleButton);

	titleElement = document.createElement('h4');
	titleElement.className = "title";
	titleElement.innerHTML = thisMatch.gameTitle;
	playersElement.appendChild(titleElement);

	timeElement = document.createElement('div');
	timeElement.className = "time";
	timeElement.innerHTML = thisMatch.gameTime;
	playersElement.appendChild(timeElement);

	thisMatch.players.forEach(function(data, key) {
		playerCheckBox = document.createElement('input');
		playerCheckBox.className = "player-checkbox";
		playerCheckBox.type = "checkbox";
		playerCheckBox.id = "player_"+key;
		playerCheckBox.setAttribute('data-steam', data.steam_id);
		playersElement.appendChild(playerCheckBox);

		playerElement = document.createElement('label');
		playerElement.className = "player-item";
		playerElement.setAttribute('for', "player_"+key);

		playerAvatar = document.createElement('img');
		playerAvatar.className = "avatar";
		playerAvatar.src = data.avatar;
		playerElement.appendChild(playerAvatar);

		playerName = document.createElement('div');
		playerName.className = "display-name";
		playerName.innerHTML = data.display_name;
		playerElement.appendChild(playerName);

		playersElement.appendChild(playerElement);
	});

	clear = document.createElement('div');
	clear.className = "clear";
	playersElement.appendChild(clear);

	listTextarea = document.createElement('textarea');
	listTextarea.id = "listTextarea";
	listTextarea.setAttribute('placeholder', 'A little description to help remember');
	listTextarea.setAttribute('rows', 3);
	playersElement.appendChild(listTextarea);

	addButton = document.createElement('button');
	addButton.className = "btn btn-add-to-list";
	addButton.innerHTML = "Add to list";
	addButton.addEventListener('click', sendToList);
	playersElement.appendChild(addButton);
}

function toggleSelect()
{
	var checkboxes = document.getElementsByClassName('player-checkbox');

	var checked = checkboxes.item(0).checked == false;

	for(var i = 0; i < checkboxes.length; i++)
	{
		checkboxes.item(i).checked = checked;
	}
}

function sendToList()
{
	var checkboxes, description, steamId, search;
	checkboxes = document.getElementsByClassName('player-checkbox');
	description = document.getElementById('listTextarea').value;
	steamId = [];

	for(var i = 0; i < checkboxes.length; i++)
	{
		var checkbox = checkboxes.item(i);
		if(checkbox.checked) steamId.push(checkbox.getAttribute('data-steam'));
	}

	if(steamId.length == 0) return;

	search = steamId.join(',');

	chrome.storage.sync.get(['private_key', 'list_id'], function (data) {
		var privateKey, listId, url, xhr;

		privateKey = data['private_key'];
		listId = data['list_id'];

		if(privateKey == undefined || listId == undefined) return;

		hideMain();
		showLoading();

		url = "https://vacstat.us/api/v1/list/add/many";
		url += "?_key=" + privateKey + "&list_id=" + listId;
		url += "&search=" + search + "&description=" + description;

		xhr = new XMLHttpRequest();
		xhr.open("POST", url, true);
		xhr.onreadystatechange = function () {
			if (xhr.readyState == 4) {
				var resp = JSON.parse(xhr.responseText);
				var opt;
				
				showElement('fetch-coplay');
				showElement('matches');
				showLoading(false);

				if (!resp.error) {
					opt = {
						type: "basic",
						iconUrl: "/img/vs128.png",
						title: 'Players have been added',
						message: 'The players you selected have successfully been added to the list'
					};
				} else {
					opt = {
						type: "basic",
						iconUrl: "/img/vs128.png",
						title: 'Players have not been added',
						message: 'Something went wrong! Please check private key to see if you\'re using the correct one!'
					};
				}

				chrome.notifications.create("", opt, function(id) {
					console.error(chrome.runtime.lastError);
				});
			}
		}
		xhr.send();

	});
}

function backToMatches()
{
	showElement('fetch-coplay');
	showElement('matches');
	showElement('links');
	hideElement('players');
}

function hideMain()
{
	hideElement('fetch-coplay');
	hideElement('matches');
	hideElement('players');
}

document.getElementById('getCoplayMatches').addEventListener('click', fetchCoplay);