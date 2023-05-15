using Microsoft.Practices.EnterpriseLibrary.Data.Sql;
using System;
using System.Data;
using System.Data.Common;

namespace DAL {
    public class DashboardDal : IDashboardDal {

        internal readonly IConnectionFactory _connectionFactory;
        internal readonly SqlDatabase _sqlConn;
        internal DbCommand _dbCmd;
        public DashboardDal(IConnectionFactory connectionFactory) {
            _connectionFactory = connectionFactory;
            _sqlConn = connectionFactory.GetConnection;
        }
        public DataSet GetPanelData() {
            string spName = Constants.TopPanelSpName;
            return DataAccess.GetData(_sqlConn, spName);
        }

        public DataSet GetDashboardOutput(object[] parameters) {
            string spName = Constants.DashboardOutputSpName;

            _dbCmd = _sqlConn.DbProviderFactory.CreateCommand();
            _dbCmd = _sqlConn.GetStoredProcCommand(spName, parameters);
            _dbCmd.CommandType = CommandType.StoredProcedure;
            _dbCmd.CommandTimeout = 7200;

            return DataAccess.GetData(_sqlConn, _dbCmd);
        }
    }
}
