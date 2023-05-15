using CCI_KH_DSR.Utilities;
using System.Net;
using System.Net.Http;
using System.Web.Http;
using BAL;
using Entities;
using System.Web;
using Newtonsoft.Json;

namespace CCI_KH_DSR.Controllers.API
{
    [ApiAuthorizationFilter]
    public class Top10Controller : ApiController
    {
        private static ITop10 _Top10Obj;
        private static IFilterPanel _filterObj;
        public Top10Controller(ITop10 _Obj,IFilterPanel _FilterObj)
        {
            _Top10Obj = _Obj;
            _filterObj = _FilterObj;
        }
        [HttpPost]
        public HttpResponseMessage GetChartOutput(Top10Request request)
        {
            var watch = new System.Diagnostics.Stopwatch();
            watch.Start();
            AQ.Logger.TrackEvent("Open-Top 10", JsonConvert.SerializeObject(request));
            HttpResponseMessage _response = null;
            if (HttpContext.Current.Session["mappingList"] == null || HttpContext.Current.Session["mappingList"].ToString() == "")
            {
                var response = _filterObj.GetMappingData();
                HttpContext.Current.Session["mappingList"] = JsonConvert.SerializeObject(response);
            }
            var fitlerResponse = JsonConvert.DeserializeObject<FilterDataWithMapping>(HttpContext.Current.Session["mappingList"].ToString());
            var chartResponse = _Top10Obj.GetPieChartOutput(request, fitlerResponse);
            _response = Request.CreateResponse(HttpStatusCode.OK, chartResponse);
            watch.Stop();
            AQ.Logger.TrackEvent("Top 10 GetChartOutput finished", $"Execution Time: {watch.ElapsedMilliseconds} ms");
            return _response;
        }
        [HttpPost]
        public HttpResponseMessage ExportPPTExcel(Top10Request request)
        {
            var watch = new System.Diagnostics.Stopwatch();
            watch.Start();
            HttpResponseMessage _response = null;
            AQ.Logger.TrackEvent("Top 10 ExportPPTExcel initiated", JsonConvert.SerializeObject(request));
            if (HttpContext.Current.Session["mappingList"] == null || HttpContext.Current.Session["mappingList"].ToString() == "")
            {
                var fitlerResponse = _filterObj.GetFilterData();
                StringResponse resp = _Top10Obj.ExportPPTExcel(request, fitlerResponse);
                HttpContext.Current.Session["mappingList"] = JsonConvert.SerializeObject(fitlerResponse);
                _response = Request.CreateResponse(HttpStatusCode.OK, resp);
            }
            else
            {
                var fitlerResponse = JsonConvert.DeserializeObject<FilterDataWithMapping>(HttpContext.Current.Session["mappingList"].ToString());
                StringResponse resp = _Top10Obj.ExportPPTExcel(request, fitlerResponse);
                _response = Request.CreateResponse(HttpStatusCode.OK, resp);
            }
            watch.Stop();
            AQ.Logger.TrackEvent("Top 10 ExportPPTExcel finished", $"Execution Time: {watch.ElapsedMilliseconds} ms");
            return _response;
        }
    }
}
