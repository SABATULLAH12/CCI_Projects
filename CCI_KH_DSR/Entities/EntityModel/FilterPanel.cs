using System.Collections.Generic;

namespace Entities
{
    public class DailyUpdate
    {
        public int data1 { get; set; }
        public int data2 { get; set; }
    }
    public class QueryInfo
    {
        public string query { get; set; }
        public int id { get; set; }
    }
    public class PageInfo
    {
        public string moduleName { get; set; }
        public string value { get; set; }
    }
    public class StringResponse
    {
        public string value { get; set; }
        public string Error { get; set; }
    }
    public class Module
    {
        public string Name { get; set; }
        public Selection Selection { get; set; }
    }

    public class Selection
    {
        public string Name { get; set; }
    }

    public class FilterDataWithMapping
    {
        public IList<FilterData> filterData { get; set; }
        public MappingData mappingData { get; set; }
        public FilterDataWithMapping()
        {
            this.mappingData = new MappingData();
        }

    }

    public class MappingData
    {
        public IList<RegionData> regionData { get; set; }
        public IList<BrandsData> brandsData { get; set; }
        public IList<PacksData> packsData { get; set; }
        public MappingData()
        {
            this.regionData = new List<RegionData>();
            this.packsData = new List<PacksData>();
            this.brandsData = new List<BrandsData>();
        }
    }

    public class FilterData
    {
        public string Name { get; set; }
        public string DispName { get; set; }
        public IList<FilterData> Data { get; set; }

        public FilterData(string name,string dispName, IList<FilterData> data)
        {
            this.Name = name;
            this.DispName = dispName;
            this.Data = data;
        }
    }


    public class RegionData
    {
        public string A1 { get; set; }
        public string A2 { get; set; }
        public string B1 { get; set; }
        public string B2 { get; set; }
        public string C1 { get; set; }
        public string C2 { get; set; }
        public string D1 { get; set; }
        public string D2 { get; set; }
        public string E1 { get; set; }
        public string E2 { get; set; }
    }

    public class BrandsData
    {
        public string A1 { get; set; }
        public string A2 { get; set; }
        public string B1 { get; set; }
        public string B2 { get; set; }
    }

    public class PacksData
    {
        public string A1 { get; set; }
        public string A2 { get; set; }
        public string B1 { get; set; }
        public string B2 { get; set; }
    }

    public class NonPerformingBottlerRequest
    {
        public string SelectedDate { get; set; }
    }
    public class NonPerformingBottler
    {
        public List<string> BottlerName { get; set; }
    }

}
