

using Entities;
using System.Collections.Generic;

namespace BAL
{
    public interface ICrossTab
    {
        IList<CrossTabOutput> GetOutput(CrossTabRequest crossTabRequest,FilterData filterData);
    }
}
