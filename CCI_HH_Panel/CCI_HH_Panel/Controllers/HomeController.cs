using BAL;
using Entity;
using Newtonsoft.Json;
using System;
using System.Configuration;
using System.Web.Mvc;

namespace CCI_HH_Panel.Controllers {
    public class HomeController : Controller {

        public static ILogin _login;
        public HomeController(ILogin login) {
            _login = login;
        }
        // GET: Home
        public ActionResult Index(string param) {
            string loginURl = ConfigurationManager.AppSettings["LoginPageURL"].ToString();
            int tokenValidity = Convert.ToInt32(ConfigurationManager.AppSettings["TokenValidity"]); // in minutes
            LoginInfo loginInfo = null;

            if (param != null && ConfigurationManager.AppSettings["ByPassLogin"].ToString() == "false" && VerifyTokenFromAuthServer(param, tokenValidity, loginURl, Request)) {
                // When Parameter is passed and Token is valid and came from Auth Server
                loginInfo = ValidateUser(param);
                if (loginInfo != null && loginInfo.IsAuthenticated) {
                    Session["LoginUrl"] = loginURl;
                    Session["RecivedToken"] = param;
                    Session["IsSSO"] = loginInfo.UserInfo.IsSSO;
                    Session["Email"] = loginInfo.UserInfo.Email;
                    Session["FirstName"] = loginInfo.UserInfo.FirstName;
                    //Session["LastName"] = loginInfo.UserInfo.LastName;
                    Session["UserId"] = loginInfo.UserInfo.Email;
                    Session.Timeout = Convert.ToInt32(ConfigurationManager.AppSettings["SessionTimeOut"]);
                    ViewBag.LoginPage = ConfigurationManager.AppSettings["LocalLogin"];
                    ViewBag.LoginPageURL = Session["LoginUrl"];
                    ViewBag.IsSSO = Session["IsSSO"];
                    AQ.Logger.TrackSignIn(ConfigurationManager.AppSettings["ClientName"].ToString(), ConfigurationManager.AppSettings["ProjectName"].ToString(), loginInfo.UserInfo.Email);
                    return View();
                } else {
                    Session.Clear();
                    return Redirect(loginURl);
                }
            } else {
                // When Parameter is not passed or Token is expired or token not from Auth Server
                if (Session["UserId"] != null && Session["UserId"].ToString() != "") {
                    ViewBag.LoginPage = ConfigurationManager.AppSettings["LocalLogin"];
                    ViewBag.LoginPageURL = Session["LoginUrl"];
                    ViewBag.IsSSO = Session["IsSSO"];
                    return View();
                } else if (ConfigurationManager.AppSettings["ByPassLogin"].ToString() == "true") {
                    Session["UserId"] = "localByPassUser";
                    return View();
                } else {
                    Session.Clear();
                    return Redirect(loginURl);
                }
            }
        }
        public ActionResult Logout() {
            string[] myCookies = Request.Cookies.AllKeys;
            foreach (string cookie in myCookies) {
                Response.Cookies[cookie].Expires = DateTime.Now.AddDays(-1);
            }

            AQ.Logger.TrackSignOut();
            Session.Clear();
            return Redirect(ConfigurationManager.AppSettings["LoginPageURL"].ToString() + ConfigurationManager.AppSettings["AuthLogout"].ToString());
        }
        /// <summary>
        /// Verify Token for token time and domain name
        /// </summary>
        /// <param name="param"></param>
        /// <param name="tokenValidity"></param>
        /// <param name="AuthServer"></param>
        /// <param name="request"></param>
        /// <returns></returns>
        private bool VerifyTokenFromAuthServer(string param, int tokenValidity, string authServer, System.Web.HttpRequestBase request) {
            string plainParamValue = "";
            Token token = new Token();
            try {
                plainParamValue = AQ.Security.Cryptography.EncryptionHelper.Decryptdata(param);
                token = JsonConvert.DeserializeObject<Token>(plainParamValue);
                //Verify Epoch Time is Acceptable
                int currentTime = Convert.ToInt32((DateTime.UtcNow - new DateTime(1970, 1, 1, 0, 0, 0, DateTimeKind.Utc)).TotalSeconds);
                int EndTime = currentTime + 60 * tokenValidity;
                if (token.epoch > EndTime) {
                    //token is expired
                    return false;
                } else if (token.appcode.ToLower() != ConfigurationManager.AppSettings["ProjectName"].ToString().ToLower()) {
                    //token is Not for this App
                    //Log.LogMessage("token is Not for this Application");.
                    return false;
                } else {
                    if (authServer == "")    //Allow when AuthServer in webconfig is not defined. Will allow any URL to make request.
                    {
                        return true;
                    } else if (request.UrlReferrer.Host != "" && request.UrlReferrer.Host == new Uri(authServer).Host)    //Check the request is genuine.
                      {
                        return true;
                    } else {
                        return false;
                    }
                }

            } catch (Exception) {
                return false;
            }
        }

        /// <summary>
        /// Makes Post request to Auth server to validate and Get user related information
        /// </summary>
        /// <param name="token"></param>
        /// <returns></returns>
        static LoginInfo ValidateUser(string param) {
            LoginInfo loginInfo = new LoginInfo();
            try {
                Token token = JsonConvert.DeserializeObject<Token>(AQ.Security.Cryptography.EncryptionHelper.Decryptdata(param));
                UserDetails userdetails = _login.GetUserDetails(Convert.ToInt32(token.value));
                loginInfo.IsAuthenticated = true;
                loginInfo.UserInfo = userdetails;
            } catch (Exception ex) {
                //Logger
            }
            return loginInfo;
        }
        [UserAuthenticationFilter]
        [HttpPost]
        public void TrackAPIResp(string key, string value) {
            AQ.Logger.TrackEvent(key, value);
        }
    }
}