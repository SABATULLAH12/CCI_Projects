"use strict";
define(['app', 'angular', 'html2canvas', 'ajaxservice', 'constants'], function (app, angular, html2canvas) {
    app.register.controller("CrossTabController", ['$scope', '$css', '$sce', 'AjaxService', 'Constants', function ($scope, $css, $sce, AjaxService, Constants) {

        ReleaseMode ? $css.bind({ href: '../Content/MinifiedCss/CrossTab.min.css?v=' + csshtmlver }, $scope) : $css.bind({ href: '../Content/Css/CrossTab.css' }, $scope);

        let filterPanelScope = $scope.$parent;
        let layoutScope = $scope.$parent.$parent.$parent;
        let topMenuScope = $scope.$parent.$parent;
        let selectedModule = topMenuScope.modules[1];
        selectedModule.IsActive = true;
        AjaxService.AjaxTrackModule(selectedModule.Name);

        $scope.leftPanel = [];
        $scope.FilterLevel = {};
        $scope.IsSelSumExapanded = false;
        $scope.IsLeftPanelExpanded = false;
        $scope.ShowSearchWhenDataMoreThan = 7;
        $scope.ResetLimitLengthTo = 30;
        $scope.LimitLength = 30;
        $scope.IncreaseLimitBy = 100;
        $scope.SearchText = { level1Search: "", level2Search: ""};

        let SetScroll = function (classname, cursor_color, top, right, left, bottom, cursorwidth, horizrailenabled) {
            setTimeout(function () {
                let Obj = $("." + classname);
                $(Obj).niceScroll({
                    cursorcolor: cursor_color,
                    cursorborder: cursor_color,
                    cursorwidth: cursorwidth + "px",
                    autohidemode: false,
                    background: "#161616",
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

        $scope.filterDataRepository = function (name) {
            let arr;
            angular.forEach(filterPanelScope.RawFilterData.CrosstabFilterList, function (obj) {
                if (obj.Name == name)
                    arr = obj.Data;
            });
            return _.cloneDeep(arr);
        }

        $scope.expandLeftPanel = function () {
            $scope.IsLeftPanelExpanded = !$scope.IsLeftPanelExpanded;
            $scope.IsSelSumExapanded = false;
        }

        $scope.expandSelSummary = function () {
            $scope.IsSelSumExapanded = !$scope.IsSelSumExapanded;
            if ($scope.IsSelSumExapanded) {
                $scope.IsLeftPanelExpanded = false;
            }
        }

        let FormatFilterData = function (item) {
            _.map(item.Data, function (obj) {
                obj.IsOpen = false;
                obj.IsChildSelected = false;
                obj.IsSelected = false;
                obj.parent = item;
                obj.Selection = [];
                FormatFilterData(obj);
            });
        }

        let prepareLeftPanelData = function () {
            //angular.forEach($scope.leftPanel, function (obj) {
            //    obj.Data = $scope.filterDataRepository(obj.Name);
            //});
            $scope.leftPanel[0].Data = $scope.filterDataRepository($scope.leftPanel[0].Name);
            FormatFilterData($scope.leftPanel[0]);
        }

        $scope.fillLeftPanal = function () {
            $scope.leftPanel = [
                 { Id: 0, Under: "Table Structure", Name: "column", DispName: "COLUMN", Dependent: [], Dependency: [1,2,3,4,5],IsMulti:false, IsHidden: false, IsOpen: false, Data: null, Selection: [] },
                 { Id: 1, Under: "Table Structure", Name: "row", DispName: "ROW", Dependent: [0], Dependency: [2, 3, 4, 5], IsMulti: false, IsHidden: false, IsOpen: false, Data: null, Selection: [] },
                 { Id: 2, Under: "Table Content", Name: "region", DispName: "REGION", Dependent: [0, 1], Dependency: [], IsMulti: false, IsHidden: false, IsOpen: false, Data: null, Selection: [] },
                 { Id: 3, Under: "Table Content", Name: "kpi", DispName: "KPI", Dependent: [0, 1], Dependency: [], IsMulti: false, IsHidden: false, IsOpen: false, Data: null, Selection: [] },
                 { Id: 4, Under: "Table Content", Name: "product", DispName: "PRODUCT", Dependent: [0, 1], Dependency: [], IsMulti: false, IsHidden: false, IsOpen: false, Data: null, Selection: [] },
                 { Id: 5, Under: "Table Content", Name: "timeperiod", DispName: "TIME PERIOD", Dependent: [0, 1], Dependency: [], IsMulti: false, IsHidden: false, IsOpen: false, Data: null, Selection: [] },
            ];
            prepareLeftPanelData();
            //applyDefaultSelection(false);
        }

        let CheckBeforeDepency = function (TabId) {
            for (var i = 0; i < $scope.leftPanel[TabId].Dependent.length; i++) {
                if (!($scope.leftPanel[$scope.leftPanel[TabId].Dependent[i]].Selection.length > 0)) {
                    layoutScope.customAlert("Please make the selection in sequence.", "Alert");
                    return true;
                }
            }
            return false;
        }
        
        $scope.openModuleLeftPanel = function (item, parent) {
            if (CheckBeforeDepency(item.Id)) return;

            if (item.Name == "column") {
                //Data is already binded
            }
            else if (item.Name == "row") {
                item.Data = _.remove(_.map($scope.filterDataRepository('column'), function (obj) {
                    if (obj.Name == $scope.leftPanel[0].Selection[0].Name) {
                        if (obj.Name == 'Product') {
                            obj.Data = _.remove(_.map(obj.Data, function (obj) {
                                return obj.Name == $scope.leftPanel[0].Selection[0].Selection[0].Name ? undefined : obj;
                            }), undefined);
                        }
                        else {
                            return undefined;
                        }
                    }
                    return obj;
                }), undefined);
            }
            else if (item.Name == "region") {
                item.IsMulti = ($scope.leftPanel[0].Selection[0].Name.toLowerCase() == item.Name || $scope.leftPanel[1].Selection[0].Name.toLowerCase() == item.Name);
                if (item.IsMulti && $scope.leftPanel[0].Selection[0].Name.toLowerCase() == item.Name) {
                    item.Data = _.remove(_.map($scope.filterDataRepository(item.Name), function (obj) {
                        if (obj.Name.toLowerCase() == $scope.leftPanel[0].Selection[0].Selection[0].Name.toLowerCase()) {
                            return obj.Data;
                        }
                    }), undefined);
                    item.Data = item.Data[0];
                }
                else if(item.IsMulti && $scope.leftPanel[1].Selection[0].Name.toLowerCase() == item.Name){
                    item.Data = _.remove(_.map($scope.filterDataRepository(item.Name), function (obj) {
                        if (obj.Name.toLowerCase() == $scope.leftPanel[1].Selection[0].Selection[0].Name.toLowerCase()) {
                            return obj.Data;
                        }
                    }), undefined);
                    item.Data = item.Data[0];
                }
                else{
                    item.Data = $scope.filterDataRepository(item.Name);
                }
            }
            else if (item.Name == "kpi") {              
                item.IsMulti = ($scope.leftPanel[0].Selection[0].Name.toLowerCase() == item.Name || $scope.leftPanel[1].Selection[0].Name.toLowerCase() == item.Name);
                item.Data = $scope.filterDataRepository(item.Name);
            }
            else if (item.Name == "product") {
                item.IsMulti = ($scope.leftPanel[0].Selection[0].Name.toLowerCase() == item.Name || $scope.leftPanel[1].Selection[0].Name.toLowerCase() == item.Name);
                if (item.IsMulti && $scope.leftPanel[0].Selection[0].Name.toLowerCase() == item.Name && $scope.leftPanel[1].Selection[0].Name.toLowerCase() == item.Name) {
                    item.Data = _.remove(_.map($scope.filterDataRepository(item.Name), function (obj) {
                        if (obj.Name.toLowerCase() == $scope.leftPanel[0].Selection[0].Selection[0].Name.toLowerCase() || obj.Name.toLowerCase() == $scope.leftPanel[1].Selection[0].Selection[0].Name.toLowerCase()) {
                            return obj;
                        }
                    }), undefined);
                }
                else if (item.IsMulti && $scope.leftPanel[0].Selection[0].Name.toLowerCase() == item.Name) {
                    item.Data = _.remove(_.map($scope.filterDataRepository(item.Name), function (obj) {
                        if (obj.Name.toLowerCase() == $scope.leftPanel[0].Selection[0].Selection[0].Name.toLowerCase()) {
                            return obj.Data;
                        }
                    }), undefined);
                    item.Data = item.Data[0];
                }
                else if (item.IsMulti && $scope.leftPanel[1].Selection[0].Name.toLowerCase() == item.Name) {
                    item.Data = _.remove(_.map($scope.filterDataRepository(item.Name), function (obj) {
                        if (obj.Name.toLowerCase() == $scope.leftPanel[1].Selection[0].Selection[0].Name.toLowerCase()) {
                            return obj.Data;
                        }
                    }), undefined);
                    item.Data = item.Data[0];
                }
                else {
                    item.Data = $scope.filterDataRepository(item.Name);
                }
            }
            else if (item.Name == "timeperiod") {
                item.IsMulti = ($scope.leftPanel[0].Selection[0].Name.toLowerCase() == item.Name || $scope.leftPanel[1].Selection[0].Name.toLowerCase() == item.Name);
                if (item.IsMulti && $scope.leftPanel[0].Selection[0].Name.toLowerCase() == item.Name) {
                    item.Data = _.remove(_.map($scope.filterDataRepository(item.Name), function (obj) {
                        if (obj.Name.toLowerCase() == $scope.leftPanel[0].Selection[0].Selection[0].Name.toLowerCase()) {
                            return obj.Data;
                        }
                    }), undefined);
                    item.Data = item.Data[0];
                }
                else if (item.IsMulti && $scope.leftPanel[1].Selection[0].Name.toLowerCase() == item.Name) {
                    item.Data = _.remove(_.map($scope.filterDataRepository(item.Name), function (obj) {
                        if (obj.Name.toLowerCase() == $scope.leftPanel[1].Selection[0].Selection[0].Name.toLowerCase()) {
                            return obj.Data;
                        }
                    }), undefined);
                    item.Data = item.Data[0];
                }
                else {
                    item.Data = $scope.filterDataRepository(item.Name);
                }
            }
            FormatFilterData(item);
            if (item.Data == null || item.Data.length == 0) {
                layoutScope.customAlert("Filter is Empty, Please change the Combination.", "Error");
                return;
            }
            let IsOpen = item.IsOpen == undefined ? false : item.IsOpen;
            _.map(parent, function (obj) {
                obj.IsOpen = false;
            });
            item.IsOpen = !IsOpen;
            if (item.IsOpen) {
                ApplyTopToBottom($scope.leftPanel[item.Id]);
                SetScroll("level1", "#EA1F2A", 0, 0, 0, 0, 3, false);
                SetScroll("level2", "#EA1F2A", 0, 0, 0, 0, 3, false);
                $scope.SearchText = { level1Search: "", level2Search: "" };
            }
        }

        $scope.IsSelectable = function (item) {
            return item.Data.length == 0;
        }

        $scope.GetSelectionObject = function (item) {
            let pnode = item;
            let Myselection = [];
            while (pnode != null) {
                Myselection.push(
                    {
                        Id: pnode.Id,
                        Name: pnode.Name,
                        Selection: null
                    })
                pnode = pnode.parent;
            }
            for (let i = 0; i < Myselection.length - 1; i++) {
                Myselection[i + 1].Selection = [Myselection[i]];
            }
            return Myselection[Myselection.length - 1];
        };

        let ClearDependentFitler = function (TabId) {
            angular.forEach($scope.leftPanel[TabId].Dependency, function (obj) {
                $scope.clearTab(obj);
            })
        }

        let ClearFilterTab = function (item) {
            angular.forEach(item.Data, function (obj) {
                obj.IsSelected = false;
                obj.IsChildSelected = false;
                obj.Selection = [];
                if (!obj.Data.length == 0) {
                    ClearFilterTab(obj);
                }
            });
        }

        $scope.clearTab = function (TabId) {
            let tabId = TabId == undefined ? _.result(_.find($scope.leftPanel, function (obj) { return obj.IsOpen == true; }), 'Id') : TabId
            $scope.leftPanel[tabId].Selection = [];
            ClearFilterTab($scope.leftPanel[tabId]);
            ClearDependentFitler(tabId);
        }

        $scope.clearAll = function () {
            $scope.clearTab(0);
            _.map($scope.leftPanel, function (item) {
                item.IsOpen = false;
            });
        }

        let ApplySelection = function (item, Selection) {
            let selection = Selection == undefined ? [] : Selection;
            var x = $scope.GetSelectionObject(item);
            if ($scope.leftPanel[x.Id].IsMulti) {
                angular.forEach(item.Data, function (obj) {
                    obj.Selection = [];
                    obj.IsSelected = obj.IsSelected
                    obj.IsChildSelected = false

                    for (var i = 0; i < selection.length; i++) {
                        if (obj.Id == selection[i].Id) {
                            if (selection[i].Selection == null) {
                                obj.IsSelected = true;
                                obj.IsChildSelected = false;
                                //obj.Selection = [];
                            }
                            else {
                                obj.IsChildSelected = true
                                obj.Selection.push(selection[i].Selection[0])
                            }
                        }
                        else {
                            if (selection.length == 1) {
                                obj.IsSelected = false
                                obj.IsChildSelected = false
                                obj.Selection = [];
                            }
                        }
                    }
                    obj.Parent = item;
                });
            }
            else {
                angular.forEach(item.Data, function (obj) {
                    for (var i = 0; i < selection.length; i++) {

                        if (obj.Id == selection[i].Id) {
                            if (selection[i].Selection == null) {
                                obj.IsSelected = true;
                                obj.IsChildSelected = false;
                                obj.Selection = [];
                            }
                            else {
                                obj.IsSelected = false
                                obj.IsChildSelected = true
                                obj.Selection = selection[i].Selection
                            }
                        }
                        else {
                            if (selection.length == 1) {
                                obj.IsSelected = false
                                obj.IsChildSelected = false
                                obj.Selection = [];
                            }
                        }
                    }
                    obj.Parent = item;
                });
            }
        }

        let isLeaveNode = function (item) {
            return item.Data === undefined || item.Data === null || item.Data.length === 0;
        }

        let ApplyTopToBottom = function (item) {
            ApplySelection(item, item.Selection)
            if (!isLeaveNode(item)) ApplyTopToBottomRecursion(item);
        }

        let ApplyTopToBottomRecursion = function (item) {
            angular.forEach(item.Data, function (obj) {
                ApplySelection(obj, obj.Selection)
                if (!isLeaveNode(obj)) ApplyTopToBottomRecursion(obj);
            })
        }

        let checkMaxSelections = function (Selection) {
            let MaxlimitWhenMulti = 15;
            let MaxSelectionReached = false;
            if ($scope.leftPanel[Selection.Id].Name == 'product'
                && $scope.leftPanel[Selection.Id].IsMulti
                && $scope.leftPanel[0].Selection[0].Name.toLowerCase() == 'product'
                && $scope.leftPanel[1].Selection[0].Name.toLowerCase() == 'product') {
                //Special Product Case
                let checkArray = [];
                _.map($scope.leftPanel[Selection.Id].Selection, function (item) { if (item.Name == Selection.Selection[0].Name) checkArray.push(item.Name); });
                if (checkArray.length == MaxlimitWhenMulti) {
                    MaxSelectionReached = true;
                }
            }
            else if ($scope.leftPanel[Selection.Id].Selection.length == MaxlimitWhenMulti) {
                MaxSelectionReached = true;
            }
            if (MaxSelectionReached) {
                layoutScope.customAlert("Only "+MaxlimitWhenMulti+" Selections are allowed in this list!", "Alert");
            }
            return MaxSelectionReached;
        }

        $scope.selectChildPanel = function (item, module) {
            let Selection = $scope.GetSelectionObject(item);
            if (module.IsMulti) {
                if (item.IsSelected) {
                    //Match selection in filterpanel and remove
                    $scope.leftPanel[Selection.Id].Selection = _.remove($scope.leftPanel[Selection.Id].Selection, function (obj) {
                        return !_.isMatch(obj, Selection.Selection[0])
                    });

                    item.IsSelected = !item.IsSelected;
                    ClearDependentFitler(Selection.Id);
                    ApplyTopToBottom($scope.leftPanel[Selection.Id]);
                }
                else {
                    if (checkMaxSelections(Selection)) {
                        return;
                    }
                    ClearDependentFitler(Selection.Id);
                    item.IsSelected = !item.IsSelected;
                    $scope.leftPanel[Selection.Id].Selection.push(Selection.Selection[0]);
                    let pnode = item;
                    while (pnode != null) {
                        pnode.IsChildSelected = true;
                        pnode = pnode.Parent;
                    }
                }
            }
            else {
                if (item.IsSelected) {
                    $scope.clearTab(Selection.Id);
                    //remove this object from selection
                }
                else {
                    $scope.clearTab(Selection.Id);
                    item.IsSelected = !item.IsSelected;
                    $scope.leftPanel[Selection.Id].Selection = Selection.Selection;
                    let pnode = item;
                    while (pnode != null) {
                        pnode.IsChildSelected = true;
                        pnode = pnode.parent;
                    }
                }
            }
            ApplyTopToBottom($scope.leftPanel[Selection.Id]);
        }

        $scope.openChildPanel = function (item, parent) {
            let IsOpen = item.IsOpen == undefined ? false : item.IsOpen;
            _.map(parent.Data, function (obj) {
                obj.IsOpen = false;
            });
            item.IsOpen = !IsOpen;
            SetScroll("level2", "#EA1F2A", 0, 0, 0, 0, 3, false);
        }

        let isLeaveSelection = function (item) {
            return item.Selection === undefined || item.Selection === null || item.Selection.length === 0
        };

        let LoopSelectionName = function (Selection) {
            if (isLeaveSelection(Selection)) {
                return Selection.Name
            }
            else {
                return LoopSelectionName(Selection.Selection[0])
            }
        }

        let LoopWithParentSelectionName = function (Selection) {
            if (isLeaveSelection(Selection)) {
                return Selection.Name
            }
            else {
                return "(" + Selection.Name + ") " + LoopWithParentSelectionName(Selection.Selection[0])
            }
        }
        
        let getFilterSelectionName = function (FilterId) {
            let SelectionList = [];
            angular.forEach($scope.leftPanel[FilterId].Selection, function (obj) {
                SelectionList.push(LoopSelectionName(obj));
            })
            return SelectionList;
        }

        let getWithParentSelectionName = function (FilterId) {
            let SelectionList = [];
            angular.forEach($scope.leftPanel[FilterId].Selection, function (obj) {
                SelectionList.push(LoopWithParentSelectionName(obj));
            })
            return SelectionList;
        }

        let CheckAllFilterSelected = function () {
            let pendingSelection = "";
            angular.forEach($scope.leftPanel, function (item) {
                if (item.Name.toLowerCase() == 'product'
                    && item.IsMulti && $scope.leftPanel[0].Selection[0].Name.toLowerCase() == item.Name
                    && $scope.leftPanel[1].Selection[0].Name.toLowerCase() == item.Name && pendingSelection == "") {
                    //special Case
                    let checkArray = [];
                    _.map($scope.leftPanel[item.Id].Selection, function (item) { checkArray.push(item.Name); });
                    if (!_.includes(checkArray, $scope.leftPanel[0].Selection[0].Selection[0].Name) ) {
                        pendingSelection = "PRODUCT - " + $scope.leftPanel[0].Selection[0].Selection[0].Name;
                    }
                    else if (!_.includes(checkArray, $scope.leftPanel[1].Selection[0].Selection[0].Name)) {
                        pendingSelection = "PRODUCT - " + $scope.leftPanel[1].Selection[0].Selection[0].Name;
                    }
                }
                else if(!item.IsHidden && pendingSelection == "" && item.Selection.length == 0) {
                    pendingSelection = item.DispName;
                }
            });
            return pendingSelection;
        }

        $scope.GetSelectionText = function (item) {
            let selText = "";
            let list = getFilterSelectionName(item.Id);
            if (item.Selection.length == 0) {
                selText = 'None';
            }
            else if (item.Selection.length == 1) {
                selText = list[0];
            }
            else {
                selText = 'Multiple';
            }
            return selText;
        }

        let GetSelectionTextForItem = function (item) {
            let seltext = "";
            let seletionList = getWithParentSelectionName(item.Id);
            if (seletionList.length > 0) {
                {
                    if (item.IsMulti && $scope.leftPanel[0].Selection[0].Name.toLowerCase() == item.Name.toLowerCase() && $scope.leftPanel[1].Selection[0].Name.toLowerCase() == item.Name.toLowerCase()) {
                        seltext += item.DispName + " : " + seletionList.join(", ");
                    }
                    else if (item.IsMulti && $scope.leftPanel[0].Selection[0].Name.toLowerCase() == item.Name.toLowerCase() && $scope.leftPanel[0].Selection[0].Selection != null) {
                        seltext += item.DispName + " : (" + $scope.leftPanel[0].Selection[0].Selection[0].Name + ") " + seletionList.join(", ");
                    }
                    else if (item.IsMulti && $scope.leftPanel[1].Selection[0].Name.toLowerCase() == item.Name.toLowerCase() && $scope.leftPanel[1].Selection[0].Selection != null) {
                        seltext += item.DispName + " : (" + $scope.leftPanel[1].Selection[0].Selection[0].Name + ") " + seletionList.join(", ");
                    }
                    else {
                        seltext += item.DispName + " : " + seletionList.join(", ");
                    }
                    seltext += " | ";
                }
            }
            return seltext;
        }

        $scope.getSelectionSummary = function () {
            let seltext = "";
            angular.forEach($scope.leftPanel, function (item) {
                seltext += GetSelectionTextForItem(item);
            });
            return seltext;
        }

        let decimalPrecisionByDivideMultipy = function (Value, DecimalPlace,colorCode) {
            if (Value == null) return "<span style='color:grey'>NA</span>";
            if (DecimalPlace == null) DecimalPlace = 2;
            let i = 0, multiplier = 1;
            for (i; i < DecimalPlace; i++) {
                multiplier = multiplier * 10;
            }
            let formattedDecimal = Math.round(parseFloat(Value) * multiplier) / multiplier;
            if (colorCode) {
                if (formattedDecimal < 0) {
                    return "<span style='color:#E0312D;font-weight:bold;'>-" + formattedDecimal + "</span>";
                }
                else if (formattedDecimal == 0) {
                    return "<span style='font-weight:bold;'>" + formattedDecimal + "</span>";
                }
                else if(formattedDecimal > 0){
                    return "<span  style='color:#357C3E;font-weight:bold;'>+" + formattedDecimal + "</span>";
                }
            }
            else {
                return "<span style='font-weight:bold;'>" + formattedDecimal + "</span>";
            }
        }

        let ShowOutput = function (resp) {
            layoutScope.setLoader(false);
            let crosstabData = resp.data;
            let tablehtml = "";
            let row = _.uniq(_.map(crosstabData, 'row'));
            let column = _.uniq(_.map(crosstabData, 'column'));
            if (row.length == 0 && column.length == 0) {
                tablehtml = "";
                layoutScope.customAlert("No Data Available.", "Alert");
            }
            else {
                if (row.length < 10 && column.length < 4) {
                    tablehtml = "<div class='cross_tab_table' style='justify-content: center;'><table style='align-self: center;'><thead><tr><th><div class='tablehead'>";
                }
                else if (row.length < 10) {
                    tablehtml = "<div class='cross_tab_table'><table style='align-self: center;'><thead><tr><th><div class='tablehead'>";
                }
                else {
                    tablehtml = "<div class='cross_tab_table'><table><thead><tr><th><div class='tablehead'>";
                }
                tablehtml += "<div class='tablehead1' style='width:100%;border-bottom: 0.5px solid #C8C8C8;'>" + GetSelectionTextForItem($scope.leftPanel[0]).replace("COLUMN : ", "").replace(" |", "");
                tablehtml += "</div><div class='tablehead1' style='text-align:left;width:100%;'>" + GetSelectionTextForItem($scope.leftPanel[1]).replace("ROW : ", "").replace(" |", "") + "</div></div></th>";
                for (let index in column) {
                    tablehtml += "<th colspan=2><div class='tablehead'><div class='tablehead1' style='border-bottom: 0.5px solid #C8C8C8;'>"
                        + column[index] + "<div class='small_border_center'></div></div><div class='tablehead1'><div class='tablehead2' style='border-right: 0.5px solid #C8C8C8;'>Value</div><div class='tablehead2'>Change</div></div></div></th>";
                }
                tablehtml += "</tr></thead>";
                for (let index1 in row) {
                    tablehtml += "<tr><th><div class='tablerowheader'>" + row[index1] + "</div></th>";
                    for (let index2 in column) {
                        let item = _.find(crosstabData, { 'column': column[index2], 'row': row[index1] });
                        tablehtml += "<td style='width:7vw;text-align:center'>" + (item == undefined ? "null" : decimalPrecisionByDivideMultipy(item.valueNumber, 1, false)) + "</td>";
                        tablehtml += "<td style='width:7vw;text-align:center'>" + (item == undefined ? "null" : decimalPrecisionByDivideMultipy(item.changeNumber, 1, true)) + "</td>";
                    }
                    tablehtml += "</tr>";
                }
                tablehtml += "</table></div>";
            }
            $(".cross_tab_output")[0].innerHTML = tablehtml;
            $scope.IsLeftPanelExpanded = false;
            SetScroll("cross_tab_table", "#EA1F2A", 0, -10, 0, -10, 5, true);
        }

        $scope.submitFilter = function () {
            let pendingSelection = CheckAllFilterSelected();
            if (pendingSelection != "") {
                layoutScope.customAlert("Please Make Selection for " + pendingSelection + " Filter.", "Alert");
                return;
            }
            let FilterObject = _.map($scope.leftPanel, function (item) {
                return {
                    Name: item.Name,
                    Selection: item.Selection
                };
            });
            console.log({ request: FilterObject });
            layoutScope.setLoader(true);
            AjaxService.AjaxPost({crossTabFilterEntityList: FilterObject },
            apiUrl + "/CrossTab/GetOutput",
            ShowOutput, function () {
                layoutScope.setLoader(false);
                layoutScope.customAlert();
            }, "CrossTab");
        }

        let getOutput = function () {
            $scope.fillLeftPanal();
            $scope.IsLeftPanelExpanded = true;
        }

        filterPanelScope.callChildGetOutput(getOutput);
        filterPanelScope.ApplyModuleFilterSetting();
        filterPanelScope.submitFilter(false);
        topMenuScope.SetclickLayoutFunction(function () {});
    }]);
})