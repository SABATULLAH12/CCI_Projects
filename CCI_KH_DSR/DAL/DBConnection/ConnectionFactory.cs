using MdxClient;
using System.Configuration;
using System.Data;
using System.Data.Common;

namespace DAL
{
    public class ConnectionFactory : IConnectionFactory
    {
        private readonly string connectionString = ConfigurationManager.ConnectionStrings[ConfigurationManager.AppSettings["CubeConnectionString"]].ConnectionString;
        public MdxConnection GetConnection
        {
            get
            {
                return new MdxConnection(connectionString);
            }
        }

        private readonly string DBconnectionString = ConfigurationManager.ConnectionStrings[ConfigurationManager.AppSettings["DBConnectionString"]].ConnectionString;
        public IDbConnection GetDBConnection
        {
            get
            {
                var factory = DbProviderFactories.GetFactory("System.Data.SqlClient");
                var conn = factory.CreateConnection();
                conn.ConnectionString = DBconnectionString;
                return conn;
            }
        }
    }
}
