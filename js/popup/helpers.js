
function removeOptions(selectbox)
{
    var i;
    for (i = selectbox.options.length - 1; i >= 0; i--) selectbox.remove(i);
}

function showLoading(visible)
{
    var loading = document.getElementById('loading');

    if(visible) loading.style.display = "block";
    else loading.style.display = "none";
}

function showElement(elementId, display)
{
    var element = document.getElementById(elementId);

    if(display == undefined) display = 'block';
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