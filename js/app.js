var ca = null;
// window.onload = function(){

//     // var tokens = window.location.hash.match(/\#(?:access_token)\=([\S\s]*?)\&/);
//     // var token = tokens && tokens.length > 0 ? tokens[1] : null;
    
//     var username = urlParams.get('username') || window.localStorage.getItem('username') || 'ScottishRebel67';
    
//     if(!token){
//         var redirectUrl = window.location.href.split('?')[0];
//         var scope = 'user:act_as'; //user:act_as channel:details:self
//         var clientId = urlParams.get('clientid') || window.localStorage.getItem('clientId');
//         if(clientId) window.localStorage.setItem('clientId', clientId);
//         var stateObj = {
//             username: username,
//             clientId: clientId
//         };
//         var state = window.btoa(JSON.stringify(stateObj));
//         var authUrl = `https://mixer.com/oauth/authorize?response_type=token&redirect_uri=${redirectUrl}&scope=${scope}&client_id=${clientId}&state=${state}`;
//         window.setTimeout(function(){
//             window.location = authUrl;
//         }, 500)
//     }

//     console.log('Auth Token', token);
//     if(authObj.state){
//         var stateObj = JSON.parse(window.atob(decodeURIComponent(authObj.state)));
//         username = stateObj.username;
//     }
//     if(username) {
//         window.localStorage.setItem('username', username);
//         console.log('Write LocalStorage: ', username);
//     }

//     var options = {
//         queryString: {authorization: 'Bearer ' + token},
//         authToken: token,
//         isBot: true
//     };
    
//     ca = new carina.Carina(options).open();



    
//     var xhr = new XMLHttpRequest();
//     xhr.onload = function () {
//         if (xhr.status >= 200 && xhr.status < 300) {
//             // Runs when the request is successful
//             console.log(xhr.responseText);
//             var data = JSON.parse(xhr.responseText)[0];
//             subscribe(ca, data.channel.id);
//         } else {
//             // Runs when it's not
//             console.log(xhr.responseText);
//         }
//     };
//     xhr.open('GET', 'https://mixer.com/api/v1/users/search?query=' + username);
//     xhr.send();    
// }

var app = angular.module("app", ['ngResource']);
app.controller("HelloWorldCtrl", function($scope, MixerUsers, MixerRealtime) {  
    $scope.message="Hello World123" ;
    function init(){
        var urlParams = new URLSearchParams(window.location.search);
        $scope.auth = {};
        $scope.state = {};
        if(window.location.hash){
            var parts = window.location.hash.split('&');
            parts.forEach(function(part){
                var segments = part.split('=');
                if(segments.length > 1)
                    $scope.auth[segments[0]]= segments[1];
            });    
        }
        var token = $scope.auth['#access_token'];
        if(!token){
            var redirectUrl = window.location.href.split('?')[0];
            var scope = 'user:act_as'; //user:act_as channel:details:self
            var clientId = urlParams.get('clientid') || window.localStorage.getItem('clientId');
            if(clientId) window.localStorage.setItem('clientId', clientId);
            var stateObj = {
                username: username,
                clientId: clientId
            };
            var state = window.btoa(JSON.stringify(stateObj));
            var authUrl = `https://mixer.com/oauth/authorize?response_type=token&redirect_uri=${redirectUrl}&scope=${scope}&client_id=${clientId}&state=${state}`;
            window.location = authUrl;
        }
        this.realtime = MixerRealtime.realtime(token);
        this.channel = MixerChannel.channel(token);
        if($scope.auth.state){
            $scope.state = JSON.parse(window.atob(decodeURIComponent($scope.auth.state)));
            //$scope.username = stateObj.username;
            MixerUsers.search({ query: $scope.state.username }).$promise.then(function(users){
                $scope.user = users[0];
                $scope.id = $scope.user.channel.id;
                // Subscribe to events
                this.realtime.subscribe(`channel:${$scope.id}:patronageUpdate`, function(data){
                    console.log('Channel Sparks Update: ', data);
                });
                this.channel.status({id: $scope.id}).$promise.then(function(status){
                    console.log('Channel Sparks: ', status.patronageEarned);
                });
            });
        }
    };
    init();
    
});
app.factory('MixerUsers',function($resource){
    return $resource('https://mixer.com/api/v1/users',null,{
        search:{
            url: 'https://mixer.com/api/v1/users/search',
            isArray: true
        }
    });
});
app.factory('MixerChannel',function($resource){
    return {
        channel: function(token){
            return $resource('https://mixer.com/api/v2/levels/patronage/channels/:id', null, {
                status:{
                    url: 'https://mixer.com/api/v2/levels/patronage/channels/:id/status',
                    headers:{
                        'Authorization': 'Bearer ' + token
                    }        
                }
            });
        }
    };
});
app.factory('MixerRealtime', function(){
    var mixer = {};
    mixer.realtime= function(token){
        mixer.service = new carina.Carina({ queryString: {authorization: 'Bearer ' + token}}).open();
        return mixer;
    };
    mixer.subscribe = function(event, callback){
        mixer.service.subscribe(event, function(data){
            callback(data, event);
        });
    };
    return mixer;
});
// app.factory("MixerRealtime",function(){
//     var realtime = {};
//     realtime.init = function(options){
//         realtime.options = options || realtime.options;
//         realtime.service = new carina.Carina(realtime.options).open();
//     };
//     realtime.subscribe = function(event, callback){
//         if(realtime.service)
//         {
//             realtime.service.subscribe(event, function(data){
//                 callback(data, event);
//             });
//         }
//     }
//     return realtime;
// });

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
