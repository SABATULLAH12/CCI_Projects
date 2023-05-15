

using Entities;
using System.Data;

namespace DAL
{
    public  interface ICrossTabRepository
    {
        DataTable CrossTabData(CrossTabRequest crossTabRequest, FilterData filterData);
    }
}
