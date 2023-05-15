using DAL;
using System;
using System.Data;
using Entities;
using Newtonsoft.Json;
using System.Linq;

namespace BAL
{
    public class Kaleidoscope : IKaleidoscope
    {
        internal readonly IUnitOfWork _unitOfWork;

        public Kaleidoscope(IUnitOfWork unitOfWork)
        {
            _unitOfWork = unitOfWork;
        }
        public ScatterChartOutput GetScatterChartOutput(KaleidoscopeRequest request)
        {
            ScatterChartOutput chartOutput = new ScatterChartOutput();
            DataTable dt = _unitOfWork.GetRepository<IKaleidoscopeRepository>().GetScatterChartOutput(request);
            chartOutput.ChartName = "bubble";
            foreach (DataRow row in dt.Rows)
            {
                BubbleSeriesData series = new BubbleSeriesData();
                series.name = (row[0] == DBNull.Value)?null:row[0].ToString();
                series.color = "rgba(0, 0, 0, 0.3)";//"#e2cf47";//
                BubbleDataPoint data = new BubbleDataPoint();

                data.x = (row[2] == DBNull.Value) ? null : stringToDouble(row[2].ToString())*100;
                data.y = (row[3] == DBNull.Value) ? null : stringToDouble(row[3].ToString())*100;
                data.z = (row[4] == DBNull.Value) ? null : stringToDouble(row[4].ToString());
                if ( data.x != null && data.y != null && data.x < 200 && data.x > -200 && data.y < 200 &&
                    data.y > -200 && data.z != null && series.name != null && series.name != string.Empty)
                {
                    if (request.Module[3].Selection.Name == "growth" || request.Module[3].Selection.Name == "transactiongrowth")
                        data.z = (double)data.z * 100;
                    else
                        data.z = (double)data.z;
                    series.data.Add(data);
                    chartOutput.Series.Add(series);
                }
            }

            return chartOutput;
        }
        public double? stringToDouble(string inputText)
        {
            double outputValue = 0.0;
            if (!double.TryParse(inputText, out outputValue)) outputValue = 0.0;
            return outputValue;
        }

        //------AJ
        #region KV1
        public PercentChart GetPercentChartOutput(KaleidoscopeRequest request)
        { // Table1 = TimeperiodData ,Table2 = INSWAData ,Table3 =LineNBarData ,Table4(Optional) = LineNBarData(should merge with Table3 as next columns)
            PercentChart chartOutput = new PercentChart();
            
            DataSet PercentChartdataDS = _unitOfWork.GetRepository<IKaleidoscopeRepository>().GetPercentChartChart(request);
            int firsttbl = 0;
            if (request.isINSWAMenu != true)
            {
                getPercentChartStruct(ref chartOutput);
            }
            PercentChartDataUotput(ref chartOutput, PercentChartdataDS.Tables[firsttbl++]);
            chartOutput.grthpercSign = (request.KV1Param.TRparam.Timeperiod == "growth") ? "%" : "";
            INSWAChartDataOutput(ref chartOutput, PercentChartdataDS.Tables[firsttbl++], request.Module[3].Selection.Name);
            if (chartOutput.INSWAChartData.Count > 0 && chartOutput.INSWAChartData[0].name.ToLower() == "all" && request.KV1Param.TRparam.Selection.Count > 0)
            {
                if (request.KV1Param.TRparam.Selection.Count > 1 && request.KV1Param.TRparam.Selection[request.KV1Param.TRparam.Selection.Count - 1].NameID == "" && request.KV1Param.TRparam.Selection[request.KV1Param.TRparam.Selection.Count - 2].NameID != "")
                    chartOutput.INSWAChartData[0].name = request.KV1Param.TRparam.Selection[request.KV1Param.TRparam.Selection.Count - 2].NameID;
                if (request.KV1Param.TRparam.Selection.Count == 1 && request.KV1Param.TRparam.Selection[request.KV1Param.TRparam.Selection.Count - 1].NameID == "")
                    chartOutput.INSWAChartData[0].name = "INSWA";

            }
            else if (request.KV1Param.TRparam.Selection.Count == 0)
                chartOutput.INSWAChartData[0].name = "INSWA";
            else if (request.KV1Param.TRparam.Selection.Count == 1  && request.KV1Param.TRparam.Selection[request.KV1Param.TRparam.Selection.Count - 1].NameID != "")
                chartOutput.INSWAChartData[0].name = request.KV1Param.TRparam.Selection[request.KV1Param.TRparam.Selection.Count - 1].NameID;
            //if (PercentChartdataDS.Tables.Count > 3)
            //    MergeTable3and4(ref PercentChartdataDS);
            BLineNBarChartDataOutput(ref chartOutput, PercentChartdataDS.Tables[firsttbl], request.KV1Param.TRparam.Timeperiod);
            
            return chartOutput;
        }

