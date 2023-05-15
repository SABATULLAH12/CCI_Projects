using System;
using System.Data;
using Entities;
using MdxClient;
using System.Collections.Generic;
using System.Globalization;
using System.Text;

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
            string rowFilters = GetRowFilters_INSWA(request.KV1Param.TRparam.Measure, request.KV1Param.TRparam.Timeperiod.ToLower());
            List<INSWADetails> lst = request.KV1Param.TRparam.Selection;
            List<string> queryList = new List<string>();
            string SelectedDate = request.SelectedDate;
            StringBuilder colSelctins = new StringBuilder(), INSAWParentlevelFilter = new StringBuilder(), where = new StringBuilder();

            BuildDynamicQueryFOR_INSWA_Chart_New(lst, ref colSelctins, ref INSAWParentlevelFilter, ref where);
            if (request.fromKaleichart != null && request.fromKaleichart != "")
            {
                where.Clear();
                colSelctins.Clear().Append($" * {request.fromKaleichart}");
                INSAWParentlevelFilter.Clear().Append($" , {{ {request.fromKaleichart} }}");
                rowFilters = GetRowFilters_INSWA(request.Module[3].Selection.Name,request.Module[1].Selection.Name.ToLower());
            }
            queryList.Add(MDXQueries.getPercentageChartQuery(INSAWParentlevelFilter.ToString(), request.Module[3].Selection.Name, SelectedDate));
            if (lst.Count > 0)
            {
                if (lst.Count == 1 && colSelctins.ToString() == "" && where.ToString().IndexOf("bublechart") > -1)
                {
                    colSelctins.Append(where.Replace("bublechart", ""));
                    where.Clear();
                }
                queryList.Add(MDXQueries.getINSWAChartQuery(colSelctins.ToString(), rowFilters, where.ToString(), SelectedDate));//colSelctins
            }
            else
                queryList.Add(MDXQueries.getINSWAChartQuery("* [Ship From].[L0 - Region].allmembers", rowFilters, "", SelectedDate));

            queryList.Add(MDXQueries.getBLineNBarChart(request.KV1Param.TRparam.Timeperiod, INSAWParentlevelFilter.ToString(), request.Module[3].Selection.Name, SelectedDate, true, getWeeNumber(SelectedDate)));

            Log.LogMDXquery("GetPercentChartChart", $"{Environment.NewLine}{MDXQueries.getPercentageChartQuery(INSAWParentlevelFilter.ToString(), request.Module[3].Selection.Name, SelectedDate)}");
            Log.LogMDXquery("getINSWAChartQuery", $"{Environment.NewLine}{MDXQueries.getINSWAChartQuery(colSelctins.ToString(), rowFilters, where.ToString(), SelectedDate)}");
            Log.LogMDXquery("getBLineNBarChart", $"{Environment.NewLine}{MDXQueries.getBLineNBarChart(request.KV1Param.TRparam.Timeperiod, INSAWParentlevelFilter.ToString(), request.Module[3].Selection.Name, SelectedDate, true, getWeeNumber(SelectedDate))}");

            return DataAccess.GetQueryOutput(queryList);
        }

        private static string GetRowFilters_INSWA(string mesure,string Timeperiod)
        {
            string mesure_2 = string.Empty, mesure_forSort= "volume";
            switch (mesure)
            {
                case "volume":
                    mesure_2 = "growth";
                    break;
                case "growth":
                    mesure_2 = "volume";
                    break;
                case "change":
                    mesure_2 = "growth";
                    break;
                case "transactionvolume":
                    mesure_2 = "transactiongrowth";
                    mesure_forSort = "transactionvolume";
                    break;
                case "transactiongrowth":
                    mesure_2 = "transactionvolume";
                    mesure_forSort = "transactionvolume";
                    break;
                case "transactionchange":
                    mesure_2 = "transactiongrowth";
                    mesure_forSort = "transactionvolume";
                    break;
            }
            return $"{ConstantMapping.measureMapping[mesure][Timeperiod]},{ConstantMapping.measureMapping[mesure_2][Timeperiod]},{ConstantMapping.measureMapping[mesure_forSort][Timeperiod]}";
        }

        private string getWeeNumber(string selectedDate)
        {
            DateTime seleDate = System.DateTime.ParseExact(selectedDate, "MMM dd yyyy", CultureInfo.InvariantCulture);
            return CultureInfo.CurrentCulture.Calendar.GetWeekOfYear(seleDate, CalendarWeekRule.FirstDay, DayOfWeek.Saturday).ToString();
        }    

        private void BuildDynamicQueryFOR_INSWA_Chart_New(List<INSWADetails> lst, ref StringBuilder colSelctins, ref StringBuilder INSAWParentlevelFilter,ref StringBuilder where)
        {
            if (lst.Count == 0 ) return;
            int eachitem = 0; 
            foreach (INSWADetails item in lst)
            {
                if (eachitem == 0 && lst.Count == 1)
                {
                    where.Clear();
                    if (item.NameID != "")
                    {
                        where.Append($"bublechart * {getSelectedD(item.Id, Convert.ToInt32(item.level))}.&[{ item.NameID}] ");
                        INSAWParentlevelFilter.Append($", {{ {getSelectedD(item.Id, Convert.ToInt32(item.level))}.&[{ item.NameID}] }}");
                    }
                    else if (item.Id == 1) { colSelctins.Clear().Append("* [Ship From].[L0 - Region].allmembers"); }
                    else
                        colSelctins.Clear().Append($" * {getSelectedD(item.Id, Convert.ToInt32(item.level))}.{ ConstantMapping.INSWA_MAP_ALL.allmembers}");
                }
                else if (eachitem == 0)
                {
                    colSelctins.Append($" * {getSelectedD(item.Id, Convert.ToInt32(item.level))}.&[{ item.NameID}]");
                    where.Clear().Append($", {{ {getSelectedD(item.Id, Convert.ToInt32(item.level))}.&[{ item.NameID}] }}");
                    INSAWParentlevelFilter.Append($", {{ {getSelectedD(item.Id, Convert.ToInt32(item.level))}.&[{ item.NameID}] }}");
                }

                else
                {
                    if (item.NameID == "")
                    {
                        colSelctins.Clear().Append($" * {getSelectedD(item.Id, Convert.ToInt32(item.level))}.{ ConstantMapping.INSWA_MAP_ALL.allmembers}");
                    }
                    else
                    {
                        where.Append($", {{ {getSelectedD(item.Id, Convert.ToInt32(item.level))}.&[{ item.NameID}]  }}");
                        INSAWParentlevelFilter.Append($", {{ {getSelectedD(item.Id, Convert.ToInt32(item.level))}.&[{ item.NameID}] }}");
                    }
                }
                eachitem++;
            }
        }

        private string getSelectedD(int selectedID,int level)
        {
            switch (selectedID)
            {
                case 1:
                    return ConstantMapping.INSWA_MAP_ALL.Region[level].Value; 
                case 2:
                    return ConstantMapping.INSWA_MAP_ALL.Category.Value;
                case 3:
                    return ConstantMapping.INSWA_MAP_ALL.Brand[level].Value;
                case 4:
                    return ConstantMapping.INSWA_MAP_ALL.Packs[level].Value;
                default:
                    return "";
            }
        }

        public DataSet UpdateMapping_JSON()
        {
            List<string> queryList = new List<string>();
            foreach(string MapQuery in MDXQueries.UpdateMapping())
                queryList.Add(MapQuery); 
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