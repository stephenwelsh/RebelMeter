var app = angular.module("app", ['ngResource']);
app.controller("HelloWorldCtrl", function($scope, $timeout, MixerUsers, MixerChannel, MixerRealtime, SparkSteps) {  
    $scope.message="Hello World123" ;
    $scope.flashClass = [];
    $scope.items = [1,2,3,4,5,6,7];
    $scope.shakeAmount = 0;
    $scope.shake = function(amount){
        $scope.shakeAmount = amount;
        $timeout(shakeTimer, 830);
    };
    var shakeTimer = function() {
        $scope.shakeAmount = 0;
    }
    $scope.getShake = function(index){
        return index < $scope.shakeAmount ? "shake" :"";
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
        }
        var token = $scope.auth['#access_token'];
        if(!token){
            var username = urlParams.get('username') || window.localStorage.getItem('username') || 'ScottishRebel67';
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
            $scope.shake(Math.random() * $scope.items.length);
            $timeout( function(){
                $scope.flashClass.length = 0;
            }, 1000 );
        });
    
        if($scope.auth.state){
            $scope.state = JSON.parse(window.atob(decodeURIComponent($scope.auth.state)));
            //$scope.username = stateObj.username;
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
app.value('SparkSteps', [5000000, 10000000, 15000000, 20000000, 30000000, 40000000,55000000, 70000000, 90000000, 115000000, 150000000, 200000000]);
