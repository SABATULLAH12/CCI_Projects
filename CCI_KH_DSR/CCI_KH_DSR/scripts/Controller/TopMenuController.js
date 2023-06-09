﻿/*-------------------------------------------------------------------------------------------------------*/
/*          Author: Rahul Kumar (Software Engineer, F&B)                                                 */
/*          Date: 04-12-2019                                                                             */
/*          Discription: This Script contains TopMenu Controller definition                              */
/*-------------------------------------------------------------------------------------------------------*/

"use strict";
define(['app', 'angular', 'ajaxservice', 'niceScroll'], function (app, angular) {
    app.register.controller("TopMenuController", ['$scope', '$css', '$state', "$http", "$sce", 'AjaxService', function ($scope, $css, $state, $http, $sce, AjaxService) {
        ReleaseMode ? $css.bind({ href: '../Content/MinifiedCss/top_menu.min.css?v=' + csshtmlver }, $scope) : $css.bind({ href: '../Content/Css/top_menu.css' }, $scope);
        let layoutScope = $scope.$parent;
        $scope.SelectedDate = new Date();
        $scope.SelectedDate.setDate($scope.SelectedDate.getDate() - 1);
        $scope.SetFilterScopeReference = function (obj) {
            $scope.FilterReference = obj;
        }
        $("#hiddenField").datepicker({
            changeYear: true,
            changeMonth: true,
            showOn: "button",
            closeText: "Close",
            showOtherMonths: true,
            selectOtherMonths: true,
            minDate: new Date(2003, 0, 1),
            yearRange: "2003:+nn",
            maxDate: "-1d",
            defaultDate: $scope.SelectedDate,
            dayNamesMin: ["S", "M", "T", "W", "T", "F", "S"],
            showAnim: "slideDown",
            beforeShow: function (input, inst) {
                inst.dpDiv.css({ marginTop: '3%', marginLeft: '-3%' });
                setTimeout(function () {
                    $(".ui-datepicker-title").append("<label style='float:right;width:17%;margin-right: 2%;line-height: 150%;'>Month</label>");
                }, 100)
            },
            onChangeMonthYear: function (dateText) {
                setTimeout(function () {
                    $(".ui-datepicker-title").append("<label style='float:right;width:17%;margin-right: 2%;line-height: 150%;'>Month</label>");
                }, 10)
            },
            onSelect: function (dateText, inst) {
                //alert('select!');
                let date = new Date(dateText);
                $scope.SelectedDate = date;
                updateModulesTime(date);
            }
        });
        $scope.NPBottlerDaterestriction = function () {
            var d = new Date();
            return $scope.SelectedDate >= d.setDate(d.getDate() - 16);
        }
        $('.ui-datepicker-trigger').attr("title", "Calendar");
        let getFormattedDate = function (date) {
            let monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
            let day = date.getDate();
            let monthIndex = date.getMonth();
            let year = date.getFullYear();
            return day + ' ' + monthNames[monthIndex] + ', ' + year;
        }
        let updateModulesTime = function (date) {
            _.map($scope.modules, function (m) {
                m.footer.leftText = "Source: NSR 2.0 as on " + getFormattedDate(date);
            });
            $scope.FilterReference.NpBottlerList = [];
            $scope.clickLayout();
            $scope.FilterReference.submitFilter(false);
            $scope.$apply();
        }
        $scope.modules = [{
            Id: 0,
            Name: "Decomposition",
            ModuleName: "KV1",
            IsActive: false,
            IsDisabled: false,
            State: "defaultState.TopMenu.FilterPanel.Kaleidoscope.View1",
            Description: undefined,
            footer: {
                leftText: "Source: NSR 2.0 as on " + getFormattedDate($scope.SelectedDate),
                rightText: ""
            }
        }, {
            Id: 1,
            Name: "Scatter Plot",
            ModuleName: "KV2",
            IsActive: false,
            IsDisabled: false,
            State: "defaultState.TopMenu.FilterPanel.Kaleidoscope.View2",
            Description: undefined,
            footer: {
                leftText: "Source: NSR 2.0 as on " + getFormattedDate($scope.SelectedDate),
                rightText: "Only points with values -200% to 200% on either axis are shown | Click on Bubble for Decomposition View"
            }
        },{
            Id: 2,
            Name: "Top 10",
            ModuleName: "TOP10",
            IsActive: false,
            IsDisabled: false,
            State: "defaultState.TopMenu.FilterPanel.Top10",
            Description: undefined,
            footer: {
                leftText: "Source: NSR 2.0 as on " + getFormattedDate($scope.SelectedDate),
                rightText: ""
            },
        }, {
            Id: 3,
            Name: "NKA",
            ModuleName: "NKA",
            IsActive: false,
            IsDisabled: false,
            State: "",
            Description: undefined,
            footer: {
                leftText: "Source: NSR 2.0 as on " + getFormattedDate($scope.SelectedDate),
                rightText: "Only points with values -200% to 200% on either axis are shown | Click on Bubble for Decomposition View"
            }
        }, {
            Id: 4,
            Name: "EVOLUTION",
            ModuleName: "EVOLUTION",
            IsActive: false,
            IsDisabled: false,
            State: "",
            Description: undefined,
            footer: {
                leftText: "Source: NSR 2.0 as on " + getFormattedDate($scope.SelectedDate),
                rightText: "Only points with values -200% to 200% on either axis are shown | Click on Bubble for Decomposition View"
            }
        }];

        $scope.extraRightText = function (prefix) {
            let module = $scope.getSelectedModule();
            let value = "";
            if (module != undefined && $scope.FilterReference != undefined) {
                if ($scope.FilterReference.filterPanel && $scope.FilterReference.filterPanel.length >= 4 && $scope.FilterReference.filterPanel[3].Selection.Name =="volume") {
                    value += (prefix != "" ? " | " : "") + "All number in '000 UCs";
                }
            }
            return prefix + value;
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

        $scope.clickModule = function (module) {
            if (module.IsDisabled) {
                layoutScope.customAlert(module.Name + " is currently disabled.", 'Maintenance');
                return;
            }
            else if (module.IsActive) {
                return;
            }
            else if (module.Name == "NKA") {
                window.open("https://app.powerbi.com/groups/ae6ee5c1-6d38-4827-848e-9c305a84babe/reports/abe1692e-08c2-4095-9b25-37bdb99a2152?ctid=548d26ab-8caa-49e1-97c2-a1b1a06cc39c")
            }
            else if (module.Name == "EVOLUTION") {
                window.open("https://app.powerbi.com/groups/ae6ee5c1-6d38-4827-848e-9c305a84babe/reports/c464354b-dd0a-4b53-ba3c-0e36ed61c549?ctid=548d26ab-8caa-49e1-97c2-a1b1a06cc39c")
            }
            else if (module.Name == "Scatter Plot") {
                return;
            }
            else {
                angular.forEach($scope.modules, function (obj) { if (module.ModuleName.toLowerCase() != obj.ModuleName.toLowerCase()) obj.IsActive = false; });
                $(".np_bottler_continer").getNiceScroll().remove();
                layoutScope.removeNiceScrollRail();
                SetScroll($(".np_bottler_continer"), "#CE7474", 0, 0, 0, 0, 4, false);
                window.dataLayer = window.dataLayer || [];
                function gtag() { dataLayer.push(arguments); }
                gtag('js', new Date());
                gtag('config', sessionStorage['GID'], { 'page_path': 'BuisnessSnapshot/' + module.ModuleName });
                $state.go(module.State, {}, { location: 'replace' });
            }
        }

        $scope.HomeButtonClick = function () {
            window.location.replace(sessionStorage["HomeButtonUrl"].toString());
        }

        $scope.getSelectedModule = function () {
            return _.find($scope.modules, function (obj) { return obj.IsActive == true });
        }

        $scope.getModuleByModuleName = function (moduleName) {
          
            return _.find($scope.modules, function (obj) { return obj.ModuleName.toLowerCase() == moduleName.toLowerCase() });
        }

        $scope.clickLayout = function () {
            if ($scope.FilterReference.openCloseFilter) {
                $scope.FilterReference.openCloseFilter();
            }
            if ($scope.FilterReference.IsNpBottlerDropdownOpen) {
                $scope.FilterReference.IsNpBottlerDropdownOpen = false;
            }
        }

    }]);
})