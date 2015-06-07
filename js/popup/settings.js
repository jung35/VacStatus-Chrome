function doSavePrivateKey()
{
    var privateKey = document.getElementById('private_key').value;

    if(privateKey.length == 0) {
        setMessage('finish-configure-message', 'Please fill in all of the fields');
        showElement('finish-configure-message');
        return;
    }

    showLoading();

    hideElement('finish-configure-message');
    hideElement('privateKey-form');

    chrome.storage.sync.set({ private_key: privateKey }, function () {
        fetchSetList(privateKey);
    });
}

function doSaveListId()
{
    var listElement, listId;

    listElement = document.getElementById('select_list');
    listId = listElement.options[listElement.selectedIndex].value;

    chrome.storage.sync.set({ list_id: listId }, function () {
        hideSettings();
    });
}

function fetchSetList(privateKey)
{
    chrome.storage.sync.get("list_id", function (data) {
        var listId = data['list_id'];

        if(listId != undefined)
        {
            fetchCustomList(privateKey, listId);
            return;
        }

        fetchCustomList(privateKey, null);
    });
}

function fetchCustomList(privateKey, listId)
{
    var xhr = new XMLHttpRequest();
    xhr.open("GET", "https://vacstat.us/api/v1/list?_key=" + privateKey);
    xhr.onreadystatechange = function ()
    {
        var myList, data, listOption;

        if (xhr.readyState != 4) return;

        data = JSON.parse(xhr.responseText);
        if (data.error)
        {
            showLoading(false);
            setMessage('finish-configure-message', 'Please submit valid private key');
            showElement('privateKey-form');
            showElement('finish-configure-message');
            return;
        }

        myList = data.my_list;

        removeOptions(document.getElementById("select_list"));

        myList.forEach(function (item) {
            listOption = document.createElement('option');

            listOption.value = item.id;
            listOption.textContent = item.title;

            if(item.id == listId) listOption.selected = true;

            document.getElementById("select_list").appendChild(listOption);
        });

        showLoading(false);
        showElement('selectList-form');
    }
    xhr.send();
}


function showSettings(canCancel)
{
    showElement('settings');
    showElement('privateKey-form');

    hideElement('main');
    hideElement('links');

    if(canCancel) showElement('cancelSettings', 'inline-block');
}

function hideSettings()
{
    showElement('main');
    showElement('links');

    hideElement('settings');
    hideElement('privateKey-form');
    hideElement('selectList-form');
    hideElement('cancelSettings');
}

function backSettings()
{
    showElement('privateKey-form');
    hideElement('selectList-form');
}

function loadSaved()
{
    chrome.storage.sync.get(['private_key', 'list_id'], function (data) {
        var privateKey, listId;

        privateKey = data['private_key'];
        listId = data['list_id'];

        if(privateKey == undefined || listId == undefined)
        {
            showSettings(false);
        } else {
            hideSettings();
            fetchMatches();
        }

        if(privateKey != undefined) document.getElementById('private_key').value = privateKey;

        showLoading(false);
    });
}

document.addEventListener('DOMContentLoaded', loadSaved);

document.getElementById('savePrivateKey').addEventListener('click', doSavePrivateKey);
document.getElementById('saveSelectedList').addEventListener('click', doSaveListId);

document.getElementById('editSettings').addEventListener('click', showSettings);
document.getElementById('cancelSettings').addEventListener('click', hideSettings);
document.getElementById('backSettings').addEventListener('click', backSettings);