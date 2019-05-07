
var urlParams = new URLSearchParams(window.location.search);
var token = urlParams.get('token');
var clientId = urlParams.get('clientId');
var redirectUrl = window.location; //https://stephenwelsh.github.io/RebelMeter/
var scope = 'user:act_as'; //user:act_as channel:details:self
if(!token){
    window.location = `https://mixer.com/oauth/authorize?response_type=token&redirect_uri=${redirectUrl}&scope=${scope}&client_id=${clientId}`;
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
