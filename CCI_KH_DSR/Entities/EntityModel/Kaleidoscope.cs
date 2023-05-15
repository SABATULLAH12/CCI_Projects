using System.Collections.Generic;

namespace Entities
{
    public class KaleidoscopeRequest
    {
        public IList<Module> Module { get; set; }
        public KV1Param KV1Param { get; set; }
        public string SelectedDate { get; set; }
        public bool isINSWAMenu { get; set; }
        public string fromKaleichart { get; set; }
        public IList<Selection> RegionFilter { get; set; }
    }
    
    public class ScatterChartOutput
    {
        public IList<BubbleSeriesData> Series { get; set; }
        public string ChartName { get; set; }
        public ScatterChartOutput()
        {
            Series = new List<BubbleSeriesData>();
        }
    }
    public class BubbleSeriesData
    {
        public string name { get; set; }
        public IList<BubbleDataPoint> data { get; set; }
        public string color { get; set; }
        public BubbleSeriesData()
        {
            data = new List<BubbleDataPoint>();
        }
    }
    public class BubbleDataPoint
    {
        public double? x { get; set; }
        public double? y { get; set; }
        public double? z { get; set; }

    }

    //------Aj

    //------Input Parameters----
    public class KV1Param
    {
        public  List<INSWAPopMenu> INSWAPopMenu { get; set; }
        public TRparam TRparam { get; set; }

        public BLineNBarChart BLineNBarChart { get; set; }

    }
    public class INSWAPopMenu
    {
        public int ID { get; set; }
        public string DisplayName { get; set; }
        public string OrgName { get; set; }
        public int Maxlevel { get; set; }
        public int Curlevel { get; set; }

        public string LastSelected_tm { get; set; }
        public string setIcon
        {
            get
            {
                switch (ID)
                {
                    case 1:
                        return "smlRegIco";
                    case 2:
                        return "smlCateIco";
                    case 3:
                        return"smlBrndIco";
                    case 4:
                        return "smlPackIco";
                }
                return ID.ToString();
            }
        }

    }
    public class TRparam
    {
        public string Measure { get; set; }
        public string Timeperiod { get; set; }
        public List<INSWADetails> Selection { get; set; }        
        public TRparam()
        {
            Selection = new List<INSWADetails>();
        }
    }
    public class INSWADetails 
    {
        public int Id { get; set; }
        public string NameID { get; set; }
        public string Name { get; set; }
        public string ExtraInfo { get; set; }
        public string level { get; set; }        
        public bool isParentNode { get; set; }

    }
    //------End of Input Parameters----
    public class PercentChart
    {
        public List<INSWAPopMenu> INSWAChartMenu { get; set; }
        public List<percentChartItem> percentChartData { get; set; }
        public List<INSWAChart> INSWAChartData { get; set; }
        public BLineNBarChart BLineNBarChart { get; set; }
        public PercentChart()
        {
            percentChartData = new List<percentChartItem>();
            INSWAChartData = new List<INSWAChart>();
            INSWAChartMenu = new List<INSWAPopMenu>();
            BLineNBarChart = new BLineNBarChart();
            BLineNBarChart.categoriesData = new List<string>();
            BLineNBarChart.columnData = new List<BarchartDataNcolor>();
            BLineNBarChart.lineData = new List<double?>();
        }
        public string grthpercSign { get; set; }
    }
    public class percentChartItem
    {
        public string Name { get; set; }
        public string Name_ID { get; set; }
        public double? value { get; set; }
    }
    public class INSWAChart
    {
        public string id { get; set; }
        public string name { get; set; }
        public string parent { get; set; }
        public string selected { get; set; }
        public double? Dvalue { get; set; }
        public string org_name { get; set; }
        public string presign { get; set; }
        public string tooltip { get; set; }
        public double? volume { get; set; }
    }

    public class BLineNBarChart
    {
        public List<string> categoriesData { get; set; }
        public List<BarchartDataNcolor> columnData { get; set; }
        public List<double?> lineData { get; set; }
    }
    public class BarchartDataNcolor
    {
        public double? y { get; set; }
        public string color { get; set; }
    }
}
