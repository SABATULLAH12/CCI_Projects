using Entities;
using System.Collections.Generic;

namespace BAL
{
    public interface ITop10
    {
        IList<GainerLooserList> GetPieChartOutput(Top10Request request, FilterDataWithMapping mapping);
        StringResponse ExportPPTExcel(Top10Request request, FilterDataWithMapping mapping);
    }
}
