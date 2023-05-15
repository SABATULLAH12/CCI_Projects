var mapData = [], statesMapData = [], citiesMapData = [], mapColorCodes = [];

var defaultCalendarValues = [], calendarYearsRange = [], defaultSelection = [];
var currentMap = '', currentMapType = '', currentView = '', selectedTimePeriodId = '', selectedTimePeriod = '', selectedDate = '',firstDate = '', latestDate = '', widgetType = '', selectedWidgetId = '', selectedKpi = '', demographicFilterId = '';

var timePeriodsData = [], demogOptionsData = [];

var dashboardEntity = {};
var demographicSelection = '';

var currentYearTrendData = [], previousYearTrendData = [], xAxisLabels = [];

var donutChartColours = ['rgba(222, 74, 74, 1)', 'rgba(255, 255, 255, 1)'];

$(document).ready(function (e) {
    ShowLoader();
    sessionStorage.clear();
    history.replaceState({}, null, "/#");

    $.ajax({
        type: "POST",
        url: "api/DashboardAPI/GetPanelData",
        dataType: "text",
        data: {},
        async: true,
        success: function (data) {
            data = JSON.parse(data).Data;

            plotTimePeriod(data.TimePeriods);
            timePeriodsData = data.TimePeriodData;
            calendarYearsRange = data.YearsRange.sort();

            demogOptionsData = data.DemographicDataList;

            defaultSelections();
            disableCalendarValues();
            setDefaultMapData();
            getDashboardData('first-load');
            bindClicks();

            HideLoader();
        },
        error: function (e) {
        }
    });
})

function logoutDashboard() {
    window.location.replace("../Home/Logout")
}

window.onresize = function () {
    plotMap(currentMap);
}

function bindClicks() {
    $('.radio-button-icon').unbind('click').click(function () {
        timePeriodSelection(this);
        disableCalendarValues();
    })

    $('.row-name-icon').unbind('click').click(function () {
        manageWidgetSubRows(this);
    })

    $('.row-name-text').unbind('click').click(function () {
        widgetDataSelection(this);
    })

    $('.toggle-button').unbind('click').click(function () {
        switchToggle();
    })

    $('.snapshot-widget').unbind('click').click(function () {
        snapshotSelection(this);
    })

    $('.expand-button-icon').unbind('click').click(function () {
        expandWidgets(this);
    })

    $('.zoom-close').unbind('click').click(function () {
        closeZoomDiv();
    })

    $('.demographic-options').unbind('click').click(function () {
        demographicDropdown(this);
    })

    $('.filter-item').unbind('click').click(function () {
        selectDropDownFilter(this);
    })

    $('.month-name').unbind('click').click(function () {
        selectMonth(this);
    })

    $('.qtr-selection').unbind('click').click(function () {
        selectQuarter(this);
    })

    $('#dropdown').change(function() {
        selectYear();
        disableCalendarValues();
    })

    $('.TranslucentDiv').unbind('click').click(function () {
        calendar();
    })
}

function setDefaultMapData() {
    dashboardEntity = {};
    dashboardEntity.TimePeriod = { Id: selectedTimePeriodId, Name: selectedTimePeriod == "QTR " ? selectedDate : selectedTimePeriod + selectedDate, Type: selectedTimePeriod.trim() };
    dashboardEntity.DemographicFilterId = demographicFilterId;
    dashboardEntity.CurrentView = currentView;
    dashboardEntity.CurrentMap = { Id: '0', Type: '450' };
    dashboardEntity.KpiSelection = selectedKpi;
    dashboardEntity.WidgetSelection = { Type: widgetType, Code: selectedWidgetId };
    dashboardEntity.ShouldLog = false;

    ShowLoader();

    $.ajax({
        type: "POST",
        url: "api/DashboardAPI/GetDashboardData",
        dataType: "JSON",
        contentType: 'application/json',
        data:  JSON.stringify(dashboardEntity),
        async: true,
        success: function (data) {
            statesMapData = data.Data.MapData;
            modifyMapData(statesMapData, currentMap);
        }
    })

    dashboardEntity.CurrentMap = { Id: '1', Type: '450' };

    ShowLoader();

    $.ajax({
        type: "POST",
        url: "api/DashboardAPI/GetDashboardData",
        dataType: "JSON",
        contentType: 'application/json',
        data: JSON.stringify(dashboardEntity),
        async: true,
        success: function (data) {
            citiesMapData = data.Data.MapData;
            modifyMapData(citiesMapData, currentMap);
        }
    })
}