        private void MergeTable3and4(ref DataSet percentChartdataDS)
        {
            //only 2rows will be there those are "change vs py" and "Growth"
            //DataTable dtTrenddata_Org = percentChartdataDS.Tables[2].Copy();
            DataTable dtTrenddata = percentChartdataDS.Tables[3].Copy();
            int merge = 0;
            int eachrow = percentChartdataDS.Tables[2].Columns.Count;
            foreach (DataColumn dceach in dtTrenddata.Columns)
            {
                
                if (merge != 0)
                {
                    percentChartdataDS.Tables[2].Columns.Add(dceach.ColumnName+"_merged", typeof(System.String));
                    percentChartdataDS.Tables[2].Rows[0][eachrow-1] = dtTrenddata.Rows[0][merge];
                    percentChartdataDS.Tables[2].Rows[1][eachrow-1] = dtTrenddata.Rows[1][merge];
                }
                merge++;
                eachrow++;

            }
        }

        private void BLineNBarChartDataOutput(ref PercentChart chartOutput, DataTable dataTable,string timeperiod)
        {
            int count = 0, totalCol = (dataTable.Columns.Count)+1;
            //List<string> categoriesData = new string[totalCol];
            //string[] columnData = new string[totalCol];
            //string[] lineData = new string[totalCol];
            foreach (DataColumn dcolumns in dataTable.Columns)
            {
                if (totalCol >= count)
                {
                    string[] colmnsarr = dcolumns.ColumnName.Split(new string[] { ".&[" }, StringSplitOptions.None);
                    if (colmnsarr.Length > 1)
                    {
                        double? prvVal = null;
                        if (Convert.ToString(dataTable.Rows[0][count]) != "") prvVal = Convert.ToDouble(dataTable.Rows[0][count]);
                        double? curVal = null;
                        if (Convert.ToString(dataTable.Rows[1][count]) != "") curVal = (Convert.ToDouble(dataTable.Rows[1][count])/1000);
                        //if (Convert.ToString(dataTable.Rows[0][(totalCol - 1) + (count)]) != "") curVal = Convert.ToDouble(dataTable.Rows[0][(totalCol - 1) + (count)]);
                        BarchartDataNcolor BarDnC = new BarchartDataNcolor();
                        BarDnC.y = curVal;
                        BarDnC.color = (prvVal<0) ?"red":"green";
                        chartOutput.BLineNBarChart.categoriesData.Add(getHeaderLinNBar(colmnsarr, timeperiod));
                        chartOutput.BLineNBarChart.columnData.Add(BarDnC);
                        chartOutput.BLineNBarChart.lineData.Add(prvVal * 100);
                    }
                    count++;
                }
                else break;
                

            }
            
        }

        private static string getHeaderLinNBar(string[] colmnsarr,string TimePeriodType ="YTD")
        {

            return  colmnsarr[1].Substring(0, colmnsarr[1].IndexOf("]"));


            //string[] YearNmonth ;// colmnsarr[2].Substring(0, colmnsarr[2].IndexOf("]")).Split(' ');
            //switch (TimePeriodType.ToLower())
            //{
            //    case "ytd":
            //        {
            //           // YearNmonth = colmnsarr[2].Substring(0, colmnsarr[2].IndexOf("]")).Split(' ');
            //            return colmnsarr[2].Substring(0, colmnsarr[2].IndexOf("]"));// $"{Convert.ToInt32(YearNmonth[0]) + 1} {YearNmonth[1]}";
            //        }
            //    case "qtd":
            //        {
            //            YearNmonth = colmnsarr[2].Substring(0, colmnsarr[2].IndexOf("]")+1).Split(' ');
            //            if (colmnsarr.Length < 5)
            //                return colmnsarr[1].Substring(0, colmnsarr[1].IndexOf("]"));
            //            else
            //                return colmnsarr[4].Substring(0, colmnsarr[4].IndexOf("]"));// $"{Convert.ToInt32(YearNmonth[0]) + 1} {YearNmonth[1]}";
            //        }
            //    case "wtd":
            //        {
            //            return colmnsarr[2].Substring(0, colmnsarr[2].IndexOf("]"));
            //        }
            //    case "mtd":
            //        {
            //            return colmnsarr[1].Substring(0, colmnsarr[1].IndexOf("]"));
            //        }
            //    case "daily":
            //        {
            //            return colmnsarr[1].Substring(0, colmnsarr[1].IndexOf("]"));
            //        }
            //}
            //return colmnsarr[2].Substring(0, colmnsarr[2].IndexOf("]"));
        }

