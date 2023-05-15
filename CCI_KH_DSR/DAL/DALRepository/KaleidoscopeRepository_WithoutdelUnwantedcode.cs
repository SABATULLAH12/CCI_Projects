using System;
using System.Data;
using Entities;
using MdxClient;
using System.Collections.Generic;
using System.Globalization;

namespace DAL
{
    public class KaleidoscopeRepository : IKaleidoscopeRepository, IDisposable
    {
        internal readonly IConnectionFactory _connFactory;
        internal readonly MdxConnection _myConn;

        public KaleidoscopeRepository(IConnectionFactory connFatory)
        {
            _connFactory = connFatory;
            _myConn = connFatory.GetConnection;
        }

        #region Repository Methods        
        public DataTable GetScatterChartOutput(KaleidoscopeRequest request)
        {
            string MdxQuery = MDXQueries.getScatterPlotQuery(request);
            Log.LogMDXquery("GetScatterChartOutput", MdxQuery);
            return DataAccess.GetQueryOutput(_myConn, MdxQuery);
        }

        #region KV 1
        //------AJ
        public DataSet GetPercentChartChart(KaleidoscopeRequest request)
        {
            string rowFilters = ConstantMapping.measureMapping[request.KV1Param.TRparam.Measure][request.KV1Param.TRparam.Timeperiod.ToLower()];
            List<INSWADetails> lst = request.KV1Param.TRparam.Selection;
            List<string> queryList = new List<string>();
            string SelectedDate = request.SelectedDate;
            string colSelctins = "", INSAWParentlevelFilter = "", where = "";

            BuildDynamicQueryFOR_INSWA_Chart_New(lst, ref colSelctins, ref INSAWParentlevelFilter, ref where);
            if (request.fromKaleichart != null && request.fromKaleichart != "")
            {
                where = "";
                colSelctins = $" * {request.fromKaleichart}";
                INSAWParentlevelFilter = $" , {{ {request.fromKaleichart} }}";
                rowFilters = ConstantMapping.measureMapping[request.Module[3].Selection.Name][request.Module[1].Selection.Name.ToLower()];
            }
            //colSelctins = "";
            //if (request.isINSWAMenu != true)
            queryList.Add(MDXQueries.getPercentageChartQuery(INSAWParentlevelFilter, request.Module[3].Selection.Name, SelectedDate));
            if (lst.Count > 0)
            {
                if (lst.Count == 1 && colSelctins == "" && where.IndexOf("bublechart") > -1)
                {
                    colSelctins = where.Replace("bublechart", "");
                    where = "";
                }
                // string INAWSSelectedID = $" * [Ship From].[L0 - Region].[L1 - Region].&[{lst[lst.Count - 1].NameID}] * {getSelectedD(lst[lst.Count-1].Id, Convert.ToInt32(lst[lst.Count - 1].level))}.{ConstantMapping.INSWA_MAP_ALL.allmembers}";
                queryList.Add(MDXQueries.getINSWAChartQuery(colSelctins, rowFilters, where, SelectedDate));//colSelctins
            }
            else
                queryList.Add(MDXQueries.getINSWAChartQuery("* [Ship From].[L0 - Region].allmembers", rowFilters, "", SelectedDate));

            //if (checkYTDanQTDthenaddNewTable(request.KV1Param.TRparam.Timeperiod.ToLower(), SelectedDate)!=false)
            //    queryList.Add(MDXQueries.getBLineNBarChart(request.KV1Param.TRparam.Timeperiod, INSAWParentlevelFilter, request.Module[3].Selection.Name, SelectedDate,false, getWeeNumber(SelectedDate)));
            queryList.Add(MDXQueries.getBLineNBarChart(request.KV1Param.TRparam.Timeperiod, INSAWParentlevelFilter, request.Module[3].Selection.Name, SelectedDate,true, getWeeNumber(SelectedDate)));
            

            // queryList.Add(MDXQueries.getINSWANode_Value_ChartQuery(rowFilters, INSAWParentlevelFilter)); //----------Get INSWA Value

            //getBLineNBarChart();

            Log.LogMDXquery("GetPercentChartChart", $"{Environment.NewLine}{MDXQueries.getPercentageChartQuery(INSAWParentlevelFilter, request.Module[3].Selection.Name, SelectedDate)}");
            Log.LogMDXquery("getINSWAChartQuery", $"{Environment.NewLine}{MDXQueries.getINSWAChartQuery(colSelctins, rowFilters, where, SelectedDate)}");
            Log.LogMDXquery("getBLineNBarChart", $"{Environment.NewLine}{MDXQueries.getBLineNBarChart(request.KV1Param.TRparam.Timeperiod, INSAWParentlevelFilter, request.Module[3].Selection.Name, SelectedDate, true, getWeeNumber(SelectedDate))}");

            // Log.LogMDXquery("GetPercentChartChart", $"{Environment.NewLine}Query 1:{((request.Module == null) ? "onlyINSWA" : MDXQueries.getPercentageChartQuery(INSAWParentlevelFilter))}{Environment.NewLine}Query 2 :{MDXQueries.getINSWAChartQuery(colSelctins)}");
            //return DataAccess.GetQueryOutput(_myConn, queryList);
            return DataAccess.GetQueryOutput(queryList);
        }

