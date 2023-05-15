using Entities;

namespace BAL {
    public interface IDashboardBal {
        PanelData GetPanelData();
        DashboardData GetDashboardData(DashboardSelectionEntity parameters);
    }
}
