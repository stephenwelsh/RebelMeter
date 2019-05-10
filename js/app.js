var app = angular.module("app", ['ngResource']);
app.controller("HelloWorldCtrl", function($scope, $timeout, MixerUsers, MixerChannel, MixerRealtime, SparkSteps) {  
    $scope.message="Hello World123" ;
    $scope.flashClass = [];
    $scope.items = [];
    $scope.shakeAmount = 0;
    $scope.shake = function(amount){
        $scope.shakeAmount = Math.max(1, $scope.items.length * amount/100);
        $timeout(shakeTimer, 830);
    };
    var shakeTimer = function() {
        $scope.shakeAmount = 0;
    }
    $scope.getShake = function(index){
        return index < $scope.shakeAmount ? "shake" :"";
    };
    $scope.setHats = function(amount){
        var hats = Math.max(1, Math.round(10 * amount/100));
        var index = 1;
        if(hats != $scope.items.length){
            $scope.items.length = 0;
            for(var i = 0; i < hats; i++){
                $scope.items.push(index++);
            }
        }
    };

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
            $scope.state = JSON.parse(window.atob(decodeURIComponent($scope.auth['state'])));
        }
        var username = $scope.state.username || urlParams.get('username') || window.localStorage.getItem('username') || 'ScottishRebel67';
        var clientid = $scope.state.clientid || urlParams.get('clientid') || window.localStorage.getItem('clientid');
        var token = $scope.auth['#access_token'] || urlParams.get('token') || window.localStorage.getItem('token');
        var expires = $scope.auth['expires_in'] || urlParams.get('expires') || window.localStorage.getItem('expires');
        if(!window.location.hash && username && clientid){
            window.localStorage.setItem('clientid', clientid);
            window.localStorage.setItem('username', username);
            $scope.state.clientid = clientid;
            $scope.state.username = username;
        }
        if(!token && clientid){
            var redirectUrl = window.location.href.split('?')[0];
            var scope = 'user:act_as'; //user:act_as channel:details:self
            var state = window.btoa(JSON.stringify({
                username: username,
                clientid: clientid
            }));
            window.location = `https://mixer.com/oauth/authorize?response_type=token&redirect_uri=${redirectUrl}&scope=${scope}&client_id=${clientid}&state=${state}`;
        }
        else if($scope.auth['#access_token'] && $scope.auth['state']){
            window.location = window.location.href.split('?')[0] + `?token=${token}&expires=${expires}&username${username}`;
        }
        else if(!token){
            window.alert('You must provide a clientid!');
            return;
        }
        if(token) window.localStorage.setItem('token', token);
        if(expires) window.localStorage.setItem('expires', expires);

        // if(!token){
        //     var username = urlParams.get('username') || window.localStorage.getItem('username') || 'ScottishRebel67';
        //     var redirectUrl = window.location.href.split('?')[0];
        //     var scope = 'user:act_as'; //user:act_as channel:details:self
        //     var clientId = urlParams.get('clientid') || window.localStorage.getItem('clientId');
        //     if(clientId) window.localStorage.setItem('clientId', clientId);
        //     var stateObj = {
        //         username: username,
        //         clientId: clientId
        //     };
        //     var state = window.btoa(JSON.stringify(stateObj));
        //     var authUrl = `https://mixer.com/oauth/authorize?response_type=token&redirect_uri=${redirectUrl}&scope=${scope}&client_id=${clientId}&state=${state}`;
        //     window.location = authUrl;
        // }
        this.realtime = MixerRealtime.realtime(token);
        this.channel = MixerChannel.channel(token);
        $scope.$watch('sparks.patronageEarned', function(newSparks, oldSparks){
            if(!$scope.sparks) return;
            // TODO: Flash brightness/duration based on the difference between new/old?
            var min = 0;
            var max = SparkSteps[$scope.sparks.currentMilestoneId];
            if($scope.sparks.currentMilestoneId > 0){
                min = SparkSteps[$scope.sparks.currentMilestoneId - 1];
            }
            $scope.sparks.percentage = (100 * (newSparks - min))/(max - min);
            $scope.flashClass.push('flash_once');
            $scope.setHats($scope.sparks.percentage);
            var delta = newSparks - oldSparks;
            $scope.shake(delta/5000*100);
            //$scope.shake(Math.random() * $scope.items.length);
            $timeout( function(){
                $scope.flashClass.length = 0;
            }, 1000 );
        });
        MixerUsers.search({ query: $scope.state.username }).$promise.then(function(users){
            $scope.user = users[0];
            $scope.id = $scope.user.channel.id;
            // Subscribe to events
            this.realtime.subscribe(`channel:${$scope.id}:patronageUpdate`, function(data){
                console.log('Channel Sparks Update: ', data);
                $scope.$apply(function(){
                    $scope.sparks = data;
                });
            });
            this.channel.status({id: $scope.id}).$promise.then(function(data){
                console.log('Channel Sparks: ', data.patronageEarned);
                $scope.sparks = data;
            });
        });
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
app.value('SparkSteps', [5000000, 10000000, 15000000, 20000000, 30000000, 40000000,55000000, 70000000, 90000000, 115000000, 150000000, 200000000]);
