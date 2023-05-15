using DAL;
using Entities;
using System;
using System.Collections.Generic;
using System.Data;
using System.Linq;

namespace BAL {
    public class DashboardBal : IDashboardBal {

        internal readonly IUnitOfWork _unitOfWork;
        public DashboardBal(IUnitOfWork unitOfWork) {
            _unitOfWork = unitOfWork;
        }
        public PanelData GetPanelData() {

            PanelData panelData = new PanelData();
            DataSet ds = _unitOfWork.GetRepository<IDashboardDal>().GetPanelData();

            panelData.TimePeriods = TimePeriodDtToList(ds.Tables[0]);

            panelData.TimePeriodData = TimePeriodDataDtToList(ds.Tables[1]);

            panelData.MapData = OutletDataDtToList(ds.Tables[3]);
            
            panelData.DemographicDataList = DemographicDataDtToList(ds.Tables[2]);

            panelData.YearsRange = ds.Tables[1].AsEnumerable().Select(x => x.Field<string>("TimePeriodGroup")).Distinct().ToList();

            return panelData;
        }

        public DashboardData GetDashboardData(DashboardSelectionEntity parameters) {
            bool currentMapId = parameters.CurrentMap.ID.Equals("1"), currentView = parameters.CurrentView.Equals("1");
            object[] selections = new object[] {parameters.TimePeriod.ID, parameters.TimePeriod.Name,
                parameters.TimePeriod.Type, parameters.DemographicFilterID, currentView, currentMapId,
                parameters.CurrentMap.Type, parameters.KpiSelection, parameters.WidgetSelection.Type, parameters.WidgetSelection.Code
            };
            DataSet ds = _unitOfWork.GetRepository<IDashboardDal>().GetDashboardOutput(selections);

            DashboardData dashboardData = new DashboardData();
            IEnumerable<DataRow> Rows, ChildRows;
            DashboardOutput dashboardOutput;
            DashboardOutput dashboardChildOutput;
            TrendOutput trendData;
            dashboardData.MapData = new List<DashboardOutput>();
            dashboardData.KpiSnapshotData = new List<DashboardOutput>();
            dashboardData.BrandData = new List<DashboardOutput>();
            dashboardData.CategoryData = new List<DashboardOutput>();
            dashboardData.CompanyData = new List<DashboardOutput>();
            dashboardData.FlavourData = new List<DashboardOutput>();
            dashboardData.PackData = new List<DashboardOutput>();
            dashboardData.TrendGraphData = new List<TrendOutput>();

            if (ds.Tables[0].Rows.Count != 0) {
                List<string> widgetNames = ds.Tables[0].AsEnumerable().Select(x => x.Field<string>("WidgetName")).Distinct().ToList();
                List<string> TrademarkParents = ds.Tables[0].AsEnumerable().Select(x => x.Field<string>("TradeMarkParentName")).Distinct().ToList();

                //dashboard data
                foreach (string widget in widgetNames) {
                    Rows = (from r in ds.Tables[0].AsEnumerable()
                            where Convert.ToString(r.Field<object>("WidgetName")).Equals(widget) && Convert.ToString(r.Field<object>("TradeMarkParentName")).Equals("")
                            select r);

                    foreach (DataRow row in Rows) {
                        dashboardOutput = new DashboardOutput();

                        dashboardOutput.MeasureCode = row["ProductCode"].ToString();
                        dashboardOutput.MeasureName = row["ProductName"].ToString();
                        dashboardOutput.MeasurePercentage = row["MeasurePercentage"].ToString();
                        dashboardOutput.Change = row["Change"].ToString();
                        dashboardOutput.HoverName = row["MouseHoverName"].ToString();

                        if (TrademarkParents.Contains(dashboardOutput.MeasureName)) {
                            dashboardOutput.Trademarks = new List<DashboardOutput>();
                            ChildRows = (from r in ds.Tables[0].AsEnumerable()
                                         where Convert.ToString(r.Field<object>("WidgetName")).Equals(widget) && Convert.ToString(r.Field<object>("TradeMarkParentName")).Equals(dashboardOutput.MeasureName)
                                         select r);

                            foreach (DataRow childRow in ChildRows) {
                                dashboardChildOutput = new DashboardOutput();

                                dashboardChildOutput.MeasureCode = childRow["ProductCode"].ToString();
                                dashboardChildOutput.MeasureName = childRow["ProductName"].ToString();
                                dashboardChildOutput.MeasurePercentage = childRow["MeasurePercentage"].ToString();
                                dashboardChildOutput.Change = childRow["Change"].ToString();
                                dashboardChildOutput.HoverName = childRow["MouseHoverName"].ToString();
                                dashboardChildOutput.Trademarks = null;

                                dashboardOutput.IsTrademark = true;
                                dashboardOutput.Trademarks.Add(dashboardChildOutput);
                            }
                        } else {
                            dashboardOutput.IsTrademark = false;
                            dashboardOutput.Trademarks = null;
                        }

                        switch (widget) {
                            case ("Map"):
                                dashboardData.MapData.Add(dashboardOutput);
                                break;
                            case ("KPI"):
                                dashboardData.KpiSnapshotData.Add(dashboardOutput);
                                break;
                            case ("Brand"):
                                dashboardData.BrandData.Add(dashboardOutput);
                                break;
                            case ("Category"):
                                dashboardData.CategoryData.Add(dashboardOutput);
                                break;
                            case ("Company"):
                                dashboardData.CompanyData.Add(dashboardOutput);
                                break;
                            case ("Flavour"):
                                dashboardData.FlavourData.Add(dashboardOutput);
                                break;
                            case ("Pack"):
                                dashboardData.PackData.Add(dashboardOutput);
                                break;
                        }
                    }
                } 
            }

            //trend graph data
            foreach(DataRow row in ds.Tables[1].Rows) {
                trendData = new TrendOutput();

                trendData.MeasureCode = row["ProductCode"].ToString();
                trendData.MeasureName = row["ProductName"].ToString();
                trendData.CurrentYearPercentage = row["CurrentYearPercentage"].ToString();
                trendData.PreviousYearPercentage = row["PreviousYearPercentage"].ToString();

                dashboardData.TrendGraphData.Add(trendData);
            }

            return dashboardData;
        }

