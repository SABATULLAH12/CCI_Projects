using System.Linq;
using Entities;
using System.Globalization;
using System.Collections.Generic;
using System;

namespace DAL
{
    public static class MDXQueries
    {

        #region Raw MDXQueries
        public static string ScatterPlotQuery = 
            @"WITH MEMBER ZoneName AS {0}.CURRENTMEMBER.PROPERTIES('MEMBER_NAME')
            MEMBER CurrentDate As ""[Period].[Day 445].&[{5}]""
            MEMBER PeriodName As[Period].[Day 445].CURRENTMEMBER.UNIQUE_NAME
            SELECT {{{1},{2},{3}}} On Columns,({0}.children * [Period].[Day 445].Children)
            HAVING(PeriodName = CurrentDate) AND(ZoneName <> 'unassigned') ON Rows FROM[Model]
            WHERE ({{[Reporting View].[Reporting View].&[Operational View]}},{{{4}}})";

        
        public static string RegionMappingQuery = @"WITH MEMBER BUSINESSNAME AS
            [Ship From].[Business Unit].CURRENTMEMBER.PROPERTIES('MEMBER_NAME')
            MEMBER REGIONNAME AS 
            [Ship From].[L0 - Region].CURRENTMEMBER.PROPERTIES('MEMBER_NAME')
            MEMBER BUSINESSID AS
            [Ship From].[Business Unit].CURRENTMEMBER.UNIQUE_NAME
            MEMBER REGIONID AS 
            [Ship From].[L0 - Region].CURRENTMEMBER.UNIQUE_NAME
            MEMBER BOTTLERGROUPID AS 
            [Ship From].[L0 - Entity].CURRENTMEMBER.UNIQUE_NAME
            MEMBER ZONEID AS 
            [Ship From].[L0 - Zone].CURRENTMEMBER.UNIQUE_NAME
            MEMBER BUSHIPID AS 
            [Ship From].[BU Ship From].CURRENTMEMBER.UNIQUE_NAME
            SELECT {BUSINESSID,REGIONID,BOTTLERGROUPID,ZONEID,BUSHIPID}ON COLUMNS
            ,{[Ship From].[Business Unit].ALLMEMBERS * [Ship From].[L0 - Region].[L0 - Region].ALLMEMBERS
            *[Ship From].[L0 - Entity].[L0 - Entity].ALLMEMBERS * [Ship From].[L0 - Zone].[L0 - Zone].ALLMEMBERS *
            [Ship From].[BU Ship From].[BU Ship From].ALLMEMBERS}
            HAVING(BUSINESSNAME='India & Southwest Asia' )ON ROWS
            FROM [Model]";

        public static string BrandsMappingQuery = @"WITH MEMBER CATEGORYID AS
            [Product].[L0 - Category].CURRENTMEMBER.UNIQUE_NAME
            MEMBER BRANDID AS 
            [Product].[L0 - Brand].CURRENTMEMBER.UNIQUE_NAME
            SELECT NON EMPTY{[Product].[L0 - Category].CHILDREN * [Product].[L0 - Brand].CHILDREN}
            HAVING (CATEGORYID<>'[Product].[L0 - Category].&[]' AND CATEGORYID<>'[Product].[L0 - Category].&')
            ON ROWS
            ,{CATEGORYID,BRANDID}ON COLUMNS
            FROM [Model]";

        public static string Top10RegionBrandQuery = @"SELECT {{{2}}}ON COLUMNS,
            NON EMPTY({3} *[Product].[L0 - Beverage Product].[L0 - Beverage Product].ALLMEMBERS {4})
            ON ROWS FROM {5}
            where ({{[Reporting View].[Reporting View].&[Operational View]}},{{[Period].[Day 445].&[{0}]}}{1}{6})";

