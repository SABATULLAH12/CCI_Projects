using Entities;
using System;
using System.Collections.Generic;
using System.Configuration;
using System.Net.Mail;
using System.Text;

namespace PushEmail
{
    public class Email
    {
        /// <summary>
        /// send Mail
        /// </summary>
        /// <param name="MailId">Recepient mail id's</param>
        /// <param name="subject">Subject of Mail</param>
        /// <param name="Message">Body of Mail</param>
        /// <param name="priority">High Or Normal Priority</param>
        /// <param name="CCSupport">CC to EmailNotification Team?</param>
        /// <returns></returns>
        /// 
        
                
        public static bool SendMail(List<string> MailId, string subject, AlternateView alternateView, MailPriority priority, bool CCSupport)
        {
            try
            {
                MailMessage mail = new MailMessage();
                SmtpClient SmtpServer = new SmtpClient(ConfigurationManager.AppSettings["SMTP_SERVER"].ToString());
                mail.From = new MailAddress(ConfigurationManager.AppSettings["FROMID"].ToString());
                foreach (var x in MailId)
                {
                    mail.To.Add(x);
                }
                if (CCSupport)
                {
                    mail.CC.Add("rahul.kumar@aqinsights.com");
                }
                mail.Subject = subject;
                mail.AlternateViews.Add(alternateView);
                mail.Priority = priority;
                mail.IsBodyHtml = true;
                SmtpServer.Port = int.Parse(ConfigurationManager.AppSettings["PORT"]);
                SmtpServer.Credentials = new System.Net.NetworkCredential(ConfigurationManager.AppSettings["FROMID"].ToString(),
                    ConfigurationManager.AppSettings["EMAILPASSWORD"].ToString());
                SmtpServer.EnableSsl = true;
                SmtpServer.Send(mail);
                return true;
            }
            catch (Exception ex)
            {
                Log.LogException(ex);
                return false;
            }
        }
    }
}
