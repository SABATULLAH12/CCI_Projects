using BAL;
using Entities;
using Newtonsoft.Json;
using System;
using System.Web.Http;
using System.Web.Mvc;

namespace CCI_HH_Panel.Controllers.API
{
    public class DashboardApiController : ApiController {

        private static IDashboardBal _dashboardBAL;

        public DashboardApiController(IDashboardBal dashboardBAL) {
            _dashboardBAL = dashboardBAL;
        }

        [System.Web.Http.HttpPost]
        public JsonResult GetPanelData() {
            try {
                var panelData = _dashboardBAL.GetPanelData();

                return new JsonResult() {
                    Data = panelData,
                    JsonRequestBehavior = JsonRequestBehavior.AllowGet
                };
            }
            catch(Exception) {
                //System.IO.File.WriteAllText(@"D:\inetpub\UAT\CokeIndiaTEST\CCIHHPanelDashboard\Error.txt", "GetPanelData: " + ex.Message)
                return null;
            }
        }

        [System.Web.Http.HttpPost]
        public JsonResult GetDashboardData(DashboardSelectionEntity parameters) {
            var dashboardData = _dashboardBAL.GetDashboardData(parameters);
            if (parameters.ShouldLog) {
                AQ.Logger.TrackEvent("Open-Dashboard", JsonConvert.SerializeObject(parameters));
            }
            return new JsonResult() {
                Data = dashboardData,
                JsonRequestBehavior = JsonRequestBehavior.AllowGet
            };
        }
    }
}
