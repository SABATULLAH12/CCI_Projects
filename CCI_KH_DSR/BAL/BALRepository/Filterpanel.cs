using DAL;
using System.Data;
using Entities;
using System.Collections.Generic;
using System.Linq;
using System;

namespace BAL
{
    public class FilterPanel : IFilterPanel
    {
        internal readonly IUnitOfWork _unitOfWork;

        public FilterPanel(IUnitOfWork unitOfWork)
        {
            _unitOfWork = unitOfWork;
        }
        public FilterDataWithMapping GetFilterData()
        {
            FilterDataWithMapping filterDataWithMapping = new FilterDataWithMapping();
            IList<FilterData> filter = new List<FilterData>();
   
            IList<FilterData> metricData = new List<FilterData>();
            metricData.Add(new FilterData("region", "Region", null));
            metricData.Add(new FilterData("category", "Category", null));
            metricData.Add(new FilterData("brand", "Brand", null));
            metricData.Add(new FilterData("packs", "Packs", null));
            filter.Add(new FilterData("metric", "METRIC", metricData));

            IList<FilterData> timeperiodData = new List<FilterData>();
            timeperiodData.Add(new FilterData("ytd", "YTD", null));
            timeperiodData.Add(new FilterData("qtd", "QTD", null));
            timeperiodData.Add(new FilterData("mtd", "MTD", null));
            timeperiodData.Add(new FilterData("wtd", "WTD", null));
            timeperiodData.Add(new FilterData("daily", "Daily", null));
            filter.Add(new FilterData("timeperiod", "TIMEPERIOD", timeperiodData));

            IList<FilterData> xaxisData = new List<FilterData>();
            xaxisData.Add(new FilterData("ytd", "YTD", null));
            xaxisData.Add(new FilterData("qtd", "QTD", null));
            xaxisData.Add(new FilterData("mtd", "MTD", null));
            xaxisData.Add(new FilterData("wtd", "WTD", null));
            filter.Add(new FilterData("xaxis", "X-AXIS", xaxisData));

            IList<FilterData> yaxisData = new List<FilterData>();
            yaxisData.Add(new FilterData("qtd", "QTD", null));
            yaxisData.Add(new FilterData("mtd", "MTD", null));
            yaxisData.Add(new FilterData("wtd", "WTD", null));
            yaxisData.Add(new FilterData("daily", "Daily", null));
            filter.Add(new FilterData("yaxis", "Y-AXIS", yaxisData));

            IList<FilterData> measureData = new List<FilterData>();
            measureData.Add(new FilterData("volume", "Volume (UCs)", null));
            measureData.Add(new FilterData("growth", "Growth (%)", null));
            measureData.Add(new FilterData("change", "Change (UCs)", null));
            measureData.Add(new FilterData("transactionvolume", "Transaction", null));
            measureData.Add(new FilterData("transactiongrowth", "Trans. Growth(%)", null));
            measureData.Add(new FilterData("transactionchange", "Trans. Change", null));
            filter.Add(new FilterData("measure", "MEASURE", measureData));

            filterDataWithMapping.mappingData.regionData = null;
            filterDataWithMapping.mappingData.brandsData = null;

            filter.Add(new FilterData("region", "REGION", null));

            filter.Add(new FilterData("brands", "BRANDS", null));

            filter.Add(new FilterData("packs", "PACKS", null));
            filterDataWithMapping.filterData = filter;
            return filterDataWithMapping;
        }

        public FilterDataWithMapping GetMappingData()
        {
            FilterDataWithMapping filterDataWithMapping = new FilterDataWithMapping();
            IList<FilterData> filter = new List<FilterData>();
            IList<FilterData> metricData = new List<FilterData>();
            metricData.Add(new FilterData("region", "Region", null));
            metricData.Add(new FilterData("category", "Category", null));
            metricData.Add(new FilterData("brand", "Brand", null));
            metricData.Add(new FilterData("packs", "Packs", null));
            filter.Add(new FilterData("metric", "METRIC", metricData));

            IList<FilterData> timeperiodData = new List<FilterData>();
            timeperiodData.Add(new FilterData("ytd", "YTD", null));
            timeperiodData.Add(new FilterData("qtd", "QTD", null));
            timeperiodData.Add(new FilterData("mtd", "MTD", null));
            timeperiodData.Add(new FilterData("wtd", "WTD", null));
            timeperiodData.Add(new FilterData("daily", "Daily", null));
            filter.Add(new FilterData("timeperiod", "TIMEPERIOD", timeperiodData));

            IList<FilterData> xaxisData = new List<FilterData>();
            xaxisData.Add(new FilterData("ytd", "YTD", null));
            xaxisData.Add(new FilterData("qtd", "QTD", null));
            xaxisData.Add(new FilterData("mtd", "MTD", null));
            xaxisData.Add(new FilterData("wtd", "WTD", null));
            filter.Add(new FilterData("xaxis", "X-AXIS", xaxisData));

            IList<FilterData> yaxisData = new List<FilterData>();
            yaxisData.Add(new FilterData("qtd", "QTD", null));
            yaxisData.Add(new FilterData("mtd", "MTD", null));
            yaxisData.Add(new FilterData("wtd", "WTD", null));
            yaxisData.Add(new FilterData("daily", "Daily", null));
            filter.Add(new FilterData("yaxis", "Y-AXIS", yaxisData));

            IList<FilterData> measureData = new List<FilterData>();
            measureData.Add(new FilterData("volume", "Volume (UCs)", null));
            measureData.Add(new FilterData("growth", "Growth (%)", null));
            measureData.Add(new FilterData("change", "Change (UCs)", null));
            measureData.Add(new FilterData("transactionvolume", "Transaction", null));
            measureData.Add(new FilterData("transactiongrowth", "Trans. Growth(%)", null));
            measureData.Add(new FilterData("transactionchange", "Trans. Change", null));
            filter.Add(new FilterData("measure", "MEASURE", measureData));

            DataSet ds = _unitOfWork.GetRepository<IFilterPanelRepository>().GetFilterMappingData();
            filterDataWithMapping.mappingData.regionData = RegionDtToList(ds.Tables[0]);
            filterDataWithMapping.mappingData.brandsData = BrandsDtToList(ds.Tables[1]);

            filter.Add(new FilterData("region", "REGION", RegionDataToFilterList(filterDataWithMapping.mappingData.regionData)));

            filter.Add(new FilterData("brands", "BRANDS", BrandsDataToList(filterDataWithMapping.mappingData.brandsData)));

            filter.Add(new FilterData("packs", "PACKS", PacksDataToList(filterDataWithMapping.mappingData.packsData)));

            filterDataWithMapping.filterData = filter;
            return filterDataWithMapping;
        }


