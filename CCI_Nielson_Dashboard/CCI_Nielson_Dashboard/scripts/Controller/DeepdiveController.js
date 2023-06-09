﻿"use strict";
define(['app', 'angular', 'html2canvas', 'ajaxservice', 'constants', 'jquery','orgchart'], function (app, angular, html2canvas) {
    app.register.controller("DeepdiveController", ['$scope', '$css', '$sce', 'AjaxService', 'Constants', '$compile', function ($scope, $css, $sce, AjaxService, Constants, $compile) {

        ReleaseMode ? $css.bind({ href: '../Content/MinifiedCss/Deepdive.min.css?v=' + csshtmlver }, $scope) : $css.bind({ href: '../Content/Css/Deepdive.css' }, $scope);
        ReleaseMode ? $css.bind({ href: '../Content/MinifiedCss/jquery.orgchart.min.css?v=' + csshtmlver }, $scope) : $css.bind({ href: '../Content/Css/jquery.orgchart.css' }, $scope);

        let filterPanelScope = $scope.$parent;
        let layoutScope = $scope.$parent.$parent.$parent;
        let topMenuScope = $scope.$parent.$parent;
        let selectedModule = topMenuScope.modules[2]; let i = 1; let TopSelbarDefParnt = "";

        let eachitem = { Id: 0, Name: null, Value: null };
        let OrgchartInput = { Timpeperiod: eachitem, Company: eachitem, Category: eachitem, Measure: eachitem, Region: eachitem, Pop: eachitem, Channel: eachitem, ChildLevel: eachitem, PopUp: eachitem, RegPopChnl: { selectedFName: "R", parent: true, DrillDownSelected: [], ParentOf_PopUp: ""},UseMonthColumn:'',isMTQry :3 }
        //let DrillDown = { id: 0, selectedItemName: null };
        let dridownPopup = { DrillDownSelected: [] };

        $scope.OrgPopup = [{ id: 1, name: "Brands", img: "KH_Sprite_Brand icon .svg", disable: false }, { id: 2, name: "Pack Type", img: "KH_Sprite_Pack Type.svg", disable: false }, { id: 3, name: "Pack Size", img: "KH_Sprite_Pack Size.svg", disable: false }, { id: 4, name: "Flavour", img: "KH_Sprite_Flavour.svg", disable: false }, { id: 5, name: "Serve", img: "KH_Sprite_Serve.svg", disable: false }]
        //if ($scope.BrandDrpDown == null || $scope.BrandDrpDown != undefined)
        //    $scope.BrandDrpDown = [{ id: 0, Name: "All", Category: "All" }];
        var ParentExeption = ["Delhi + NCR TT","Delhi TT","HP - JK - TT", "Delhi"];
        $scope.showBrandPopup = true;
        selectedModule.IsActive = true;
        AjaxService.AjaxTrackModule(selectedModule.Name);

        $scope.topPanel = [];

        $scope.CalenderObject = {
            IsTimePeriodOpen: false,
            YearCursorIndex:null,
            SelectedYearIndex: null,
            SelectedMonthIndex: null,
            RawCalenderList: null,
            TimePeriodType:null,
            YearList: [],
            ResetCalender: function () {
                this.TimePeriodType = $scope.topPanel[0].Selection.Name;
                this.FillYearList();
            },
            FillYearList: function () {
                let yearList = [];
                let data = _.filter(this.RawCalenderList, { 'Name': this.TimePeriodType })[0].Data;
                angular.forEach(_.uniq(_.map(data, function (obj) { return obj.Name.split(" - ")[0] })), function (year) {
                    yearList.push({
                        Name: year,
                        MonthList: _.uniq(_.remove(_.map(data, function (obj) { if (year == obj.Name.split(" - ")[0]) return obj.Name.split(" - ")[1] }), undefined))
                    })
                });
                this.YearList = yearList;
                this.SelectedYearIndex = this.YearList.length - 1;
                this.YearCursorIndex = this.SelectedYearIndex;
                this.SelectedMonthIndex = this.YearList[this.SelectedYearIndex].MonthList.length - 1;
                $scope.topPanel[0].Selection.Selection = { Name: this.GetSelectedValue() };

            },
            GetSelectedValue: function () {
                return this.YearList[this.SelectedYearIndex].Name + " - " + this.YearList[this.SelectedYearIndex].MonthList[this.SelectedMonthIndex];
            },
            DecrementYear: function () {
                if (this.YearCursorIndex == 0) return;
                this.YearCursorIndex = this.YearCursorIndex - 1;
            },
            IncrementYear:function(){
                if (this.YearCursorIndex + 1 == this.YearList.length) return;
                this.YearCursorIndex = this.YearCursorIndex + 1;
            },
            SelectItem: function (monthIndex) {
                OrgchartInput.isMTQry = 3;
                this.SelectedYearIndex = this.YearCursorIndex;
                this.SelectedMonthIndex = monthIndex;
                $scope.topPanel[0].Selection.Selection = { Name: this.GetSelectedValue() };
                resetPopUp(false);
                getOrgChart();
            }
        };

        $scope.fillTopPanal = function () {
            $scope.topPanel = [
                  { Id: 0, orderID: 0, Name: "timeperiod", DispName: "TIMEPERIOD", Dependent: [], Dependency: [], onTop: true, IsHidden: false, IsOpen: false, Data: null, Selection: null },
                  { Id: 1, orderID: 0, Name: "company", DispName: "COMPANY", Dependent: [], Dependency: [], onTop: true, IsHidden: false, IsOpen: false, Data: null, Selection: null },
                  { Id: 2, orderID: 0, Name: "category", DispName: "CATEGORY", Dependent: [], Dependency: [], onTop: true, IsHidden: false, IsOpen: false, Data: null, Selection: null },                  
                  { Id: 3, orderID: 0, Name: "brand", DispName: "Brand", Dependent: [], Dependency: [], onTop: true, IsHidden: false, IsOpen: false, Data: null, Selection: null },
                  { Id: 4, orderID: 0, Name: "measure", DispName: "MEASURE", Dependent: [], Dependency: [], onTop: true, IsHidden: false, IsOpen: false, Data: null, Selection: null },
                  { Id: 5, orderID: 2, Name: "region", DispName: "REGION", Dependent: [], Dependency: [], onTop: false, IsHidden: false, IsOpen: false, Data: null, Selection: null },
                  { Id: 6, orderID: 1, Name: "pop", DispName: "POP", Dependent: [], Dependency: [], onTop: false, IsHidden: false, IsOpen: false, Data: null, Selection: null },
                  { Id: 7, orderID: 3, Name: "channel", DispName: "CHANNEL", Dependent: [], Dependency: [], onTop: false, IsHidden: false, IsOpen: false, Data: null, Selection: null }
                  
            ];
            prepareFilterPanelData();
            applyDefaultSelection(false);
            getOrgChart();
        }

        $scope.openCloseFilter = function (item) {
            angular.forEach($scope.topPanel, function (obj) {
                obj.IsOpen = (item == obj) ? !obj.IsOpen : false;
            });
            $scope.CalenderObject.IsTimePeriodOpen = false;
            SetScroll("module_filter_item_list_container", "#EA1F2A", 0, 0, 0, 0, 3, false);
            SetScroll("ddbody_filter_item_list_container", "#EA1F2A", 0, 0, 0, 0, 3, false);
        }

        $scope.OpenSubFilter = function (item) {
            item.IsOpen = !item.IsOpen;
            SetScroll("ddbody_filter_item_list_container", "#EA1F2A", 0, 0, 0, 0, 3, false);
        }

        $scope.OpenTimePeriodTab = function (action) {
            $scope.openCloseFilter();
            $scope.CalenderObject.IsTimePeriodOpen = action;
        }

        $scope.selectFilterItem = function (parent, child) {
            if (parent.Id == 3 && child.Name.toLocaleLowerCase() != "all")
                $scope.showBrandPopup = false;
            else if (parent.Id == 3 && child.Name.toLocaleLowerCase() == "all")
                $scope.showBrandPopup = true;
            //    parent.Selection = child;
            if (parent.Id == 2 || parent.Id == 1) {
                var selectedcategname = $scope.topPanel[2].Selection.Name.toLocaleLowerCase();
                var selectedcompegname = $scope.topPanel[1].Selection.Name.toLocaleLowerCase();
                if (parent.Id == 2)
                    selectedcategname = child.Name.toLocaleLowerCase();
                else if (parent.Id == 1)
                    selectedcompegname = child.Name.toLocaleLowerCase();
                fillBrand(selectedcategname, selectedcompegname);                   
            }
            if (parent.Name == 'timeperiod') {
                parent.Selection =_.cloneDeep(child);
                $scope.CalenderObject.RawCalenderList = parent.Data;
                $scope.CalenderObject.ResetCalender();
                $scope.OpenTimePeriodTab(true);
                if($scope.CalenderObject.TimePeriodType.toLowerCase()=="month")
                    $(".module_filter_item_container_Slider").show();
                else
                    $(".module_filter_item_container_Slider").hide();

            }
            else if(!parent.onTop){
                parent.Selection = _.cloneDeep(child);
                $scope.openCloseFilter();
                SetNodeFilterInMiddle(parent.Name);
                OrgchartInput.RegPopChnl.parent = true;
                $scope.LeafnodeParentName = null;
            }
            else {
                parent.Selection = _.cloneDeep(child);
                $scope.openCloseFilter();
            }
            //OrgchartInput.RegPopChnl.ParentOf_PopUp = "";
            OrgchartInput.isMTQry = 3;
            resetPopUp(false);
            getOrgChart();
        }

        $scope.selectSubFilterItem = function (parent, child, item) {
            OrgchartInput.RegPopChnl.parent = false;
            let selection = _.cloneDeep(child);
            selection.Selection = item;
            parent.Selection = selection;
            $scope.openCloseFilter();
            SetNodeFilterInMiddle(parent.Name);
            $scope.LeafnodeParentName = null;
            //OrgchartInput.RegPopChnl.ParentOf_PopUp = "";
            OrgchartInput.isMTQry = 3;//Exicute MT Query also
            resetPopUp(false);
            getOrgChart();
        }
        
        $scope.filterDataRepository = function (name) {
            let arr;
            
            if (name == 'brand')
            {
                arr = $scope.BrandDrpDown;//filterPanelScope.RawFilterData.BrandMapping;
            }
            else
            {
                angular.forEach(filterPanelScope.RawFilterData.DeepDiveFilterList, function (obj) {
                    if (obj.Name == name)
                        arr = obj.Data;
                });
            }
            return _.cloneDeep(arr);
        }

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
            }, 50);
        }

        let SetNodeFilterInMiddle = function (FilterName) {
            switch (FilterName) {
                case 'region':
                    SetOrderForNodeFilters(2, 1, 3);
                    OrgchartInput.RegPopChnl.selectedFName = "R";
                    break;
                case 'pop':
                    SetOrderForNodeFilters(1, 2, 3);
                    OrgchartInput.RegPopChnl.selectedFName = "P";
                    break;
                case 'channel':
                    SetOrderForNodeFilters(1, 3, 2);
                    OrgchartInput.RegPopChnl.selectedFName = "C";
                    break;
            }
            angular.forEach($scope.topPanel, function (item) {
                if(item.onTop==false && item.orderID != 2)
                {
                    item.Selection = null;
                }
            })
        }

        let SetOrderForNodeFilters = function (regionOrderID, popOrderID, channelOrderID) {
            angular.forEach($scope.topPanel, function (item) {
                switch (item.Name) {
                    case 'region':
                        item.orderID = regionOrderID;
                        break;
                    case 'pop':
                        item.orderID = popOrderID;
                        break;
                    case 'channel':
                        item.orderID = channelOrderID;
                        break;
                }
            });
        }

        let prepareFilterPanelData = function () {
            angular.forEach($scope.topPanel, function (obj) {
                obj.Data = $scope.filterDataRepository(obj.Name);
            });            
        }

        let applyDefaultSelection = function (forced) {
            let Module = topMenuScope.getSelectedModule();
            angular.forEach($scope.topPanel, function (obj) {
                if (obj.Selection == null || forced) {
                    switch (obj.Name) {
                        case "timeperiod":
                            obj.Selection = obj.Data[0];
                            $scope.CalenderObject.RawCalenderList = obj.Data;
                            $scope.CalenderObject.ResetCalender();
                            break;
                        case "company":
                            obj.Selection = obj.Data[0];
                            break;
                        case "category":
                            obj.Selection = obj.Data[0];
                            break;
                        case "measure":
                            obj.Selection = obj.Data[0];
                            break;
                        case "region":
                            obj.Selection = obj.Data[0];
                            break;
                        case "pop":
                            obj.Selection = undefined;
                            break;
                        case "channel":
                            obj.Selection = undefined;
                            break;
                        case "brand":
                            obj.Selection = [{ id: 0, Name: "All", Category: "All", onTop: true }]; //(obj.Data) ? obj.Data[0] : null; //$scope.BrandDrpDown[0];
                            break;
                        default:
                            obj.Selection = null;
                    }
                    applyFilterDependency(obj);
                }
            });
        }
        //---------- Get org chart data-----------
        function fillSelOGR(eItm) {
            let eachitemcpy = { Id: 0, Name: null, Value: null };
            if (eItm == null || eItm.Selection == null)
                return null;
            if (eItm.Selection.Id != null && eItm.Selection.Id != undefined)
                eachitemcpy.Id = eItm.Selection.Id;
            eachitemcpy.Name = eItm.Selection.Name;
            if (eItm.Selection.Selection != undefined && eItm.Selection.Selection.Name != null && eItm.Selection.Selection.Name != undefined)
                eachitemcpy.Value = eItm.Selection.Selection.Name;
            else
                eachitemcpy.Value = eItm.Selection.Name;
            if (eItm.Id != null && eItm.Id == 3)
                eachitemcpy.Value = eItm.Selection.CubeColumnName;
            return eachitemcpy;
        }
        let getOrgChart = function () {
            
            layoutScope.setLoader(true);
            //console.log(i++);
            OrgchartInput.Timpeperiod = fillSelOGR($scope.topPanel[0]);
            OrgchartInput.Company = fillSelOGR($scope.topPanel[1]);
            OrgchartInput.Category = fillSelOGR($scope.topPanel[2]);
            OrgchartInput.Brand = fillSelOGR($scope.topPanel[3]);
            OrgchartInput.Measure = fillSelOGR($scope.topPanel[4]);
            OrgchartInput.Region = fillSelOGR($scope.topPanel[5]);
            OrgchartInput.Pop = fillSelOGR($scope.topPanel[6]);
            OrgchartInput.Channel = fillSelOGR($scope.topPanel[7]);
            OrgchartInput.ChildLevel = fillSelOGR($scope.topPanel[8]);
            OrgchartInput.RegPopChnl.DrillDownSelected = dridownPopup.DrillDownSelected;

            if (OrgchartInput.Timpeperiod.Name.toLowerCase() == "month" && $(".module_filter_item_container_Slider").find(".mficsslider_LM").length > 0)
                OrgchartInput.UseMonthColumn = true;
            else
                OrgchartInput.UseMonthColumn = false;

            AjaxService.AjaxPost(OrgchartInput,
            apiUrl + "/DeepDive/GetOutput",
            ShowOutput, function () {
                OrgchartInput.PopUp = { Id: 0, Name: null, Value: null };//RESET POPUP
                layoutScope.setLoader(false);
                layoutScope.customAlert();
            }, "DeepDive");

        }
        function HideOrgChart(data,isonlyRootNode)
        {
            if (data == null) {
                if (isonlyRootNode == false)
                    $scope.orgShow = false;
                else
                    $scope.orgleafShow = false;
                layoutScope.setLoader(false);
                return true;
            }
            return false;
        }
        function ManipulateParent(ParentName)
        {
            if (OrgchartInput.RegPopChnl.DrillDownSelected.length > 0)
                return ParentName;
            if ($.inArray(ParentName, ParentExeption) == -1) {
                if (ParentName.lastIndexOf("- TT") > 0)
                    return ParentName.substring(0, ParentName.lastIndexOf("- TT"));
                else if (ParentName.indexOf(" (U+R) TT") > 0)
                    return ParentName.substring(0, ParentName.indexOf(" (U+R) TT"));
                else if (ParentName.indexOf(" (U+R)") > 0)
                    return ParentName.substring(0, ParentName.indexOf(" (U+R)"));
                else
                    return ParentName;
            }
            else
            {
                if (ParentName.lastIndexOf("- TT") > 0)
                    return ParentName.substring(0, ParentName.lastIndexOf("- TT"));
                if (ParentName.lastIndexOf("TT") > 0)
                    return ParentName.replace("TT", "");
            }
                return ParentName;
                         
        }
        let ShowOutput = function (DataValue) {
            OrgchartInput.PopUp = { Id: 0, Name: null, Value: null };//RESET POPUP
            
            if (HideOrgChart(DataValue.data, false) == true)
                return;

            $scope.orgRootName = ManipulateParent(DataValue.data.DeepdiveOrgOutputData[0].name);
            $scope.orgRootValue = rootNodeValue(DataValue.data.DeepdiveOrgOutputData[0].Dvalue, $scope.topPanel[4].Selection.Name.toLowerCase());// parseFloat(DataValue.data.DeepdiveOrgOutputData[0].Dvalue).toLocaleString('en-US', { maximumFractionDigits: 1 }) + (($scope.topPanel[3].Selection.Name.toLowerCase() == "volume growth" || $scope.topPanel[3].Selection.Name.toLowerCase() == "value growth") ? "%" : "pp");
            $scope.orgRoottooltip = fixSignsTooltip(DataValue.data.DeepdiveOrgOutputData[0].tooltip,$scope.topPanel[4].Selection.Name);//parseFloat(DataValue.data.DeepdiveOrgOutputData[0].tooltip).toLocaleString('en-US', { maximumFractionDigits: 1 });
            if (TopSelbarDefParnt == "")
                TopSelbarDefParnt = $scope.orgRootName;
            updateTopSelections();
            //if (parseFloat(DataValue.data.DeepdiveOrgOutputData[0].Dvalue).toLocaleString('en-US', { maximumFractionDigits: 1 }).toString() == "NaN") {
            //    HideOrgChart(null, false);
            //    return;
            //}
            if (HideOrgChart(DataValue.data, true) == true)
                return;
            DataValue = DataValue.data.DeepdiveOrgOutputData;
            $scope.orgShow = true;
            $scope.orgleafShow = true;
            layoutScope.setLoader(false);
            DataValue.Measure = $scope.topPanel[4].Selection.Name;
            let org_chart = $('#orgChart').orgChart({
                data: DataValue,// your data'
                orderBy: "Dvalue",
                showControls: true,// display add or remove node button.
                allowEdit: true,// click the node's title to edit
                onAddNode: function (node) {
                    //log('Created new node on node '+node.data.id);
                    org_chart.newNode(node.data.id);
                },
                onDeleteNode: function (node) {
                    //log('Deleted node '+node.data.id);
                    org_chart.deleteNode(node.data.id);
                },
                onClickNode: function (node) {
                    //log('Clicked node '+node.data.id);
                },
                newNodeText: 'Add Child'// text of add button
            });
            $compile($('.node'))($scope);            
            setTimeout(function () {
                $("#orgChart").niceScroll({
                    cursorcolor: 'rgb(206, 116, 116)',
                    cursorborder: 'rgb(206, 116, 116)', autohidemode: false,
                    cursorwidth:3
                });
            }, 1000);
            $scope.showOrgPopup = function (eventpos) {
                var parentnodeobj = $(eventpos.target).closest(".node");
                $scope.leafPopY = parentnodeobj.position().top + $(eventpos.target).closest(".node").height() + 3;
                $scope.leafPopX = parentnodeobj.offset().left - 12;
                
                var selectedcurrentName = $(eventpos.target).closest(".node").find(".leafval_trpdot").html().replace("&amp;", "&");
                if ($scope.LeafnodeParentName == null || $scope.LeafnodeParentName == undefined) {                    
                   // dridownPopup.DrillDownSelected.push({ id: 0, selectedPopupName: $(eventpos.target).closest(".node").find(".topName").html() });
                    $scope.LeafnodeParentName = selectedcurrentName
                    OrgchartInput.RegPopChnl.ParentOf_PopUp = selectedcurrentName;
                } else
                {
                    $scope.LeafnodeParentName = selectedcurrentName;
                    if(dridownPopup.DrillDownSelected.length < 1)
                        OrgchartInput.RegPopChnl.ParentOf_PopUp = selectedcurrentName;
                }
                if (dridownPopup.DrillDownSelected.length > 0)
                {
                    dridownPopup.DrillDownSelected[dridownPopup.DrillDownSelected.length - 1].selectedPopupName = selectedcurrentName;
                }
                
                OrgchartInput.PopUp.Name = $scope.LeafnodeParentName;
                debugger;
                OrgchartInput.isMTQry = (parentnodeobj.is('[isMTQry]')) ? (parentnodeobj.attr("isMTQry").toLowerCase() == "true")?1:0 : 3;
                $scope.show_OrgPopup = true;
                
            }

        }
        
        
        $scope.leafPopitemclick =function(event,ths)
        {
            if ($(event.target).closest(".lfNPeachbox").attr("menudisabled") == "true" || $(event.target).attr("menudisabled") == "true")
                return;
            OrgchartInput.PopUp.Id = ths;//$(ths).attr("id");
            dridownPopup.DrillDownSelected.push({ id: ths, selectedPopupName: "" });
            if (dridownPopup.DrillDownSelected.length > 0)
                $scope.showbackbtn = true;
            else
                $scope.showbackbtn = false;
            $scope.show_OrgPopup = false;
            desablePopupItem(ths);
            getOrgChart();
        }
        let desablePopupItem = function (id)
        { $scope.OrgPopup.forEach(function (item) { if (item.id == id) item.disable = true; }) };
        $scope.OneStepBack = function ()
        {
            //layoutScope.customAlert("Work in progress...!!!");
            //return;
            $scope.OrgPopup.forEach(function (item) { if (item.id == dridownPopup.DrillDownSelected[dridownPopup.DrillDownSelected.length-1].id) item.disable = false; });
            dridownPopup.DrillDownSelected.splice(-1, 1);
            if (dridownPopup.DrillDownSelected.length > 0) {
                dridownPopup.DrillDownSelected[dridownPopup.DrillDownSelected.length - 1].selectedPopupName = "";
                if (dridownPopup.DrillDownSelected.length > 1) {
                    OrgchartInput.PopUp.Id = dridownPopup.DrillDownSelected[dridownPopup.DrillDownSelected.length - 1].id;
                    OrgchartInput.PopUp.Name = dridownPopup.DrillDownSelected[dridownPopup.DrillDownSelected.length - 1].selectedPopupName;
                }
                else if (dridownPopup.DrillDownSelected.length == 1) {
                    OrgchartInput.PopUp.Id = dridownPopup.DrillDownSelected[dridownPopup.DrillDownSelected.length - 1].id;
                }
            }
            else {
                OrgchartInput.isMTQry = 3;
                resetPopUp(true);
            }
            getOrgChart();
        };
        
        $scope.checkVolume = function (val) {
            if (val == null || val == undefined)
                return '';
            val = parseFloat(val.replace("pp", "").replace("%", "")).toLocaleString('en-US', { maximumFractionDigits: 1 });
            if (val < 0)
                return 'redTxt';
            else if (val != null && val != undefined && val > 0)
                return 'greenTxt';
            return '';

        }
        function rootNodeValue(val, measure)
        {
            if (val != null && val != undefined) {
                let grval = val;
                if (measure != null && measure.toLowerCase().indexOf("growth") > 0)
                    grval = val * 100;
                if (parseFloat(grval).toLocaleString('en-US', { maximumFractionDigits: 1 }) == 0)
                    return (0 + ((measure == "volume growth" || measure == "value growth") ? "%" : "pp"));
                else {
                    if (measure == "volume growth" || measure == "value growth")
                        return parseFloat(grval).toLocaleString('en-US', { maximumFractionDigits: 1 }) + "%";
                    else
                        return parseFloat(grval).toLocaleString('en-US', { maximumFractionDigits: 1 }) + "pp"; //+ ((masure == "volume growth" || masure == "value growth") ? "%" : "pp");
                }
            }
            return val;
        }
        /* function fixSignsTooltip (value) {
             measure=$scope.topPanel[4].Selection.Name;
             if (measure.toLowerCase() == "volume") {
                 if (value != null && value != undefined)
                     return "Absolute Volume:" + parseFloat(value).toLocaleString('en-US', { maximumFractionDigits: 1 });
                 return "Absolute Volume:" + value;
             } else if (measure.toLowerCase() == "value") {
                 if (value != null && value != undefined)
                     return "Absolute Value:" + parseFloat(value).toLocaleString('en-US', { maximumFractionDigits: 1 });
                 return "Absolute Value:" + value;
             } else
                 return "Share:" + parseFloat(value).toLocaleString('en-US', { maximumFractionDigits: 1 }) + "%";
         }*/
         let resetPopUp = function (keepParent) {
             dridownPopup.DrillDownSelected = [];
             $scope.OrgPopup.forEach(function (item) { item.disable = false; });
             $scope.showbackbtn = false;
             //if (keepParent != true)
             //    OrgchartInput.RegPopChnl.ParentOf_PopUp = "";
             TopSelbarDefParnt = "";
         }
         function updateTopSelections()
         {let parnt={Name:"",Value:""}
         angular.forEach($scope.topPanel, function (item) {
                 switch(item.Name)
                 {
                     case "region":
                         if (item.Selection != null)
                             parnt = { id: 0, Name: "Selections", Value: item.Selection.Name + ((item.Selection.Selection != null) ? " : " + item.Selection.Selection.Name : "") }; //item.DispName Value: item.Selection.Name +
                         break;
                     case "pop":
                         if (item.Selection != null)
                             parnt = { id: 0, Name: "Selections", Value: item.Selection.Name + ((item.Selection.Selection != null) ? " : " + item.Selection.Selection.Name : "") };
                         break;
                     case "channel":
                         if (item.Selection != null)
                             parnt = { id: 0, Name: "Selections", Value: item.Selection.Name + ((item.Selection.Selection != null) ? " : " + item.Selection.Selection.Name : "") };
                         break;
                 }
         })
         
         $scope.DtpSelcetions = [];
         parnt.Value = parnt.Value + ((TopSelbarDefParnt != "") ? ":" + TopSelbarDefParnt : "") + ((OrgchartInput.RegPopChnl.ParentOf_PopUp != "" && dridownPopup.DrillDownSelected.length !=0) ? " : " + OrgchartInput.RegPopChnl.ParentOf_PopUp : "");
         $scope.DtpSelcetions.push(parnt);
         angular.forEach(dridownPopup.DrillDownSelected, function (item) {
             let parnt = { Name: "", Value: ((item.selectedPopupName=="")?"All":item.selectedPopupName) };
             switch(item.id)
             {

                 case 1:
                     parnt.Name = "Brands";
                     break;
                 case 2:
                     parnt.Name = "Pack Type";
                     break;
                 case 3:
                     parnt.Name = "Pack Size";
                     break;
                 case 4:
                     parnt.Name = "Flavour";
                     break;
                 case 5:
                     parnt.Name = "Serve";
                     break;
             }
             $scope.DtpSelcetions.push(parnt);
         });

             //$scope.DtpSelcetions = [{ id:1,Name: "Region", value: "All India Total" }, { id:2,Name: "", value: "All India (U+r)" }];
         }
         $scope.changetoggle = function (clkd) {
             var toggle = $(".module_filter_item_container_Slider");
             toggle.find(".mficsslider_bold").removeClass("mficsslider_bold");
             if (toggle.find(".mficsslider_PY").length > 0 && clkd == null)
                 clkd = 'lm';
             else if (clkd == null)
                 clkd = 'py';
             OrgchartInput.UseMonthColumn = false;
             if (clkd == 'lm')//toggle.find(".mficsslider_PY").length > 0
             {
                 toggle.find(".mficsslider_PY").addClass("mficsslider_LM").removeClass("mficsslider_PY");
                 toggle.find(".mficsslider_txt_LM").addClass("mficsslider_bold");
                 OrgchartInput.UseMonthColumn = true;
             } else if (clkd == 'py') {
                 toggle.find(".mficsslider_LM").addClass("mficsslider_PY").removeClass("mficsslider_LM");
                 toggle.find(".mficsslider_txt_PY").addClass("mficsslider_bold");
             } else
                 return;
             dridownPopup.DrillDownSelected = [];
             resetPopUp(true);
             getOrgChart();

         }
         function fillBrand(selectedcategname, selectedcompegname)
         {
             $scope.showBrandPopup = true;
             if ($scope.BrandDrpDown == null || $scope.BrandDrpDown != undefined) {
                // $scope.BrandDrpDown = [{ id: 0, Name: "All", Category: "All", onTop: true }];
                 var brands = [], multbrand = [], multbrandData = [];
                 brands.push({ id: 0, Name: "All", Category: "All",Data:null, onTop: true });
                 angular.forEach(filterPanelScope.RawFilterData.BrandMapping, function (item) {
                    
                     //if (child.Name.toLocaleLowerCase() == item.Category.toLocaleLowerCase() && item.Company.toLocaleLowerCase() == $scope.topPanel[1].Selection.Name.toLocaleLowerCase())
                     if (selectedcategname == item.Category.toLocaleLowerCase() && item.Company.toLocaleLowerCase() == selectedcompegname) {
                         if (item.IsSelectable.toLocaleLowerCase() == "false" && item.DropDownName == '') {
                             if (multbrand.length != 0 && multbrandData.length != 0) {
                                 multbrand[0].Data = multbrandData;
                                 multbrand[0].onTop = true;
                                 multbrand[0].Id = 3;
                                 brands.push(multbrand[0]);
                                 multbrand = []; multbrandData = [];
                                 multbrand.push(item);
                             }
                             else multbrand.push(item);
                         }
                         else if (item.IsSelectable.toLocaleLowerCase() == "true" && item.DropDownName != '') {
                             multbrandData.push(item);
                         }
                         else if (item.IsSelectable.toLocaleLowerCase() == "true" && item.DropDownName == '') {
                             if (multbrand.length != 0 && multbrandData.length != 0) {
                                 multbrand[0].Data = multbrandData;
                                 multbrand[0].onTop = true;
                                 multbrand[0].Id = 3;
                                 brands.push(multbrand[0]);
                                 brands.push(item);
                                 multbrand = []; multbrandData = [];
                             } else {
                                 item.Data = null;
                                 brands.push(item);
                             }
                         }
                     }

                 });
                 if (multbrand.length != 0 && multbrandData.length != 0) {
                     multbrand[0].Data = multbrandData;
                     brands.push(multbrand[0]);
                     multbrand = []; multbrandData = [];
                 } else if (multbrand.length != 0) {
                     brands.push(multbrand[0]);
                     multbrand = []; multbrandData = [];

                 }
                 
                 if (brands.length > 0) {
                     $scope.BrandDrpDown = brands;
                     $scope.topPanel[3].Selection = brands[0];
                 }
                 else
                     $scope.topPanel[3].Selection = $scope.BrandDrpDown;
                 //$scope.BrandDrpDown = filterPanelScope.RawFilterData.BrandMapping.filter(
                 //    obj => child.Name.toLocaleLowerCase() == obj.Category.toLocaleLowerCase()
                 //        &&
                 //        obj.Company.toLocaleLowerCase() == $scope.topPanel[1].Selection.Name.toLocaleLowerCase());

                 //$scope.BrandDrpDown


                 angular.forEach($scope.topPanel, function (item) {
                     if (item.Name == 'brand') {
                         item.Data = $scope.BrandDrpDown;
                     }
                 })

             }
         }
         $scope.ShowHideSubBrands = function (ths) {
             //$(".Brand_sub_item_select").removeClass("Brand_sub_item_select");
             //$(ths).parent().addClass("Brand_sub_item_select");
             if ($(ths).parent().siblings().is(":visible")) {
                 $(ths).removeClass("minus_icon_brand");
                 $(ths).parent().siblings().hide();
             }
             else {
                 $(ths).addClass("minus_icon_brand");
                 $(ths).parent().siblings().show();
             }
             //$(ths).parent().siblings().slideToggle();
             $(ths).closest(".module_filter_item_list_container").getNiceScroll().resize();
             //$(ths).closest(".module_filter_item_list_container").niceScroll();//.getNiceScroll().updateScrollBar();
         }
         $scope.higlightsub = function (ths) {
             
             $(".Brand_sub_item_select").removeClass("Brand_sub_item_select");
             $(ths).addClass("Brand_sub_item_select");
         }
        //----------------------------------------

        let applyFilterDependency = function (item) {
            // Not Required 
        }

        let getOutput = function () {
            $scope.fillTopPanal();
            fillBrand($scope.topPanel[2].Selection.Name.toLocaleLowerCase(), $scope.topPanel[1].Selection.Name.toLocaleLowerCase());
        }

        filterPanelScope.callChildGetOutput(getOutput);
        filterPanelScope.ApplyModuleFilterSetting();
        filterPanelScope.submitFilter(false);
        topMenuScope.SetclickLayoutFunction(function () {
            $scope.openCloseFilter();
            $scope.show_OrgPopup = false;
        });
    }]);
})
