using BAL;
using System.Net;
using System.Net.Http;
using System.Web.Http;

namespace CCI_Nielson_Dashboard.Controllers.API
{
    public class DashboardController : ApiController
    {
        private static IDashboard _dashObj;

        public DashboardController(IDashboard _Obj)
        {
            _dashObj = _Obj;
        }
        [HttpPost]
        public HttpResponseMessage GetFilter()
        {
            HttpResponseMessage _response = null;
            var response = _dashObj.Dummy();
            _response = Request.CreateResponse(HttpStatusCode.OK, response);
            return _response;
        }
    }
}