function getDashboardData(calledFrom) {
    dashboardEntity = {};
    dashboardEntity.TimePeriod = { Id: selectedTimePeriodId, Name: selectedTimePeriod == "QTR " ? selectedDate : selectedTimePeriod + selectedDate, Type: selectedTimePeriod.trim() };
    dashboardEntity.DemographicFilterId = demographicFilterId;
    dashboardEntity.CurrentView = currentView;
    dashboardEntity.CurrentMap = { Id: currentMap, Type: currentMapType };
    dashboardEntity.KpiSelection = selectedKpi;
    dashboardEntity.WidgetSelection = { Type: widgetType, Code: selectedWidgetId };
    dashboardEntity.ShouldLog = true;

    ShowLoader();

    $.ajax({
        type: "POST",
        url: "api/DashboardAPI/GetDashboardData",
        dataType: "JSON",
        contentType: 'application/json',
        data:  JSON.stringify(dashboardEntity),
        async: true,
        success: function (data) {
            switch (calledFrom) {
                case 'first-load':
                case 'map-toggle':
                case 'calendar-selection':
                case 'time-period-selection':
                case 'selected-dropdown':
                    mapData = data.Data.MapData;
                    if (mapData.length != 0) {
                        modifyMapData(mapData, currentMap);
                        setMapColourCodes(mapData, currentMap);

                        updateSnapshotWidget(data.Data.KpiSnapshotData);


                        $('.data-widget-content-values').show();
                        $('.data-widget-content-data-unavailable').hide();
                    }

                    else {
                        modifyMapData(mapData, currentMap);
                        updateSnapshotWidget(data.Data.KpiSnapshotData);
                    }
                    updateTrendChart(data.Data.TrendGraphData);

                    data.Data.BrandData.length != 0 ? updatePerformanceWidgets('brandPerformanceWidget', data.Data.BrandData) : showDataUnavailable('brandPerformanceWidget');
                    data.Data.CategoryData.length != 0 ? updatePerformanceWidgets('categoryPerformanceWidget', data.Data.CategoryData) : showDataUnavailable('categoryPerformanceWidget');
                    data.Data.FlavourData.length != 0 ? updatePerformanceWidgets('flavourPerformanceWidget', data.Data.FlavourData) : showDataUnavailable('flavourPerformanceWidget');
                    data.Data.CompanyData.length != 0 ? updatePerformanceWidgets('companyPerformanceWidget', data.Data.CompanyData) : showDataUnavailable('companyPerformanceWidget');
                    data.Data.PackData.length != 0 ? updatePerformanceWidgets('packPerformanceWidget', data.Data.PackData) : showDataUnavailable('packPerformanceWidget');

                    toggleMapMessage();

                    break;
                case 'state-selection':
                case 'city-selection':
                    closeZoomedDiv();
                    
                    mapData = data.Data.MapData;
                    modifyMapData(mapData, currentMap);
                    setMapColourCodes(mapData, currentMap);

                    updateSnapshotWidget(data.Data.KpiSnapshotData);

                    updateTrendChart(data.Data.TrendGraphData);

                    data.Data.BrandData.length != 0 ? updatePerformanceWidgets('brandPerformanceWidget', data.Data.BrandData) : showDataUnavailable('brandPerformanceWidget');
                    data.Data.CategoryData.length != 0 ? updatePerformanceWidgets('categoryPerformanceWidget', data.Data.CategoryData) : showDataUnavailable('categoryPerformanceWidget');
                    data.Data.FlavourData.length != 0 ? updatePerformanceWidgets('flavourPerformanceWidget', data.Data.FlavourData) : showDataUnavailable('flavourPerformanceWidget');
                    data.Data.CompanyData.length != 0 ? updatePerformanceWidgets('companyPerformanceWidget', data.Data.CompanyData) : showDataUnavailable('companyPerformanceWidget');
                    data.Data.PackData.length != 0 ? updatePerformanceWidgets('packPerformanceWidget', data.Data.PackData) : showDataUnavailable('packPerformanceWidget');

                    break;
                case 'widget-selection':
                    mapData = data.Data.MapData;
                    modifyMapData(mapData, currentMap);
                    setMapColourCodes(mapData, currentMap);

                    updateSnapshotWidget(data.Data.KpiSnapshotData);

                    updateTrendChart(data.Data.TrendGraphData);

                    switch (dashboardEntity.WidgetSelection.Type.toLowerCase()) {
                        case 'map':
                            data.Data.BrandData.length != 0 ? updatePerformanceWidgets('brandPerformanceWidget', data.Data.BrandData) : showDataUnavailable('brandPerformanceWidget');
                            data.Data.CategoryData.length != 0 ? updatePerformanceWidgets('categoryPerformanceWidget', data.Data.CategoryData) : showDataUnavailable('categoryPerformanceWidget');
                            data.Data.FlavourData.length != 0 ? updatePerformanceWidgets('flavourPerformanceWidget', data.Data.FlavourData) : showDataUnavailable('flavourPerformanceWidget');
                            data.Data.CompanyData.length != 0 ? updatePerformanceWidgets('companyPerformanceWidget', data.Data.CompanyData) : showDataUnavailable('companyPerformanceWidget');
                            data.Data.PackData.length != 0 ? updatePerformanceWidgets('packPerformanceWidget', data.Data.PackData) : showDataUnavailable('packPerformanceWidget');
                            break;
                        case 'brand':
                            data.Data.CategoryData.length != 0 ? updatePerformanceWidgets('categoryPerformanceWidget', data.Data.CategoryData) : showDataUnavailable('categoryPerformanceWidget');
                            data.Data.FlavourData.length != 0 ? updatePerformanceWidgets('flavourPerformanceWidget', data.Data.FlavourData) : showDataUnavailable('flavourPerformanceWidget');
                            data.Data.CompanyData.length != 0 ? updatePerformanceWidgets('companyPerformanceWidget', data.Data.CompanyData) : showDataUnavailable('companyPerformanceWidget');
                            data.Data.PackData.length != 0 ? updatePerformanceWidgets('packPerformanceWidget', data.Data.PackData) : showDataUnavailable('packPerformanceWidget');
                            break;
                        case 'category':
                            data.Data.BrandData.length != 0 ? updatePerformanceWidgets('brandPerformanceWidget', data.Data.BrandData) : showDataUnavailable('brandPerformanceWidget');
                            data.Data.FlavourData.length != 0 ? updatePerformanceWidgets('flavourPerformanceWidget', data.Data.FlavourData) : showDataUnavailable('flavourPerformanceWidget');
                            data.Data.CompanyData.length != 0 ? updatePerformanceWidgets('companyPerformanceWidget', data.Data.CompanyData) : showDataUnavailable('companyPerformanceWidget');
                            data.Data.PackData.length != 0 ? updatePerformanceWidgets('packPerformanceWidget', data.Data.PackData) : showDataUnavailable('packPerformanceWidget');
                            break;
                        case 'company':
                            data.Data.BrandData.length != 0 ? updatePerformanceWidgets('brandPerformanceWidget', data.Data.BrandData) : showDataUnavailable('brandPerformanceWidget');
                            data.Data.CategoryData.length != 0 ? updatePerformanceWidgets('categoryPerformanceWidget', data.Data.CategoryData) : showDataUnavailable('categoryPerformanceWidget');
                            data.Data.FlavourData.length != 0 ? updatePerformanceWidgets('flavourPerformanceWidget', data.Data.FlavourData) : showDataUnavailable('flavourPerformanceWidget');
                            data.Data.PackData.length != 0 ? updatePerformanceWidgets('packPerformanceWidget', data.Data.PackData) : showDataUnavailable('packPerformanceWidget');
                            break;
                    }

                    break;
                case 'snapshot-selection':
                    mapData = data.Data.MapData;
                    modifyMapData(mapData, currentMap);
                    setMapColourCodes(mapData, currentMap);

                    updateTrendChart(data.Data.TrendGraphData);

                    data.Data.BrandData.length != 0 ? updatePerformanceWidgets('brandPerformanceWidget', data.Data.BrandData) : showDataUnavailable('packPerformanceWidget');
                    data.Data.CategoryData.length != 0 ? updatePerformanceWidgets('categoryPerformanceWidget', data.Data.CategoryData) : showDataUnavailable('categoryPerformanceWidget');
                    data.Data.FlavourData.length != 0 ? updatePerformanceWidgets('flavourPerformanceWidget', data.Data.FlavourData) : showDataUnavailable('flavourPerformanceWidget');
                    data.Data.CompanyData.length != 0 ? updatePerformanceWidgets('companyPerformanceWidget', data.Data.CompanyData) : showDataUnavailable('companyPerformanceWidget');
                    data.Data.PackData.length != 0 ? updatePerformanceWidgets('packPerformanceWidget', data.Data.PackData) : showDataUnavailable('packPerformanceWidget');

                    break;
            }

            bindClicks();
            HideLoader();
        },
        error: function (e) {
        }
    });
}

function plotTimePeriod(timePeriodValues) {
    var htmlString = '';

    timePeriodValues.forEach(function (value) {
        htmlString += '<div class="time-period-options"><div class="radio-button-container"><div class="radio-button-icon"></div></div><div class="time-period-name">' + value + '</div></div>';
    })

    $('.time-period-selection').html(htmlString);
}

