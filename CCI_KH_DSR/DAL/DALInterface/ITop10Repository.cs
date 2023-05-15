using Entities;
using System.Data;

namespace DAL
{
    public interface ITop10Repository
    {
        DataTable GetchartOuput(Top10Request request, FilterDataWithMapping mapping);
    }
}
