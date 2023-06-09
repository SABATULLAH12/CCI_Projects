﻿"use strict";
define(['app', 'angular', 'ajaxservice', 'constants'], function (app, angular) {
    app.register.controller("LayoutController", ['$scope', '$css', '$sce', '$state', 'AjaxService', 'Constants', function ($scope, $css, $sce, $state, AjaxService, Constants) {
        ReleaseMode ? $css.bind({ href: '../Content/MinifiedCss/layout.min.css?v=' + csshtmlver }, $scope) : $css.bind({ href: '../Content/Css/layout.css' }, $scope);
        AjaxService.initialize($scope);
        
        $scope.showLoader = false;
        $scope.alert = {};
        $scope.setLoader = function (flag) {
            $scope.showLoader = flag;
        }

        $scope.clearTokenCookie = function () {
            localStorage.clear();
            sessionStorage.clear();
        }

        $scope.redirectToLogin = function () {
            window.location.replace(applicationPath + 'Home/Logout');
        }

        $scope.logOut = function () {
            $scope.clearTokenCookie();
            $scope.redirectToLogin();
        };

        $scope.customAlert = function (message, title, closeHandler, isHtmlText) {
            $scope.alert.htmlText_show = isHtmlText === undefined ? false : isHtmlText;
            if (message === undefined && $scope.alert.htmlText_show == false) {
                $scope.alert.htmlText_show = true;
                message = $sce.trustAsHtml('<div class="alert_warning_icon"></div><div class="something_went_wrong">Something went wrong ! Try again.</div>');
            }
            else if (message != undefined && $scope.alert.htmlText_show) {
                message = $sce.trustAsHtml(message);
            }
            title = title === undefined ? "Error" : title;
            $scope.alert.show = true;
            $scope.alert.header = title;
            $scope.alert.message = message;
            if (closeHandler == null) {
                $scope.alert.onClose = function () { $scope.alert.show = false; $scope.alert.style = {}; $scope.setLoader(false); };
            }
            else {
                $scope.alert.onClose = closeHandler;
            }
        };
        $scope.removeNiceScrollRail = function () {
            $(".nicescroll-rails").remove();
        };

        let decimalPrecisionByDivideMultipy = function (Value, DecimalPlace) {
            if (DecimalPlace == null) DecimalPlace = 9;
            let i = 0, multiplier = 1;
            for (i; i < DecimalPlace; i++) {
                multiplier = multiplier * 10;
            }
            return Math.round(parseFloat(Value) * multiplier) / multiplier;
        }

        $scope.numberWithCommas = function (x, y) {
            if (x != null) {
                x = decimalPrecisionByDivideMultipy(x, y);
                var parts = x.toString().split(".");
                parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
                return parts.join(".");
            }
        }
    }]);
    app.register.directive('onSizeChanged', ['$window', function ($window) {
        return {
            restrict: 'A',
            scope: {
                onSizeChanged: '&'
            },
            link: function (scope, $element, attr) {
                var element = $element[0];

                cacheElementSize(scope, element);
                $window.addEventListener('resize', onWindowResize);

                function cacheElementSize(scope, element) {
                    scope.cachedElementWidth = element.offsetWidth;
                    scope.cachedElementHeight = element.offsetHeight;
                }

                function onWindowResize() {
                    var isSizeChanged = scope.cachedElementWidth != element.offsetWidth || scope.cachedElementHeight != element.offsetHeight;
                    if (isSizeChanged) {
                        var expression = scope.onSizeChanged();
                        expression();
                    }
                };
            }
        }
    }]);
})
