using System;
using System.Configuration;
using System.Net;
using System.Net.Http;
using System.Web;
using System.Web.Http.Filters;

namespace CCI_KH_DSR.Utilities
{
    public class ApiAuthorizationFilterAttribute : AuthorizationFilterAttribute
    {
        private bool _Flag { get; set; }
        public ApiAuthorizationFilterAttribute()
        {
            _Flag = false;//!Convert.ToBoolean(ConfigurationManager.AppSettings["ByPassLogin"]);
        }
        public ApiAuthorizationFilterAttribute(bool flag)
        {
            _Flag = flag;
        }

        public static string Base64Decode(string base64EncodedData)
        {
            var base64EncodedBytes = System.Convert.FromBase64String(base64EncodedData);
            return System.Text.Encoding.UTF8.GetString(base64EncodedBytes);
        }

        public override void OnAuthorization(System.Web.Http.Controllers.HttpActionContext actionContext)
        {
            try
            {
                if (!_Flag)
                    return;
                
                if (HttpContext.Current.Session["UserId"] !=null && HttpContext.Current.Session["UserId"].ToString() != "")
                {
                    //pass
                }
                else
                {
                    // returns unauthorized error  
                    actionContext.Response = actionContext.Request.CreateResponse(HttpStatusCode.Unauthorized);
                }
                base.OnAuthorization(actionContext);
            }
            // Handling Authorize: Basic <base64(username:password)> format.
            catch
            {
                actionContext.Response = actionContext.Request.CreateResponse(HttpStatusCode.Unauthorized);
            }
        }
    }
}