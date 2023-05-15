using BAL;
using System.Net;
using System.Net.Http;
using System.Web.Http;

namespace CCI_Nielson_Dashboard.Controllers.API
{
    public class FilterPanelController : ApiController
    {
        private static IFilterPanel _filterObj;

        public FilterPanelController(IFilterPanel _Obj)
        {
            _filterObj = _Obj;
        }
        [HttpPost]
        public HttpResponseMessage GetFilter()
        {
            HttpResponseMessage _response = null;
            var response = _filterObj.GetFilterData();
            _response = Request.CreateResponse(HttpStatusCode.OK, response);
            return _response;
        }
    }
}
