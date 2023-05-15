using System;
using System.Data;

namespace DAL
{
    public class LoginRepository : ILoginRepository
    {
        internal readonly IConnectionFactory _connFactory;
        internal readonly IDbConnection _myConn;

        public LoginRepository(IConnectionFactory connFatory)
        {
            _connFactory = connFatory;
            _myConn = connFatory.GetConnection;
        }

        #region Repository Methods 
        public DataSet LoginDetails(int userId)
        {
            var paramValues = new object[] { userId };
            var ds = DataAccess.GetData(_myConn, Constants.Getuserdetails, paramValues);
            return ds;
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