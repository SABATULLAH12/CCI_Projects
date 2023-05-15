using System;
using AQLogger;

namespace Entities
{
    public class Log
    {
        public static void LogMDXquery(string queryName, string query)
        {
            Logger.GetInstance().Debug(queryName + " '" + query + "'");
        }
        public static void LogProc(string procName, object[] param)
        {
            var p = string.Join("','", param);
            Logger.GetInstance().Debug(procName + " '" + p + "'");
        }

        public static void LogMessage(string messageText)
        {
            Logger.GetInstance().Debug(messageText);
        }

        public static void LogException(Exception ex)
        {
            Logger.GetInstance().Error(ex);
        }
    }
}
