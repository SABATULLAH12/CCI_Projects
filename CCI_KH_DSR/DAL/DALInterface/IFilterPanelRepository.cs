using Entities;
using System.Data;

namespace DAL
{
    public interface IFilterPanelRepository
    {
        DataSet GetFilterMappingData();
        DataTable GetNonPerformingBottler(NonPerformingBottlerRequest request,FilterDataWithMapping mapping);
    }
}
