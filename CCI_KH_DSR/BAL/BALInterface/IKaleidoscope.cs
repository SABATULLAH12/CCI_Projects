using Entities;

namespace BAL
{
    public interface IKaleidoscope
    {
        ScatterChartOutput GetScatterChartOutput(KaleidoscopeRequest request);
        PercentChart GetPercentChartOutput(KaleidoscopeRequest request);
        void UpdateMapping_JSON();
    }
}
