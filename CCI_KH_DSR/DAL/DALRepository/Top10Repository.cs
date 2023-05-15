using System;
using System.Data;
using Entities;
using MdxClient;

namespace DAL
{
    public class Top10Repository : ITop10Repository, IDisposable
    {
        internal readonly IConnectionFactory _connFactory;
        internal readonly MdxConnection _myConn;

        public Top10Repository(IConnectionFactory connFatory)
        {
            _connFactory = connFatory;
            _myConn = connFatory.GetConnection;
        }
        #region Repository Methods

        public DataTable GetchartOuput(Top10Request request, FilterDataWithMapping mapping)
        {
            string MdxQuery = MDXQueries.getTop10ChartPlotQuery(request,mapping);
            Log.LogMDXquery("GetTop10ChartOutput", MdxQuery);
            return DataAccess.GetQueryOutput(_myConn, MdxQuery);
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
