var ca = null;
window.onload = function(){
    var urlParams = new URLSearchParams(window.location.search);
    var tokens = window.location.hash.match(/\#(?:access_token)\=([\S\s]*?)\&/);
    var token = tokens && tokens.length > 0 ? tokens[1] : null;
    console.log('URLParams: ', urlParams.get('username'));
    console.log('Read LocalStorage: ', window.localStorage.getItem('username'));
    
    var username = urlParams.get('username') || window.localStorage.getItem('username') || 'ScottishRebel67';
    if(username) {
        window.localStorage.setItem('username', username);
        console.log('Write LocalStorage: ', username);
    }
    
    if(!token){
        var redirectUrl = window.location.href.split('?')[0];
        var scope = 'user:act_as'; //user:act_as channel:details:self
        var clientId = urlParams.get('clientid') || window.localStorage.getItem('clientId');
        if(clientId) window.localStorage.setItem('clientId', clientId);
        var authUrl = `https://mixer.com/oauth/authorize?response_mode=fragment&response_type=token&redirect_uri=${redirectUrl}&scope=${scope}&client_id=${clientId}`;
        window.setTimeout(function(){
            window.location = authUrl;
        }, 500)
    }
    console.log('Auth Token', token);
    var options = {
        queryString: {authorization: 'Bearer ' + token},
        authToken: token,
        isBot: true
    };
    
    ca = new carina.Carina(options).open();
    
    var xhr = new XMLHttpRequest();
    xhr.onload = function () {
        if (xhr.status >= 200 && xhr.status < 300) {
            // Runs when the request is successful
            console.log(xhr.responseText);
            var data = JSON.parse(xhr.responseText)[0];
            subscribe(ca, data.channel.id);
        } else {
            // Runs when it's not
            console.log(xhr.responseText);
        }
    };
    xhr.open('GET', 'https://mixer.com/api/v1/users/search?query=' + username);
    xhr.send();    
}
var subscribe = function(ca, id){
    ca.subscribe(`channel:${id}:update`, function (data) {
        console.log('Channel update', data);
    });
    ca.subscribe(`channel:${id}:skill`, function (data) {
        console.log('Channel skills', data);
    });
    ca.subscribe(`channel:${id}:patronageUpdate`, function (data) {
        console.log('Channel skill update', data);
    });    
}
