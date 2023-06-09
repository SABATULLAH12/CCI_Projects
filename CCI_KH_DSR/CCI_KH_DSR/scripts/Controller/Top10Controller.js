﻿/*----------------------------------------------------------------------------------------------------*/
/*          Author: Rahul Kumar (Software Engineer, F&B)                                              */
/*          Date: 16-12-2019                                                                          */
/*          Discription: This Script contains Snapshot Controller definition for Filter state         */
/*----------------------------------------------------------------------------------------------------*/

"use strict";
define(['app', 'angular', 'html2canvas', 'ajaxservice', 'constants'], function (app, angular, html2canvas) {
    app.register.controller("Top10Controller", ['$scope', '$css', '$sce', 'AjaxService', 'Constants', function ($scope, $css, $sce, AjaxService, Constants) {

        ReleaseMode ? $css.bind({ href: '../Content/MinifiedCss/top10.min.css?v=' + csshtmlver }, $scope) : $css.bind({ href: '../Content/Css/top10.css' }, $scope);

        let filterPanelScope = $scope.$parent;
        let layoutScope = $scope.$parent.$parent.$parent;
        let topMenuScope = $scope.$parent.$parent;
        let selectedModule = topMenuScope.modules[2];
        let divideVolumeBy = 1000;
        let multiplyGrowthBy = 100;
        selectedModule.IsActive = true;
        AjaxService.AjaxTrackModule(selectedModule.Name);

        $scope.IsLeftRightFilterOpen = true;

        $scope.setLeftRightFilterShow = function () {
            $scope.IsLeftRightFilterOpen = !$scope.IsLeftRightFilterOpen;
            SetScroll($(".top10_filter_item_right_contianer"), "#CE7474", 0, -3, 0, -8, 3, false);
            SetScroll($(".top10_filter_item_left_contianer"), "#CE7474", 0, -3, 0, -8, 3, false);
            setTimeout(function () {
                drawChart('widgit1', 1, $scope.Top10Response.data, null, false);
            }, 10);
        }
        $scope.TopChartSizeChangedReplot = function () {
            SetScroll($(".top10_filter_item_right_contianer"), "#CE7474", 0, -3, 0, -8, 3, false);
            SetScroll($(".top10_filter_item_left_contianer"), "#CE7474", 0, -3, 0, -8, 3, false);
            drawChart('widgit1', 1, $scope.Top10Response.data, null, false);
        }

        let drawChart = function (container, chartType, Series, Categories, ShowDataLabel) {
            var chart = {
                style: {
                    fontFamily: "Montserrat"
                }
            };
            var title = {
                text: ''
            };
            var subtitle = {
                text: ''
            };
            var xAxis = {};
            var yAxis = {};
            var tooltip = {};
            var legend = {};
            var series = [];
            var plotOptions = {};
            var credits = { enabled: false };
            var annotations = [];
            var lang = {
                noData: "No Data to show!"
            };
            var noData = {
                style: {
                    fontWeight: 'bold',
                    fontSize: '15px',
                    color: '#303030'
                }
            };
            var additonalFunction = function (chart) {
                if ($scope.listGainers.length + $scope.listLosers.length == 0) {
                    $(".top10_chart_area").css({
                        "background-image": "none",
                        "background-size": "contain"
                    });
                }
                else if (chart.chartWidth > chart.chartHeight) {
                    $(".top10_chart_area").css({
                        "background-image": "url('../Content/Images/KH_Sprite_Top10_Chart BG.png')",
                        "background-size": "contain"
                    });
                }
                else {
                    $(".top10_chart_area").css({
                        "background-image": "url('../Content/Images/KH_Sprite_Top10_Chart BG.png')",
                        "background-size": "100% 100%"
                    });
                }
            };
            switch (chartType) {
                case 1:
                    chart = {
                        type: 'variablepie',
                        style: {
                            fontFamily: "Montserrat",
                            fontWeight: 'bold',
                            fontSize: '1em'
                        },
                        backgroundColor: 'rgba(0,0,0,0)',
                        margin: [26, 0, 0, 0],

                    };
                    xAxis = {
                        title: {
                            text: "",
                        },
                    };
                    yAxis = {
                        title: {
                            text: "",
                        }
                    };
                    plotOptions = {
                        series: {
                            dataLabels: {
                                enabled: ShowDataLabel
                            }
                        },
                        variablepie: {
                            size: '75%'
                        }
                    };
                    tooltip = {
                        useHTML: false,
                        shared: false,
                        formatter: function () {
                            if (this.point.name != 'AqHacks' && this.point.name != 'Slice' && this.point.name != '') {
                                if (_.includes(filterPanelScope.filterPanel[3].Selection.Name, 'volume')) {
                                    return '<b>' + this.point.name + '</b><br/>' + layoutScope.numberWithCommasSpecial(this.point.value / divideVolumeBy, 0);
                                }
                                else if (_.includes(filterPanelScope.filterPanel[3].Selection.Name, 'growth')) {
                                    return '<b>' + this.point.name + '</b><br/>' + layoutScope.numberWithCommasSpecial(this.point.value * multiplyGrowthBy, 1) + "%";
                                }
                                else {
                                    return '<b>' + this.point.name + '</b><br/>' + layoutScope.numberWithCommasSpecial(this.point.value, 0);
                                }
                            }
                            else {
                                return false;
                            }
                        },
                        snap: 0,
                        style: {
                            zIndex: 20
                        }
                    };
                    legend = {
                        enabled: false
                    };
                    $scope.listGainers = [];
                    $scope.listLosers = [];
                    if (Series != undefined && Series.length > 0) {
                        for (let i = 0; i < 10; i++) {
                            if (Series != undefined && Series[i] != null && Series[i].Value < 0) {
                                if (_.includes(filterPanelScope.filterPanel[3].Selection.Name, 'volume')) {
                                    $scope.listLosers.push({
                                        z: Series[i].Value,
                                        name: Series[i].Name,
                                        DispValue: layoutScope.numberWithCommasSpecial(Series[i].Value / divideVolumeBy, 0)
                                    })
                                }
                                else if (_.includes(filterPanelScope.filterPanel[3].Selection.Name, 'growth')) {
                                    $scope.listLosers.push({
                                        z: Series[i].Value,
                                        name: Series[i].Name,
                                        DispValue: layoutScope.numberWithCommasSpecial(Series[i].Value * multiplyGrowthBy, 1) + "%"
                                    })
                                }
                                else {
                                    $scope.listLosers.push({
                                        z: Series[i].Value,
                                        name: Series[i].Name,
                                        DispValue: layoutScope.numberWithCommasSpecial(Series[i].Value, 0)
                                    })
                                }
                            }
                            else {
                                $scope.listLosers = _.concat([{ z: 0, name: "", DispValue: "" }], $scope.listLosers);
                            }
                            if (Series != undefined && Series[Series.length - i - 1] != null && Series[Series.length - i - 1].Value >= 0) {
                                if (_.includes(filterPanelScope.filterPanel[3].Selection.Name, 'volume')) {
                                    $scope.listGainers.push({
                                        z: Series[Series.length - i - 1].Value,
                                        name: Series[Series.length - i - 1].Name,
                                        DispValue: layoutScope.numberWithCommasSpecial(Series[Series.length - i - 1].Value / divideVolumeBy, 0)
                                    })
                                }
                                else if (_.includes(filterPanelScope.filterPanel[3].Selection.Name, 'growth')) {
                                    $scope.listGainers.push({
                                        z: Series[Series.length - i - 1].Value,
                                        name: Series[Series.length - i - 1].Name,
                                        DispValue: layoutScope.numberWithCommasSpecial(Series[Series.length - i - 1].Value * multiplyGrowthBy, 1) + "%"
                                    })
                                }
                                else {
                                    $scope.listGainers.push({
                                        z: Series[Series.length - i - 1].Value,
                                        name: Series[Series.length - i - 1].Name,
                                        DispValue: layoutScope.numberWithCommasSpecial(Series[Series.length - i - 1].Value, 0)
                                    })
                                }
                            }
                            else {
                                $scope.listGainers.push({ z: 0, name: "", DispValue: "" })
                            }
                        }
                        //_.reverse($scope.listLosers);
                    }
                    let seriesArray = [];
                    let seriesObj = {};
                    let barWidth = 2;
                    let seriesTransObj = {
                        name: 'AqHacks',
                        y: barWidth / 2,
                        z: 0,
                        color: 'transparent',
                        showInLegend: false,
                        enableMouseTracking: false
                    };
                    _.map($scope.listGainers, function (obj) {
                        if (obj.name != '') {
                            seriesObj = {
                                name: obj.name,
                                y: barWidth,
                                z: obj.z,
                                value: obj.z,
                                color: '#79AA96'
                            };
                        }
                        else {
                            seriesObj = {
                                y: barWidth,
                                z: 0,
                                color: 'transparent',
                                showInLegend: false,
                                enableMouseTracking: false,
                            };
                        }
                        seriesArray.push(seriesTransObj);
                        seriesArray.push(seriesObj);
                        seriesArray.push(seriesTransObj);
                    });
                    _.map($scope.listLosers, function (obj) {
                        if (obj.name != '') {
                            seriesObj = {
                                name: obj.name,
                                y: barWidth,
                                z: Math.abs(obj.z),
                                value: obj.z,
                                color: '#CE7474'
                            };
                        }
                        else {
                            seriesObj = {
                                y: barWidth,
                                z: 0,
                                color: 'transparent',
                                showInLegend: false,
                                enableMouseTracking: false
                            };
                        }
                        seriesArray.push(seriesTransObj);
                        seriesArray.push(seriesObj);
                        seriesArray.push(seriesTransObj);
                    });
                    series = [{
                        innerSize: '31%',
                        name: 'topworst',
                        data: seriesArray
                    }];
                    break;
            }
            let json = {};
            json.chart = chart;
            json.title = title;
            json.subtitle = subtitle;
            json.xAxis = xAxis;
            json.yAxis = yAxis;
            json.tooltip = tooltip;
            json.noData = noData;
            json.lang = lang;
            json.legend = legend;
            json.series = series;
            json.plotOptions = plotOptions;
            json.credits = credits;
            json.annotations = annotations;
            Highcharts.chart(container, json, additonalFunction);
        }

        let prepareChartOutput = function (response) {
            layoutScope.setLoader(false);
            $scope.Top10Response = response;
            SetScroll($(".top10_filter_item_right_contianer"), "#CE7474", 0, -3, 0, -8, 3, false);
            SetScroll($(".top10_filter_item_left_contianer"), "#CE7474", 0, -3, 0, -8, 3, false);
            drawChart('widgit1', 1, response.data, null, false);
        }

        let step1 = function (resp) {
            filterPanelScope.initializeFullFilterPanel(resp);
            populateTop10Filter();
        }

        let populateTop10Filter = function () {
            if ($scope.Top10Panel == null || $scope.Top10Panel.length == 0) {
                $scope.Top10Panel = [{
                    Id: 0,
                    Name: "timeperiod",
                    DispName: "TIME PERIOD",
                    Data: filterPanelScope.filterDataRepository('timeperiod'),
                    Selection: null
                }, {
                    Id: 1,
                    Name: "brands",
                    DispName: "BRANDS",
                    Data: filterPanelScope.filterDataRepository('brands'),
                    Selection: null
                }, {
                    Id: 2,
                    Name: "packs",
                    DispName: "PACKS",
                    Data: filterPanelScope.filterDataRepository('packs'),
                    Selection: null
                }, {
                    Id: 3,
                    Name: "region",
                    DispName: "REGION",
                    Data: filterPanelScope.filterDataRepository('region'),
                    Selection: null
                }];
                ApplyDefaultSelection();
                SetScroll($(".top10_filter_item_right_contianer"), "#CE7474", 0, -3, 0, -8, 3, false);
                SetScroll($(".top10_filter_item_left_contianer"), "#CE7474", 0, -3, 0, -8, 3, false);
            }
            AjaxService.AjaxPost(getCombinedFilter($scope.submitData), apiUrl + "/Top10/GetChartOutput", prepareChartOutput, errorFunction, topMenuScope.getSelectedModule().Name);
        }

        let getOutput = function (data) {
            layoutScope.setLoader(true);
            $scope.IsLeftRightFilterOpen = true;
            $scope.submitData = data;
            if (filterPanelScope.isRegionBrandPackEmpty('region')) {
                AjaxService.AjaxPost([],
                    apiUrl + "/FilterPanel/GetMappingData",
                    step1,
                    function () {
                        layoutScope.setLoader(false);
                        layoutScope.customAlert();
                    },
                    "FilterPanel");
            }
            else {
                populateTop10Filter();
            }
        }

        let errorFunction = function (err) {
            layoutScope.setLoader(false);
            $scope.IsLeftRightFilterOpen = true;
            layoutScope.customAlert();
        }

        let getCombinedFilter = function (data) {
            _.map($scope.Top10Panel, function (item) {
                if (item.Name == 'region' || item.Name == 'brands') {
                    let Selection = [];
                    _.map(item.Data, function (obj) {
                        if (obj.IsSelected) {
                            Selection.push(obj);
                        }
                        else if (obj.Data != null && obj.Data.length > 0) {
                            _.map(obj.Data, function (ob) {
                                if (ob.IsSelected) {
                                    ob.Parent = obj.Name;
                                    Selection.push(ob);
                                }
                            });
                        }
                    });
                    item.Selection = Selection;
                }
                else {
                    item.Selection = [_.find(item.Data, { 'IsSelected': true })];
                }
            })
            _.map(data.Module, function (obj) {
                obj.Selection = [obj.Selection];
            });
            return { 'Module': _.concat(data.Module, $scope.Top10Panel), 'SelectedDate': data.SelectedDate };
        }

        let ApplyDefaultSelection = function () {
            _.map($scope.Top10Panel, function (obj) {
                switch (obj.Name) {
                    case 'timeperiod':
                        obj.Data[0].IsSelected = true;
                    case 'brands':
                        obj.Data[0].IsSelected = true;
                    case 'packs':
                        obj.Data[0].IsSelected = true;
                    case 'region':
                        obj.Data[0].IsSelected = true;
                    default:
                        obj.Data[0].IsSelected = true;
                }
            })
        }

        let CheckRegionIfEmptySelectDefault = function (parent) {
            let flag = true;
            _.map(parent.Data, function (item) {
                if (item.IsSelected) flag = false;
                _.map(item.Data, function (subItem) {
                    if (subItem.IsSelected) flag = false;
                })
            });
            SetScroll($(".top10_filter_item_right_contianer"), "#CE7474", 0, -3, 0, -8, 3, false);
            if (flag) {
                parent.Data[0].IsSelected = true;
                _.map(parent.Data, function (obj) { obj.IsOpen = false });
                $(".top10_filter_item_right_contianer").getNiceScroll(0).doScrollTop(0);
            }
            SetScroll($(".top10_filter_item_right_contianer"), "#CE7474", 0, -3, 0, -8, 3, false);
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

        $scope.SelectTop10Filteritem = function (item, parent) {
            if (parent.Name == 'region') {
                if (item.Name == "all zone" || item.Name == "all bus" || item.Name == "all india" || item.Name == "all swa") {
                    _.map(parent.Data, function (obj) {
                        obj.IsSelected = false;
                        obj.IsOpen = false;
                        _.map(obj.Data, function (ob) { ob.IsSelected = false });
                    });
                    item.IsSelected = true;
                }
                else {
                    _.find(parent.Data, { 'Name': 'all zone' }).IsSelected = false;
                    _.find(parent.Data, { 'Name': 'all bus' }).IsSelected = false;
                    _.find(parent.Data, { 'Name': 'all india' }).IsSelected = false;
                    _.find(parent.Data, { 'Name': 'all swa' }).IsSelected = false;
                    _.map(parent.Data, function (obj) {
                        obj.IsOpen = false;
                        _.map(obj.Data, function (ob) { ob.IsSelected = false })
                    });
                    item.IsSelected = !item.IsSelected;
                }
                CheckRegionIfEmptySelectDefault(parent);
            }
            else if (parent.Name == 'brands') {
                _.map(parent.Data, function (obj) {
                    obj.IsOpen = false;
                    _.map(obj.Data, function (ob) { ob.IsSelected = false });
                    obj.IsSelected = false;
                });
                item.IsSelected = true;
            }
            else {
                _.map(parent.Data, function (obj) { obj.IsSelected = false });
                item.IsSelected = true;
            }
            filterPanelScope.submitFilter(false);
        }

        $scope.SelectTop10BrandFilteritem = function (subchild, child, parent) {
            _.map(parent.Data, function (obj) {
                if (obj.Name != child.Name) {
                    obj.IsOpen = false;
                }
                _.map(obj.Data, function (ob) { ob.IsSelected = false });
                obj.IsSelected = false;
            });
            subchild.IsSelected = true;
            filterPanelScope.submitFilter(false);
        }

        $scope.SelectTop10SubRegionFilteritem = function (subchild, child, parent) {
            subchild.IsSelected = !subchild.IsSelected;
            _.map(parent.Data, function (obj) {
                obj.IsSelected = false;
                if (obj.Name != child.Name) {
                    obj.IsOpen = false;
                    _.map(obj.Data, function (ob) { ob.IsSelected = false });
                }
            });
            CheckRegionIfEmptySelectDefault(parent);
            filterPanelScope.submitFilter(false);
        }

        $scope.SetItemOpenClose = function (item) {
            item.IsOpen = !item.IsOpen;
            SetScroll($(".top10_filter_item_left_contianer"), "#CE7474", 0, -3, 0, -8, 3, false);
            SetScroll($(".top10_filter_item_right_contianer"), "#CE7474", 0, -3, 0, -8, 3, false);
        }

        $scope.IsChildSelected = function (item) {
            let flag = false;
            _.map(item.Data, function (obj) {
                if (obj.IsSelected) flag = true;
            })
            return flag;
        }

        filterPanelScope.callChildGetOutput(getOutput);
        filterPanelScope.ApplyModuleFilterSetting();
        filterPanelScope.submitFilter(false);
    }]);
})