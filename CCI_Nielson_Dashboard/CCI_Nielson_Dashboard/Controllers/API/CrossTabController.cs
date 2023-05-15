using BAL;
using Entities;
using Newtonsoft.Json;
using System.Net;
using System.Net.Http;
using System.Web.Http;

namespace CCI_Nielson_Dashboard.Controllers.API
{
    public class CrossTabController : ApiController
    {
        private static ICrossTab _crossTabObj;
        private static IFilterPanel _FilterObj;
        public CrossTabController(ICrossTab crosstabObj, IFilterPanel FilterObj)
        {
            _crossTabObj = crosstabObj;
            _FilterObj = FilterObj;

        }
        [HttpPost]
        public HttpResponseMessage GetOutput(CrossTabRequest request)
        {
            HttpResponseMessage _response = null;
            var watch = new System.Diagnostics.Stopwatch();
            watch.Start();
            AQ.Logger.TrackEvent("Open-Visual Cross Tab", JsonConvert.SerializeObject(request));
            var response = _crossTabObj.GetOutput(request, _FilterObj.GetFilter());
            _response = Request.CreateResponse(HttpStatusCode.OK, response);
            watch.Stop();
            AQ.Logger.TrackEvent("Visual Cross Tab GetOutput finished", $"Execution Time: {watch.ElapsedMilliseconds} ms");
            return _response;
        }
    }
}
