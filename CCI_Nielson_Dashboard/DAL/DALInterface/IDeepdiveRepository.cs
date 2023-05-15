

using Entities;
using System.Data;

namespace DAL
{
    public  interface IDeepdiveRepository
    {
        DataSet GetOutput(DeepdiveInput deepdiveInput);
    }
}
