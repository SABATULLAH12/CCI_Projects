using Microsoft.Practices.EnterpriseLibrary.Data.Sql;
using System;
using System.Data;
using System.Data.Common;

namespace DAL {
    public static class DataAccess {
        public static DataSet GetData(SqlDatabase conn, string strSPName) {
            DataSet dsData;
            dsData = conn.ExecuteDataSet(strSPName);

            return dsData;
        }

        public static DataSet GetData(SqlDatabase _sqlConn, DbCommand dbCmd) {
            DataSet dsData;

            try {
                dsData = _sqlConn.ExecuteDataSet(dbCmd);
            }
            catch(Exception ex) {
                //System.IO.File.WriteAllText(@"E:\inetpub\Coke India Dev\CCIHHPanel\WriteText.txt", "GetData2 " + ex.Message)
                dsData = null;
            }
            return dsData;
        }
        public static DataSet GetData(IDbConnection conn, string strSPName, object[] param) {
            DataSet dsData;

            SqlDatabase database = new SqlDatabase(conn.ConnectionString);
            dsData = database.ExecuteDataSet(strSPName, param);

            return dsData;
        }
    }
}
