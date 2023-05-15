/*----------------------------------------------------------------------------------------------------*/
/*          Author: Rahul Kumar (Software Engineer, F&B)                                              */
/*          Date: 04-12-2019                                                                          */
/*          Discription: This Script contains Snapshot Controller definition for Filter state         */
/*----------------------------------------------------------------------------------------------------*/

"use strict";
define(['app', 'angular', 'html2canvas', 'ajaxservice', 'constants'], function (app, angular, html2canvas) {
    app.register.controller("KaleidoscopeView2Controller", ['$scope', '$css', '$sce', 'AjaxService', 'Constants', function ($scope, $css, $sce, AjaxService, Constants) {

        ReleaseMode ? $css.bind({ href: '../Content/MinifiedCss/kaleidoscopeview2.min.css?v=' + csshtmlver }, $scope) : $css.bind({ href: '../Content/Css/kaleidoscopeview2.css' }, $scope);

        let kaleidoscopeScope = $scope.$parent;
        let filterPanelScope = $scope.$parent.$parent;
        let topMenuScope = $scope.$parent.$parent.$parent;
        let layoutScope = $scope.$parent.$parent.$parent.$parent;

        $scope.animation = true;

        let divideVolumeBy = 1000;
        let selectedModule = topMenuScope.modules[1];
        selectedModule.IsActive = true;
        AjaxService.AjaxTrackModule(selectedModule.Name);
        $scope.RegionFilter = [
            { Id: 0, Name: "India", DispName: "India", IsSelected: true },
            { Id: 1, Name: "SWA", DispName: "SWA", IsSelected: true }
        ];
        let prepareChartOutput = function (response) {
            layoutScope.setLoader(false);
            drawChart('widgit2', 1, response.data.Series,null, true);
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
            var lang= {
                noData: "No Data to show!"
            };
            var noData = {
                style: {
                    fontWeight: 'bold',
                    fontSize: '15px',
                    color: '#303030'
                }
            };
            let additionalfunction = function () {

            }
            switch (chartType) {
                case 1:
                    chart = {
                        type: 'bubble',
                        zoomType: 'xy',
                        panning: true,
                        panKey: 'ctrl',
                        style: {
                            fontFamily: "Montserrat",
                            fontWeight: 'bold',
                            fontSize: '1em'
                        },
                        //events: {
                        //    load: function () {
                        //        antiCollision(this.series);
                        //    },
                        //    redraw: function () {
                        //        antiCollision(this.series);
                        //    }
                        //},
                    };
                    xAxis = {
                        title: {
                            text: filterPanelScope.filterPanel[1].Selection.DispName + (_.includes(filterPanelScope.filterPanel[3].Selection.Name, 'transaction') ? " - Trans. Growth" : " - Growth"),
                        },
                        labels: {
                            formatter: function () {
                                if (this.value < 0) {
                                    return "<span style='color:red'>" + this.value + "%</span>"
                                }
                                else {
                                    return "<span style='color:green'>" + this.value + "%</span>"
                                }
                            },
                            style: {
                                "font-family": "Montserrat",
                            }
                        },
                        shadow: true,
                        gridLineWidth:1,
                        gridLineColor: 'rgba(183, 183, 183, 0.5)',
                        gridLineDashStyle: 'dot',
                        plotLines: [{
                            color: 'silver',
                            width: 1,
                            value: 0
                        }]
                    };
                    yAxis = {
                        title: {
                            text: filterPanelScope.filterPanel[2].Selection.DispName + (_.includes(filterPanelScope.filterPanel[3].Selection.Name, 'transaction') ? " - Trans. Growth" : " - Growth"),
                        },
                        labels: {
                            formatter: function () {
                                if (this.value < 0) {
                                    return "<span style='color:red'>" + this.value + "%</span>"
                                }
                                else {
                                    return "<span style='color:green'>" + this.value + "%</span>"
                                }
                            },
                            style: {
                                "font-family": "Montserrat",
                            }
                        },
                        gridLineColor: 'rgba(183, 183, 183, 0.5)',
                        gridLineDashStyle: 'dot',
                        plotLines: [{
                            color: 'silver',
                            width: 1,
                            value: 0
                        }]
                    };
                    plotOptions = {
                        series: {
                            cursor: 'pointer',
                            stickyTracking:false,
                            events: {
                                click: function () {
                                    kaleidoscopeScope.setKelidoscopeSelection(this.name);
                                    topMenuScope.clickModule(topMenuScope.getModuleByModuleName("KV1"));
                                }
                            }
                        },
                        bubble: {
                            dataLabels: {
                                enabled: true,
                                style: {
                                    fontWeight: 'bold'
                                },
                                color: 'black',
                                crop: false,
                                formatter: function () {
                                    if (this.series.name == 'AqHacks') {
                                        return null;
                                    }
                                    else {
                                        return this.series.name;
                                    }
                                },
                                allowOverlap: false,
                                inside:false,
                            }
                        },
                    };
                    tooltip = {
                        useHTML: false,
                        shared: false,
                        formatter: function () {
                            let tip = '<b>' + this.series.name + '</b><br/>' ;
                            if(_.includes(filterPanelScope.filterPanel[3].Selection.Name, 'volume')){
                                tip += layoutScope.numberWithCommasSpecial(this.point.z / divideVolumeBy, 0);
                            }
                            else if(_.includes(filterPanelScope.filterPanel[3].Selection.Name, 'growth')){
                                tip += layoutScope.numberWithCommasSpecial(this.point.z, 1) + "%";
                            }
                            else {
                                tip += layoutScope.numberWithCommasSpecial(this.point.z, 0);
                            }
                            return tip;
                        },
                        snap: 0,
                    };
                    legend = {
                        enabled:false
                    }
                    series = _.sortBy(_.cloneDeep(Series), [function (o) { return o.data[0].z; }]);;
                    if (series.length > 0) {
                        var obj = {
                            name: 'AqHacks',
                            data: [{
                                x: series[series.length - 1].data[0].x,
                                y: series[series.length - 1].data[0].y,
                                z: series[series.length-1].data[0].z
                            }],
                            showInLegend: false,
                            color: 'rgb(255,255,255,0)',
                            marker: {
                                fillOpacity: 0.0,
                                stroke: 'rgb(255,255,255,0)',
                            },
                            enableMouseTracking: false
                        };
                        series = _.concat([obj], series)
                    }
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
            Highcharts.chart( container,json);
        }

        let getOutput = function (data) {
            layoutScope.setLoader(true);
            data.RegionFilter = _.filter($scope.RegionFilter, ['IsSelected', true]);
            AjaxService.AjaxPost(data, apiUrl + "/Kaleidoscope/GetScatterChartOutput", prepareChartOutput, errorFunction, topMenuScope.getSelectedModule().Name);
        }
        
        $scope.selectRegion = function (region) {
            let selectedItem = _.filter($scope.RegionFilter, ['IsSelected', true]);
            if (selectedItem.length<2 && selectedItem[0].Name == region.Name) {
                _.map($scope.RegionFilter, function (reg) { reg.IsSelected = !reg.IsSelected });
            }
            else {
                region.IsSelected = !region.IsSelected;
            }
            filterPanelScope.submitFilter(false);
        }

        let errorFunction = function (err) {
            layoutScope.setLoader(false);
            layoutScope.customAlert();
        }

        filterPanelScope.callChildGetOutput(getOutput);
        filterPanelScope.ApplyModuleFilterSetting();
        filterPanelScope.submitFilter(false);
    }]);
})