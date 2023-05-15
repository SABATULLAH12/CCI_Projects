using System;
using System.Web;
using System.Web.Mvc;
using System.Web.Routing;
using System.Web.SessionState;
using System.Web.Http;

namespace CCI_HH_Panel
{
    public class Global : HttpApplication
    {
        void Application_Start(object sender, EventArgs e)
        {
            // Code that runs on application startup
            AreaRegistration.RegisterAllAreas();
            GlobalConfiguration.Configure(WebApiConfig.Register);
            RouteConfig.RegisterRoutes(RouteTable.Routes);            
        }
        public override void Init() {
            this.PostAuthenticateRequest += MvcApplication_PostAuthenticateRequest;
            base.Init();
        }
        void MvcApplication_PostAuthenticateRequest(object sender, EventArgs e) {
            System.Web.HttpContext.Current.SetSessionStateBehavior(
                SessionStateBehavior.Required);
        }
        void Application_PreSendRequestHeaders(Object sender, EventArgs e) {
            Response.Cache.SetCacheability(HttpCacheability.NoCache);
        }
    }
}