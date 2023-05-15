

using Entities;

namespace BAL
{
    public interface IDeepdive
    {
        DeepdiveOrgOutput GetOutput(DeepdiveInput deepdiveInput, FilterData filterData);
    }
}
