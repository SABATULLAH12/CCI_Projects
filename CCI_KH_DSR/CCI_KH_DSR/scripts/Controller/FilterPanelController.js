﻿/*----------------------------------------------------------------------------------------------------*/
/*          Author: Rahul Kumar (Software Engineer, F&B)                                              */
/*          Date: 05-12-2019                                                                          */
/*          Discription: This Script contains Filter Controller definition across all modules         */
/*----------------------------------------------------------------------------------------------------*/

"use strict";
define(['app', 'angular', 'jquery', 'lodash', 'ajaxservice', 'JqueryUi', 'constants'], function (app, angular, $) {
    app.register.controller("FilterPanelController", ['$scope', '$css', '$sce', 'AjaxService', 'Constants', function ($scope, $css, $sce, AjaxService, Constants) {
        ReleaseMode ? $css.bind({ href: '../Content/MinifiedCss/filterpanel.min.css?v=' + csshtmlver }, $scope) : $css.bind({ href: '../Content/Css/filterpanel.css' }, $scope);
        let layoutScope = $scope.$parent;
        let topMenuScope = $scope.$parent;
        $scope.SetFilterScopeReference($scope);
        $scope.IsFilterInitialized = false;
        $scope.filterPanel = [];
        $scope.RawFilterData = [];
        $scope.IsNpBottlerDropdownOpen = false;
        $scope.NpBottlerList = [];
        $scope.INSWAMenu_SS_INSWA_temp = [];
        $scope.fillFilterPanal = function () {
            $scope.filterPanel = [
                  { Id: 0, Name: "metric", DispName: "METRIC", Dependent: [], Dependency: [], IsHidden: false, IsOpen: false, Data: null, Selection: null},
                  { Id: 1, Name: "xaxis", DispName: "X-AXIS", Dependent: [], Dependency: [2], IsHidden: false, IsOpen: false, Data: null, Selection: null},
                  { Id: 2, Name: "yaxis", DispName: "Y-AXIS", Dependent: [1], Dependency: [], IsHidden: false, IsOpen: false, Data: null, Selection: null},
                  { Id: 3, Name: "measure", DispName: "MEASURE", Dependent: [], Dependency: [], IsHidden: false, IsOpen: false, Data: null, Selection: null},
            ];
            prepareFilterPanelData();
            applyDefaultSelection(false);
        }

        $scope.SetINSWAMenuFromKV1 = function (obj) {
            $scope.INSWAMenu_SS_INSWA_temp = obj;
        }
        
        $scope.ApplyModuleFilterSetting = function () {
            let Module = topMenuScope.getSelectedModule();
            let enabledFilter = [];
            if (Module.ModuleName == "KV1") {
                enabledFilter = ["measure"];
                angular.forEach($scope.filterPanel, function (obj) {
                    if (obj.Name == "measure") {
                        obj.DispName = "MEASURE";
                        _.map(obj.Data, function (item) { if (item.Name == "volume") item.IsHidden = false });
                    }
                    obj.IsHidden = !_.includes(enabledFilter, obj.Name);
                });
            }
            else if (Module.ModuleName == "KV2") {
                enabledFilter = ["metric", "xaxis", "yaxis", "measure"];
                angular.forEach($scope.filterPanel, function (obj) {
                    if (obj.Name == "measure") {
                        obj.DispName = "BUBBLE SIZE";
                        _.map(obj.Data, function (item) { if (item.Name == "volume") item.IsHidden = false });
                    }
                    obj.IsHidden = !_.includes(enabledFilter, obj.Name);
                });
            }
            else if (Module.ModuleName == "TOP10") {
                enabledFilter = ["measure"];
                angular.forEach($scope.filterPanel, function (obj) {
                    if (obj.Name == "measure") {
                        obj.DispName = "MEASURE";
                        //_.map(obj.Data, function (item) { if (item.Name == "volume") item.IsHidden = true });
                        //if (obj.Selection.Name == "volume") {
                            //obj.Selection = null;
                            //applyDefaultSelection(false);
                        //}
                    }
                    obj.IsHidden = !_.includes(enabledFilter, obj.Name);
                });
            }
        }

        $scope.getFilterPrefix = function (filterName) {
            let Module = topMenuScope.getSelectedModule();
            if (Module!=null && Module.ModuleName == "KV2" && filterName=="measure" && $scope.filterPanel[1].Selection != null) {
                return $scope.filterPanel[1].Selection.DispName + " - ";
            }
            return "";
        }

        $scope.selectFilterItem = function (parent, child) {
            parent.Selection = child;
            $scope.openCloseFilter();
            applyFilterDependency(parent);
            $scope.submitFilter();
        }

        $scope.openCloseFilter = function (item) {
            angular.forEach($scope.filterPanel, function (obj) {
                obj.IsOpen = (item == obj) ? !obj.IsOpen : false;
            });
        }

        $scope.submitFilter = function (forced) {
            if (forced || $scope.IsFilterInitialized) {
                let module = { Module: _.cloneDeep($scope.filterPanel), SelectedDate: prepareQueryDateFormat(topMenuScope.SelectedDate) };
                $scope.getOutput(module);
            }
        }

        $scope.callChildGetOutput = function (getOutput) {
            $scope.getOutput = getOutput;
        }

        $scope.isRegionBrandPackEmpty = function (name) {
            let isEmpty = false;
            angular.forEach($scope.RawFilterData, function (obj) {
                if ((obj.Name == name) && (obj.Data==null||obj.Data.length==0)) {
                    isEmpty = true;
                }
            });
            return isEmpty;
        }

        $scope.filterDataRepository = function (name) {
            let arr;
            angular.forEach($scope.RawFilterData, function (obj) {
                if (obj.Name == name)
                    arr = obj.Data;
            });
            return _.cloneDeep(arr);
        }

        let prepareFilterPanelData = function () {
            angular.forEach($scope.filterPanel, function (obj) {
                obj.Data = $scope.filterDataRepository(obj.Name);
            });
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

        let applyFilterDependency = function (item) {
            angular.forEach(item.Dependency, function (id) {
                if (item.Name == 'xaxis') {
                    let Data = [], flag = false;
                    angular.forEach($scope.filterDataRepository('timeperiod'), function (obj) {
                        if (flag) {
                            Data.push(obj);
                        }
                        if (item.Selection.Name == obj.Name) {
                            flag = true;
                        }
                    });
                    $scope.filterPanel[id].Data = Data;
                    $scope.filterPanel[id].Selection = $scope.filterPanel[id].Data[0];
                }
            });
        }

        let applyDefaultSelection = function (forced) {
            let Module = topMenuScope.getSelectedModule();
            angular.forEach($scope.filterPanel, function (obj) {
                if (obj.Selection == null || forced) {
                    switch (obj.Name) {
                        case "metric":
                            obj.Selection = obj.Data[0];
                            break;
                        case "xaxis":
                            obj.Selection = obj.Data[0];
                            break;
                        case "yaxis":
                            obj.Selection = obj.Data[0];
                            break;
                        case "measure":
                            if (Module.ModuleName == "TOP10")
                                obj.Selection = obj.Data[2];
                            else
                                obj.Selection = obj.Data[0];
                            break;
                        default:
                            obj.Selection = null;
                    }
                    applyFilterDependency(obj);
                }
            });
        }

        let initializeFilterPanel = function (resp) {
            $scope.RawFilterData = resp.data;
            $scope.fillFilterPanal();
            $scope.ApplyModuleFilterSetting();
            layoutScope.setLoader(false);
            $scope.submitFilter(true);
            $scope.IsFilterInitialized = true;
        }

        $scope.initializeFullFilterPanel = function (resp) {
            $scope.RawFilterData = resp.data;
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

        let ShowNPBottler = function(data) {
            layoutScope.setLoader(false);
            $scope.NpBottlerList = data;
            $scope.IsNpBottlerDropdownOpen = true;
            SetScroll($(".np_bottler_continer"), "#CE7474", 0, 0, 0, 0, 4, false);
        }

        $scope.getNpBottler = function () {
            if (!$scope.IsNpBottlerDropdownOpen) {
                layoutScope.setLoader(true);
                if ($scope.NpBottlerList.data && $scope.NpBottlerList.data.BottlerName.length > 0) {
                    ShowNPBottler($scope.NpBottlerList);
                }
                else {
                    AjaxService.AjaxPost({ SelectedDate: prepareQueryDateFormat(topMenuScope.SelectedDate) }, apiUrl + "/FilterPanel/GetNonPerfomBottler", ShowNPBottler, function () {
                        layoutScope.setLoader(false);
                        $scope.IsNpBottlerDropdownOpen = false;
                        layoutScope.customAlert();
                    }, "FilterPanel");
                }
            }
            else {
                $scope.IsNpBottlerDropdownOpen = false;
            }
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