function modifyMapData(mapData, currentMap) {
    if (mapData.length != 0) {

        if (demographicSelection == "Total India" || demographicSelection == "") {
            $('.map-directions').show();
            $('.map-toggle').show();
        }

        if (currentMapType == '450') {
            if (currentMap == '0') {
                mapData.forEach(function (item, index) {
                    //rename states with names that have text 'excl'
                    if (item.MeasureName.indexOf("excl") != -1)
                        item.MeasureName = item.MeasureName.substr(0, item.MeasureName.indexOf("excl") - 1)

                    //rename states with names that have text 'Total'
                    if (item.MeasureName.indexOf('Total') != -1)
                        item.MeasureName = item.MeasureName.substr(6, item.MeasureName.length)

                    //adding states with '/' in name
                    if (item.MeasureName.search('/') != -1) {
                        var index = item.MeasureName.search('/');
                        var value = item.MeasureName;

                        mapData.push({ MeasureCode: item.MeasureCode, MeasureName: value.substr(0, index), MeasurePercentage: item.MeasurePercentage, Change: item.Change });
                        mapData.push({ MeasureCode: item.MeasureCode, MeasureName: value.substr(index + 1), MeasurePercentage: item.MeasurePercentage, Change: item.Change });
                    }
                })
            }
        }
    }
    else {
        $('.map-toggle').hide();
        $('.map-directions').hide();
        $('#mapContainer').html('</div><div class="data-widget-content-data-unavailable">No Data Available</div>');
        $('#mapContainer').find('.data-widget-content-data-unavailable').show();
    }
}

function setMapColourCodes(mapData, currentMap) {
    if (currentMapType == '450') {
        mapColorCodes = [];
        if (currentMap == '0') {
            mapData.forEach(function (item, index) {
                //rename states with names that have text '(U)'
                if (item.MeasureName.indexOf("(U)") != -1)
                    item.MeasureName = item.MeasureName.substr(0, item.MeasureName.indexOf("(U)"))

                if (item.Change[0] == '-')
                    mapColorCodes.push(item.MeasureName + '|' + '#E0312E');
                else
                    mapColorCodes.push(item.MeasureName + '|' + '#367C3E');
            })
        }

        else {
            mapData.forEach(function (item, index) {
                if (item.Change[0] == '-')
                    mapColorCodes.push(item.MeasureName + '|' + '#FF0F0F');
                else
                    mapColorCodes.push(item.MeasureName + '|' + '#478851');
            })
        }

        plotMap(currentMap);
    }
    plotDirections();
}

function plotMap(selection) {
    //plot map    
    $('#mapContainer').empty();
    $('#zoomMapContainer').empty();

    if (selection == '0') {
        MapStates.Drawchart("mapContainer");
        $('.zoom-map-div').show();
        MapStates.Drawchart("zoomMapContainer");
        $('.zoom-map-div').hide();
    }
    else {
        MapCities.Drawchart("mapContainer");
        $('.zoom-map-div').show();
        MapCities.Drawchart("zoomMapContainer");
        $('.zoom-map-div').hide();
        $('#mapContainer').append('<div id="cheatDiv"></div>');//for hiding the icons that come up in top left of city map
    }
}

function showZoomMap() {
    $('.zoom-map-div').css('z-index', '6');
    $('.zoomWidgetContainer').css('z-index', '6');
    $(".TranslucentDiv").show();
    $(".zoom-map-div").show();
}

function closeZoomedDiv() {
    $(".TranslucentDiv").hide();
    $(".zoom-map-div").hide();
}

function plotDirections() {
    mapData.forEach(function (value, index) {
        if (value.MeasureName.indexOf('Zone') != -1) {
            name = value.MeasureName.substring(0, value.MeasureName.indexOf('Zone') - 1).toLowerCase();
            $('#' + name + 'Direction .direction-text').html(name.toUpperCase());
            if (value.MeasurePercentage != "")
                $('#' + name + 'Direction .direction-value').html((selectedKpi == "3" ? (Math.round(value.MeasurePercentage).toFixed(0)) : (Math.round(value.MeasurePercentage * 10) / 10).toFixed(1)) + (selectedKpi == "1" ? '%' : ''));
            else
                $('#' + name + 'Direction .direction-value').html("");
        }
    })
}

function plotChart() {
    Highcharts.chart('graphContainer', {
        chart: {
            style: {
                fontFamily: 'Montserrat',
                fontSize: '0.9em',
                color: '#000000'
            }
        },
        credits: {
            enabled: false
        },
        title: {
            text: ''
        },
        yAxis: {
            tickInterval: (selectedKpi == '1') ? 20 : ((selectedKpi == '2') || (selectedKpi == '4')) ? 2 : 100,
            max: (selectedKpi == '1') ? 100 : ((selectedKpi == '2') || (selectedKpi == '4')) ? 10 : 50000,
            gridLineWidth: 0,
            minorGridLineWidth: 0,
            title: {
                text: ''
            },
            labels: {
                style: {
                    fontFamily: 'Montserrat',
                    fontSize: '1em',
                    color: '#000000',
                    fontWeight: 'bolder'
                }
            }
        },

        xAxis: {
            categories: xAxisLabels,
            lineColor: 'transparent',
            tickLength: 0,
            alternateGridColor: {
                linearGradient: {
                    x1: 0,
                    y1: 0.1,
                    x2: 0,
                    y2: 0.9
                },
                stops: [
                    [0, 'rgba(255, 255, 255, 1)'],
                    [1, 'rgba(225, 225, 225, 1)']
                ]
            },
            labels: {
                style: {
                    fontFamily: 'Montserrat',
                    fontSize: '1em',
                    color: '#000000',
                    fontWeight: 'bolder'
                },
                formatter: function () {
                    return this.value.split(' ')[0];
                }
            }
        },

        plotOptions: {
            series: {
                showInLegend: false,
                states: {
                    inactive: {
                        opacity: 1
                    },
                    hover: {
                        enabled: false
                    }
                }
            }
        },

        series: [{
            name: 'Current Year',
            color: 'red',
            marker: {
                symbol: 'url(../../Content/Images/HHPanel_dashboard_Sprite_red_point.svg)'
            },
            data: currentYearTrendData
        }, {
            name: 'Previous Year',
            color: 'yellow',
            marker: {
                symbol: 'url(../../Content/Images/HHPanel_dashboard_Sprite_Shape_orange.svg)'
            },
            data: previousYearTrendData,
            tooltip: {
                pointFormatter: function () {
                    return ' : ' + Highcharts.numberFormat(this.y, 1, '.') + ' <br/>';
                }
            },
            dashStyle: 'dot',
        }],
        tooltip: {
            shared: false,
            formatter: function () {
                var text = '';
                if (selectedKpi == '3') {
                    if (this.series.name == 'Current Year') {
                        text = this.x + ': ' + '<br> ' + (Math.round(this.y));
                    } else {
                        text = this.x.split(' ')[0] + ' ' + (this.x.split(' ')[1] - 1) + ': ' + '<br> ' + (Math.round(this.y));
                    }
                }
                else {
                    if (this.series.name == 'Current Year') {
                        text = this.x + ': ' + '<br> ' + (Math.round(this.y * 10) / 10).toFixed(1);
                    } else {
                        text = this.x.split(' ')[0] + ' ' + (this.x.split(' ')[1] - 1) + ': ' + '<br> ' + (Math.round(this.y * 10) / 10).toFixed(1);
                    }
                }
                return text;
            }
        }
    });
}

