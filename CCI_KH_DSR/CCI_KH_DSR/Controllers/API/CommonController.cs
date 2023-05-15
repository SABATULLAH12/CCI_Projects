using CCI_KH_DSR.Utilities;
using Entities;
using System.Web.Http;

namespace CCI_KH_DSR.Controllers.API
{
    [ApiAuthorizationFilter]
    public class CommonController : ApiController
    {
        public CommonController()
        {

        }

        [HttpPost]
        public void TrackModule(PageInfo page)
        {
            AQ.Logger.TrackEvent("Navigated to Module:", page.moduleName);
        }

        [HttpPost]
        public void TrackAPIResp(PageInfo page)
        {
            AQ.Logger.TrackEvent(page.moduleName + " Consumed:", page.value);
        }
    }

}
