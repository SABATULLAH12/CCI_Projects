
using Entities;
using System.Collections.Generic;
using System.Data;

namespace DAL
{
    public class FilterPanelRepository: IFilterPanelRepository
    {
        internal readonly IConnectionFactory _connFactory;
        internal readonly IDbConnection _myConn;

        public FilterPanelRepository(IConnectionFactory connFatory)
        {
            _connFactory = connFatory;
            _myConn = connFatory.GetConnection;
        }
        public DataSet GetStaticCrossTabFilterPanel()
        {
            return DataAccess.GetData(_myConn, Constants.GetStaticCrossTabFilterPanel);
        }
        public DataSet GetStaticDeepdiveFilterPanel()
        {
            return DataAccess.GetData(_myConn, Constants.GetStaticDeepDiveFilterPanel);
        }

        public DataSet GetFilterMappingData()
        {
            IList<string> queryList = new List<string>();
            queryList.Add(MDXQueries.CompanyMapping);
            queryList.Add(MDXQueries.BrandMapping);
            queryList.Add(MDXQueries.PackMappingQuery);
            queryList.Add(MDXQueries.FlavoursMapping);
            queryList.Add(MDXQueries.TimePeriodMapping);
            queryList.Add(MDXQueries.CategoryMappingQuery);
            Log.LogMDXquery("query0 CompanyMapping", MDXQueries.CompanyMapping);
            Log.LogMDXquery("query1 BrandMapping", MDXQueries.BrandMapping);
            Log.LogMDXquery("query2 PackMappingQuery", MDXQueries.PackMappingQuery);
            Log.LogMDXquery("query3 FlavoursMapping", MDXQueries.FlavoursMapping);
            Log.LogMDXquery("query4 TimePeriodMapping", MDXQueries.TimePeriodMapping);
            Log.LogMDXquery("query5 CategoryMapping", MDXQueries.CategoryMappingQuery);
            return DataAccess.GetQueryOutput(queryList);
        }
    }
}
