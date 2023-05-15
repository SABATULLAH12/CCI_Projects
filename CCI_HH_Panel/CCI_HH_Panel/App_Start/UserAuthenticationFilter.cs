using System;
using System.Web;
using System.Web.Mvc;

namespace CCI_HH_Panel {
    public class UserAuthenticationFilterAttribute : ActionFilterAttribute {
        public override void OnActionExecuting(ActionExecutingContext filterContext) {
            if (string.IsNullOrEmpty(Convert.ToString(filterContext.HttpContext.Session["UserID"]))) {
                HttpContext.Current.Response.Redirect(@"../Home/Logout");
            }
        }

    }
}