        private void getPercentChartStruct(ref PercentChart chartOutput)
        {

            chartOutput.INSWAChartMenu.Add(getMenuItems(1,"REGION", ConstantMapping.INSWA_MAP_ALL.Region.Count));
            chartOutput.INSWAChartMenu.Add(getMenuItems(2,"CATEGORY", 1));
            chartOutput.INSWAChartMenu.Add(getMenuItems(3,"BRANDS", ConstantMapping.INSWA_MAP_ALL.Brand.Count));
            chartOutput.INSWAChartMenu.Add(getMenuItems(4,"PACKS", ConstantMapping.INSWA_MAP_ALL.Packs.Count));

        }

        private static INSWAPopMenu getMenuItems(int id,string name,int level)
        {
            INSWAPopMenu Menu = new INSWAPopMenu();
            Menu.ID = id; Menu.DisplayName = Menu.OrgName = name; Menu.Maxlevel = level; Menu.Curlevel = (id==1)?2: 0;
            return Menu;
        }

        private void INSWAChartDataOutput(ref PercentChart chartOutput, DataTable dataTable, string measure)
        {
            dataTable = ManipulateTableHeaders(dataTable,true);
            int colmnumber = 0;
            //sortRow(dataTable);
            //DataView dv = dataTable.DefaultView;
            //dv.Sort = "occr desc";
            double addedallvalue = 0.0; bool allisthere = false;
            foreach (DataColumn dC in dataTable.Columns)
            {
                if (colmnumber != 0 && Convert.ToString(dataTable.Rows[1][colmnumber]) !="")
                {
                    if (Convert.ToString(dataTable.Rows[1][colmnumber]).ToLower() == "all")
                        allisthere = true;
                    INSWAChart INSWAItems = new INSWAChart();
                    INSWAItems.name = Convert.ToString(dataTable.Rows[1][colmnumber]);
                    INSWAItems.selected = Convert.ToString(returnWithDecimal(dataTable.Rows[0][colmnumber], 1, measure));
                    INSWAItems.Dvalue = ((INSWAItems.selected == "NA") ? null : (double?)Convert.ToDouble(INSWAItems.selected));
                    INSWAItems.tooltip = Convert.ToString(returnWithDecimal(dataTable.Rows[2][colmnumber], 1,((measure !="growth")? "growth" : "volume")));
                    INSWAItems.id = colmnumber.ToString();
                    INSWAItems.parent = (Convert.ToString(dataTable.Rows[1][colmnumber]).ToLower() == "all") ? "0" : "1";//(colmnumber == 1 ? "0" : "1");//(Convert.ToString(dataTable.Rows[1][colmnumber]).ToLower() == "unassigned"|| Convert.ToString(dataTable.Rows[1][colmnumber]).ToLower()=="all")
                    INSWAItems.org_name = INSWAItems.name;// GetLegacyNames(dC);
                    INSWAItems.presign = (measure == "growth" || measure == "transactiongrowth") ? "%" : "";
                    if (INSWAItems.Dvalue != null)
                        addedallvalue += Convert.ToDouble(dataTable.Rows[0][colmnumber]);
                    if (!(INSWAItems.selected == "NA" && INSWAItems.tooltip == "NA"))
                        chartOutput.INSWAChartData.Add(INSWAItems);
                    INSWAItems.volume = getVolumforsort(dataTable.Rows[3][colmnumber]);
                }
                colmnumber++;
            }
            colmnumber = 2;
            //if (allisthere == false)
            //    chartOutput.INSWAChartData.Insert(0,new INSWAChart() { name = "INSWA", selected = Convert.ToString(returnWithDecimal(addedallvalue, 1, measure)), Dvalue = (double?)returnWithDecimal(addedallvalue, 1, measure), id = "0", parent = "0", org_name = " All " });
            if (chartOutput.INSWAChartData.Count > 1)
            {
                foreach (INSWAChart item in chartOutput.INSWAChartData.OrderByDescending(x => x.volume).ToList())
                {
                    if (item.parent == "0")
                        item.id = "1";
                    else
                        item.id = colmnumber.ToString();
                    colmnumber++;
                }
            }
            else if(chartOutput.INSWAChartData.Count ==1)
                chartOutput.INSWAChartData[0].parent = "0";
            //chartOutput.INSWAChartData = chartOutput.INSWAChartData.OrderBy(x => x.Dvalue).ToList();


        }

        private double? getVolumforsort(object vol)
        {
            if (vol == null || vol == DBNull.Value)
                return null;
            else
                return Convert.ToDouble(vol);
        }

