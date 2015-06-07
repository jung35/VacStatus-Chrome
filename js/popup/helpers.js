
function removeOptions(selectbox)
{
    for (var i = selectbox.options.length - 1; i >= 0; i--) selectbox.remove(i);
}

function showLoading(visible)
{
    var loading = document.getElementById('loading');

    if(visible === false) loading.style.display = "none";
    else loading.style.display = "block";
}

function showElement(elementId, display)
{
    var element = document.getElementById(elementId);

    if(typeof display != 'string') display = 'block';
    element.style.display = display;
}

function hideElement(elementId)
{
    var element = document.getElementById(elementId);

    element.style.display = 'none';
}

function setMessage(elementId, text)
{
    document.getElementById(elementId).innerHTML = text;
}