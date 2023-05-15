
using System.Data;

namespace DAL
{
    public interface IConnectionFactory
    {
        IDbConnection GetConnection { get; }
    }
}