function plotDonutChart(snapshotData) {

    var penetrationData = (snapshotData[0].MeasureName.toLowerCase() == "penetration") ? snapshotData[0] : (snapshotData[1].MeasureName.toLowerCase() == "penetration") ? snapshotData[1] : snapshotData[2];

    Highcharts.setOptions({
        colors: Highcharts.map(donutChartColours, function (color) {
            return {
                radialGradient: {
                    cx: 0.5,
                    cy: 0.3,
                    r: 0.7
                },
                stops: [
                    [0, Highcharts.color(color).brighten(-0.3).get('rgb')],
                    [1, color]
                ]
            };
        })
    });

    Highcharts.chart('penetrationGraph', {
        chart: {
            type: 'pie',
            backgroundColor: 'transparent',
            margin: [0, 0, 0, 0],
            spacingTop: 0,
            spacingBottom: 0,
            spacingLeft: 0,
            spacingRight: 0
        },
        title: {
            text: '',
        },
        credits: {
            enabled: false
        },
        tooltip: {
            enabled: false
        },
        plotOptions: {
            pie: {
                dataLabels: {
                    enabled: false,
                },
                slicedOffset: 0,
                startAngle: -90,
                endAngle: 90,
                center: [null, '100%'],
                size: '200%'
            },
            series: {
                innerSize: '65%',
                states: {
                    inactive: {
                        opacity: 1
                    },
                    hover: {
                        enabled: false
                    }
                }
            }
        },
        series: [{
            name: 'Penetration',
            data: [
              ['', parseInt(penetrationData.MeasurePercentage)],
              ['', 100 - parseInt(penetrationData.MeasurePercentage)]
            ]
        }]
    });
}

function updateSnapshotWidget(snapshotData) {

    if (snapshotData.length != 0) {
        var penetrationData, frequencyData, absoluteData, volumeData;
        snapshotData.forEach(function (value, index) {
            if (value.MeasureName.toLowerCase() == "penetration")
                penetrationData = value;
            if (value.MeasureName.toLowerCase() == "frequency")
                frequencyData = value;
            if (value.MeasureName.toLowerCase() == "absolute hhs")
                absoluteData = value;
            if (value.MeasureName.toLowerCase() == "vol/trip")
                volumeData = value;
        });

        $('#kpiSnapshotWidget').find('.data-widget-content-data-unavailable').hide();
        $('#penetrationWidget').show();
        $('#frequencyWidget').show();
        $('#absoluteWidget').show();
        $('#volumeWidget').show();

        $('#penetrationWidget .change-icon').removeClass('positive negative');
        $('#frequencyWidget .change-icon').removeClass('positive negative');
        $('#absoluteWidget .change-icon').removeClass('positive negative');
        $('#volumeWidget .change-icon').removeClass('positive negative');

        //penetration
        $('#penetrationWidget .widget-value').html((Math.round(penetrationData.MeasurePercentage * 100) / 100).toFixed(2) + '%');
        $('#penetrationWidget .change-value').html(((Math.round(penetrationData.Change * 10) / 10).toFixed(1) > 0.0 ? '+' : '') +(Math.round(penetrationData.Change * 10) / 10).toFixed(1));

        if (penetrationData.Change.substring(0, 1) == '-') {
            $('#penetrationWidget .change-icon').addClass('negative');
        }
        else if (penetrationData.Change != "") {
            $('#penetrationWidget .change-icon').addClass('positive');
        }

        //Frequency
        $('#frequencyWidget .widget-value').html((Math.round(frequencyData.MeasurePercentage * 10) / 10).toFixed(1));
        $('#frequencyWidget .change-value').html(((Math.round(frequencyData.Change * 10) / 10).toFixed(1) > 0.0 ? '+' : '') + (Math.round(frequencyData.Change * 10) / 10).toFixed(1));
        $('#frequencyGraphColour').css('width', 'calc(7% * ' + frequencyData.MeasurePercentage + ')')

        if (frequencyData.Change.substring(0, 1) == '-') {
            $('#frequencyWidget .change-icon').addClass('negative');
        }
        else if (frequencyData.Change != "") {
            $('#frequencyWidget .change-icon').addClass('positive');
        }

        //Volume/Trip
        $('#volumeWidget .widget-value').html((Math.round(volumeData.MeasurePercentage * 10) / 10).toFixed(1));
        $('#volumeWidget .change-value').html(((Math.round(volumeData.Change * 10) / 10).toFixed(1) > 0.0 ? '+' : '') + (Math.round(volumeData.Change * 10) / 10).toFixed(1));
        $('#volumeGraphColour').css('width', 'calc(7% * ' + volumeData.MeasurePercentage + ')')

        if (volumeData.Change.substring(0, 1) == '-') {
            $('#volumeWidget .change-icon').addClass('negative');
        }
        else if (volumeData.Change != "") {
            $('#volumeWidget .change-icon').addClass('positive');
        }

        //Absolute
        $('#absoluteWidget .widget-value').html((Math.round(absoluteData.MeasurePercentage)));
        $('#absoluteWidget .change-value').html(((Math.round(absoluteData.Change)) > 0 ? '+' : '') + (Math.round(absoluteData.Change)) + '%');

        if (absoluteData.Change.substring(0, 1) == '-') {
            $('#absoluteWidget .change-icon').addClass('negative');
        }
        else if (absoluteData.Change != "") {
            $('#absoluteWidget .change-icon').addClass('positive');
        }
        plotDonutChart(snapshotData);
    }
    else {
        $('#kpiSnapshotWidget').find('.data-widget-content-data-unavailable').length == 0 ? $('#kpiSnapshotWidget .data-widget-content').append('</div><div class="data-widget-content-data-unavailable">No Data Available</div>') : '';
        $('#kpiSnapshotWidget').find('.data-widget-content-data-unavailable').show();
        $('#penetrationWidget').hide();
        $('#frequencyWidget').hide();
        $('#absoluteWidget').hide();
        $("#volumeWidget").hide();
    }
}

