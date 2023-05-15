using System.Collections.Generic;

namespace Entities {

    public class TimePeriodAttributes {
        public string PeriodType { get; set; }
        public string PeriodCode { get; set; }
        public string PeriodName { get; set; }
        public string Month { get; set; }
        public string  Year { get; set; }
    }

    public class OutletData {
        public string OutletCode { get; set; }
        public string OutletID { get; set; }
        public string OutletName { get; set; }
        public string OutletParentName { get; set; }
    }

    public class DemographicData {
        public string DemographicName { get; set; }
        public string DemographicCode { get; set; }
        public string DemographicID { get; set; }
        public bool IsSelectable { get; set; }
        public List<DemographicData> DemographicChild { get; set; }
    }
    
    public class TimePeriodData {
        public string PeriodType { get; set; }
        public List<TimePeriodAttributes> TimePeriodList { get; set; }
    }

    public class MapData {
        public string OutletType { get; set; }
        public List<OutletData> OutletDataList { get; set; }
    }

    public class PanelData {
        public PanelData() {
            TimePeriods = new List<string>();
            TimePeriodData = new List<TimePeriodData>();
        }
        public List<string> TimePeriods { get; set; }
        public List<TimePeriodData> TimePeriodData { get; set; }
        public List<MapData> MapData { get; set; }
        public List<DemographicData> DemographicDataList { get; set; }
        public List<string> YearsRange { get; set; }
       
    }

    public class DashboardSelectionEntity {
        public TimePeriodEntity TimePeriod { get; set; }
        public string DemographicFilterID { get; set; }
        public string CurrentView { get; set; }
        public CurrentMapEntity CurrentMap { get; set; }
        public string KpiSelection { get; set; }
        public WidgetEntity WidgetSelection { get; set; }
        public bool ShouldLog { get; set; }
    }

    public class TimePeriodEntity {
        public string ID { get; set; }
        public string Name { get; set; }
        public string Type { get; set; }
    }

    public class CurrentMapEntity {
        public string ID { get; set; }
        public string Type { get; set; }
    }

    public class WidgetEntity {
        public string Code { get; set; }
        public string Type { get; set; }
    }

    public class DashboardOutput {
        public string MeasureCode { get; set; }
        public string MeasureName { get; set; }
        public bool IsTrademark { get; set; }
        public string MeasurePercentage { get; set; }
        public string Change { get; set; }
        public string HoverName { get; set; }
        public List<DashboardOutput> Trademarks { get; set; }
    }

    public class TrendOutput {
        public string MeasureCode { get; set; }
        public string MeasureName { get; set; }
        public string CurrentYearPercentage { get; set; }
        public string PreviousYearPercentage { get; set; }
    }

    public class DashboardData {
        public List<DashboardOutput> MapData { get; set; }
        public List<DashboardOutput> KpiSnapshotData { get; set; }
        public List<TrendOutput> TrendGraphData { get; set; }
        public List<DashboardOutput> BrandData { get; set; }
        public List<DashboardOutput> CategoryData { get; set; }
        public List<DashboardOutput> CompanyData { get; set; }
        public List<DashboardOutput> FlavourData { get; set; }
        public List<DashboardOutput> PackData { get; set; }
    }
}