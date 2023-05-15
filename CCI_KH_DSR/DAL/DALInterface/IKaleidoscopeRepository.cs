using Entities;
using System.Data;

namespace DAL
{
    public interface IKaleidoscopeRepository
    {
        DataTable GetScatterChartOutput(KaleidoscopeRequest request);
        //------AJ
        DataSet GetPercentChartChart(KaleidoscopeRequest request);
        DataSet UpdateMapping_JSON();
    }
}
