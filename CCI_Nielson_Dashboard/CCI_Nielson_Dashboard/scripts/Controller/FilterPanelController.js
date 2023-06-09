﻿"use strict";
define(['app', 'angular', 'jquery', 'lodash', 'ajaxservice', 'JqueryUi', 'constants'], function (app, angular, $) {
    app.register.controller("FilterPanelController", ['$scope', '$css', '$sce', 'AjaxService', 'Constants', function ($scope, $css, $sce, AjaxService, Constants) {
        ReleaseMode ? $css.bind({ href: '../Content/MinifiedCss/filterpanel.min.css?v=' + csshtmlver }, $scope) : $css.bind({ href: '../Content/Css/filterpanel.css' }, $scope);
        let layoutScope = $scope.$parent;
        let topMenuScope = $scope.$parent;
        $scope.SetFilterScopeReference($scope);
        $scope.IsFilterInitialized = false;
        $scope.filterPanel = [];
        $scope.RawFilterData = [];

        $scope.submitFilter = function (forced) {
            if (forced || $scope.IsFilterInitialized) {
                let module = { Module: _.cloneDeep($scope.filterPanel), SelectedDate: prepareQueryDateFormat(topMenuScope.SelectedDate) };
                $scope.getOutput(module);
            }
        }

        $scope.ApplyModuleFilterSetting = function(){
    
        }

        $scope.callChildGetOutput = function (getOutput) {
            $scope.getOutput = getOutput;
        }

        let prepareQueryDateFormat = function (date) {
            let monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
            let day = date.getDate();
            if (day < 10) {
                day = "0" + day;
            }
            let monthIndex = date.getMonth();
            let year = date.getFullYear();
            return monthNames[monthIndex] + ' ' +  day + ' ' + year;
        }

        let initializeFilterPanel = function (resp) {
            $scope.RawFilterData = resp.data;
            layoutScope.setLoader(false);
            $scope.submitFilter(true);
            $scope.IsFilterInitialized = true;
        }

        let SetScroll = function (Obj, cursor_color, top, right, left, bottom, cursorwidth, horizrailenabled) {
            setTimeout(function () {
                $(Obj).niceScroll({
                    cursorcolor: cursor_color,
                    cursorborder: cursor_color,
                    cursorwidth: cursorwidth + "px",
                    autohidemode: false,
                    horizrailenabled: horizrailenabled,
                    railpadding: {
                        top: top,
                        right: right,
                        left: left,
                        bottom: bottom
                    }
                });
                $(Obj).getNiceScroll().resize();
                angular.element(".nicescroll-cursors").css("cursor", "pointer");
            }, 100);
        }

        
        layoutScope.setLoader(true);
        AjaxService.AjaxPost([],
            apiUrl + "/FilterPanel/GetFilter",
            initializeFilterPanel, function () {
                layoutScope.setLoader(false);
                layoutScope.customAlert();
            },
            "FilterPanel");
    }]);
});