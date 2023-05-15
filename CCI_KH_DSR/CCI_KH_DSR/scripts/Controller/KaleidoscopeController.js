/*----------------------------------------------------------------------------------------------------*/
/*          Author: Rahul Kumar (Software Engineer, F&B)                                              */
/*          Date: 04-12-2019                                                                          */
/*          Discription: This Script contains Snapshot Controller definition for Filter state         */
/*----------------------------------------------------------------------------------------------------*/

"use strict";
define(['app', 'angular', 'html2canvas', 'ajaxservice', 'constants'], function (app, angular, html2canvas) {
    app.register.controller("KaleidoscopeController", ['$scope', '$css', '$sce', 'AjaxService', 'Constants', function ($scope, $css, $sce, AjaxService, Constants) {

        ReleaseMode ? $css.bind({ href: '../Content/MinifiedCss/kaleidoscope.min.css?v=' + csshtmlver }, $scope) : $css.bind({ href: '../Content/Css/kaleidoscope.css' }, $scope);

        let filterPanelScope = $scope.$parent;
        let layoutScope = $scope.$parent.$parent.$parent;
        let topMenuScope = $scope.$parent.$parent;

        $scope.kelidoscopeSelection = "";

        $scope.setKelidoscopeSelection = function (name) {
            $scope.kelidoscopeSelection = name;
        }

    }]);
})