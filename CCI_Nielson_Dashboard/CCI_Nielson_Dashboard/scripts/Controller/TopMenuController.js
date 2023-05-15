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
        //$("#hiddenField").datepicker({
        //    changeYear: true,
        //    changeMonth: true,
        //    showOn: "button",
        //    closeText: "Close",
        //    showOtherMonths: true,
        //    selectOtherMonths: true,
        //    minDate: "-10y",
        //    maxDate: "-1d",
        //    defaultDate: $scope.SelectedDate,
        //    dayNamesMin: ["S", "M", "T", "W", "T", "F", "S"],
        //    showAnim: "slideDown",
        //    beforeShow: function (input, inst) {
        //        inst.dpDiv.css({ marginTop: '3%', marginLeft: '-3%' });
        //        setTimeout(function () {
        //            $(".ui-datepicker-title").append("<label style='float:right;width:17%;margin-right: 2%;line-height: 150%;'>Month</label>");
        //        }, 100)
        //    },
        //    onChangeMonthYear: function (dateText) {
        //        setTimeout(function () {
        //            $(".ui-datepicker-title").append("<label style='float:right;width:17%;margin-right: 2%;line-height: 150%;'>Month</label>");
        //        }, 10)
        //    },
        //    onSelect: function (dateText, inst) {
        //        //alert('select!');
        //        let date = new Date(dateText);
        //        $scope.SelectedDate = date;
        //        updateModulesTime(date);
        //    }
        //});
        //$('.ui-datepicker-trigger').attr("title", "Calendar");
        //let getFormattedDate = function (date) {
        //    let monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        //    let day = date.getDate();
        //    let monthIndex = date.getMonth();
        //    let year = date.getFullYear();
        //    return day + ' ' + monthNames[monthIndex] + ', ' + year;
        //}
        //let updateModulesTime = function (date) {
        //    _.map($scope.modules, function (m) {
        //        m.footer.leftText = "Source: DSR as on " + getFormattedDate(date);
        //    });
        //    $scope.FilterReference.NpBottlerList = [];
        //    $scope.clickLayout();
        //    $scope.FilterReference.submitFilter(false);
        //    $scope.$apply();
        //}
        $scope.modules = [{
            Id: 0,
            Name: "Dashboard",
            ModuleName: "DASHBOARD",
            IsActive: false,
            IsDisabled: true,
            State: "defaultState.TopMenu.FilterPanel.Dashboard",
            Description: undefined,
            footer: {
                leftText: "Footer",
                rightText: ""
            }
        }, {
            Id: 1,
            Name: "Cross Tab",
            ModuleName: "CROSSTAB",
            IsActive: false,
            IsDisabled: true,
            State: "defaultState.TopMenu.FilterPanel.CrossTab",
            Description: undefined,
            footer: {
                leftText: "Footer",
                rightText: ""
            }
        },{
            Id: 2,
            Name: "Change Decomposition",
            ModuleName: "DEEPDIVE",
            IsActive: false,
            IsDisabled: true,
            State: "defaultState.TopMenu.FilterPanel.Deepdive",
            Description: undefined,
            footer: {
                leftText: "Source: Nielsen",
                rightText: ""
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

        }
        $scope.SetclickLayoutFunction = function (func) {
            $scope.clickLayout = func;
        }

    }]);
})