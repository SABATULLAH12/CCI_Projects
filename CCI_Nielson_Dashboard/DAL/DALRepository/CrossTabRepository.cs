using Entities;
using System.Collections.Generic;
using System.Data;
using System.Linq;

namespace DAL
{
    public class CrossTabRepository : ICrossTabRepository
    {
        public CrossTabRepository()
        {

        }

        public DataTable CrossTabData(CrossTabRequest crossTabRequest, FilterData filterData)
        {
            string query = "";
            CrossTabFilterEntity column = crossTabRequest.crossTabFilterEntityList[0];
            CrossTabFilterEntity row = crossTabRequest.crossTabFilterEntityList[1];
            CrossTabFilterEntity product = crossTabRequest.crossTabFilterEntityList[4];
            CrossTabFilterEntity timeperiod = crossTabRequest.crossTabFilterEntityList[5];
            string timeperiodType = "";
            string queryParam0 = "";//on {{0}} column
            string queryParam1 = "";//on {{1}}* 
            string queryParam2 = "";//on *{{2}} row
            string queryParam3 = "";//on {{3}} rest two Filter
            string queryParam4 = "";//for product pack extra * {5}
            string queryParam5 = "";//for pack vs brand in filter
            if(row.Selection[0].Name.ToLower() == "timeperiod" || column.Selection[0].Name.ToLower() == "timeperiod")
            {
                if(row.Selection[0].Name.ToLower() == "timeperiod")
                {
                    timeperiodType = row.Selection[0].Name;
                }
                else
                {
                    timeperiodType = column.Selection[0].Name;
                }
            }
            else
            {
                timeperiodType = timeperiod.Selection[0].Name.ToLower();
            }

            if ((row.Selection[0].Name.ToLower() == "product" && row.Selection[0].Selection[0].Name.ToLower() == "pack") || (column.Selection[0].Name.ToLower() == "product" && column.Selection[0].Selection[0].Name.ToLower() == "pack"))
            {
                queryParam4 = "*{[IN_FMCG_PRODUCTS].[PK Type].[PK Type].ALLMEMBERS}";
            }


            if ((row.Selection[0].Name.ToLower() == "product" && row.Selection[0].Selection[0].Name.ToLower() == "pack")|| (column.Selection[0].Name.ToLower() == "product" && column.Selection[0].Selection[0].Name.ToLower() == "pack"))
            {
                queryParam5 = ",{[IN_FMCG_PRODUCTS].[Hierarchy Level Name].&[Item]}";
            }
            else if ((row.Selection[0].Name.ToLower() != "product" && column.Selection[0].Name.ToLower() != "product") && product.Selection[0].Selection[0].Name.ToLower() == "pack")
            {
                queryParam5 = ",{[IN_FMCG_PRODUCTS].[Hierarchy Level Name].&[Item]}";
            }
            else
            {
                queryParam5 = ",{[IN_FMCG_PRODUCTS].[Hierarchy Level Name].&[Brand]}";
            }


            if (row.Selection[0].Name.ToLower() == "kpi" || column.Selection[0].Name.ToLower() == "kpi")
            {
                foreach (CrossTabFilterEntity entity in crossTabRequest.crossTabFilterEntityList)
                {
                    if (row.Selection[0].Name.ToLower() == entity.Name.ToLower() || column.Selection[0].Name.ToLower() == entity.Name.ToLower())
                    {
                        if (column.Selection[0].Name.ToLower() == entity.Name.ToLower() && column.Selection[0].Name.ToLower() != "kpi")
                        {
                            //fill query param 1
                            queryParam1 = string.Concat("{", GetMDXColummnNameAsCompare(column.Selection[0].Selection[0].Name, entity, filterData, timeperiodType), "}");
                        }
                        else if (row.Selection[0].Name.ToLower() == entity.Name.ToLower() && row.Selection[0].Name.ToLower() != "kpi")
                        {
                            queryParam1 = string.Concat("{", GetMDXColummnNameAsCompare(row.Selection[0].Selection[0].Name, entity, filterData, timeperiodType), "}");
                        }
                        else if (column.Selection[0].Name.ToLower() == entity.Name.ToLower() && entity.Name.ToLower() == "kpi")
                        {
                            queryParam0 = GetMdxColumnNameAsFilters(entity, filterData, timeperiodType);
                        }
                        else if (row.Selection[0].Name.ToLower() == entity.Name.ToLower() && entity.Name.ToLower() == "kpi")
                        {
                            queryParam0 = GetMdxColumnNameAsFilters(entity, filterData, timeperiodType);
                        }
                    }
                    else if (row.Name.ToLower() != entity.Name.ToLower() && column.Name.ToLower() != entity.Name.ToLower())
                    {
                        //fill query param 3
                        if (queryParam3.Length > 0)
                        {
                            queryParam3 = string.Concat(queryParam3, ",");
                        }
                        queryParam3 += string.Concat("{", GetMdxColumnNameAsFilters(entity, filterData, timeperiodType), "}");
                    }
                }
            }
            else
            {
                foreach (CrossTabFilterEntity entity in crossTabRequest.crossTabFilterEntityList)
                {
                    if (row.Selection[0].Name.ToLower() == entity.Name.ToLower() && column.Selection[0].Name.ToLower() == entity.Name.ToLower())
                    {
                        if (column.Selection[0].Name.ToLower() == entity.Name.ToLower())
                        {
                            //fill query param 1
                            queryParam1 = string.Concat("{", GetProductNestedMDXColumnName(column.Selection[0].Selection[0].Name, entity.Selection, filterData.CrossTabfilterMapping.productMapping), "}");
                        }
                        if (row.Selection[0].Name.ToLower() == entity.Name.ToLower())
                        {
                            //fill query param 2
                            queryParam2 = string.Concat("*{", GetProductNestedMDXColumnName(row.Selection[0].Selection[0].Name, entity.Selection, filterData.CrossTabfilterMapping.productMapping),"}");
                        }
                    }
                    else if (row.Selection[0].Name.ToLower() == entity.Name.ToLower() || column.Selection[0].Name.ToLower() == entity.Name.ToLower())
                    {
                        if (column.Selection[0].Name.ToLower() == entity.Name.ToLower())
                        {
                            //fill query param 1
                            queryParam1 = string.Concat("{", GetMDXColummnNameAsCompare(column.Selection[0].Selection[0].Name, entity, filterData, timeperiodType),"}");
                        }
                        if (row.Selection[0].Name.ToLower() == entity.Name.ToLower())
                        {
                            //fill query param 2
                            queryParam2 = string.Concat("*{", GetMDXColummnNameAsCompare(row.Selection[0].Selection[0].Name, entity, filterData, timeperiodType),"}");
                        }
                    }
                    else if (entity.Name.ToLower()=="kpi")
                    {
                        queryParam0 = GetMdxColumnNameAsFilters(entity, filterData, timeperiodType);
                    }
                    else if(row.Name.ToLower() != entity.Name.ToLower() && column.Name.ToLower() != entity.Name.ToLower())
                    {
                        //fill query param 3
                        if (queryParam3.Length > 0)
                        {
                            queryParam3 = string.Concat(queryParam3, ",");
                        }
                        queryParam3 += string.Concat("{", GetMdxColumnNameAsFilters(entity, filterData,timeperiodType), "}");
                    }
                }
            }
            query = string.Format(MDXQueries.CrosstabQuery, queryParam0, queryParam1, queryParam2, queryParam3,queryParam4, queryParam5);
            Log.LogMDXquery("CrossTabQuery", query);
            return DataAccess.GetQueryOutput(query);
        }

