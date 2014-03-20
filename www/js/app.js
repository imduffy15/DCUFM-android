var storage = window.localStorage;

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
    .run(function ($http, $rootScope) {
        // Place schedule data into localstorage.
        var cached = storage.getItem('schedule-cached');
        var api = 'feed.json';

        // Only update if older than 86400 seconds.
        if ((Math.round(new Date().getTime() / 1000) - cached) > 86400) {
            $http({
                method: 'GET',
                url: api,
                data: 'crud-action=read',
                headers: {'Content-Type': 'application/x-www-form-urlencoded'}
            })
                .success(function (data) {
                    storage.setItem('schedule', JSON.stringify(data));
                    storage.setItem('schedule-cached', (Math.round(new Date().getTime() / 1000)));
                })
                .error(function (data) {
                    console.log('error' + data);
                })
        }

        var streamUrl = "http://dcufm.redbrick.dcu.ie/stream128.mp3";
        $rootScope.audio = new Audio(streamUrl);
        $rootScope.ready = /(iPad|iPhone|iPod)/g.test(navigator.userAgent);

        $rootScope.audio.addEventListener('play', function () {
            console.log('playing')
        }, false);
        $rootScope.audio.addEventListener('pause', function () {
            console.log('paused')
        }, false);
        $rootScope.audio.addEventListener('error', function () {
            console.log('error');
        }, false);
        $rootScope.audio.addEventListener('waiting', function () {
            console.log('waiting');
        }, false);
        $rootScope.audio.addEventListener('canplay', function () {
            $rootScope.ready = true;
        }, false);

        $rootScope.audio.addEventListener('canplaythrough', function () {
            $rootScope.ready = true;
        }, false);

        $rootScope.audio.addEventListener('ended', function () {
            console.log('stream-ended');
        }, false);

        $rootScope.audio.addEventListener('touchstart', function () {
            $rootScope.audio.play();
        }, false);

    })
    .controller('HomeCtrl', function () {

    })
    .controller('ScheduleCtrl', function ($scope) {
        console.log('ScheduleCtrl');
        $scope.days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
    })
    .controller('ScheduleDayCtrl', function ($scope, $stateParams) {
        $scope.day = $stateParams.day.charAt(0).toUpperCase() + $stateParams.day.substring(1).toLowerCase();
        $scope.headerTitle = $scope.day;
        $scope.schedule = JSON.parse(storage.getItem('schedule'))[$scope.day];
        console.log($scope.schedule);
    })
    .controller('MessageCtrl', function ($scope) {
        console.log('MessageCtrl');

        $scope.sendMessage = function () {
            console.log("sending message");
        }
    })
    .controller('AboutCtrl', function () {
        console.log('AboutCtrl');
    })
    .controller('ListenCtrl', function ($scope, $rootScope) {
        $scope.playpause = function () {
            if (!$rootScope.ready) {
                alert("Connection issue to stream. Try again in a few seconds.");
                return;
            }
            if ($rootScope.audio.paused) {
                $rootScope.audio.play();
            } else {
                $rootScope.audio.pause();
            }
        };

        console.log($rootScope.audio)

        var getTime = function () {
            var date = new Date();
            var hours = date.getHours();
            var ampm = hours >= 12 ? 'pm' : 'am';
            hours = hours % 12;
            hours = hours ? hours : 12;
            return hours + ':' + '00' + ' ' + ampm;
        };

        var getDay = function () {
            var date = new Date();
            var days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday',
                'Friday', 'Saturday'];
            return days[date.getDay()];
        };

        var findShow = function (day, currentTime) {
            var shows = JSON.parse(storage.getItem('schedule'))[day];
            for (var showIndex in shows) {
                var showTime = shows[showIndex].startClock;
                if (showTime == currentTime) {
                    return shows[showIndex];
                }
            }
            return {
                showName: "DCUFM Music Playlist",
                imageURL: 'http://dcufm.com/wp-content/uploads/2013/10/dcufm-400x4001.jpg'
            }
        };

        $scope.currentShow = findShow(getDay(), getTime());
        console.log($scope.currentShow);
    })
    .directive('rwdimgmap', function ($window) {
        return{
            restrict: 'CA',
            link: function (scope, element, attrs) {

                var w = attrs.width;
                var h = attrs.height;

                console.log(w + ", " + h);

                function resize() {
                    elem = angular.element(element)[0];

                    if (!w || !h) {
                        var temp = new Image();
                        temp.src = elem.src;
                        if (!w)
                            w = temp.width;
                        if (!h)
                            h = temp.height;
                    }

                    var wPercent = elem.width / 100,
                        hPercent = elem.height / 100,
                        mapname = attrs.usemap.replace('#', ''),
                        areas = angular.element(document.querySelector('map[name="' + mapname + '"]')).find('area');

                    for (var i = 0; i < areas.length; i++) {
                        var area = angular.element(areas[i]);

                        if (!area.data('coords')) {
                            area.data('coords', area.attr('coords'));
                        }

                        var coords = area.data('coords').split(','),
                            coordsPercent = new Array(coords.length);
                        coordsPercent = new Array(coords.length);

                        for (var j = 0; j < coordsPercent.length; ++j) {
                            if (j % 2 === 0) {
                                coordsPercent[j] = parseInt(((coords[j] / w) * 100) * wPercent);
                            } else {
                                coordsPercent[j] = parseInt(((coords[j] / h) * 100) * hPercent);
                            }
                        }
                        area.attr('coords', coordsPercent.toString());
                    }
                }

                angular.element(document).ready(function () {
                    resize();
                });

                angular.element($window).bind("resize", function () {
                    resize();
                });

            }
        };
    });