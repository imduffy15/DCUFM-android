storage = window.localStorage;

angular.module('DCUFMApp', ['ionic'])
    .config(function ($stateProvider, $urlRouterProvider) {

        $stateProvider
            .state('home', {
                url: '/home',
                templateUrl: 'home.html',
                controller: 'HomeCtrl'
            })
            .state('schedule', {
                url: '/schedule',
                templateUrl: "schedule.html",
                controller: 'ScheduleCtrl'
            })
            .state('scheduleday', {
                url: '/schedule/:day',
                templateUrl: "scheduleday.html",
                controller: 'ScheduleDayCtrl'
            })
            .state('message', {
                url: '/message',
                templateUrl: 'message.html',
                controller: 'MessageCtrl'
            })
            .state('about', {
                url: "/about",
                templateUrl: "about.html",
                controller: 'AboutCtrl'
            })
            .state('listen', {
                url: "/listen",
                templateUrl: "listen.html",
                controller: 'ListenCtrl'
            });


        $urlRouterProvider.otherwise("/home");

    })

    .controller('HomeCtrl', function ($scope, $http) {

        ionic.Platform.ready(function() {
        });

        var schedule = cached = storage.getItem('schedule-cached');
        var api = 'feed.json'

        if((Math.round(new Date().getTime() / 1000) - cached) > 86400) {
            $http({
                method: 'GET',
                url: api,
                data: 'crud-action=read',
                headers: {'Content-Type': 'application/x-www-form-urlencoded'}
            })
            .success(function(data) {
                    storage.setItem('schedule', JSON.stringify(data));
                    storage.setItem('schedule-cached', (Math.round(new Date().getTime() / 1000)));
            })
            .error(function(data) {
                    console.log('error' + data);
            })
        }
    })
    .controller('ScheduleCtrl', function ($scope) {
        console.log('ScheduleCtrl');
        $scope.days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
    })
    .controller('ScheduleDayCtrl', function ($scope, $stateParams) {
        $scope.day = $stateParams.day.charAt(0).toUpperCase() + $stateParams.day.substring(1).toLowerCase();
        $scope.headerTitle = $scope.day
        $scope.schedule = JSON.parse(storage.getItem('schedule'))[$scope.day];
        console.log($scope.schedule)
    })
    .controller('MessageCtrl', function ($scope) {
        console.log('MessageCtrl');

        $scope.sendMessage = function() {
            console.log("sending message");
        }
    })
    .controller('AboutCtrl', function ($scope) {
        console.log('AboutCtrl');
    })
    .controller('ListenCtrl', function ($scope) {
        console.log('ListenCtrl');

        var streamUrl = "http://dcufm.redbrick.dcu.ie/stream128.mp3"
        var streamAudio = new Audio(streamUrl);
        $scope.isPlaying = false;

        $scope.changeState = function() {
            if($scope.isPlaying) {
                stop();
            } else {
                play();
            }
        }

        var play = function() {
            streamAudio.play();
            $scope.isPlaying = true;

            streamAudio.addEventListener("error", function() {
                console.log('streamAudio ERROR');
            }, false);
            streamAudio.addEventListener("canplay", function() {
                console.log('streamAudio CAN PLAY');
            }, false);
            streamAudio.addEventListener("waiting", function() {
                //console.log('streamAudio WAITING');
                $scope.isPlaying = false;
            }, false);
            streamAudio.addEventListener("playing", function() {
                $scope.isPlaying = true;
            }, false);
            streamAudio.addEventListener("ended", function() {
                console.log('Streaming failed. Possibly due to a network error.');
            }, false);
        }

        var stop = function() {
            streamAudio.pause();
            $scope.isPlaying = false;
        }

        var getTime = function() {
            var date = new Date();
            var hours = date.getHours();
            var ampm = hours >= 12 ? 'pm' : 'am';
            hours = hours % 12;
            hours = hours ? hours : 12;
            var strTime = hours + ':' + '00' + ' ' + ampm;
            return strTime;
        }

        var getDay = function() {
            var date = new Date();
            var days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday',
                'Friday', 'Saturday'];
            return days[date.getDay()];
        }

        var findShow = function(day, time) {
            console.log(day, time);
            shows = JSON.parse(storage.getItem('schedule'))[day];
            for(var show in shows) {
                if(show.startTime.equals(time)) {
                    return currentShow;
                }
            }
            return {
                showName: "DCUFM Music Playlist",
                imageURL: 'http://dcufm.com/wp-content/uploads/2013/10/dcufm-400x4001.jpg'
            }
        }

        $scope.currentShow = findShow(getDay(), getTime());
        console.log($scope.currentShow);
    })


