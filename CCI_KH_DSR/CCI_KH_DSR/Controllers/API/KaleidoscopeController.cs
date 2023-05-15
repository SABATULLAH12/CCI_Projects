using BAL;
using Entities;
using System.Web.Http;
using CCI_KH_DSR.Utilities;
using System.Net.Http;
using System.Net;
using Newtonsoft.Json;

namespace CCI_KH_DSR.Controllers.API
{
    [ApiAuthorizationFilter]
    public class KaleidoscopeController : ApiController
    {
        private static IKaleidoscope _KaleidoObj;
        public KaleidoscopeController(IKaleidoscope _Obj)
        {
            _KaleidoObj = _Obj;
        }
        [HttpPost]
        public HttpResponseMessage GetScatterChartOutput(KaleidoscopeRequest request)
        {
            var watch = new System.Diagnostics.Stopwatch();
            watch.Start();
            AQ.Logger.TrackEvent("Open-Scatter Plot", JsonConvert.SerializeObject(request));
            var response = _KaleidoObj.GetScatterChartOutput(request);
            HttpResponseMessage _response = Request.CreateResponse(HttpStatusCode.OK, response);
            watch.Stop();
            AQ.Logger.TrackEvent("Scatter Plot GetScatterChartOutput finished", $"Execution Time: {watch.ElapsedMilliseconds} ms");
            return _response;
        }

        #region KV1
        [HttpPost]
        public HttpResponseMessage GetPercentChartOutput(KaleidoscopeRequest request)
        {
            var watch = new System.Diagnostics.Stopwatch();
            watch.Start();
            AQ.Logger.TrackEvent("Open-Kaleidoscope", JsonConvert.SerializeObject(request));
            var response = _KaleidoObj.GetPercentChartOutput(request);            
            HttpResponseMessage _response = Request.CreateResponse(HttpStatusCode.OK, response);
            watch.Stop();
            AQ.Logger.TrackEvent("Decomposition GetPercentChartOutput finished", $"Execution Time: {watch.ElapsedMilliseconds} ms");
            return _response;
        }


        /// <summary>
        /// Independant function for UPDATE json MAPPING file
        /// This function need to call only if Any Mapping updated On CUBE
        /// </summary>        
        [HttpGet]
        public void UpdateMapping()
        {
            var watch = new System.Diagnostics.Stopwatch();
            watch.Start();
            AQ.Logger.TrackEvent("Decomposition UpdateMapping initiated");
            _KaleidoObj.UpdateMapping_JSON();
            watch.Stop();
            AQ.Logger.TrackEvent("Decomposition UpdateMapping finsihed", $"Execution Time: {watch.ElapsedMilliseconds} ms");
        }
        
        #endregion

    }
}
