
using System.Data;

namespace DAL {
    public interface IDashboardDal {
        DataSet GetPanelData();
        DataSet GetDashboardOutput(object[] parameters);
    }
}
