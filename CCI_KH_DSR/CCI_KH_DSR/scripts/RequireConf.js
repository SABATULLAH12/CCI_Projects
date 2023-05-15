"use strict";
require.config({
    //-- base/ root folder to all your js files --//
    baseUrl: "../Scripts",
    waitSeconds: 120,
    urlArgs: "bust=" + (new Date()).toLocaleDateString(),
    // alias libraries paths
    paths: {
        'app': 'app',
        'angular': 'Plugin/angular.min',
        'angularAMD': 'Plugin/angularAMD.min',
        'angular-ui-route': 'Plugin/angular-ui-router.min',
        'angular-animate': 'Plugin/angular-animate.min',
        'ajaxservice': 'Services/CommonAjaxService',
        'angular-css': 'Plugin/angular-css.min',
        'jquery': 'Plugin/jquery-3.3.1.min',
        'lodash': 'Plugin/lodash.min',
        'JqueryUi': 'Plugin/JqueryUi',
        'constants': 'Services/Constants',
        'html2canvas': 'Services/html2canvas',
        'canvg': 'Services/canvg.min',
        'rgbcolor': 'Services/rgbcolor',
        'promise': 'Services/promise',
        'niceScroll': 'Plugin/jquery.nicescroll',
        'big': 'Plugin/big.min.js',
        'orgchart': 'Plugin/jquery.orgchart'
    },

    // angular does not support AMD out of the box, put it in a shim
    shim: {
        angular: {
            exports: 'angular',
            deps: ['jquery']
        },
        html2canvas: {
            exports: 'html2canvas',
            deps: ['canvg', 'promise']
        },
        canvg: {
            deps: ['rgbcolor']
        },
        niceScroll: ['jquery'],
        'angularAMD': ['angular'],
        'angular-route': ['angular'],
        'angular-css': ['angular'],
        'angular-animate': ['angular'],
        'orgchart':['jquery'],
        'JqueryUi': ['jquery']
    }
});


//just a convention
require(['app'], function (app) {
});
