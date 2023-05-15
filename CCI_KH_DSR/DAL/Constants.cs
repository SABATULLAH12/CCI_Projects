namespace DAL
{
    public class Constants
    {

        #region SP Names

        public static string Getuserdetails = "[dbo].[USP_GetUserDetails]";
        #endregion

        #region DB Parameters

        #endregion

        #region Other Constants

        public static int Command_Timeout = 300;
        public static string PPT_Text = "ppt";
        public static string Excel_Text = "excel";

        public static string Top10ExcelTemplate = "~/ExportTemplates/Top10/Top10Template.xlsx";

        public static string Top10DownloadPath = "~/Temp/Top10/";

        public static string[] kv1timeperiod = new string[] { "YTD", "QTD", "MTD", "WTD", "Daily" };
        #endregion

    }
}
