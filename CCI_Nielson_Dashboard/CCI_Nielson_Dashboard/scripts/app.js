/*----------------------------------------------------------------------------------------------------*/
/*          Author: Rahul kumar (Software Engineer, F&B)                                              */
/*          Date: 03-12-2019                                                                          */
/*          Discription: This page contains the UI-Router configuration to be used across states      */
/*----------------------------------------------------------------------------------------------------*/

"use strict";
var ReleaseMode = false;
var applicationPath = '/';
var apiUrl = '/API';
var automationData = {};
var csshtmlver = "bust" + (new Date()).toLocaleDateString();

define(['angularAMD', 'angular-ui-route', 'angular-css', 'angular-animate'], function (angularAMD) {
    var app = angular.module("myapp", ['ui.router','angularCSS','ngAnimate']);
    app.config(['$stateProvider', '$urlRouterProvider', '$locationProvider', function ($stateProvider, $urlRouterProvider, $locationProvider) {
        $stateProvider
        .state('defaultState', angularAMD.route({
            url: '',
            views: {
                '': {
                    templateUrl: '../Template/LayoutPage.html?v=' + csshtmlver
                }
            },
            resolve: {
                load: ['$q', '$rootScope', '$location', '$state',
                    function ($q, $rootScope, $location, $state) {
                        try {
                            var controllerName = "LayoutController";
                            var loadController = ReleaseMode ? "Controller/Minified/" + controllerName + '.min' : "Controller/" + controllerName;
                            var deferred = $q.defer();
                            require([loadController], function () {
                                $rootScope.$apply(function () {
                                    deferred.resolve();
                                });
                            });
                            return deferred.promise;
                        }
                        catch (e) {
                            console.log(e.message);
                        }
                    }]
            }
        }))
        .state('defaultState.TopMenu', angularAMD.route({
            url: '',
            views: {
                'container-view@defaultState': {
                    templateUrl: function (rp) {
                        return '../Template/TopMenuPage.html?v=' + csshtmlver
                    }
                }
            },
            resolve: {
                load: ['$q', '$rootScope', '$location', '$state',
                    function ($q, $rootScope, $location, $state) {
                        try {
                            var controllerName = "TopMenuController";
                            var loadController = ReleaseMode ? "Controller/Minified/" + controllerName + '.min' : "Controller/" + controllerName;
                            var deferred = $q.defer();
                            require([loadController], function () {
                                $rootScope.$apply(function () {
                                    deferred.resolve();
                                });
                            });
                            return deferred.promise;
                        }
                        catch (e) {
                            console.log(e.message);
                        }
                    }]
            }
        }))
        .state('defaultState.TopMenu.FilterPanel', angularAMD.route({
            url: '',
            views: {
                'filterpanal-view@defaultState.TopMenu': {
                    templateUrl: function (rp) {
                        return '../Template/FilterPanelPage.html?v=' + csshtmlver
                    }
                }
            },
            resolve: {
                load: ['$q', '$rootScope', '$location', '$state',
                    function ($q, $rootScope, $location, $state) {
                        try {
                            var controllerName = "FilterPanelController";
                            var loadController = ReleaseMode ? "Controller/Minified/" + controllerName + '.min' : "Controller/" + controllerName;
                            var deferred = $q.defer();
                            require([loadController], function () {
                                $rootScope.$apply(function () {
                                    deferred.resolve();
                                });
                            });
                            return deferred.promise;
                        }
                        catch (e) {
                            console.log(e.message);
                        }
                    }]
            }
        }))
        .state('defaultState.TopMenu.FilterPanel.Dashboard', angularAMD.route({
            url: '/Dashboard',
            views: {
                'module-view@defaultState.TopMenu.FilterPanel': {
                    templateUrl: function (rp) {
                        return '../Template/DashboardPage.html?v=' + csshtmlver;
                    }
                }
            },
            resolve: {
                load: ['$q', '$rootScope', '$location', '$state',
                    function ($q, $rootScope, $location, $state) {
                        try {
                            var controllerName = "DashboardController";
                            var loadController = ReleaseMode ? "Controller/Minified/" + controllerName + '.min' : "Controller/" + controllerName;
                            var deferred = $q.defer();
                            require([loadController], function () {
                                $rootScope.$apply(function () {
                                    deferred.resolve();
                                });
                            });
                            return deferred.promise;
                        }
                        catch (e) {
                            console.log(e.message);
                        }
                    }]
            }
        }))
        .state('defaultState.TopMenu.FilterPanel.Deepdive', angularAMD.route({
            url: '/Deepdive',
            views: {
                'module-view@defaultState.TopMenu.FilterPanel': {
                    templateUrl: function (rp) {
                        return '../Template/DeepdivePage.html?v=' + csshtmlver;
                    }
                }
            },
            resolve: {
                load: ['$q', '$rootScope', '$location', '$state',
                    function ($q, $rootScope, $location, $state) {
                        try {
                            var controllerName = "DeepdiveController";
                            var loadController = ReleaseMode ? "Controller/Minified/" + controllerName + '.min' : "Controller/" + controllerName;
                            var deferred = $q.defer();
                            require([loadController], function () {
                                $rootScope.$apply(function () {
                                    deferred.resolve();
                                });
                            });
                            return deferred.promise;
                        }
                        catch (e) {
                            console.log(e.message);
                        }
                    }]
            }
        }))
        .state('defaultState.TopMenu.FilterPanel.CrossTab', angularAMD.route({
            url: '/VisualCrossTab',
            views: {
                'module-view@defaultState.TopMenu.FilterPanel': {
                    templateUrl: function (rp) {
                        return '../Template/CrossTabPage.html?v=' + csshtmlver;
                    }
                }
            },
            resolve: {
                load: ['$q', '$rootScope', '$location', '$state',
                    function ($q, $rootScope, $location, $state) {
                        try {
                            var controllerName = "CrossTabController";
                            var loadController = ReleaseMode ? "Controller/Minified/" + controllerName + '.min' : "Controller/" + controllerName;
                            var deferred = $q.defer();
                            require([loadController], function () {
                                $rootScope.$apply(function () {
                                    deferred.resolve();
                                });
                            });
                            return deferred.promise;
                        }
                        catch (e) {
                            console.log(e.message);
                        }
                    }]
            }
        }));
        if (sessionStorage["tabName"] != null && sessionStorage["tabName"] != "") {
            if (sessionStorage["tabName"] == "NielsenDecomp") {
                $urlRouterProvider.otherwise('/Deepdive');
            }
            else if (sessionStorage["tabName"] == "NielsenDashboard") {
                $urlRouterProvider.otherwise('/Dashboard');
            }
            else if (sessionStorage["tabName"] == "NielsenCrossTab") {
                $urlRouterProvider.otherwise('/VisualCrossTab');
            }
        }
        else {
            $urlRouterProvider.otherwise('/Deepdive');
        }
        $locationProvider.html5Mode(true);
    }]);

    // Bootstrap Angular when DOM is ready
    angularAMD.bootstrap(app, false, document.getElementById("body2"));
    return app;
});
//Polyfill JavaScript Array.prototype.find for older browsers (e.g. IE 10, IE 11)
if (!Array.prototype.find) {

    Object.defineProperty(Array.prototype, "find", {
        enumerable: false,
        value: function (predicate) {
            if (this == null) {
                throw new TypeError('Array.prototype.find called on null or undefined');
            }
            if (typeof predicate !== 'function') {
                throw new TypeError('predicate must be a function');
            }
            var list = Object(this);
            var length = list.length >>> 0;
            var thisArg = arguments[1];
            var value;

            for (var i = 0; i < length; i++) {
                value = list[i];
                if (predicate.call(thisArg, value, i, list)) {
                    return value;
                }
            }
            return undefined;
        }
    });

}
