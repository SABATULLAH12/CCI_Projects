

using Entities;
using System.Data;

namespace DAL
{
    public  interface IFilterPanelRepository
    {
        DataSet GetStaticCrossTabFilterPanel();
        DataSet GetStaticDeepdiveFilterPanel();
        DataSet GetFilterMappingData();
    }
}