        private string getWeeNumber(string selectedDate)
        {
            DateTime seleDate = System.DateTime.ParseExact(selectedDate, "MMM dd yyyy", CultureInfo.InvariantCulture);
            return CultureInfo.CurrentCulture.Calendar.GetWeekOfYear(seleDate, CalendarWeekRule.FirstDay, DayOfWeek.Saturday).ToString();
        }

        private static bool checkYTDanQTDthenaddNewTable(string Timeperiod,string SelectedDate)
        {
            //need to merge two tables for qtd and ytd in few cases 
            DateTime seleDate = System.DateTime.ParseExact(SelectedDate, "MMM dd yyyy", CultureInfo.InvariantCulture);
            if (Timeperiod == "ytd" || Timeperiod == "qtd")
            {
                if ((Timeperiod == "qtd" && (seleDate.Month == 1 || seleDate.Month == 4 || seleDate.Month == 7 || seleDate.Month == 10)) || (Timeperiod == "ytd" && (seleDate.Month == 1)))
                    return false;
                else
                    return true;                    
            }
            return false;
        }

        private void BuildDynamicQueryFOR_INSWA_Chart(List<INSWADetails> lst, ref string colSelctins, ref string INSAWParentlevelFilter)
        {
            int eachitem = 0, lastId = 0;
            foreach (INSWADetails item in lst)
            {
                if (item.isParentNode == true)
                {
                    colSelctins += $" * { getSelectedD(item.Id, Convert.ToInt32(item.level))}.{ ConstantMapping.INSWA_MAP_ALL.allmembers}";
                }
                else
                {
                    string lastName = (lst.Count > eachitem) ? $"&[{item.NameID}]" : $".{ConstantMapping.INSWA_MAP_ALL.allmembers}";
                    if (eachitem == 0)
                    {
                        if (lst.Count == 1 && item.Id == 1)
                            colSelctins = $" * { getSelectedD(item.Id, Convert.ToInt32(item.level) + 1)}.{ ConstantMapping.INSWA_MAP_ALL.allmembers}";

                    }
                    else if (lst.Count == eachitem + 1)
                    {
                        if (lastId == item.Id)
                        {
                            if (checkMaxlevel(item.Id, item.level))
                            {
                                colSelctins += $" * {getSelectedD(item.Id, Convert.ToInt32(item.level))}.&[{ item.NameID}] * {getSelectedD(item.Id, Convert.ToInt32(item.level) + 1)}.{ ConstantMapping.INSWA_MAP_ALL.allmembers}";
                                INSAWParentlevelFilter += $", {{ {getSelectedD(item.Id, Convert.ToInt32(item.level))}.&[{ item.NameID}] }}";
                            }
                            else
                                colSelctins += $" * {getSelectedD(item.Id, Convert.ToInt32(item.level))}.{ ConstantMapping.INSWA_MAP_ALL.allmembers}";
                        }
                        else
                            colSelctins += $" * {getSelectedD(item.Id, Convert.ToInt32(item.level))}.{ ConstantMapping.INSWA_MAP_ALL.allmembers}";
                    }
                    else if (eachitem != 0 && item.NameID != "")
                    {
                        colSelctins += $" * {getSelectedD(item.Id, Convert.ToInt32(item.level))}.&[{ item.NameID}]";//$" * {item.NameID}";
                        INSAWParentlevelFilter += $", {{ {getSelectedD(item.Id, Convert.ToInt32(item.level))}.&[{ item.NameID}] }}";
                    }
                }
                //if (lst.Count == 1 || eachitem==0)
                //    INSAWParentlevelFilter = $", {{[Ship From].[LL0 - Region].[L1 - Region].&[{item.NameID}]}}";
                //else if(item.NameID !="")
                //    INSAWParentlevelFilter += $", {getSelectedD(item.Id, Convert.ToInt32(item.level))}.&[{ item.NameID}]";
                lastId = item.Id;

                eachitem++;
            }
        }

