﻿"use strict";
define(['app', 'angular', 'html2canvas', 'ajaxservice', 'constants', 'D3IndiaMap', , 'topojson', 'jquery', 'IndiaMap'], function (app, angular, html2canvas) {
    app.register.controller("DashboardController", ['$scope', '$css', '$sce', 'AjaxService', 'Constants', function ($scope, $css, $sce, AjaxService, Constants) {

        ReleaseMode ? $css.bind({ href: '../Content/MinifiedCss/DashBoard.min.css?v=' + csshtmlver }, $scope) : $css.bind({ href: '../Content/Css/DashBoard.css' }, $scope);

        let filterPanelScope = $scope.$parent;
        let layoutScope = $scope.$parent.$parent.$parent;
        let topMenuScope = $scope.$parent.$parent;
        let selectedModule = topMenuScope.modules[0];
        selectedModule.IsActive = true;
        AjaxService.AjaxTrackModule(selectedModule.Name);
       
       // $scope.DynamicWid = [{ NnPCName: "nameA", NnPCValue: "40", NnPCChg: "10" }, { NnPCName: "nameB", NnPCValue: "20", NnPCChg: "10" }, { NnPCName: "AANU", NnPCValue: "30", NnPCChg: "10" }, { NnPCName: "James", NnPCValue: "-20", NnPCChg: "10" }];
        let getOutput = function () {
            $scope.DynamicWid = [{ NnPCName: "nameA", NnPCValue: "40", NnPCChg: "10" }, { NnPCName: "nameB", NnPCValue: "20", NnPCChg: "10" }, { NnPCName: "AANU", NnPCValue: "30", NnPCChg: "10" }, { NnPCName: "James", NnPCValue: "-20", NnPCChg: "10" }];
            // { NnPCName: "Jhon", NnPCValue: "20", NnPCChg: "10" }
            MapChartIndia.Drawchart("MapContainer");
            console.log("submitFilter called")
        }
       

        filterPanelScope.callChildGetOutput(getOutput);
        filterPanelScope.ApplyModuleFilterSetting();
        filterPanelScope.submitFilter(false);
        $scope.BindNnPCbarwidth = function (val, pos) {
            if (val == null || val == undefined || parseFloat(val) == 0)
                return val;
            if (parseFloat(val) < 0) {
                return (pos == true) ? Math.abs(val) : 0;
            } else {
                return (pos == false) ? val : 0;
            }
        };
        //---------Six Widgets------------
        $scope.showNegorpos = function (val, pos) {
            if (pos == true && parseFloat(val) > 0)
                return 'hidden';
            if (pos == false && parseFloat(val) < 0)
                return 'hidden';
            return 'visible';
        }
        //--------End Of Six Widgets-------

        //--------KPI Snapshot-------------
        $scope.KPISnapshotObj = [{ Header: "nameA", Value: "40", Chng: "10" }, { Header: "nameB", Value: "40", Chng: "10" }, { Header: "AANU", Value: "40", Chng: "10" }, { Header: "nameA", Value: "40", Chng: "10" }, { Header: "nameA", Value: "40", Chng: "10" }, { Header: "nameB", Value: "40", Chng: "10" }, { Header: "AANU", Value: "40", Chng: "10" }, { Header: "nameA", Value: "40", Chng: "10" }, { Header: "nameA", Value: "40", Chng: "10" }, { Header: "nameB", Value: "40", Chng: "10" }, { Header: "AANU", Value: "40", Chng: "10" }, { Header: "nameA", Value: "40", Chng: "10" }, { Header: "nameA", Value: "40", Chng: "10" }, { Header: "nameB", Value: "40", Chng: "10" }, { Header: "AANU", Value: "40", Chng: "10" }, { Header: "nameA", Value: "40", Chng: "10" }];
        $(".kpiSnapshotContainer").niceScroll({
            cursorcolor: 'rgb(206, 116, 116)',
            cursorborder: 'rgb(206, 116, 116)', autohidemode: false,
            cursorwidth:3
        });
        //---------------------------------
        topMenuScope.SetclickLayoutFunction(function () {});
    }]);
})
