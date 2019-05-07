
var urlParams = new URLSearchParams(window.location.search);
var tokens = window.location.hash.match(/\#(?:access_token)\=([\S\s]*?)\&/);
var token = tokens && tokens.length > 0 ? tokens[1] : null;

//var redirectUrl = encodeURIComponent(window.location); //https://stephenwelsh.github.io/RebelMeter/
var redirectUrl = window.location.href.split('?')[0];

if(!token){
    var scope = 'user:act_as'; //user:act_as channel:details:self
    var state = window.location.search;
    if (state.charAt(0) === "?")
        state = state.substring(1);
    var clientId = urlParams.get('clientid');
    var authUrl = `https://mixer.com/oauth/authorize?response_type=token&redirect_uri=${redirectUrl}&scope=${scope}&client_id=${clientId}&state=${state}`;
    window.location = authUrl;
    // console.log('Auth URL', authUrl);
    // window.setTimeout(function(){
    //     window.location = authUrl;
    // }, 5000);
}
console.log('Auth Token', token);
var options = {
    queryString: {authorization: 'Bearer ' + token},
    authToken: token,
    isBot: true
};

var ca = new carina.Carina(options).open();

var username = urlParams.get('user') || 'ScottishRebel67';

var xhr = new XMLHttpRequest();
xhr.onload = function () {
	if (xhr.status >= 200 && xhr.status < 300) {
		// Runs when the request is successful
        console.log(xhr.responseText);
        var data = JSON.parse(xhr.responseText)[0];
        subscribe(data.id);        
	} else {
		// Runs when it's not
		console.log(xhr.responseText);
	}
};
xhr.open('GET', 'https://mixer.com/api/v1/users/search?query='+username);
xhr.send();

var subscribe = function(id){
    ca.subscribe(`channel:${id}:update`, function (data) {
        console.log('Channel update', data);
    });
    ca.subscribe(`channel:${id}:patronageUpdate`, function (data) {
        console.log('Channel skill update', data);
    });    
}