        private void BuildDynamicQueryFOR_INSWA_Chart_New(List<INSWADetails> lst, ref string colSelctins, ref string INSAWParentlevelFilter,ref string where)
        {
            if (lst.Count == 0 ) return;
            int eachitem = 0, lastId = 0; string[] LegacyName = lst[lst.Count - 1].ExtraInfo.Split('_');            
            List<string> FilterList = new List<string>();
            //where = ",{[Ship From].[Business Unit].&[India & Southwest Asia]}";
            foreach (INSWADetails item in lst)
            {
                if(eachitem ==0 && lst.Count ==1)
                {
                    where = "";
                    if (item.NameID!="")
                    {
                        where += $"bublechart * {getSelectedD(item.Id, Convert.ToInt32(item.level))}.&[{ item.NameID}] ";//$" * {item.NameID}";
                        INSAWParentlevelFilter += $", {{ {getSelectedD(item.Id, Convert.ToInt32(item.level))}.&[{ item.NameID}] }}";
                    }
                    else  if (item.Id == 1) { colSelctins = "* [Ship From].[L0 - Region].allmembers"; }
                    else
                        colSelctins = $" * {getSelectedD(item.Id, Convert.ToInt32(item.level))}.{ ConstantMapping.INSWA_MAP_ALL.allmembers}";
                    

                }
                else if (eachitem == 0)
                {
                    colSelctins += $" * {getSelectedD(item.Id, Convert.ToInt32(item.level))}.&[{ item.NameID}]";
                    where = $", {{ {getSelectedD(item.Id, Convert.ToInt32(item.level))}.&[{ item.NameID}] }}";
                    INSAWParentlevelFilter += $", {{ {getSelectedD(item.Id, Convert.ToInt32(item.level))}.&[{ item.NameID}] }}";
                }

                else //if(item.isParentNode != true)
                {
                    if (item.NameID == "")
                    {
                        colSelctins = $" * {getSelectedD(item.Id, Convert.ToInt32(item.level))}.{ ConstantMapping.INSWA_MAP_ALL.allmembers}";
                    }
                    else
                    {
                        //if (item.Id == 1 && Convert.ToInt32(item.level) == 0)
                        //{ colSelctins = "* [Ship From].[L0 - Region].allmembers"; }
                        //else
                        {
                            where += $", {{ {getSelectedD(item.Id, Convert.ToInt32(item.level))}.&[{ item.NameID}]  }}";//$" * {item.NameID}";
                            INSAWParentlevelFilter += $", {{ {getSelectedD(item.Id, Convert.ToInt32(item.level))}.&[{ item.NameID}] }}";
                        }
                    }
                    //where+=
                }
                eachitem++;


            }
                       
           
        }

        private object LegacyOverwrite(string nameID, string[] legacyName, int eachitem)
        {
            if (legacyName.Length > eachitem)
                return legacyName[eachitem];
            else
                return nameID;
        }

        private object getParentLevelItemLevel(List<INSWADetails> lst, int eachitem)
        {
            return lst[eachitem - 1].level+1;
        }

        private bool checkMaxlevel(int id,string level)
        {
            switch (id)
            {
                case 1:
                    return (ConstantMapping.INSWA_MAP_ALL.Region.Count-1 > Convert.ToInt32(level))?true:false; //++level
                case 2:
                    return (Convert.ToInt32(level) > 0) ? false : true;
                case 3:
                    return (ConstantMapping.INSWA_MAP_ALL.Brand.Count - 1 > Convert.ToInt32(level)) ? true : false; //(Convert.ToInt32(level) > 0) ? false : true;// return (ConstantMapping.INSWA_MAP_ALL.Category.Count - 1 > Convert.ToInt32(level)) ? true : false;
                                                                                                                     //  return (ConstantMapping.INSWA_MAP_ALL.Brand.Count - 1 > Convert.ToInt32(level)) ? true : false;
                case 4:
                    return (ConstantMapping.INSWA_MAP_ALL.Packs.Count-1 > Convert.ToInt32(level))?true:false;
                default:
                    return false;
            }
        }

        private string getSelectedD(int selectedID,int level)
        {
            switch (selectedID)
            {
                case 1:
                    return ConstantMapping.INSWA_MAP_ALL.Region[level].Value; //++level
                case 2:
                    return ConstantMapping.INSWA_MAP_ALL.Category.Value;
                case 3:
                    return ConstantMapping.INSWA_MAP_ALL.Brand[level].Value;
                case 4:
                    return ConstantMapping.INSWA_MAP_ALL.Packs[level].Value;
                default:
                    return "";
            }
            
            //List<INSWADetails> selections = request.KV1Param.TRparam.Selection;            
            //DataTable dtMap = DataAccess.GetQueryOutput(_myConn, MDXQueries.getMapQuery(selections[selections.Count].Id));
            //int colcount = dtMap.Columns.Count;
            //return "";
        }

        public DataSet UpdateMapping_JSON()
        {
            List<string> queryList = new List<string>();
            foreach(string MapQuery in MDXQueries.UpdateMapping())
                queryList.Add(MapQuery); 
            //DataSet MappinTables = DataAccess.GetQueryOutput(_myConn, queryList);
            DataSet MappinTables = DataAccess.GetQueryOutput(queryList);
            return MappinTables;
        }

        #endregion

        #endregion

        #region IDisposable Support
        private bool disposedValue = false; // To detect redundant calls

        protected virtual void Dispose(bool disposing)
        {
            if (!disposedValue)
            {
                if (disposing)
                {
                    _myConn.Dispose();
                }

                disposedValue = true;
            }
        }

        // This code added to correctly implement the disposable pattern.
        public void Dispose()
        {
            Dispose(true);
            GC.SuppressFinalize(this);
        }


        #endregion
        
    }
}