        private string GetMdxColumnNameAsFilters(CrossTabFilterEntity entity, FilterData filterData, string timeperiodType)
        {
            string commaSepMDXColumnNames = "";
            switch (entity.Name.ToLower())
            {
                case "region":
                    commaSepMDXColumnNames = GetRegionMDXColumnName(entity.Selection[0].Name, entity.Selection[0].Selection, filterData.CrossTabfilterMapping.regionMapping);
                    break;
                case "kpi":
                    commaSepMDXColumnNames = GetKpiMDXColumnName(entity.Selection, filterData.CrossTabfilterMapping.kpiMapping, timeperiodType);
                    break;
                case "product":
                    commaSepMDXColumnNames = GetProductMDXColumnName(entity.Selection[0].Name, entity.Selection[0].Selection, filterData.CrossTabfilterMapping.productMapping);
                    break;
                case "timeperiod":
                    commaSepMDXColumnNames = GetTimeperiodMDXColumnName(entity.Selection[0].Name, entity.Selection[0].Selection, filterData.CrossTabfilterMapping.timeperiodMapping);
                    break;
            }
            return commaSepMDXColumnNames;
        }

        private string GetMDXColummnNameAsCompare(string firstLevel, CrossTabFilterEntity entity, FilterData filterData,string timeperiodType)
        {
            string commaSepMDXColumnNames = "";
            switch (entity.Name.ToLower())
            {
                case "region":
                    commaSepMDXColumnNames = GetRegionMDXColumnName(firstLevel, entity.Selection, filterData.CrossTabfilterMapping.regionMapping);
                    break;
                case "kpi":
                    commaSepMDXColumnNames = GetKpiMDXColumnName(entity.Selection, filterData.CrossTabfilterMapping.kpiMapping, timeperiodType);
                    break;
                case "product":
                    commaSepMDXColumnNames = GetProductMDXColumnName(firstLevel, entity.Selection, filterData.CrossTabfilterMapping.productMapping);
                    break;
                case "timeperiod":
                    commaSepMDXColumnNames = GetTimeperiodMDXColumnName(firstLevel, entity.Selection, filterData.CrossTabfilterMapping.timeperiodMapping);
                    break;
            }
            return commaSepMDXColumnNames;
        }

