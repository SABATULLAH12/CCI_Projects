using CCI_KH_DSR.Utilities;
using System.Net;
using System.Net.Http;
using System.Web.Http;
using Entities;
using BAL;
using System.Web;
using Newtonsoft.Json;
using System.Web.Script.Serialization;
using System;
using System.Collections.Generic;

namespace CCI_KH_DSR.Controllers.API
{
    [ApiAuthorizationFilter]
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
            var watch = new System.Diagnostics.Stopwatch();
            watch.Start();
            AQ.Logger.TrackEvent("FilterPanel GetFilter initiated");
            HttpResponseMessage _response = null;
            if (HttpContext.Current.Session["mappingList"] == null || HttpContext.Current.Session["mappingList"].ToString() == "")
            {
                var response = _filterObj.GetFilterData();
                _response = Request.CreateResponse(HttpStatusCode.OK, response.filterData);
            }
            else
            {
                var response = JsonConvert.DeserializeObject<FilterDataWithMapping>(HttpContext.Current.Session["mappingList"].ToString());
                _response = Request.CreateResponse(HttpStatusCode.OK, response.filterData);
            }
            watch.Stop();
            AQ.Logger.TrackEvent("FilterPanel GetFilter finished", $"Execution Time: {watch.ElapsedMilliseconds} ms");
            return _response;
        }
        [HttpPost]
        public HttpResponseMessage GetMappingData()
        {
            var watch = new System.Diagnostics.Stopwatch();
            watch.Start();
            AQ.Logger.TrackEvent("FilterPanel GetMappingData initiated");
            HttpResponseMessage _response = null;
            if (HttpContext.Current.Session["mappingList"] == null || HttpContext.Current.Session["mappingList"].ToString() == "")
            {
                var response = _filterObj.GetMappingData();
                HttpContext.Current.Session["mappingList"] = JsonConvert.SerializeObject(response);
                _response = Request.CreateResponse(HttpStatusCode.OK, response.filterData);
            }
            else
            {
                var response = JsonConvert.DeserializeObject<FilterDataWithMapping>(HttpContext.Current.Session["mappingList"].ToString());
                _response = Request.CreateResponse(HttpStatusCode.OK, response.filterData);
            }
            watch.Stop();
            AQ.Logger.TrackEvent("FilterPanel GetMappingData finished", $"Execution Time: {watch.ElapsedMilliseconds} ms");
            return _response;
        }
        [HttpPost]
        public HttpResponseMessage GetNonPerfomBottler(NonPerformingBottlerRequest SelectedDate)
        {
            var watch = new System.Diagnostics.Stopwatch();
            watch.Start();
            AQ.Logger.TrackEvent("FilterPanel GetNonPerfomBottler initiated", JsonConvert.SerializeObject(SelectedDate));
            HttpResponseMessage _response = null;
            JavaScriptSerializer serializer = new JavaScriptSerializer();
            serializer.MaxJsonLength = Int32.MaxValue;
            string ExcludeBottlerList = System.IO.File.ReadAllText(HttpContext.Current.Server.MapPath("~/App_Data/") + "ExcludeBottlerList.json");
            _response = Request.CreateResponse(HttpStatusCode.OK, _filterObj.getNonPerfomBottler(SelectedDate, serializer.Deserialize<List<string>>(ExcludeBottlerList)));
            watch.Stop();
            AQ.Logger.TrackEvent("FilterPanel GetNonPerfomBottler finished", $"Execution Time: {watch.ElapsedMilliseconds} ms");
            return _response;
        }
    }
}
