
using Microsoft.Practices.EnterpriseLibrary.Data.Sql;
using System.Data;

namespace DAL {
    public interface IConnectionFactory {

        SqlDatabase GetConnection { get; }
        IDbConnection GetDBConnection { get; }
    }
}
