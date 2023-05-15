using System;
using System.Collections.Generic;

namespace Entities
{
    public class ClientSideFilterFormat
    {
        public List<FilterEntity> CrosstabFilterList { get; set; }
        public List<FilterEntity> DeepDiveFilterList { get; set; }
        public IList<BrandMapping> BrandMapping { get; set; }
    }
    public class FilterData
    {
        public DateTime StaticMappingUpdatedOn { get; set; }
        public DateTime DynamicMappingUpdateOn { get; set; }
        public List<FilterEntity> CrosstabFilterList { get; set; }
        public FilterMapping CrossTabfilterMapping { get; set; }
        public List<FilterEntity> DeepDiveFilterList { get; set; }
        public DeepdiveMapping deepdiveFilterMapping { get; set; }
        public FilterData()
        {
            CrosstabFilterList = new List<FilterEntity>();
            CrossTabfilterMapping = new FilterMapping();
            DeepDiveFilterList = new List<FilterEntity>();
            deepdiveFilterMapping = new DeepdiveMapping();
        }
    }
    public class FilterEntity
    {
        public int Id { get; set; }
        public string Name { get; set; }
        public List<FilterEntity> Data {get;set;}
    }
    public class TimeperiodMapping
    {
        public string Level1Name { get; set; }
        public string Level2Name { get; set; }
        public string CubeColumnName { get; set; }
    }
    public class Selections
    {
        public string Name { get; set; }
        public IList<Selections> Selection { get; set; }
    }
    public class QueryInfo
    {
        public string query { get; set; }
        public int id { get; set; }
    }
}