function updatePerformanceWidgets(widgetName, widgetData) {
    var htmlString = '', subSectionHtmlString = '', measureValue = '', selectedRow = '', maxChangeValue = 0.0;

    var widgetHeading = '';
    switch (widgetName.substring(0, widgetName.length - 17).toLowerCase()) {
        case 'brand':
            widgetHeading += 'Brands & TM';
            break;
        case 'company':
            widgetHeading += '';
            break;
        case 'category':
            widgetHeading += 'Category';
            break;
        case 'flavour':
            widgetHeading += 'Flavour';
            break;
        case 'pack':
            widgetHeading += 'Packs';
            break;
    }

    measureValue = selectedKpi == 1 ? '%' : '';

    htmlString += '<div class="data-widget-content-header"><div class="data-name-1">' + widgetHeading + '</div><div class="data-name-2">Measure</div><div class="data-name-3">Chg.</div></div><div class="data-widget-content-values">'
    
    maxChangeValue = getMaxChangeValue(widgetData, maxChangeValue);

    widgetData.forEach(function (value, index) {
        subSectionHtmlString = '';
        selectedRow = ((value.MeasureCode == selectedWidgetId) && (selectedWidgetId != '2886') && (value.MeasureName == sessionStorage.widgetSelection)) ? ' selected-row' : ''; 
        if (value.MeasureName.toLowerCase() == "industry")
            htmlString += '<div class="widget-values' + selectedRow + '"><div class="widget-row-name" style="cursor: default"><div class="row-name-icon"';
        else
            htmlString += '<div class="widget-values' + selectedRow + '"><div class="widget-row-name"><div class="row-name-icon"';

        if (value.IsTrademark) {
            htmlString += '></div><div class="row-name-text" id="' + value.MeasureCode + '" title="' + value.HoverName + '">' + value.MeasureName + '</div></div><div class="widget-graph">';
            subSectionHtmlString += '<div class="collapsible-widget"><div class="collapsible-widget-rows">'
            
            maxChangeValue = getMaxChangeValue(value.Trademarks, maxChangeValue);
            //creating subSectionHtmlString
            value.Trademarks.forEach(function (value, index) {
                selectedRow = ((value.MeasureCode == selectedWidgetId)&& (value.MeasureName == sessionStorage.widgetSelection)) ? ' selected-row' : '';

                subSectionHtmlString += '<div class="widget-values collapsible' + selectedRow + '"><div class="widget-row-name"><div class="row-name-icon" style="display: none;"></div><div class="row-name-text" id="' + value.MeasureCode + '" title="' + value.HoverName + '">' + value.MeasureName + '</div></div><div class="widget-graph">';
                if (value.Change.substring(0, 1) == '') {
                    subSectionHtmlString += '<div class="negative-graph"></div><div class="positive-graph"></div></div><div class="widget-measure">' + ((selectedKpi == '3') ? (Math.round(value.MeasurePercentage)).toFixed(0) : (Math.round(value.MeasurePercentage * 10) / 10).toFixed(1)) + measureValue +
                        '</div><div class="widget-change"><div class="widget-change-text"></div><div class="widget-change-icon"></div></div></div>';
                }
                else if (value.Change.substring(0, 1) == '-') {
                    subSectionHtmlString += '<div class="negative-graph"><div class="graph-bar" style="width: ' + 76 * Math.abs(value.Change / maxChangeValue) + '%;"></div><div class="graph-icon"></div></div><div class="positive-graph"></div></div><div class="widget-measure">' + ((selectedKpi == '3') ? (Math.round(value.MeasurePercentage)).toFixed(0) : (Math.round(value.MeasurePercentage * 10) / 10).toFixed(1)) + measureValue +
                        '</div><div class="widget-change"><div class="widget-change-text"' + (selectedKpi == '3' ? 'id="absolute"' : '') + '>' + ((selectedKpi == '3') ? (Math.round(value.Change)).toFixed(0) : (Math.round(value.Change * 10) / 10).toFixed(1)) + (selectedKpi == '3' ? '%' : '') + '</div><div class="widget-change-icon ' + ((value.Change == 0.0) ? '' : 'negative') + '"></div></div></div>';
                }
                else {
                    subSectionHtmlString += '<div class="negative-graph"></div><div class="positive-graph"><div class="graph-bar" style="width: ' + 76 * (value.Change / maxChangeValue) + '%;"></div><div class="graph-icon"></div>' +
                                           '</div></div><div class="widget-measure">' + ((selectedKpi == '3') ? (Math.round(value.MeasurePercentage)).toFixed(0) : (Math.round(value.MeasurePercentage * 10) / 10).toFixed(1)) + measureValue + '</div><div class="widget-change"><div class="widget-change-text"' + (selectedKpi == '3' ? 'id="absolute"' : '') + '>' + ((selectedKpi == '3') ? (Math.round(value.Change)).toFixed(0) : (Math.round(value.Change * 10) / 10).toFixed(1)) + (selectedKpi == '3' ? '%' : '') + '</div><div class="widget-change-icon ' + ((value.Change == 0.0) ? '' : 'positive') + '"></div></div></div>'
                }
            })
            subSectionHtmlString += '</div></div>'
        }
        else if (value.MeasureName.toLowerCase() == "industry")
            htmlString += 'style="display: none;"></div><div class="row-name-text" style="pointer-events: none;" id="' + value.MeasureCode + '" title="' + value.HoverName + '">' + value.MeasureName + '</div></div><div class="widget-graph">';
        else
            htmlString += 'style="display: none;"></div><div class="row-name-text" id="' + value.MeasureCode + '" title="' + value.HoverName + '">' + value.MeasureName + '</div></div><div class="widget-graph">';
        if (value.Change.substring(0, 1) == '') {
            htmlString += '<div class="negative-graph"></div><div class="positive-graph"></div></div><div class="widget-measure">' + ((selectedKpi == '3') ? (Math.round(value.MeasurePercentage)).toFixed(0) : (Math.round(value.MeasurePercentage * 10) / 10).toFixed(1)) + measureValue +
                 '</div><div class="widget-change"><div class="widget-change-text"></div><div class="widget-change-icon"></div></div></div>';
        }
        else if (value.Change.substring(0, 1) == '-')
            htmlString += '<div class="negative-graph"><div class="graph-bar" style="width: ' + 76 * Math.abs(value.Change / maxChangeValue) + '%;"></div><div class="graph-icon"></div></div><div class="positive-graph"></div></div><div class="widget-measure">' + ((selectedKpi == '3') ? (Math.round(value.MeasurePercentage)).toFixed(0) : (Math.round(value.MeasurePercentage * 10) / 10).toFixed(1)) + measureValue +
                '</div><div class="widget-change"><div class="widget-change-text"' + (selectedKpi == '3' ? 'id="absolute"' : '') + '>' + ((selectedKpi == '3') ? (Math.round(value.Change)).toFixed(0) : (Math.round(value.Change * 10) / 10).toFixed(1)) + (selectedKpi == '3' ? '%' : '') + '</div><div class="widget-change-icon ' + ((value.Change == 0.0) ? '' : 'negative') + '"></div></div></div>';
        else 
            htmlString += '<div class="negative-graph"></div><div class="positive-graph"><div class="graph-bar" style="width: ' + 76 * (value.Change / maxChangeValue) + '%;"></div><div class="graph-icon"></div>' +
                                   '</div></div><div class="widget-measure">' + ((selectedKpi == '3') ? (Math.round(value.MeasurePercentage)).toFixed(0) : (Math.round(value.MeasurePercentage * 10) / 10).toFixed(1)) + measureValue + '</div><div class="widget-change"><div class="widget-change-text"' + (selectedKpi == '3' ? 'id="absolute"' : '') + '>' + ((selectedKpi == '3') ? (Math.round(value.Change)).toFixed(0) : (Math.round(value.Change * 10) / 10).toFixed(1)) + (selectedKpi == '3' ? '%' : '') + '</div><div class="widget-change-icon ' + ((value.Change == 0.0) ? '' : 'positive') + '"></div></div></div>'

        htmlString += subSectionHtmlString;
    })

    htmlString += '</div><div class="data-widget-content-data-unavailable"></div>'
    $('#' + widgetName + ' .data-widget-content').html(htmlString);
}