        private string GetRegionMDXColumnName(string firstLevel, IList<Selections> Selection, IList<RegionMapping> regionMapping)
        {
            string outputString = "";
            foreach (var item in Selection)
            {
                if (outputString.Length > 0)
                {
                    outputString = string.Concat(outputString, ",");
                }
                outputString = string.Concat(outputString, string.Join(",", regionMapping.Where(x => x.Level1Name.ToLower() == firstLevel.ToLower() && x.Level2Name.ToLower() == item.Name.ToLower()).Select(y => y.CubeColumnName).ToList<string>()));
            }
            return outputString;
        }

        private string GetKpiMDXColumnName(IList<Selections> Selection, IList<KpiMapping> kpiMapping,string TimePeriodType)
        {
            string outputString = "";
            foreach (var item in Selection)
            {
                if (outputString.Length > 0)
                {
                    outputString = string.Concat(outputString, ",");
                }
                outputString = string.Concat(outputString, string.Join(",",
                    kpiMapping.Where(x => x.Level1Name.ToLower() == item.Name.ToLower()).Select(y => GetTimeperiodColumnName(y,TimePeriodType,false)).ToList<string>()),",", string.Join(",",
                    kpiMapping.Where(x => x.Level1Name.ToLower() == item.Name.ToLower()).Select(y => GetTimeperiodColumnName(y, TimePeriodType, true)).ToList<string>()));
            }
            return outputString;
        }

        private string GetTimeperiodColumnName(KpiMapping item,string timePeriodType,bool IsChangeKpi)
        {
            string ColumnName = "";
            switch (timePeriodType)
            {
                case "ytd":
                    ColumnName = IsChangeKpi ? item.YTDCubeChangeColumnName : item.YTDCubeValueColumnName;
                    break;
                case "qtd":
                    ColumnName = IsChangeKpi ? item.QTDCubeChangeColumnName : item.QTDCubeValueColumnName;
                    break;
                case "mat":
                    ColumnName = IsChangeKpi ? item.MATCubeChangeColumnName : item.MATCubeValueColumnName;
                    break;
                case "month":
                    ColumnName = IsChangeKpi ? item.MonthCubeChangeColumnName : item.MonthCubeValueColumnName;
                    break;
            }
            return ColumnName;
        }

        private string GetProductMDXColumnName(string firstLevel, IList<Selections> Selection, IList<ProductMapping> productMapping)
        {
            string outputString = "";
            foreach (var item in Selection)
            {
                if (outputString.Length > 0)
                {
                    outputString = string.Concat(outputString, ",");
                }
                outputString = string.Concat(outputString, string.Join(",", productMapping.Where(x => x.Level1Name.ToLower() == firstLevel.ToLower() && x.Level2Name.ToLower() == item.Name.ToLower()).Select(y => y.CubeColumnName).ToList<string>()));
            }
            return outputString;
        }

        private string GetProductNestedMDXColumnName(string firstLevel, IList<Selections> Selection, IList<ProductMapping> productMapping)
        {
            string outputString = "";
            foreach (var item in Selection)
            {
                List<string> value = productMapping.Where(x => x.Level1Name.ToLower() == firstLevel.ToLower() && x.Level2Name.ToLower() == item.Selection[0].Name.ToLower()).Select(y => y.CubeColumnName).Where(s => !string.IsNullOrEmpty(s)).ToList();
                if (value.Count>0)
                {
                    if (outputString.Length > 0)
                    {
                        outputString = string.Concat(outputString, ",");
                    }
                    outputString = string.Concat(outputString, string.Join(",", value));
                }
            }
            return outputString;
        }

        private string GetTimeperiodMDXColumnName(string firstLevel, IList<Selections> Selection, IList<TimeperiodMapping> timeperidMapping)
        {
            string outputString = "";
            foreach (var item in Selection)
            {
                if (outputString.Length > 0)
                {
                    outputString = string.Concat(outputString, ",");
                }
                outputString = string.Concat(outputString, string.Join(",", timeperidMapping.Where(x => x.Level1Name.ToLower() == firstLevel.ToLower() && x.Level2Name.ToLower() == item.Name.ToLower()).Select(y => y.CubeColumnName).ToList<string>()));
            }
            return outputString;
        }
    }
}