        /// <summary>
        /// 
        /// </summary>
        /// <param name="dC"></param>
        /// <returns></returns>
        private static string GetLegacyNames(DataColumn dC)
        {
            string[] LegacyNames =null;string LegacyName = "INSWA_";
            if (dC != null && dC.ColumnName != "" && dC.ColumnName.IndexOf("][") > -1)
                LegacyNames = dC.ColumnName.Split(new string[] { "][" }, StringSplitOptions.None);
            if(LegacyNames.Length>1)
            {
                int cnt = 0;
                foreach (string Level in LegacyNames)
                {
                    if (cnt != 0)
                    {
                        if (Level.LastIndexOf("[") > -1)
                        {
                            string name = Level.Substring(Level.LastIndexOf("[") , Level.Length - Level.LastIndexOf("["));
                            LegacyName += $"{name.Replace("]", "").Replace("[","")}_";
                        }
                        else
                            LegacyName += "VALNA";
                    }
                    cnt++;
                }
            }
            return LegacyName;
        }

    
        private object returnWithDecimal(dynamic val, int pont ,string measure)
        {
            if (Convert.ToString(val).IndexOf(".") > -1)
            {
                if (measure == "growth" || measure == "transactiongrowth")
                    return Math.Round(Convert.ToDouble(val) * 100, pont);
                else
                    return Math.Round(Convert.ToDouble(val), pont);
            }
            else if (Convert.ToString(val).Trim() == "")
                return "NA";
            else if (measure == "growth" || measure == "transactiongrowth")
                return Math.Round(Convert.ToDouble(val) * 100, pont);
            else
                return val;
        }

        private DataTable ManipulateTableHeaders(DataTable dataTable,bool ismultpleparam)
        {
            DataTable NewTable = dataTable.Clone();
            foreach(DataColumn dt in NewTable.Columns)
            {
                dt.DataType = typeof(string);
            }

            DataRow OriginalName = NewTable.NewRow();
            NewTable.Rows.Add(OriginalName);
            OriginalName = NewTable.NewRow();
            NewTable.Rows.Add(OriginalName);
            OriginalName = NewTable.NewRow();
            NewTable.Rows.Add(OriginalName);
            OriginalName = NewTable.NewRow();
            NewTable.Rows.Add(OriginalName);
            int eachCol = 0;
            foreach (DataColumn drColumn in dataTable.Columns)
            {
                NewTable.Rows[0][eachCol] = dataTable.Rows[0][eachCol];
                NewTable.Rows[2][eachCol] = dataTable.Rows[1][eachCol];
                NewTable.Rows[3][eachCol] = dataTable.Rows[2][eachCol];
                string ColName = drColumn.ColumnName;
                int Startindex = (ismultpleparam) ? ColName.LastIndexOf("&[") : ColName.IndexOf("&[");//ColName.LastIndexOf("&[") : ColName.IndexOf("&[")
                if (ColName.Substring(ColName.Length - 1) == "&")
                    NewTable.Rows[1][eachCol] = "  ";
                else if (Startindex != -1)
                {
                    NewTable.Rows[1][eachCol] = ColName.Substring(ColName.LastIndexOf("[") + 1).Substring(0, ColName.Substring(ColName.LastIndexOf("[") + 1).IndexOf("]"));
                }
                eachCol++;
            }
            return NewTable;
        }

        private static PercentChart PercentChartDataUotput(ref PercentChart chartOutput, DataTable PercentChartdata)
        {
            string[] DisplayName = Constants.kv1timeperiod;
            int itm = 0;
            if (PercentChartdata.Columns.Count > 1)
            {
                foreach (DataRow eachItem in PercentChartdata.Rows)
                {
                    percentChartItem PcItm = new percentChartItem();
                    if (itm > 4)
                        break;
                    PcItm.Name = DisplayName[itm++];
                    PcItm.Name_ID = (eachItem[0] != null && eachItem[0] != DBNull.Value) ? Convert.ToString(eachItem[0]) : null;
                    PcItm.value = (eachItem[1] != null && eachItem[1] != DBNull.Value) ? (double?)Convert.ToDouble(eachItem[1]) * 100 : null; // always growth so * 100
                    chartOutput.percentChartData.Add(PcItm);
                }
            }

            return chartOutput;
        }


        public void UpdateMapping_JSON()
        {
            DataSet PercentChartdataDS = _unitOfWork.GetRepository<IKaleidoscopeRepository>().UpdateMapping_JSON();
            string JSONString = string.Empty;
            foreach (DataTable dts in PercentChartdataDS.Tables)
                JSONString += JsonConvert.SerializeObject(dts);
            //return JSONString;
        }
        #endregion
    }
}