function timePeriodSelection(e) {
    if ($(e).parents('time-period-options').find('.time-period-name').text() != selectedTimePeriod) {
        //changing icon
        $('.time-period-name').removeClass('selected');
        $('.radio-button-icon').removeClass('selected')
        $(e).parent().find('.radio-button-icon').addClass('selected');
        $(e).parent().parent().find('.time-period-name').addClass('selected');

        //generating time period values
        selectedTimePeriod = $(e).parent().parent().find('.time-period-name').text() + ' ';

        timePeriodsData.forEach(function (value, index) {
            if (selectedTimePeriod.trim() == value.PeriodType) {

                var temp = '', tempDate = '', tempID = '';
                value.TimePeriodList.forEach(function (value, index) {
                    firstDate = index == 0 ? value.PeriodName : firstDate;
                    //selectedDate = value.Month + ' ' + value.Year;
                    if (value.PeriodType == 'QTR') {
                        switch (selectedDate.split(' ')[0]) {
                            case "Jan":
                            case "Feb":
                            case "Mar":
                            case "Q1":
                                temp = 'Q1'
                                break;
                            case "Apr":
                            case "May":
                            case "Jun":
                            case "Q2":
                                temp = 'Q2'
                                break;
                            case "Jul":
                            case "Aug":
                            case "Sep":
                            case "Q3":
                                temp = 'Q3'
                                break;
                            case "Oct":
                            case "Nov":
                            case "Dec":
                            case "Q4":
                                temp = 'Q4'
                                break;
                        }

                    }
                    else {
                        switch (selectedDate.split(' ')[0]) {
                            case "Q1":
                                temp = 'Jan'
                                break;
                            case "Q2":
                                temp = 'Apr'
                                break;
                            case "Q3":
                                temp = 'Jul'
                                break;
                            case "Q4":
                                temp = 'Oct'
                                break;
                            default:
                                temp = selectedDate.split(' ')[0];
                                break;
                        }
                    }

                    if (temp == value.Month && selectedDate.split(' ')[1] == value.Year) {
                        selectedTimePeriodId = value.PeriodCode;
                        selectedDate = temp + ' ' + value.Year;
                    }
                    tempDate = value.Month + " " + value.Year;
                    tempID = value.PeriodCode;
                    latestDate = tempDate;
                })
                if (temp != selectedDate.split(' ')[0]) {
                    selectedDate = tempDate;
                    selectedTimePeriodId = tempID;
                }
                if (latestDate.split(' ')[1] != $('option').last().html()) {
                    $('option').last().attr('disabled', true);
                    $('#dropdown').prop('selectedIndex', calendarYearsRange.length - 2);
                }
                else {
                    $('option').last().attr('disabled', false);
                    //$('#dropdown').prop('selectedIndex', calendarYearsRange.length - 1);
                }
            }
        })

        //update footer date
        $('#dataDate').html(selectedDate);

        ////remove previously selected year on time period change 
        //if (selectedDate.split(' ')[1] == latestDate.split(' ')[1]) {
        //    $('option').last().attr('disabled', false);
        //    $('#dropdown').prop('selectedIndex', calendarYearsRange.length - 1);
        //}
        //else {
        //    $('option').last().attr('disabled', true);
        //    $('#dropdown').prop('selectedIndex', calendarYearsRange.length - 2);
        //}

        //changing calendar
        if ($(e).parent().parent().find('.time-period-name').text() == 'QTR') {
            $('.qtr-block').show();
            $('.qtr-selection-block').show();
            $('.month-block').css('left', '10%').css('width', '90%');
            document.getElementsByClassName('month-block')[0].style.pointerEvents = 'none';
            removeCalendarSelections();
            $('#qtrSelection' + selectedDate[1]).addClass('selected')
            $('.quarter-inner-div:contains(' + selectedDate.substr(0, 2) + ')').addClass('selected')
        }
        else {
            $('.qtr-block').hide();
            $('.qtr-selection-block').hide();
            $('.month-block').css('left', '0').css('width', '100%');
            document.getElementsByClassName('month-block')[0].style.pointerEvents = 'auto';
            removeCalendarSelections()
            $('.month-name-value:contains(' + selectedDate.substr(0, 3) + ')').addClass('selected');
            $('.month-name-value:contains(' + selectedDate.substr(0, 3) + ')').parent().addClass('selected');
        }

        getDashboardData('time-period-selection');
    }
}

function removeCalendarSelections() {
    $('.qtr-selection').removeClass('selected');
    $('.quarter-inner-div').removeClass('selected');
    $('.month-name').removeClass('selected')
    $('.month-name-value').removeClass('selected')
}

function manageWidgetSubRows(e) {
    var collapsibleDiv = $(e).parents('.widget-values').next();

    if ($(e).parents('.widget-values').next().hasClass('open')) {
        $(e).removeClass('selected');
        collapsibleDiv.removeClass('open');
        collapsibleDiv.height(0);
    }
    else {
        $(e).parent().find('.row-name-icon').addClass('selected');
        collapsibleDiv.addClass('open');
        collapsibleDiv.height(collapsibleDiv.find('.collapsible-widget-rows').outerHeight(true));
    }
}

function widgetDataSelection(e) {
    if (($(e).parents(".data-widget-content#flavourWidget").length != 1) && ($(e).parents(".data-widget-content#packWidget").length != 1)) {
        $('.data-widget-content-values').find('.selected-row').removeClass('selected-row');

        if (sessionStorage.widgetSelection == $(e).html()) {
            sessionStorage.widgetSelection = 0;
            widgetType = 'Map';
            selectedWidgetId = '2886';
            currentView = '0';
            $('#zoomWidgetContainer').hide();
        }
        else {
            sessionStorage.widgetSelection = $(e).html();
            $("[title|='" + $(e).attr('title') + "']").parents('.widget-values').addClass('selected-row');
            selectedWidgetId = $(e).attr('id');
            widgetType = $(e).parents('.data-widget-content').attr('id').substr(0, $(e).parents('.data-widget-content').attr('id').indexOf('Widget'));
            currentView = '1';
            $('#zoomWidgetContainer').hide();
        }
        getDashboardData('widget-selection');
    }
}

function switchToggle() {
    if ($('.toggle-button').hasClass('selected')) {
        $('.toggle-button').removeClass('selected')
        $('.toggle-state').addClass('selected')
        $('.toggle-city').removeClass('selected')
        currentMap = '0';
    }
    else {
        $('.toggle-button').addClass('selected')
        $('.toggle-city').addClass('selected')
        $('.toggle-state').removeClass('selected')
        currentMap = '1';
    }

    sessionStorage.stateid = 0;
    sessionStorage.cityid = 0;
    currentMapType = '450';
    $('.demographic-container').show();
    
    getDashboardData('map-toggle');
}

function snapshotSelection(e) {
    if (($(e).attr('id') == "frequencyWidget" && selectedKpi != '2') || ($(e).attr('id') == "penetrationWidget" && selectedKpi != '1') || ($(e).attr('id') == "absoluteWidget" && selectedKpi != '3')
        || ($(e).attr('id') == "volumeWidget" && selectedKpi != '4')) {
        $(e).parent().find('.selected').removeClass('selected');
        $(e).addClass('selected');

        $(e).find('.selected').removeClass('selected');
        $(e).find('.snapshot-widget-icon').addClass('selected');

        $('.snapshot-widget-header').css('font-family', 'Montserrat');
        $(e).find('.snapshot-widget-header').css('font-family', 'Montserrat-Bold');

        widgetType = 'KPI';

        if ($(e).attr('id') == "frequencyWidget") {
            selectedKpi = '2';
            $('.footer-absolute-message').show();
            $('.footer-absolute-message').html("*Frequency defined as total number of trips/total no. of respondents.");
        }
        else if ($(e).attr('id') == "penetrationWidget") {
            selectedKpi = '1';
            $('.footer-absolute-message').hide();
        }
        else if ($(e).attr('id') == "volumeWidget") {
            selectedKpi = '4';
            $('.footer-absolute-message').show();
            $('.footer-absolute-message').html("*All numbers in Liters.");
        }
        else {
            selectedKpi = '3';
            $('.footer-absolute-message').show();
            $('.footer-absolute-message').html("*All numbers in '000s.");
        }
        
        currentView = checkDefaultView();
        getDashboardData('snapshot-selection');
    }
}

