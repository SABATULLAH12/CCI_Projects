using System.Web.Mvc;
using System.Web.Routing;

namespace CCI_KH_DSR
{
    public class RouteConfig
    {
        public static void RegisterRoutes(RouteCollection routes)
        {
            routes.IgnoreRoute("{resource}.axd/{*pathInfo}");

            // Route override to work with Angularjs and HTML5 routing
            routes.MapRoute(
                name: "Default0",
                url: "Home/logout",
                defaults: new { controller = "Home", action = "logout" }
            );
            routes.MapRoute(
                 name: "Default1",
                 url: "{controller}/{*.}",
                 defaults: new { controller = "Home", action = "Index" }
             );
            routes.MapRoute(
               name: "Default2",
               url: "{controller}/{action}/{id}",
               defaults: new { controller = "Home", action = "Index", id = UrlParameter.Optional }
           );
        }
    }
}
