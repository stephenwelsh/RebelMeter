
var urlParams = new URLSearchParams(window.location.search);
var tokens = window.location.hash.match(/\#(?:access_token)\=([\S\s]*?)\&/);
var token = tokens ? tokens[0].split('=')[0] : null;

//var redirectUrl = encodeURIComponent(window.location); //https://stephenwelsh.github.io/RebelMeter/
var redirectUrl = window.location.href.split('?')[0];

var scope = 'user:act_as'; //user:act_as channel:details:self
if(!token){
    var clientId = urlParams.get('clientid');
    var authUrl = `https://mixer.com/oauth/authorize?response_type=token&redirect_uri=${redirectUrl}&scope=${scope}&client_id=${clientId}`;
    window.location = authUrl;
    // console.log('Auth URL', authUrl);
    // window.setTimeout(function(){
    //     window.location = authUrl;
    // }, 5000);
}
console.log('Auth Token', token);
var options = {
    authToken: token
};

var ca = new carina.Carina(options).open();

ca.subscribe('channel:1:update', function (data) {
    console.log('Channel update', data);
});
ca.subscribe('channel:1:patronageUpdate', function (data) {
    console.log('Channel1 skill update', data);
});
ca.subscribe('channel:35122269:patronageUpdate', function (data) {
    console.log('Rebel skill update', data);
});
