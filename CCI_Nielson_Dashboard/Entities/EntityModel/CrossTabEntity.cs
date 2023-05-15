
using System.Collections.Generic;

namespace Entities
{
    public class CrossTabOutput
    {
        public string row { get; set; }
        public string column { get; set; }
        public double? valueNumber { get; set; }
        public double? changeNumber  { get; set; }
    }
    public class FilterMapping
    {
        public IList<RegionMapping> regionMapping { get; set; }
        public IList<KpiMapping> kpiMapping { get; set; }
        public IList<TimeperiodMapping> timeperiodMapping { get; set; }
        public IList<ProductMapping> productMapping { get; set; }
        public FilterMapping()
        {
            regionMapping = new List<RegionMapping>();
            kpiMapping = new List<KpiMapping>();
            timeperiodMapping = new List<TimeperiodMapping>();
            productMapping = new List<ProductMapping>();
        }
    }

    public class CrossTabRequest
    {
        public IList<CrossTabFilterEntity> crossTabFilterEntityList { get; set; }
    }

    public class CrossTabFilterEntity
    {
        public string Name { get; set; }
        public IList<Selections> Selection { get; set; }
    }

    public class RegionMapping
    {
        public string Level1Name { get; set; }
        public string Level2Name { get; set; }
        public string Level3Name { get; set; }
        public string CubeColumnName { get; set; }
    }

    public class KpiMapping
    {
        public string Level1Name { get; set; }
        public string YTDCubeValueColumnName { get; set; }
        public string YTDCubeChangeColumnName { get; set; }
        public string MATCubeValueColumnName { get; set; }
        public string MATCubeChangeColumnName { get; set; }
        public string MonthCubeValueColumnName { get; set; }
        public string MonthCubeChangeColumnName { get; set; }
        public string QTDCubeValueColumnName { get; set; }
        public string QTDCubeChangeColumnName { get; set; }
    }

    public class ProductMapping
    {
        public string Level1Name { get; set; }
        public string Level2Name { get; set; }
        public string CubeColumnName { get; set; }
    }
}
