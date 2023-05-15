using System;
using System.Data;
using Entities;
using MdxClient;
using System.Collections.Generic;

namespace DAL
{
    public class FilterPanelRepository : IFilterPanelRepository
    {
        internal readonly IConnectionFactory _connFactory;
        internal readonly MdxConnection _myConn;

        public FilterPanelRepository(IConnectionFactory connFatory)
        {
            _connFactory = connFatory;
            _myConn = connFatory.GetConnection;
        }

        #region Repository Methods 
        public DataSet GetFilterMappingData()
        {
            IList<string> queryList = new List<string>();
            queryList.Add(MDXQueries.RegionMappingQuery);
            queryList.Add(MDXQueries.BrandsMappingQuery);
            Log.LogMDXquery("GetRegionData", MDXQueries.RegionMappingQuery);
            Log.LogMDXquery("GetBrandData", MDXQueries.BrandsMappingQuery);
            return DataAccess.GetQueryOutput(queryList);
        }

        public DataTable GetNonPerformingBottler(NonPerformingBottlerRequest request,FilterDataWithMapping mapping)
        {
            string query = MDXQueries.getNonPerformingBottlerQuery(request, mapping);
            Log.LogMDXquery("GetNPBottler", query);
            return DataAccess.GetQueryOutput(_myConn, query);
        }
        #endregion

        #region IDisposable Support
        private bool disposedValue = false; // To detect redundant calls

        protected virtual void Dispose(bool disposing)
        {
            if (!disposedValue)
            {
                if (disposing)
                {
                    _myConn.Dispose();
                }

                disposedValue = true;
            }
        }

        // This code added to correctly implement the disposable pattern.
        public void Dispose()
        {
            Dispose(true);
            GC.SuppressFinalize(this);
        }


        #endregion
    }
}