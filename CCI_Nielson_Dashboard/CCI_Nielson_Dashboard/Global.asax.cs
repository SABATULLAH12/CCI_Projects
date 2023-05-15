using System;
using System.Web;
using System.Web.Mvc;
using System.Web.Routing;
using System.Web.SessionState;
using System.Web.Http;
using CCI_Nielson_Dashboard.App_Start;
using Entities;

namespace CCI_Nielson_Dashboard
{
    public class Global : HttpApplication
    {
        public override void Init()
        {
            this.PostAuthenticateRequest += MvcApplication_PostAuthenticateRequest;
            base.Init();
        }
        void MvcApplication_PostAuthenticateRequest(object sender, EventArgs e)
        {
            System.Web.HttpContext.Current.SetSessionStateBehavior(
                SessionStateBehavior.Required);
        }
        void Application_Start(object sender, EventArgs e)
        {
            // Code that runs on application startup
            Log.LogMessage("Application Started");
            AreaRegistration.RegisterAllAreas();
            GlobalConfiguration.Configure(WebApiConfig.Register);
            RouteConfig.RegisterRoutes(RouteTable.Routes);
            MinifyJavascript js = new MinifyJavascript(Server.MapPath("~/Scripts/Controller"));
            MinifyCss css = new MinifyCss(Server.MapPath("~/Content"));
            MvcHandler.DisableMvcResponseHeader = true;
        }

        void Application_PreSendRequestHeaders(Object sender, EventArgs e)
        {
            Response.Cache.SetCacheability(HttpCacheability.NoCache);
        }
    }
}