        public static string NonPerformingBottlerQuery = @"SELECT {[Measures].[Unit Cases AC]}ON COLUMNS
            ,{[Ship From].[BU Ship From].[BU Ship From].ALLMEMBERS} ON Rows
            FROM [Model] WHERE ({[Reporting View].[Reporting View].&[Operational View]},{[Period].[Day 445].&[";

        public static string GetMailQuery = @"SELECT {[Measures].[Unit Cases AC YTD vs PY]}ON COLUMNS,
            NON EMPTY([Ship From].[L0 - Zone].[L0 - Zone].ALLMEMBERS *[Product].[L0 - Beverage Product].[L0 - Beverage Product].ALLMEMBERS )
            ON ROWS FROM [Model] where ({[Reporting View].[Reporting View].&[Operational View]},{[Period].[Day 445].&[Feb 19 2020]})";
        #endregion

        #region FormatedMDXQueries
        public static string getNonPerformingBottlerQuery(NonPerformingBottlerRequest request, FilterDataWithMapping mapping)
        {
            return string.Concat(NonPerformingBottlerQuery, request.SelectedDate, "]})");
        }
        public static string getScatterPlotQuery(KaleidoscopeRequest request)
        {
            string query = "";
            IList<string> regionFilter = new List<string>();
            string metric = request.Module[0].Selection.Name;
            string xaxis = request.Module[1].Selection.Name;
            string yaxis = request.Module[2].Selection.Name;
            string measure = request.Module[3].Selection.Name;
            string param1;
            string param2;
            if (measure.Contains("transaction"))
            {
                param1 = ConstantMapping.measureMapping["transactiongrowth"][xaxis];
                param2 = ConstantMapping.measureMapping["transactiongrowth"][yaxis];
            }
            else
            {
                param1 = ConstantMapping.measureMapping["growth"][xaxis];
                param2 = ConstantMapping.measureMapping["growth"][yaxis];
            }
            string param3 = ConstantMapping.measureMapping[measure][xaxis];
            foreach(var region in request.RegionFilter)
            {
                regionFilter.Add("[Ship From].[L0 - Region].&["+ region.Name + "]");
            }
            switch (metric)
            {
                case "category":
                    query = string.Format(ScatterPlotQuery, "[Product].[L0 - Category]", param1,param2, param3, string.Join(",", regionFilter), request.SelectedDate);
                    break;
                case "region":
                    query = string.Format(ScatterPlotQuery, "[Ship From].[L0 - Zone]", param1, param2, param3, string.Join(",", regionFilter), request.SelectedDate);
                    break;
                case "brand":
                    query = string.Format(ScatterPlotQuery, "[Product].[L0 - Brand]", param1, param2, param3, string.Join(",", regionFilter), request.SelectedDate);
                    break;
                case "packs":
                    query = string.Format(ScatterPlotQuery, "[Package].[L0 - Retail Container Type]", param1, param2, param3, string.Join(",", regionFilter), request.SelectedDate);
                    break;
            }
            return query;
        }

        public static string getTop10ChartPlotQuery(Top10Request request, FilterDataWithMapping mapping)
        {
            string query = "";
            string param1 = request.SelectedDate;
            string param2 = "";
            string param3 = ConstantMapping.measureMapping[request.Module[3].Selection[0].Name][request.Module[4].Selection[0].Name];//timeperiod mesure mapping
            string param4 = "";
            string param5 = "";
            string param6 = "[Model]";
            string param7 = "";
            string subquery = "(select {{{0}}} on columns from [Model])";
            if(request.Module[5].Selection[0].Name == "all") 
            {
                param2 = "";
            }
            else if(string.IsNullOrEmpty(request.Module[5].Selection[0].Parent))
            {
                //from brand mapping 1st and 3rd column
                foreach(var sel in request.Module[5].Selection)
                {
                    param2 = string.Concat(param2, ",{" + mapping.mappingData.brandsData.Where(x => x.A1 == sel.Name).Select(x => x.A2).FirstOrDefault() + "}");
                }
            }
            else
            {
                //from brand mapping 1st, 2nd and 4rd column
                foreach (var sel in request.Module[5].Selection)
                {
                    param2 = string.Concat(param2, ",{" + mapping.mappingData.brandsData.Where(x => x.A1 == sel.Parent && x.B1 == sel.Name).Select(x => x.B2).FirstOrDefault() + "}");
                }
            }
            
            if (request.Module[7].Selection[0].Name == "all bus" || request.Module[7].Selection[0].Parent != null)
            {
                param4 = "[Ship From].[L0 - Zone].[L0 - Zone].ALLMEMBERS *[Ship From].[BU Ship From].[BU Ship From].ALLMEMBERS";
            }
            else
            {
                param4 = "[Ship From].[L0 - Zone].[L0 - Zone].ALLMEMBERS";
            }

            if (request.Module[6].Selection[0].Name == "pack size")
            {
                param5 = "*[Package].[L0 - Retail Container Pack].[L0 - Retail Container Pack].ALLMEMBERS";
            }
            else if (request.Module[6].Selection[0].Name == "pack type")
            {
                param5 = "*[Package].[L0 - Retail Container Type].[L0 - Retail Container Type].ALLMEMBERS";
            }

            if (request.Module[7].Selection[0].Name != "all bus" && request.Module[7].Selection[0].Name != "all zone" && request.Module[7].Selection[0].Name != "all swa" && request.Module[7].Selection[0].Name != "all india" && request.Module[7].Selection[0].Parent == null)
            {
                string subqueryParam = "";
                foreach (var sel in request.Module[7].Selection)
                {
                    if (subqueryParam.Length != 0) subqueryParam = string.Concat(subqueryParam, ",");
                    subqueryParam = string.Concat(subqueryParam, mapping.mappingData.regionData.Where(x => x.D1 == sel.Name).Select(x => x.D2).Distinct().FirstOrDefault());
                }
                param6 = string.Format(subquery, subqueryParam);
            }
            else if (request.Module[7].Selection[0].Name != "all bus" && request.Module[7].Selection[0].Name != "all zone" && request.Module[7].Selection[0].Name != "all swa" && request.Module[7].Selection[0].Name != "all india" && request.Module[7].Selection[0].Parent != null)
            {
                string subqueryParam = "";
                foreach (var sel in request.Module[7].Selection)
                {
                    if (subqueryParam.Length != 0) subqueryParam = string.Concat(subqueryParam, ",");
                    subqueryParam = string.Concat(subqueryParam ,mapping.mappingData.regionData.Where(x => x.E1 == sel.Name).Select(x => x.E2).Distinct().FirstOrDefault());
                }
                param6 = string.Format(subquery, subqueryParam);
            }
            if (request.Module[7].Selection[0].Name == "all india")
            {
                param7 = ",{[Ship From].[L0 - Region].&[India]}";
            }
            else if (request.Module[7].Selection[0].Name == "all swa")
            {
                param7 = ",{[Ship From].[L0 - Region].&[SWA]}";
            }
            query = string.Format(Top10RegionBrandQuery, param1, param2, param3, param4, param5, param6,param7);
            return query;
        }
        #endregion

        #region KV1
        #region FormatedMDXQueries
       
        private static string PercentageChartQuery = @"WITH MEMBER currentdate as ""[Period].[Day 445].&["" +format(CDATE(""{2}""), ""MMM dd yyyy"" + ""]"")
                                 MEMBER periodname as [Period].[Day 445].currentmember.UNIQUE_NAME
                                            SELECT {1}  ON ROWS,
                                {{[Ship From].[Business Unit].children*[Period].[Day 445].[Day 445].allmembers
                                }} HAVING(periodname= currentdate)ON COLUMNS
                                FROM(SELECT {{[Ship From].[Business Unit].&[India & Southwest Asia]}}ON COLUMNS FROM[Model]){0}";
     
        private static string INSWAChartQuery = @"with member currentdate
                        as
                        ""[Period].[Day 445].&[{3}]""
                        member periodname as
                        [Period].[Day 445].currentmember.unique_name
                        SELECT {{ {0}
                        }}on rows
                        ,
                        {{[Period].[Day 445].[Day 445].allmembers 
                        {1}
                        }} 
                        having(periodname=currentdate)on columns
                        from [Model]
                        where ({{[Reporting View].[Reporting View].&[Operational View]}} {2})";
        
        private static string BLineNBarChartQuery_YTD = @"WITH MEMBER CalendarDate As CDATE(""{2}"")
                            MEMBER StartDate As[Period].[Day 445].CURRENTMEMBER.UNIQUE_NAME
                            MEMBER EndDate As '[Period].[Day 445].&[' +format(CalendarDate, 'MMM dd yyyy' + ']')
                            MEMBER EndDateName As VBA!left(VBA!right('[Period].[Day 445].&[' +format(CalendarDate, 'MMM dd yyyy' + ']'),12),6)
                            MEMBER DATENAME As VBA!left([Period].[Day 445].CURRENTMEMBER.PROPERTIES('MEMBER_NAME'),6)
                            MEMBER CurrentYear As cstr(Year(CalendarDate)-5)
                            MEMBER YearName As [Period].[Year 445].CURRENTMEMBER.PROPERTIES('MEMBER_NAME')
                            SELECT  {1} ON ROWS
                            ,{{[Period].[Day 445].[Day 445].ALLMEMBERS * [Period].[Year 445].[Year 445].allmembers}}
                            HAVING (StartDate<=EndDate and EndDateName=DATENAME and YearName>CurrentYear) 
                            ON COLUMNS
                            FROM [Model]
                            WHERE ({{[Reporting View].[Reporting View].&[Operational View]}}  {0} )";
 
        #endregion


        internal static string getPercentageChartQuery(string where, string rows,string SelectedDate)
        {
            if (rows == "transactionvolume" || rows == "transactiongrowth" || rows == "transactionchange")
                rows = "{{[Measures].[Transactions AC YTD % vs PY (CD)],[Measures].[Transactions AC QTD % vs PY (CD)],[Measures].[Transactions AC MTD % vs PY (CD)],[Measures].[Transactions AC WTD % vs PY (CD)],[Measures].[Transactions AC % vs PY (CD)]}}";
            else
                rows = "{{[Measures].[Unit Cases AC YTD % vs PY (CD)],[Measures].[Unit Cases AC QTD % vs PY (CD)],[Measures].[Unit Cases AC MTD % vs PY (CD)],[Measures].[Unit Cases AC WTD % vs PY (CD)],[Measures].[Unit Cases AC % vs PY (CD)] }}";
            string whereCont = string.Format("WHERE({{[Reporting View].[Reporting View].&[Operational View]}}{0})", where);
            return string.Format(PercentageChartQuery, whereCont, rows, System.DateTime.ParseExact(SelectedDate, "MMM dd yyyy", CultureInfo.InvariantCulture).ToString("MM-dd-yyyy"));
        }

        internal static string getINSWAChartQuery(string columnFilter = " * [Ship From].[L0 - Region].[L0 - Region].allmembers ", string rowFilters = "[Measures].[Unit Cases AC YTD]", string where="",string SelectedDate="")
        {
            return string.Format(INSWAChartQuery, rowFilters, columnFilter,where, SelectedDate);//columnFilter

        }
        internal static string getBLineNBarChart(string Timeperiod, string whereCond = "",string rows = "",string SelectedDate="",bool isSecondTbl=false,string weeknumber="")
        {
            switch (Timeperiod.ToLower())
            {
                case "ytd":
                    rows = getRowsForLineNBar(rows,1);
                    return string.Format(BLineNBarChartQuery_YTD, whereCond, rows, System.DateTime.ParseExact(SelectedDate, "MMM dd yyyy", CultureInfo.InvariantCulture).ToString("MM-dd-yyyy"));
                case "qtd":
                    rows = getRowsForLineNBar(rows, 2);
                    return string.Format(BLineNBarChartQuery_YTD, whereCond, rows, System.DateTime.ParseExact(SelectedDate, "MMM dd yyyy", CultureInfo.InvariantCulture).ToString("MM-dd-yyyy"));
                case "mtd":
                    rows = getRowsForLineNBar(rows, 3);//BLineNBarChartQuery_MTD
                    return string.Format(BLineNBarChartQuery_YTD, whereCond, rows, System.DateTime.ParseExact(SelectedDate, "MMM dd yyyy", CultureInfo.InvariantCulture).ToString("MM-dd-yyyy") );
                case "wtd":
                    rows = getRowsForLineNBar(rows, 4);//BLineNBarChartQuery_WTD
                    return string.Format(BLineNBarChartQuery_YTD,  whereCond, rows, System.DateTime.ParseExact(SelectedDate, "MMM dd yyyy", CultureInfo.InvariantCulture).ToString("MM-dd-yyyy"), weeknumber);
                case "daily":
                    rows = getRowsForLineNBar(rows, 5);//BLineNBarChartQuery_Daily
                    return string.Format(BLineNBarChartQuery_YTD,  whereCond, rows, System.DateTime.ParseExact(SelectedDate, "MMM dd yyyy", CultureInfo.InvariantCulture).ToString("MM-dd-yyyy"));
                default:
                    return "";
            }

        }

        private static string getRowsForLineNBar(string rows, int id)
        {
            switch (id)
            {
                case 1:
                    if (rows == "transactionvolume" || rows == "transactiongrowth" || rows == "transactionchange")
                        return "{{[Measures].[Transactions AC YTD % vs PY (CD)],[Measures].[Transactions AC YTD]}}";
                    else
                        return "{{[Measures].[Unit Cases AC YTD % vs PY (CD)],[Measures].[Unit Cases AC YTD]}}";
                case 2:
                    if (rows == "transactionvolume" || rows == "transactiongrowth" || rows == "transactionchange")
                        return "{{[Measures].[Transactions AC QTD % vs PY (CD)],[Measures].[Transactions AC QTD]}}";
                    else
                        return "{{[Measures].[Unit Cases AC QTD % vs PY (CD)],[Measures].[Unit Cases AC QTD]}}";
                case 3:
                    if (rows == "transactionvolume" || rows == "transactiongrowth" || rows == "transactionchange")
                        return "{{[Measures].[Transactions AC MTD % vs PY (CD)],[Measures].[Transactions AC MTD]}}";
                    else

                        return "{{[Measures].[Unit Cases AC MTD % vs PY (CD)],[Measures].[Unit Cases AC MTD]}}";
                case 4:
                    if (rows == "transactionvolume" || rows == "transactiongrowth" || rows == "transactionchange")
                        return "{{[Measures].[Transactions AC WTD % vs PY (CD)],[Measures].[Transactions AC WTD]}}";
                    else
                        return "{{[Measures].[Unit Cases AC WTD % vs PY (CD)],[Measures].[Unit Cases AC WTD]}}";
                case 5:
                    if (rows == "transactionvolume" || rows == "transactiongrowth" || rows == "transactionchange")
                        return "{{[Measures].[Transactions AC % vs PY (CD)],[Measures].[Transactions AC]}}";
                    else
                        return "{{[Measures].[Unit Cases AC % vs PY (CD)],[Measures].[Unit Cases AC]}}";
            }

            return "";
        }


        internal static string[] UpdateMapping()
        {
            //string[] Map_queries =
            //{
            //    INSWA_UpdateMap_Region,
            //    INSWA_UpdateMap_Category,
            //    INSWA_UpdateMap_Brands,
            //    INSWA_UpdateMap_Packs,

            //};
            //return Map_queries;
            return null;
        }


        #endregion
        
    }
}
