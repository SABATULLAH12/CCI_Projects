using System;
using System.Net.Http;
using System.Web.Http;
using System.Web.Http.Filters;
using System.Web.Script.Serialization;
using Newtonsoft.Json;
using Entities;

namespace CCI_KH_DSR
{
    public class GlobalExceptionHandleAttribute : ExceptionFilterAttribute
    {
        public override void OnException(HttpActionExecutedContext actionExecutedContext)
        {
            Exception ex = actionExecutedContext.Exception;

            ApiError _apiError = new ApiError();
            _apiError.message = ex.Message;
            _apiError.statuscode = System.Net.HttpStatusCode.InternalServerError;
            _apiError.detail = ex.StackTrace;

            Log.LogException(ex);
            AQ.Logger.TrackEvent("ERROR API Request Failed", JsonConvert.SerializeObject(_apiError));
            throw new HttpResponseException(new HttpResponseMessage(System.Net.HttpStatusCode.InternalServerError)
            { Content = new StringContent(new JavaScriptSerializer().Serialize(_apiError)), ReasonPhrase = "Something Went Wrong" });
        }

        private class ApiError
        {
            public string message { get; set; }
            public System.Net.HttpStatusCode statuscode { get; set; }
            public string detail { get; set; }
        }
    }
}