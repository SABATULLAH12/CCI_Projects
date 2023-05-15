using System.Configuration;
using System.Data;
using System.Data.Common;

namespace DAL
{
    public class ConnectionFactory : IConnectionFactory
    {
        private readonly string connectionString = ConfigurationManager.ConnectionStrings[ConfigurationManager.AppSettings["DBConnectionString"]].ConnectionString;
        public IDbConnection GetConnection
        {
            get
            {
                var factory = DbProviderFactories.GetFactory("System.Data.SqlClient");
                var conn = factory.CreateConnection();
                conn.ConnectionString = connectionString;
                return conn;
            }
        }
    }
}
