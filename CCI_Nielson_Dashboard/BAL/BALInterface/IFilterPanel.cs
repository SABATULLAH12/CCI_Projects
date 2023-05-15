using Entities;

namespace BAL
{
    public interface IFilterPanel
    {
        ClientSideFilterFormat GetFilterData();
        FilterData GetFilter();
    }
}