        public List<string> TimePeriodDtToList(DataTable dt) {
            List<string> timePeriods = new List<string>();

            foreach(DataRow dr in dt.Rows) {
                timePeriods.Add(dr[1].ToString());
            }

            return timePeriods;
        }

        public List<TimePeriodData> TimePeriodDataDtToList(DataTable dt) {
            List<TimePeriodData> timePeriodData = new List<TimePeriodData>();

            List<string> timePeriods = dt.AsEnumerable().Select(x => x.Field<string>("PeriodType")).Distinct().ToList();
            IEnumerable<DataRow> Rows;
            TimePeriodData tpData;
            TimePeriodAttributes tpAttr;

            foreach (string timePeriod in timePeriods) {
                tpData = new TimePeriodData();

                tpData.PeriodType = timePeriod;
                tpData.TimePeriodList = new List<TimePeriodAttributes>();

                Rows = (from r in dt.AsEnumerable()
                        where Convert.ToString(r.Field<object>("PeriodType")).Equals(timePeriod)
                        select r);

                foreach (DataRow dr in Rows) {
                    tpAttr = new TimePeriodAttributes();

                    tpAttr.PeriodCode = dr["PeriodCode"].ToString();
                    tpAttr.PeriodName = dr["PeriodName"].ToString();
                    tpAttr.PeriodType = dr["PeriodType"].ToString();
                    tpAttr.Month = dr["MonthName"].ToString();
                    tpAttr.Year = dr["TimePeriodGroup"].ToString();

                    tpData.TimePeriodList.Add(tpAttr);
                }
                timePeriodData.Add(tpData);
            }

            return timePeriodData;
        }

        public List<MapData> OutletDataDtToList(DataTable dt) {
            List<MapData> mapDataList = new List<MapData>();

            List<string> outletTypes = dt.AsEnumerable().Select(x => x.Field<string>("OutletType")).Distinct().ToList();

            IEnumerable<DataRow> Rows;
            MapData mapData;
            OutletData outletData;

            foreach (string outlet in outletTypes) {
                mapData = new MapData();
                mapData.OutletType = outlet;
                mapData.OutletDataList = new List<OutletData>();

                Rows = (from r in dt.AsEnumerable()
                        where Convert.ToString(r.Field<object>("OutletType")).Equals(outlet)
                        select r);

                foreach (DataRow dr in Rows) {
                    outletData = new OutletData();

                    outletData.OutletCode = dr["OutletCode"].ToString();
                    outletData.OutletID = dr["OutletId"].ToString();
                    outletData.OutletName = dr["OutletName"].ToString();
                    outletData.OutletParentName = dr["OutletParentName"].ToString();

                    mapData.OutletDataList.Add(outletData);
                }
                mapDataList.Add(mapData);
            }

            return mapDataList;
        }

        public List<DemographicData> DemographicDataDtToList(DataTable dt) {
            List<DemographicData> demDataList = new List<DemographicData>();
            DemographicData demData, childDemData;
            IEnumerable<DataRow> Rows = (from r in dt.AsEnumerable()
                                         where Convert.ToString(r.Field<object>("LevelId")).Equals("1")
                                         select r);

            foreach(DataRow row in Rows) {
                demData = new DemographicData();

                demData.DemographicID = Convert.ToString(row["DemogId"]);
                demData.DemographicName = Convert.ToString(row["DemogName"]);
                demData.DemographicCode = Convert.ToString(row["DemogCode"]);
                demData.IsSelectable = Convert.ToBoolean(row["IsSelectable"]);

                demData.DemographicChild = new List<DemographicData>();
                IEnumerable<DataRow> ChildRows = (from r in dt.AsEnumerable()
                                             where Convert.ToString(r.Field<object>("DemogParentId")).Equals(Convert.ToString(row["DemogId"]))
                                             select r);

                foreach(DataRow childRow in ChildRows) {
                    childDemData = new DemographicData();

                    childDemData.DemographicID = Convert.ToString(childRow["DemogId"]);
                    childDemData.DemographicName = Convert.ToString(childRow["DemogName"]);
                    childDemData.DemographicCode = Convert.ToString(childRow["DemogCode"]);
                    childDemData.IsSelectable = Convert.ToBoolean(childRow["IsSelectable"]);
                    childDemData.DemographicChild = null;

                    demData.DemographicChild.Add(childDemData);
                }
                demDataList.Add(demData);
            }

            return demDataList;
        } 
    }
}
