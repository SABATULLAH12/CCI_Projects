﻿/*----------------------------------------------------------------------------------------------------*/
/*          Author: Rahul Kumar (Software Engineer, F&B)                                              */
/*          Date: 04-12-2019                                                                          */
/*          Discription: This Script contains Snapshot Controller definition for Filter state         */
/*----------------------------------------------------------------------------------------------------*/

"use strict";
define(['app', 'angular', 'html2canvas', 'ajaxservice', 'constants', 'orgchart'], function (app, angular, html2canvas) {
   
    app.register.controller("KaleidoscopeView1Controller", ['$scope', '$css', '$sce', 'AjaxService', 'Constants', '$compile', '$timeout', function ($scope, $css, $sce, AjaxService, Constants, $compile, $timeout) {

        ReleaseMode ? $css.bind({ href: '../Content/MinifiedCss/kaleidoscopeview1.min.css?v=' + csshtmlver }, $scope) : $css.bind({ href: '../Content/Css/kaleidoscopeview1.css' }, $scope);
        ReleaseMode ? $css.bind({ href: '../Content/MinifiedCss/jquery.orgchart.min.css?v=' + csshtmlver }, $scope) : $css.bind({ href: '../Content/Css/jquery.orgchart.css' }, $scope);
        let popMenuId = {'REGION':1,'CATEGORY':2,'BRANDS':3,'PACKS':4 };

        let KaleidoscopeScope = $scope.$parent;
        let filterPanelScope = $scope.$parent.$parent;
        let topMenuScope = $scope.$parent.$parent.$parent;
        let layoutScope = $scope.$parent.$parent.$parent.$parent;

        let selectedModule = topMenuScope.modules[0];
        selectedModule.IsActive = true;
        AjaxService.AjaxTrackModule(selectedModule.Name);
        console.log('form' + $scope.kelidoscopeSelection + 'dd');
        $scope.Measure = 'volume';

        //-----------Temp Variables----------------
        $scope.SubmitVariable = {};
        $scope.PerNode = { id: 1, Name: '', Value: 0, tooltip:0 };
      
        $scope.SelectedName = 'YTD';
        $scope.INSWAMenuPopUp = { INSWAPopX: 0, INSWAPopY: 0, INSWAPopPrntID: 0, INSWAPopNodeID: "", INSWAPopshow: false, legacy:"" };
        
        $scope.showBackbtn = false;
        let INSWAselect = [], INSWAMenu_SS_INSWA = [];

        //------Bottom Notes----

        //----------Top Left-----
        let BaseVal = 0;
        $scope.showNegPos = 2;
        $scope.getvalueinpercent = function (val) {
            let perc = Math.abs(val) * 100 / BaseVal;
            return (perc < 5) ? 5 : perc;
        };
        $scope.getRound = function (val) {
          return  (val % 1 != 0) ? val.toFixed(1) : val
        }
        let Bind_top_left = function (data) {
            try {
                let temp = _.sortBy(data, [function (o) { return o.value; }]);
                if (temp[0].value == null) {
                    return false;
                }
            }
            catch (ex) {
                console.log(ex.message)
            }
            BaseVal = Math.max.apply(Math, data.map(function (o) { return Math.abs(o.value); }));
            BaseVal = (BaseVal == 100) ? 100 : BaseVal + 1;
            let maxval = Math.max.apply(Math, data.map(function (o) { return (o.value); }));
            let minval =  Math.min.apply(Math, data.map(function (o) { return (o.value); }));
            if (minval < 0 && maxval < 0) {
                $scope.showNegPos = 0;//only negative values
            } else if (minval >= 0 && maxval >= 0) {
                $scope.showNegPos = 1;//only positive values
            } else
                $scope.showNegPos = 2;
                      
            let topleft_item_height = 100 / data.length;
            return { data: data, topleft_item_height: topleft_item_height };
        };

        $scope.TLChart_Click = function(Name)
        {
            $scope.SelectedName = Name;
            getData();
        }
        
        //-----------End of Top Left----

        //---------Top Right----

        let pageload = 0;
        let BindINSWAChart = function (DataValue) {
            
            DataValue.Measure = $scope.Measure.toLocaleLowerCase();
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
          $scope.TRDropdown = function (eventpos, ths) {
              if ($(eventpos.target).hasClass("clickMenu_open") == true)
              {
                  $(".clkdchldNod").removeClass("clkdchldNod");
                  $(".clickMenu_open").removeClass("clickMenu_open");
                  $scope.INSWAMenuPopUp.INSWAPopshow = false;
                  return;
              }
              $(".clkdchldNod").removeClass("clkdchldNod");
              if ($(eventpos.target).closest(".node").attr("node-id") == 1)
              {
                  $scope.INSWAMenuPopUp.INSWAPopX = $(eventpos.target).offset().left + "px";//$(eventpos.target).offset().left;
                  $scope.INSWAMenuPopUp.INSWAPopY = (($(eventpos.target).offset().top - $(eventpos.target).position().top) + $(eventpos.target).height()) + "px";;
                  if (INSWAselect.length > 1)
                      checkSelctAndSetCategoryShowOrHide();
                  else if (INSWAselect.length == 1 && (INSWAselect[0].id == 3))
                      $scope.BrandSelected = true;
                  else
                      $scope.BrandSelected = false;
                
              } else {                  
                  $(eventpos.target).closest(".node").addClass("clkdchldNod");
                  $(".clickMenu_open").removeClass("clickMenu_open");
                  $(eventpos.target).addClass("clickMenu_open");
                  $scope.INSWAMenuPopUp.INSWAPopX = $(eventpos.target).closest(".node").find(".mnuPlcHldr").offset().left +"px";
                  $scope.INSWAMenuPopUp.INSWAPopY = (($(eventpos.target).closest(".node").offset().top - $(eventpos.target).closest(".node").height()) + $(eventpos.target).height()) + "px";
                  checkSelctAndSetCategoryShowOrHide();
              }
              $scope.INSWAMenuPopUp.INSWAPopPrntID = $(eventpos.target).closest(".node").attr("node-id"); // node-id =1 - Parent Node
              $scope.INSWAMenuPopUp.INSWAPopNodeID = $(eventpos.target).closest(".node").attr("org-name");
              $scope.INSWAMenuPopUp.legacy = $(eventpos.target).closest(".node").attr("legacy") + "_" + $scope.INSWAMenuPopUp.INSWAPopNodeID;
             
              $scope.clickFromNode = true;
              $scope.INSWAMenuPopUp.INSWAPopshow = true;  
          }
        };
        //-------------------------try start 
        $scope.InswaMenuClick = function (event) {
            if (angular.element(event.target).hasClass('menudesabled') || angular.element(event.target.parentElement).hasClass('menudesabled') == true) { //|| angular.element(event.target).parent.hasClass('menudesabled') == true
                return;
            }
            if (event.currentTarget.id == popMenuId['BRANDS'] || $scope.INSWAPopMenuItems[popMenuId['BRANDS']].Curlevel != 0) {
                //desable category if brand selected        
                $scope.BrandSelected = true;
            }
            else {                //$($`.tr-m-eachitem [id={popMenuId['BRANDS']}`).removeClass('brandinselec');
                if ($scope.INSWAPopMenuItems[popMenuId['BRANDS']].Curlevel != 0)
                    $scope.BrandSelected = false;
            }
            let lvl = 0,isthr=0;
            if (INSWAselect.length > 0) {
                INSWAselect.forEach(function (val, idx) {
                    let eachid = parseInt(event.currentTarget.id);
                    if (eachid != 'NaN' && eachid == parseInt(val.id))
                    { lvl = val.level; isthr++ }//lvl++;
                });
                if (isthr > 0)
                    lvl++;
            }
            
            let RemoveLevel = [];
            if ($scope.INSWAMenuPopUp.INSWAPopPrntID == 1) {

                //remove previos perent

                RemoveLevel = jQuery.grep(INSWAselect, function (val) {
                    return ((val.permper != null || val.permper != undefined || val.isParentNode == true || (val.isParentNode == true && val.permper == false)) && val.NameID == '');
                });

                INSWAselect = jQuery.grep(INSWAselect, function (val) {
                    return ((val.permper == null || val.permper == undefined || val.isParentNode != true || (val.isParentNode == true && val.permper == true)) && val.NameID != '');
                });


                INSWAselect.push({ id: event.currentTarget.id, NameID: "", Name: event.currentTarget.innerText, ExtraInfo: $scope.INSWAMenuPopUp.legacy, level:(event.currentTarget.id == 1 && lvl == 0) ? 1: lvl, isParentNode: true ,permper:false });

            }
            else {
                if (INSWAselect.length > 0 && INSWAselect[INSWAselect.length - 1].NameID == "")
                {
                    INSWAselect[INSWAselect.length - 1].NameID = $scope.INSWAMenuPopUp.INSWAPopNodeID;
                    INSWAselect[INSWAselect.length - 1].permper = true;
                    if (INSWAselect.length == 1 && INSWAselect[0].id == 1) {                        
                        INSWAselect[INSWAselect.length - 1].level = 1;
                        if (event.currentTarget.id == 1)
                            lvl = 2;
                    }
                }
                if (INSWAselect.length ==1 && event.currentTarget.id != INSWAselect[INSWAselect.length - 1].id && event.currentTarget.id == 1)
                    lvl = lvl+1; // INSWA is not the parentnow so Region level need to move up
                if ((INSWAselect.length == 0 && event.currentTarget.id == 1)) {
                    lvl = 1;
                    INSWAselect.push({ id: event.currentTarget.id, NameID: $scope.INSWAMenuPopUp.INSWAPopNodeID, Name: event.currentTarget.innerText, ExtraInfo: $scope.INSWAMenuPopUp.legacy, level: lvl, isParentNode: false, permper: false });
                    lvl = lvl + 1;
                }else  if (INSWAselect.length == 0)
                {
                    INSWAselect.push({ id: 1, NameID: $scope.INSWAMenuPopUp.INSWAPopNodeID, Name: "REGION", ExtraInfo: $scope.INSWAMenuPopUp.legacy, level: lvl+1, isParentNode: false, permper: false });
                }
                INSWAselect.push({ id: event.currentTarget.id, NameID: "", Name: event.currentTarget.innerText, ExtraInfo: $scope.INSWAMenuPopUp.legacy, level:(event.currentTarget.id == 1 && lvl == 0) ? 1 : lvl, isParentNode: false, permper: false });
            }
            $scope.INSWAMenuPopUp.INSWAPopshow = false;
            console.log(INSWAselect);
            INSWAselect = INSWAselect;
            $scope.showBackbtn = INSWAselect.length > 1 ? true : false;
            updateSelection_Summary();
            $scope.INSWAPopMenuItems[event.currentTarget.id - 1].Curlevel = lvl + 1;//$scope.INSWAPopMenuItems[event.currentTarget.id - 1].Curlevel + 1;
            if ($scope.INSWAMenuPopUp.INSWAPopPrntID == 1) {
                if (RemoveLevel.length == 1) {
                    RemoveLevel.forEach(function (val) {
                        if ($scope.INSWAPopMenuItems[val.id - 1].Curlevel > 0) {
                            $scope.INSWAPopMenuItems[val.id - 1].Curlevel = $scope.INSWAPopMenuItems[val.id - 1].Curlevel - 1;
                            INSWAselect.forEach(function (valmenu) {
                                if (valmenu.NameID == "" && val.id == valmenu.id && valmenu.level > 0)
                                    valmenu.level = valmenu.level - 1;
                            });
                        }
                    });
                }
            }
            console.log($scope.INSWAPopMenuItems);
            $scope.parentnodIco = (INSWAselect.length > 1) ? getMenuImg(INSWAselect[INSWAselect.length - 2].id,1) : getMenuImg(1, 1);
            $scope.childnodIco = getMenuImg(event.currentTarget.id,2);
            getData();
        }
        
      
        function updateSelection_Summary()
        {
            if ($scope.INSWAPopMenuItems != null && $scope.INSWAPopMenuItems != undefined)
            $scope.INSWAPopMenuItems.forEach(function (val) {
                val.LastSelected_tm = "All";
            });
            if (INSWAselect.length > 1) {
                INSWAselect.forEach(function (val) {
                    if (val.NameID != "")
                        $scope.INSWAPopMenuItems[val.id - 1].LastSelected_tm = val.NameID;
                });
            }
            let menu = [];
            
            if ($scope.INSWAPopMenuItems != null && $scope.INSWAPopMenuItems != undefined) {
                menu = $scope.INSWAPopMenuItems.slice();
                //splice(0, 0,
                menu.unshift({ ID: 0, DisplayName: "Time", OrgName: "Time", Maxlevel: 5, Curlevel: 5, LastSelected_tm: $scope.SelectedName, setIcon: "" });
            }
            filterPanelScope.SetINSWAMenuFromKV1(menu);//($scope.INSWAMenu_SS_INSWA);
            $scope.bottomchartheader = "INSWA";
            updateBtchart();
        }        
        function updateBtchart()
        {
            if (INSWAselect.length > 1) {
                try{
                    $scope.bottomchartheader = (INSWAselect[INSWAselect.length - 1].NameID == '') ? INSWAselect[INSWAselect.length - 2].NameID : INSWAselect[INSWAselect.length - 1].NameID
                }catch(ex)
                    {}
            }

        }
        function clearParentLevelSelection(event)
        {
            if (INSWAselect.length > 2)
                INSWAselect.splice(INSWAselect.length - 1, 1);
        }
        //-----------End of Top Right----
        //----------Bottom Chart------------
        let BindLinNBarChart = function (BNLdata) {
            let categoriesData = BNLdata.categoriesData; // ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']; //[];//
            let columnData = BNLdata.columnData; // [2, 10, 5, -5, 8, 10, 2, 5, 3, 4, 6, 8];
            let lineData = BNLdata.lineData;// [10, 40, 20, 30, 120, 40, 30, 60, 72, 20, 30, 140];
            $scope.showBottomchart = false;
            try {
                let temp1 = _.sortedUniq(columnData);
                let temp2 = _.sortedUniq(lineData);
                if (temp1[0] == null && temp2[0] == null) {
                    $("#Bottomcontainer").html("");
                    $scope.showBottomchart = false;
                    return;
                }
            }
            catch (ex) {
                console.log(ex.message);
            }
            $("#Bottomcontainer").hide();
            if (categoriesData.length > 0 && columnData.length > 0 && lineData.length > 0) {
                $scope.showBottomchart = true;
                $("#Bottomcontainer").show();
                Highcharts.chart('Bottomcontainer', {
                    chart: { zoomType: false, title: 'hhs', marginTop: 30, backgroundColor: 'transparent' },
                    credits: { enabled: false },
                    lang: {
                        thousandsSep: ','
                    },
                    title: { text: '' },
                    subtitle: { text: '' },
                    legend: {
                        align: 'center', verticalAlign: 'bottom', x: 0, y: 0,useHTML: true,
                        labelFormatter: function () {
                            if (this.name == "Volume") {

                                return "<img src='../Content/Images/Decomp/KH_Sprite_chart legend black.svg' style='margin-right: 4px;' width='10' height='10'/>" + this.name
                            } else
                                return this.name;
                        }
                    },
                    xAxis: [{
                        categories: categoriesData //,//crosshair: true
                        , alternateGridColor: {
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
                        }, labels: {
                            format: (($scope.SelectedName.toLocaleLowerCase() != 'daily') ? $scope.SelectedName + ' {value}' : ' {value}')
                        }
                    }],
                    yAxis: [{ // Primary yAxis
                        labels: {
                            format: "{value}",
                            formatter: function ()
                                {return this.value.toLocaleString('en-US', { maximumFractionDigits: 1 })}
                            , style: { color: Highcharts.getOptions().colors[0] }
                        },
                        title: { text: false, style: { color: Highcharts.getOptions().colors[1] } },
                        gridLineDashStyle: 'Dot'
                    },
                        { // Secondary yAxis
                            labels: {
                                format: "{value}",
                                formatter: function ()
                                { return this.value.toLocaleString('en-US', { maximumFractionDigits: 1 }) }
                            , style: { color: Highcharts.getOptions().colors[1] }
                            },
                            title: { text: false, style: { color: Highcharts.getOptions().colors[1] } },
                           // labels: { format: '{value}', style: { color: Highcharts.getOptions().colors[1] } },
                            opposite: true, gridLineDashStyle: 'Dot'
                        }],
                    tooltip: {
                        formatter: function () {
                            return this.points.reduce(function (s, point) {
                                let perc = (point.series.name.toLocaleLowerCase() == "growth") ? "%" : "";
                                return s + '<br/>' + point.series.name + ': ' +
                                    ((perc != "") ? point.y.toLocaleString('en-US', { maximumFractionDigits: 1 }) + perc + '' : point.y.toLocaleString('en-US', { maximumFractionDigits: 0 }) + perc + '');//except growth n Tgrowth no decimal points
                            }, '<b>' + (($scope.SelectedName.toLocaleLowerCase() != 'daily') ? $scope.SelectedName + " " + this.x : this.x) + '</b>');
                        }, shared: true
                    },
                    series: [{
                        name: returnLegend(),//'Volume',//Change vs PY
                        type: 'column', yAxis: 1, pointWidth: 20, data: columnData,
                        tooltip: {},//valueSuffix: ' mm'
                        color: '#6CA84D', negativeColor: 'red'
                    },
                        {
                            name: 'Growth', type: 'spline', data: lineData,
                            tooltip: {},valueSuffix: '%',
                            dashStyle: 'dash',
                            marker: { enabled: false }
                        }]
                }, (function () {                   
                    let legnd = $(".highcharts-series-0.highcharts-legend-item.highcharts-column-series");
                    let imgorg = $(legnd).find("rect").attr("rx", 0).attr("ry", 0);
                    //let imgg = imgorg.clone();
                    //let imgr = imgorg.clone();//doct.create
                    
                    //$(imgr).attr("x", "-12"); 
                    //$(imgr).attr("width", $(imgr).attr("width")); $(imgr).attr("height", $(imgr).attr("height")); $(imgr).attr("fill", "red");
                    //legnd.append(imgg, imgr);
                    imgorg.remove();
                }));
            }
        }

        //----------------------------------------

        function returnLegend()
        {
            switch ($scope.Measure)
            {
                case 'transactionchange':
                case 'transactiongrowth':
                case 'transactionvolume':
                    return "Transaction";
                default :
                    return "Volume";
            }
           
        }

        //-----------


        let prepareChartOutput = function (response) {
            layoutScope.setLoader(false);           

            $scope.topleftData = Bind_top_left(response.data.percentChartData);
            onlyBindINSWAChart(response);
            updateSelection_Summary()
            if ($scope.INSWAPopMenuItems == null || $scope.INSWAPopMenuItems == undefined)
                $scope.INSWAPopMenuItems = response.data.INSWAChartMenu;
            updateSelection_Summary();
            if ($scope.kelidoscopeSelection != null && $scope.kelidoscopeSelection != '') {
                setMetricCur_level();
                $scope.kelidoscopeSelection = null;
            }
            BindLinNBarChart(response.data.BLineNBarChart);
            $timeout(function () {
                setScroll();
            }, 1000);
            setTimeout(function () {
                if (filterPanelScope.isRegionBrandPackEmpty('region')) {
                    AjaxService.AjaxPost([],
                        apiUrl + "/FilterPanel/GetMappingData",
                        function (resp) {
                            if (filterPanelScope.isRegionBrandPackEmpty('region')) {
                                filterPanelScope.initializeFullFilterPanel(resp);
                            }
                        },
                        function () {},
                        "FilterPanel");
                }
            }, 100);
        }
        function setMetricCur_level()
        {
            let id=0,lvl=0;
            switch ($scope.Metric) {
                case 'region': {
                    id = 1;  lvl = 3; break;
                }
                case 'category': {
                    id = 2;  lvl = 1;
                     break;
                }
                case 'brand': {
                    id = 3;  lvl = 0; break;
                }
                case 'packs': {
                    id = 4;  lvl = 1;break;
                }

            }
            $scope.INSWAPopMenuItems[id-1].Curlevel = lvl;
        }
        let prepareINSWAChartOutput = function (response) {
            layoutScope.setLoader(false);
        }
        function getData()
        {
            let data = { Module: filterPanelScope.filterPanel, SelectedDate: prepareQueryDateFormat(topMenuScope.SelectedDate) };
            layoutScope.setLoader(true);
            data.KV1Param = { TRparam: { Measure: $scope.Measure, Timeperiod: $scope.SelectedName, Selection: INSWAselect } };
            data.isINSWAMenu = true;
            AjaxService.AjaxPost(data, apiUrl + "/Kaleidoscope/GetPercentChartOutput", prepareChartOutput, errorFunction, topMenuScope.getSelectedModule().Name);
        }
        function onlyBindINSWAChart(response)
        {                
            if (response.data.INSWAChartData.length > 0) {
                $scope.showTopRight = true;
                $scope.BindINSWAChart = BindINSWAChart(response.data.INSWAChartData);

                $scope.PerNode.id = response.data.INSWAChartData[0].id;
                $scope.PerNode.Name = response.data.INSWAChartData[0].name;
                $scope.PerNode.Value = response.data.INSWAChartData[0].selected;
                $scope.PerNode.presign = response.data.INSWAChartData[0].presign;
                $scope.PerNode.tooltip = response.data.INSWAChartData[0].tooltip;
                
                $("#orgChart").show();
                $(".overlayparent").show();
                if (response.data.INSWAChartData.length == 1)
                    $(".FixedParentnode").attr("style", "background-image:url('../content/Images/Decomp/KH_Sprite_tital_BG_withouttail.svg')");
                else
                    $(".FixedParentnode").attr("style", "");
            }
            else {
                $("#orgChart").hide();
                $(".overlayparent").hide();
                INSWAselect.splice(INSWAselect.length, 1);
                $scope.showTopRight = false;
            }
            $("#orgChart").niceScroll({
                cursorcolor: 'rgb(206, 116, 116)',
                cursorborder: 'rgb(206, 116, 116)', autohidemode: false,
            });
            
            layoutScope.setLoader(false);
            
        }
        function setScroll()
        {           
            $('#orgChart').getNiceScroll(0).doScrollPos(($("#nodetbl").width() / 2) - ($('#orgChart').width() / 2));
           // alert();
        }
        let getOutput = function (data) {
            layoutScope.setLoader(true);
            $scope.Metric = data.Module[0].Selection.Name;
            $scope.Measure = data.Module[3].Selection.Name;
                        
            if ($scope.kelidoscopeSelection != null && $scope.kelidoscopeSelection != '') {
                let filter = '', id = 0, lvl=0,name="";
                switch ($scope.Metric) {
                    case 'region': {
                        id = 1; name = "REGION", lvl = 3;
                        filter = '[Ship From].[L0 - Zone].&[' + $scope.kelidoscopeSelection + ']'; break;
                    }
                    case 'category': {
                        id = 2; name = "CATEGORY", lvl = 1;
                        filter = '[Product].[L0 - Category].&[' + $scope.kelidoscopeSelection + ']'; break;
                    }
                    case 'brand': {
                        id = 3; name = "BRAND", lvl = 0;
                        filter = '[Product].[L0 - Brand].&[' + $scope.kelidoscopeSelection + ']'; break;
                    }
                    case 'packs': {
                        id = 4; name = "PACKS", lvl = 0;
                        filter = '[Package].[L0 - Retail Container Type].&[' + $scope.kelidoscopeSelection + ']'; break; //'[Package].[L0 - Retail Container Pack].&['
                    }
                }
                data.fromKaleichart = filter;
                $scope.SelectedName = data.Module[1].Selection.Name.toUpperCase(); 
                INSWAselect = []; 
                data.KV1Param = { TRparam: { Measure: $scope.Measure, Timeperiod: $scope.SelectedName, Selection: INSWAselect } };
                INSWAselect.push({ id: id, NameID: $scope.kelidoscopeSelection, Name: name, ExtraInfo: $scope.kelidoscopeSelection + "_", level: lvl, isParentNode: false ,frmBbl:true });
               
                $scope.parentnodIco = getMenuImg(INSWAselect[INSWAselect.length - 1].id, 1);
                if (id == 3 || id == "3")
                    $scope.BrandSelected = true;
                else
                    $scope.BrandSelected = false;
                console.log(INSWAselect);
            }
            else {
                data.fromKaleichart = null;
                data.KV1Param = { TRparam: { Measure: $scope.Measure, Timeperiod: $scope.SelectedName, Selection: INSWAselect } };
            }
            AjaxService.AjaxPost(data, apiUrl + "/Kaleidoscope/GetPercentChartOutput", prepareChartOutput, errorFunction, topMenuScope.getSelectedModule().Name);
        }
        let errorFunction = function (err) {
            console.log(err);
            $scope.showBackbtn = false;
            layoutScope.customAlert();
            layoutScope.setLoader(false);
        }
        //------------Custom Functions--------------------
        $scope.kvcontroler_Click = function()
        {
            if ($scope.clickFromNode == true)
                $scope.clickFromNode = false;
            else {
                $(".clkdchldNod").removeClass("clkdchldNod");
                $(".clickMenu_open").removeClass("clickMenu_open");
                $scope.INSWAMenuPopUp.INSWAPopshow = false;
            }
        }
        $scope.ClickBack = function (evnt) {
            console.log("back");
            if(INSWAselect.length>1)
            {
                layoutScope.setLoader(true);
                INSWAselect[INSWAselect.length - 2].NameID = "";
                if (INSWAselect[INSWAselect.length - 2].frmBbl != undefined && INSWAselect[INSWAselect.length - 2].frmBbl == true)
                {//parant node is from bubble chart so count should clean
                    if (INSWAselect[INSWAselect.length - 2].id == 1)
                        $scope.INSWAPopMenuItems[INSWAselect[INSWAselect.length - 1].id - 1].Curlevel = 1;
                    else
                        $scope.INSWAPopMenuItems[INSWAselect[INSWAselect.length - 1].id - 1].Curlevel = 0;
                }
                $scope.INSWAPopMenuItems[INSWAselect[INSWAselect.length - 1].id - 1].Curlevel = $scope.INSWAPopMenuItems[INSWAselect[INSWAselect.length - 1].id - 1].Curlevel - 1;
                INSWAselect.splice(INSWAselect.length - 1, 1);
                $scope.showBackbtn = INSWAselect.length > 1 ? true : false;
                $scope.parentnodIco = (INSWAselect.length > 1) ? getMenuImg(INSWAselect[INSWAselect.length - 2].id, 1) : getMenuImg(1, 1);
                $scope.childnodIco = getMenuImg(INSWAselect[INSWAselect.length - 1].id, 2);
                checkSelctAndSetCategoryShowOrHide();
                updateSelection_Summary();
                getData();

            }
        }
        function checkSelctAndSetCategoryShowOrHide()
        {
            let brndinsel = false;
            INSWAselect.forEach(function (val) {
                if (val.id == 3 || val.id == "3") {
                    brndinsel = true; return;
                }
            })
            $scope.BrandSelected = brndinsel;
        }
        function getMenuImg(id,wher)
        {
            console.log("1");
            
            switch(parseInt(id))
            {
                case 1:
                case "region":
                    return (wher == 1) ? 'smlRegIco' : 'bgRegIco';
                    break;
                case 2:
                case "category":
                    return (wher == 1) ? 'smlCateIco' : 'bgCateIco';
                    break;
                case 3:
                case "brands":
                    return (wher == 1) ? 'smlBrndIco' : 'bgBrndIco';
                    break;
                case 4:
                case "packs":
                    return (wher == 1) ? 'smlPackIco' : 'bgPackIco';
                    break;


            }
        }
        
        $scope.commaOrperc = function (val, tooltip) {
           let Measure = $scope.Measure;
           if (tooltip == true)
               return addGrowth(val, Measure, tooltip);
           if (val != null && val != undefined && parseFloat(val) != "NaN" && val != "NA") {
               if (Measure != "growth" && Measure != "transactiongrowth")
                   return divby1000forVol(parseFloat(val), Measure).toLocaleString('en-US', { maximumFractionDigits: 0 });
               else
                   return divby1000forVol(parseFloat(val), Measure).toLocaleString('en-US', { maximumFractionDigits: 1 }) + $scope.PerNode.presign;
           }
           else
               return val;
        }
        function divby1000forVol(val, Measure) {
            if (Measure != null && Measure != undefined && (Measure == "volume" || Measure == "transactionvolume")) {
                return val / 1000;
            }
            return val;

        }
        function addGrowth(val, Measure, tooltip) {
            if (val == null || val == undefined || val == "NA")
                return "NA";
            if (Measure != "growth" && Measure != "transactiongrowth")
                return "Growth : " + parseFloat(val).toLocaleString('en-US', { maximumFractionDigits: 1 }) + "%"; 
            else
                return "Volume : " + parseFloat(val / 1000).toLocaleString('en-US', { maximumFractionDigits: 0 });
        }
        $scope.checkVolume = function (val,tooltip) {
            let Measure = $scope.Measure;
            console.log("measure" + Measure);
            if (Measure != "growth" && Measure != "transactiongrowth")
               val = tooltip;
            // if (Measure != null && Measure != undefined && (Measure == "growth" || Measure == "transactiongrowth")) 
            {
                if (val != null && val != undefined && val < 0)
                    return 'redTxt';
                else if (val != null && val != undefined && val > 0)
                    return 'greenTxt';
            }
            return '';
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
        //-----------------------------------------------
        filterPanelScope.callChildGetOutput(getOutput);
        
        filterPanelScope.ApplyModuleFilterSetting();
        filterPanelScope.submitFilter(false);
    }]);
})