function checkDefaultView() {
    if(currentMap == '0' && currentMapType == '450' && selectedKpi == '1' && widgetType == 'Map' && selectedWidgetId == '2886') {
        return '0';
    }
    else {
        return '1';
    }
}

function expandWidgets(e) {
    $(".TranslucentDiv").show();
    $(".TranslucentDiv").css('top', '0%');

    if ($(e).parents('.data-widget').attr('id') == "mapWidget") {
        showZoomMap();
        $('.zoom-header-text').html('ALL INDIA PERFORMANCE');
    }
    else {
        $('#zoomWidgetContainer').show();

        $('.zoom-header-text').html($(e).parents('.data-widget').find('.data-widget-header-text').html());
        $('.zoom-container').html($(e).parents('.data-widget').html().substr($(e).parents('.data-widget').html().search('<div class="data-widget-content"')));

        $('.zoom-container .widget-values').css('height', '2em');
        $('.zoom-container .row-name-icon').css('margin-top', '2%');
        $('.zoom-container .data-widget-content').css('height', '96%').css('overflow', 'auto');
    }

    bindClicks();
}

function calendar() {
    if (sessionStorage.calendarSelection == 'on') {
        sessionStorage.calendarSelection = 'off';
        $(".TranslucentDiv").hide();
        $(".TranslucentDiv").css('top', '0');
        $('.calendar-container').hide();
    }
    else if ($('.zoom-map-div').css('display') != 'none' || $('#zoomWidgetContainer').css('display') != 'none') {
        $('.zoom-map-div').hide();
        $('#zoomWidgetContainer').hide();
        $(".TranslucentDiv").hide();
        $(".TranslucentDiv").css('top', '0');
    }
    else {
        //closing the demographic selection if its open
        $('.first-level-container').hide();
        $('.second-level-container').hide();

        sessionStorage.calendarSelection = 'on';
        $(".TranslucentDiv").show();
        $(".TranslucentDiv").css('top', '7%');
        $('.calendar-container').show();
    }
}

function closeZoomDiv() {
    $(".TranslucentDiv").hide();
    $(".TranslucentDiv").css('top', '7%');
    $("#zoomWidgetContainer").hide();
    closeZoomedDiv();
}

function demographicDropdown(e) {
    if ($(e).hasClass('dropdown-selected')) {
        $(e).removeClass('dropdown-selected');
        $('.first-level-container').hide();
        $('.second-level-container').hide();
    }
    else {
        $(e).addClass('dropdown-selected');
        $('.first-level-container').show();
    }
}

function selectDropDownFilter(e) {
    var htmlString = '';

    if ($(e).parent().attr('class') == 'first-level-container') {

        demogOptionsData.forEach(function (value, index) {
            if ($(e).text() == value.DemographicName) {
                if (value.IsSelectable) {
                    $('.filter-item-selected').removeClass('filter-item-selected');
                    $(e).addClass('filter-item-selected');
                    $('.selected-text-container').html($(e).text());
                    $('.selected-text-container').attr('title', $(e).text());
                    $('.first-level-container').hide();
                    $('.second-level-container').hide();
                    demographicSelection = $(e).text();
                    demographicFilterId = $(e).attr('id');
                    getDashboardData('selected-dropdown');
                }
                //make second level
                if (value.DemographicChild.length != 0) {
                    htmlString = '';
                    value.DemographicChild.forEach(function (value, index) {
                        if (demographicSelection == value.DemographicName) {
                            htmlString += '<div class="filter-item filter-item-selected"  id="' + value.DemographicCode + '" onclick="selectDropDownFilter(this)"><span class="filter-item-text" title="' + value.DemographicName + '">' + value.DemographicName + '</span></div>'
                        }
                        else {
                            htmlString += '<div class="filter-item"  id="' + value.DemographicCode + '" onclick="selectDropDownFilter(this)"><span class="filter-item-text" title="' + value.DemographicName + '">' + value.DemographicName + '</span></div>'
                        }
                    })
                    $('.second-level-container').css('top', (100 + 99 * index) + '%');
                    $('.second-level-container').show();
                    $('.second-level-container').html(htmlString);
                }
            }
        })
    }
    else {
        $('.filter-item-selected').removeClass('filter-item-selected');
        $(e).addClass('filter-item-selected');
        $('.selected-text-container').html($(e).text());
        $('.selected-text-container').attr('title', $(e).text());
        demographicSelection = $(e).text();
        $('.first-level-container').hide();
        $('.second-level-container').hide();
        demographicFilterId = $(e).attr('id');
        getDashboardData('selected-dropdown');
    }

    currentView = checkDefaultView();
}

function toggleMapMessage() {
    if (demographicSelection == "Total India" || demographicSelection == '') {
        $('#ErrorPopup').hide();
        $('#mapWidget .data-widget-content').css('opacity', '1');
        if ($('.data-widget-content-data-unavailable').css('display') == 'none') {
            $('.map-directions').show();
            $('.map-toggle').show();
            $('#mapWidget .expand-button').show();
        }
        else {
            $('.map-directions').hide();
            $('.map-toggle').hide();
            $('#mapWidget .expand-button').hide();
        }
    }
    else {
        if ($('.data-widget-content-data-unavailable').css('display') == 'none') {
            $('#ErrorPopup').show();
            $('#mapWidget .data-widget-content').css('opacity', '0.5');
        }
        else {
            $('#ErrorPopup').hide();
            $('#mapWidget .data-widget-content').css('opacity', '1');
        }
        $('.map-directions').hide();
        $('.map-toggle').hide();
        $('#mapWidget .expand-button').hide();
    }
}

function defaultSelections() {
    //set default values
    currentView = '0', currentMap = '0', currentMapType = '450', widgetType = 'map', selectedWidgetId = '2886';

    //default time period selection
    $('.time-period-options .radio-button-icon').first().addClass('selected');
    $('.time-period-options .time-period-name').first().addClass('selected');
    selectedTimePeriod = $('.time-period-options .time-period-name').first().text() + ' ';

    timePeriodsData.forEach(function (value, index) {
        if(selectedTimePeriod.trim() == value.PeriodType)
            value.TimePeriodList.forEach(function (value, index) {
                firstDate = index == 0 ? value.PeriodName : firstDate;
                selectedDate = value.Month + ' ' + value.Year;
                latestDate = selectedDate;
                selectedTimePeriodId = value.PeriodCode;
            })
    })

    //update footer date
    $('#dataDate').html(selectedDate);

    //default calendar
    var htmlString = '';
    calendarYearsRange.forEach(function (value, index) {
        htmlString += '<option value="' + value + '">' + value + '</option>';
    })
    $('#dropdown').html(htmlString);
    $('option').last().attr('selected', 'selected')

    $('.qtr-block').hide();
    $('.qtr-selection-block').hide();
    $('.month-block').css('left', '0').css('width', '100%');
    $('.month-name-value:contains(' + selectedDate.substr(0, 3) + ')').addClass('selected');
    $('.month-name-value:contains(' + selectedDate.substr(0, 3) + ')').parent().addClass('selected');

    //default snapshot selection
    $('.snapshot-widget').first().addClass('selected');
    $('.snapshot-widget-icon').first().addClass('selected');
    $('.snapshot-widget-header').first().css('font-family', 'Montserrat-Bold');
    selectedKpi = '1';

    //creating first level of dropdown
    var htmlString = '';

    $('.selected-text-container').attr('title', demogOptionsData[0].DemographicName);
    $('.selected-text-container').html(demogOptionsData[0].DemographicName);

    demogOptionsData.forEach(function (value, index) {
        htmlString += '<div class="filter-item" id="' + value.DemographicCode + '"><span class="filter-item-text" title="' + value.DemographicName + '">' + value.DemographicName + '</span></div>'
    })
    $('.first-level-container').html(htmlString);
    $('.filter-item').first().addClass('filter-item-selected');
    demographicFilterId = $('.filter-item').first().attr('id');
}