        private string CurrentDtToString(DataTable dt)
        {
            string result = dt.Rows[0][0].ToString();
            return result;
        }
        private IList<FilterData> PacksDataToList(IList<PacksData> data)
        {
            IList<FilterData> packsData = new List<FilterData>();
            packsData.Add(new FilterData("all", "ALL", null));
            packsData.Add(new FilterData("pack type", "Pack Type", null));
            packsData.Add(new FilterData("pack size", "Pack Size", null));
            return packsData;
        }

        private IList<FilterData> BrandsDataToList(IList<BrandsData> data)
        {
            IList<BrandsData> brandsDataList = data;
            IList<FilterData> brandsData = new List<FilterData>();
            brandsData.Add(new FilterData("all", "ALL", null));
            FilterData unassignedData = new FilterData(null,null,null);
            foreach (var i in brandsDataList.Select(x => x.A1).Distinct())
            {
                IList<FilterData> subData = new List<FilterData>();
                foreach (var j in brandsDataList.Where(x => x.A1 == i).Select(x => x.B1).Distinct())
                {
                    subData.Add(new FilterData(j, j, null));
                }
                if (i.ToLower() == "unassigned")
                {
                    unassignedData = new FilterData(i, i, subData);
                }
                else
                {
                    brandsData.Add(new FilterData(i, i, subData));
                }
            }
            if (unassignedData.Name != null)
            {
                brandsData.Add(unassignedData);
            }
            return brandsData;
        }
        private IList<BrandsData> BrandsDtToList(DataTable dt)
        {
            IList<BrandsData> brandsDataList = new List<BrandsData>();
            foreach (DataRow dr in dt.Rows)
            {
                BrandsData data = new BrandsData();
                data.A1 = dr[0].ToString();
                data.A2 = dr[2].ToString();
                data.B1 = dr[1].ToString();
                data.B2 = dr[3].ToString();
                brandsDataList.Add(data);
            }
            return brandsDataList;
        }

        private IList<FilterData> RegionDataToFilterList(IList<RegionData> data)
        {
            IList<RegionData> regionDataList = data;
            IList<FilterData> regionData = new List<FilterData>();
            regionData.Add(new FilterData("all zone", "All Zones", null));
            regionData.Add(new FilterData("all bus", "Bottler Units", null));
            regionData.Add(new FilterData("all india", "India Zones", null));
            regionData.Add(new FilterData("all swa", "SWA Countries", null));
            FilterData unassignedData = new FilterData(null, null, null);
            foreach (var i in regionDataList.Select(x => x.D1).Distinct())
            {
                IList<FilterData> subData = new List<FilterData>();
                foreach (var j in regionDataList.Where(x => x.D1 == i).Select(x => x.E1).Distinct())
                {
                    subData.Add(new FilterData(j, j, null));
                }
                if (i.ToLower() == "unassigned")
                {
                    unassignedData = new FilterData(i, i, subData);
                }
                else
                {
                    regionData.Add(new FilterData(i, i, subData));
                }
            }
            if (unassignedData.Name != null)
            {
                regionData.Add(unassignedData);
            }
            return regionData;
        }
        private IList<RegionData> RegionDtToList(DataTable dt)
        {
            IList<RegionData> regionDataList = new List<RegionData>();
            foreach (DataRow dr in dt.Rows)
            {
                RegionData data = new RegionData();
                data.A1 = dr[0].ToString();
                data.A2 = dr[5].ToString();
                data.B1 = dr[1].ToString();
                data.B2 = dr[6].ToString();
                data.C1 = dr[2].ToString();
                data.C2 = dr[7].ToString();
                data.D1 = dr[3].ToString();
                data.D2 = dr[8].ToString();
                data.E1 = dr[4].ToString();
                data.E2 = dr[9].ToString();
                regionDataList.Add(data);
            }
            return regionDataList;
        }

        public NonPerformingBottler getNonPerfomBottler(NonPerformingBottlerRequest request, List<string> ExcludeList)
        {
            NonPerformingBottler Npb = new NonPerformingBottler();
            List<string> lst = new List<string>();
            DataTable dt = _unitOfWork.GetRepository<IFilterPanelRepository>().GetNonPerformingBottler(request, null);
            foreach (DataRow dr in dt.Rows)
            {
                if (string.IsNullOrEmpty(dr[1].ToString()) && !string.IsNullOrEmpty(dr[0].ToString()))
                {
                    lst.Add(dr[0].ToString().Trim(new Char[] { ' ','"','\'' }));
                }
            }
            Npb.BottlerName = lst.Distinct()
                                    .Where(r => !ExcludeList.Contains(r))
                                    .OrderBy(q => q)
                                    .ToList();
            return Npb;
        }
    }
}
