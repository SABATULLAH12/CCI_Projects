using Entities;
using System.Collections.Generic;

namespace BAL
{
    public interface IFilterPanel
    {
        FilterDataWithMapping GetFilterData();

        FilterDataWithMapping GetMappingData();
        NonPerformingBottler getNonPerfomBottler(NonPerformingBottlerRequest request,List<string> ExcludeList);
    }
}
