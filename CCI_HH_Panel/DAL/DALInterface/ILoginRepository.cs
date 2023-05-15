using System.Data;

namespace DAL {
    public interface ILoginRepository {
        DataSet LoginDetails(int userId);
    }
}