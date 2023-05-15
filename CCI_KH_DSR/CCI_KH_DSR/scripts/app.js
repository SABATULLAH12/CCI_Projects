/*----------------------------------------------------------------------------------------------------*/
/*          Author: Rahul kumar (Software Engineer, F&B)                                              */
/*          Date: 03-12-2019                                                                          */
/*          Discription: This page contains the UI-Router configuration to be used across states      */
/*----------------------------------------------------------------------------------------------------*/

"use strict";
var ReleaseMode = true;
var applicationPath = '/';
var apiUrl = '/API';
var automationData = {};
var csshtmlver = "bust" + (new Date()).toLocaleDateString();

define(['angularAMD', 'angular-ui-route', 'angular-css'], function (angularAMD) {
    var app = angular.module("myapp", ['ui.router','angularCSS']);
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
                            var loadController =ReleaseMode ? "Controller/Minified/" + controllerName + '.min': "Controller/" + controllerName;
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
                            var loadController =ReleaseMode ? "Controller/Minified/" + controllerName + '.min' : "Controller/" + controllerName;
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
                            var loadController =ReleaseMode ? "Controller/Minified/" + controllerName + '.min' : "Controller/" + controllerName;
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
        .state('defaultState.TopMenu.FilterPanel.Kaleidoscope', angularAMD.route({
            url: '',
            views: {
                'module-view@defaultState.TopMenu.FilterPanel': {
                    templateUrl: function (rp) {
                        return '../Template/KaleidoscopePage.html?v=' + csshtmlver;
                    }
                }
            },
            resolve: {
                load: ['$q', '$rootScope', '$location', '$state',
                    function ($q, $rootScope, $location, $state) {
                        try {
                            var controllerName = "KaleidoscopeController";
                            var loadController =ReleaseMode ? "Controller/Minified/" + controllerName + '.min' : "Controller/" + controllerName;
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
        .state('defaultState.TopMenu.FilterPanel.Kaleidoscope.View1', angularAMD.route({
            url: '/Kaleidoscope',
            views: {
                'sub-module-view@defaultState.TopMenu.FilterPanel.Kaleidoscope': {
                    templateUrl: function (rp) {
                        return '../Template/KaleidoscopeView1Page.html?v=' + csshtmlver;
                    }
                }
            },
            resolve: {
                load: ['$q', '$rootScope', '$location', '$state',
                    function ($q, $rootScope, $location, $state) {
                        try {
                            var controllerName = "KaleidoscopeView1Controller";
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
        .state('defaultState.TopMenu.FilterPanel.Kaleidoscope.View2', angularAMD.route({
            url: '/Kaleidoscope/ScatterPlot',
            views: {
                'sub-module-view@defaultState.TopMenu.FilterPanel.Kaleidoscope': {
                    templateUrl: function (rp) {
                        return '../Template/KaleidoscopeView2Page.html?v=' + csshtmlver;
                    }
                }
            },
            resolve: {
                load: ['$q', '$rootScope', '$location', '$state',
                    function ($q, $rootScope, $location, $state) {
                        try {
                            var controllerName = "KaleidoscopeView2Controller";
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
        .state('defaultState.TopMenu.FilterPanel.Top10', angularAMD.route({
            url: '/Top10',
            views: {
                'module-view@defaultState.TopMenu.FilterPanel': {
                    templateUrl: function (rp) {
                        return '../Template/Top10Page.html?v=' + csshtmlver;
                    }
                }
            },
            resolve: {
                load: ['$q', '$rootScope', '$location', '$state',
                    function ($q, $rootScope, $location, $state) {
                        try {
                            var controllerName = "Top10Controller";
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
        $urlRouterProvider.otherwise('/Kaleidoscope');
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
