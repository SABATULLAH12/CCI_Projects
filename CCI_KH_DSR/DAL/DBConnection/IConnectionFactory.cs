using MdxClient;
using System.Data;

namespace DAL
{
    public interface IConnectionFactory
    {
        MdxConnection GetConnection { get; }
        IDbConnection GetDBConnection { get; }
    }
}