function updateTrendChart(trendChartValues) {
    currentYearTrendData = [], previousYearTrendData = [], xAxisLabels = [];
    trendChartValues.reverse().forEach(function (value, index) {
        currentYearTrendData.push(parseFloat(value.CurrentYearPercentage));
        previousYearTrendData.push(parseFloat(value.PreviousYearPercentage));
        xAxisLabels.push(value.MeasureName.replace(selectedTimePeriod, ""));
    })
    
    plotChart();
}

function selectMonth(e) {
    selectedDate = $(e).text().trim() + ' ' + $('option:selected').val();

    //update footer date
    $('#dataDate').html(selectedDate);

    $('.month-name').removeClass('selected');
    $('.month-name-value').removeClass('selected');

    timePeriodsData.forEach(function (value, index) {
        if (value.PeriodType == selectedTimePeriod.trim()) {
            value.TimePeriodList.forEach(function (value, index) {
                if (value.PeriodName.toLowerCase() == (selectedTimePeriod + selectedDate).toLowerCase()) {
                    selectedTimePeriodId = value.PeriodCode;
                    $(e).addClass('selected');
                    $(e).find('.month-name-value').addClass('selected');

                    sessionStorage.calendarSelection = 'off';
                }
            })
        }
    })

    setDefaultMapData();
    getDashboardData('calendar-selection');
    //$(".TranslucentDiv").hide();
    $('.calendar-container').hide();
}


function selectQuarter(e) {
    selectedDate = 'Q' + $(e).attr('id')[12] + ' ' + $('option:selected').val();

    //update footer date
    $('#dataDate').html(selectedDate);

    $('.quarter-inner-div').removeClass('selected');
    $('.qtr-selection').removeClass('selected');

    $(e).addClass('selected');
    $(e).parents('.calendar-container').find('.quarter-name:nth-child(' + $(e).attr('id')[12] + ')').find('.quarter-inner-div').addClass('selected');

    timePeriodsData.forEach(function (value, index) {
        if (value.PeriodType == selectedTimePeriod.trim()) {
            value.TimePeriodList.forEach(function (value, index) {
                if (value.PeriodName.toLowerCase() == selectedDate.toLowerCase()) {
                    selectedTimePeriodId = value.PeriodCode;
                    sessionStorage.calendarSelection = 'off';
                }
            })
        }
    })

    getDashboardData('calendar-selection');
    $(".TranslucentDiv").hide();
    $('.calendar-container').hide();
}

function ShowLoader() {
    $(".TranslucentDiv").show();
    $("#Loader").show();
}

function HideLoader() {
    $(".TranslucentDiv").hide();
    $("#Loader").hide();
}

function ShowError() {
    $(".TranslucentDiv").show();
    $("#ErrorPopup").show();
}

function HideError() {
    $(".TranslucentDiv").hide();
    $("#ErrorPopup").hide();
}

function selectYear() {
    $('.month-block').find('.selected').removeClass('selected');
    $('.qtr-selection-block').find('.selected').removeClass('selected');
    $('.qtr-block').find('.selected').removeClass('selected');
}

function showDataUnavailable(widgetName) {
    $('#' + widgetName).find('.data-widget-content-values').hide();
    if ($('#' + widgetName).find('.data-widget-content-data-unavailable').length == 0) {
        $('#' + widgetName + ' .data-widget-content').html('</div><div class="data-widget-content-data-unavailable">No Data Available</div>');
        $('#' + widgetName).find('.data-widget-content-data-unavailable').show();
    }
    else {
        $('#' + widgetName).find('.data-widget-content-data-unavailable').html("No Data Available");
        $('#' + widgetName).find('.data-widget-content-data-unavailable').show();
    }
}

function getMaxChangeValue(widgetData, maxChangeValue) {
    var minChangeValue = 0.0;
    
    widgetData.forEach(function (value, index) {
        maxChangeValue = parseFloat(value.Change) > maxChangeValue ? parseFloat(value.Change) : maxChangeValue;
        minChangeValue = parseFloat(value.Change) < minChangeValue ? parseFloat(value.Change) : minChangeValue;
    })
    return maxChangeValue > Math.abs(minChangeValue) ? maxChangeValue : Math.abs(minChangeValue);
}

function disableCalendarValues() {
    $('.month-name').removeClass('disabled');
    $('.month-row .month-name-value').removeClass('disabled');
    $('.quarter-name').removeClass('disabled');
    $('.qtr-selection').removeClass('disabled');
    var flag = 0;

    if ($('option:selected').val() == latestDate.split(' ')[1]) {
        if (selectedTimePeriod.trim() != 'QTR') {
            $('.month-name').each(function (index, value) {
                if (flag == 1) {
                    $(value).addClass('disabled');
                }
                if ($(value).text().trim() == latestDate.split(' ')[0]) {
                    flag = 1;
                }
            })
        }
        else {
            $('.qtr-selection').each(function (index, value) {
                if ($(value).attr('id').slice(-1) > latestDate[1]) {
                    $(value).addClass('disabled');
                    $('.month-row:eq(' + index + ') .month-name-value').addClass('disabled');
                    $('.qtr-block .quarter-name:eq(' + index + ')').addClass('disabled');
                }
            })
        }
    }

    if ($('option:selected').val() == firstDate.split(' ')[1] || $('option:selected').val() == firstDate.split(' ')[2]) {
        flag = 0;
        if (selectedTimePeriod.trim() != 'QTR') {
            $('.month-name').each(function (index, value) {
                if ($(value).text().trim() == firstDate.split(' ')[1]) {
                    flag = 1;
                }
                if (flag == 0) {
                    $(value).addClass('disabled');
                }
            })
        }
        else {
            $('.qtr-selection').each(function (index, value) {
                if ($('.quarter-name:eq(' + index + ') .quarter-inner-div').text().search(firstDate.split(' ')[0]) != -1) {
                    flag = 1;
                }
                if(flag == 0) {
                    $(value).addClass('disabled');
                    $('.month-row:eq(' + index + ') .month-name-value').addClass('disabled');
                    $('.qtr-block .quarter-name:eq(' + index + ')').addClass('disabled');
                }
            })
        }
    }
}