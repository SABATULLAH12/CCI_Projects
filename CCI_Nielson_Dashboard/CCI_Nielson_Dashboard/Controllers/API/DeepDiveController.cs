using BAL;
using Entities;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Web.Http;

namespace CCI_Nielson_Dashboard.Controllers.API
{
    public class DeepDiveController : ApiController
    {
        private static IDeepdive _deepdiveTabObj;
        private static IFilterPanel _FilterObj;
        public DeepDiveController(IDeepdive deepdiveTabObj, IFilterPanel FilterObj)
        {
            _deepdiveTabObj = deepdiveTabObj;
            _FilterObj = FilterObj;

        }
        [HttpPost]
        public HttpResponseMessage GetOutput(DeepdiveInput OrgchartInput)
        {
            HttpResponseMessage _response = null;
            var watch = new System.Diagnostics.Stopwatch();
            watch.Start();
            AQ.Logger.TrackEvent("Open-Change Decomposition", JsonConvert.SerializeObject(OrgchartInput));
            var response = _deepdiveTabObj.GetOutput(OrgchartInput, _FilterObj.GetFilter());
            _response = Request.CreateResponse(HttpStatusCode.OK, response);
            watch.Stop();
            AQ.Logger.TrackEvent("Change Decomposition GetOutput finished", $"Execution Time: {watch.ElapsedMilliseconds} ms");
            return _response;
        }
    }
}
