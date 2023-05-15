using PushEmail;
using System.Timers;
using Entities;
using System.Collections.Generic;
using DAL;
using System.Data;
using System;
using System.Linq;
using System.Net.Mail;
using System.Windows.Forms.DataVisualization.Charting;
using System.Drawing;
using System.Net.Mime;
using System.IO;

namespace CCI_KH_DSR
{
    public class MailSchduler
    {
        public void Thread()
        {
            System.Timers.Timer timer = new System.Timers.Timer();
            double interval = 60000;
            timer.Interval = interval;
            timer.AutoReset = true;
            timer.Elapsed += new ElapsedEventHandler(WriteLogEntry);
            timer.Start();

        }
        private double? stringToDouble(string inputText)
        {
            double outputValue = 0.0;
            if (!double.TryParse(inputText, out outputValue)) outputValue = 0.0;
            return outputValue;
        }

        private string GenerateChartImage(IList<GainerLooserList> data, IList<GainerLooserList> data2)
        {
            Chart chart = new Chart();
            chart.Width = 1000;
            chart.Height = 700;

            ChartArea CA2 = chart.ChartAreas.Add("ChartName2");
            ChartArea CA = chart.ChartAreas.Add("ChartName");
            CA.AxisX.MajorGrid.LineDashStyle = ChartDashStyle.DashDotDot;
            CA.AxisY.MajorGrid.LineDashStyle = ChartDashStyle.Dash;
            CA.AxisX.MajorTickMark.Enabled = false;
            CA.AxisY.MajorTickMark.Enabled = false;
            CA.AxisX.MinorGrid.Enabled = false; 
            CA.AxisX.Title = "Brands";
            CA.AxisY.Title = "Change";

            Series s =  chart.Series.Add("S1");
            s.ChartType = SeriesChartType.Bar;
            s.Color = Color.Red;
            s["PixelPointWidth"] = "10";
            s.ChartArea = "ChartName";
            for (int i = 0; i < data.Count; i++)
            {
                s.Points.AddXY(data[i].Name, data[i].Value);
            }

            CA.AxisX.MajorGrid.LineWidth = 0;
            CA.AxisY.MajorGrid.LineWidth = 0;
            CA.AxisX.TitleAlignment = StringAlignment.Center;
            CA.AxisX.Enabled = AxisEnabled.True;

           
            CA2.AxisX.MajorGrid.LineDashStyle = ChartDashStyle.DashDotDot;
            CA2.AxisY.MajorGrid.LineDashStyle = ChartDashStyle.Dash;
            CA2.AxisX.MajorTickMark.Enabled = false;
            CA2.AxisY.MajorTickMark.Enabled = false;
            CA2.AxisX.MinorGrid.Enabled = false;
            CA2.AxisX.Title = "Brands";
            CA2.AxisY.Title = "Change";

            Series s2 = chart.Series.Add("S2");
            s2.ChartType = SeriesChartType.Bar;
            s2.Color = Color.Red;
            s2["PixelPointWidth"] = "10";
            s2.ChartArea = "ChartName2";
            for (int i = 0; i < data2.Count; i++)
            {
                s2.Points.AddXY(data2[i].Name, data2[i].Value);
            }

            CA2.AxisX.MajorGrid.LineWidth = 0;
            CA2.AxisY.MajorGrid.LineWidth = 0;
            CA2.AxisX.TitleAlignment = StringAlignment.Center;

            

            //It is used to set 0 reference line
            StripLine stripline = new StripLine();
            stripline.Interval = 0;
            stripline.IntervalOffset = 0;
            stripline.StripWidth = 0.1;
            stripline.BackColor = Color.Black;
            //CA.AxisY.StripLines.Add(stripline);
            CA2.AxisY.StripLines.Add(stripline);


            /* Set chart color and other settings as required */
            chart.BackColor = Color.Transparent;
            chart.ChartAreas[0].BackColor = chart.BackColor;

            /*Assign AntiAliasing to Graphics style for smooth edges*/
            chart.AntiAliasing = AntiAliasingStyles.Graphics;

            /* Set the image path and save the image as PNG format*/
            string tempath = Path.GetTempPath();
            string imageNameAndPath = string.Concat(tempath,"\\Temp","\\Image", DateTime.Now.ToString("ddMMyyyyhhmmss") + ".png");
            if (!System.IO.Directory.Exists(string.Concat(tempath, "\\Temp")))
            {
                System.IO.Directory.CreateDirectory(string.Concat(tempath, "\\Temp"));
            }
            DirectoryInfo di = new DirectoryInfo(string.Concat(tempath, "\\Temp"));
            foreach (FileInfo file in di.GetFiles())
            {
                file.Delete();
            }
            chart.SaveImage(imageNameAndPath, ChartImageFormat.Png);
            return imageNameAndPath;
        }

        private AlternateView GetMailEmbedded(IList<GainerLooserList> list)
        {
            IList<GainerLooserList> gainer= new List<GainerLooserList>();
            IList<GainerLooserList> looser = new List<GainerLooserList>();
            for (var i = 0; i < 10; i++)
            {
                GainerLooserList item = new GainerLooserList();
                item = list[i];
                if (item.Value < 0)
                    looser.Add(item);
            }
            for (var i = list.Count - 1; i > list.Count - 10 && i > -1; i--)
            {
                GainerLooserList item = new GainerLooserList();
                item = list[i];
                if (item.Value > 0)
                    gainer.Add(item);
            }
            string imagePath = GenerateChartImage(looser,gainer);
            LinkedResource res = new LinkedResource(imagePath);
            res.ContentId = Guid.NewGuid().ToString();
            string htmlBody = @"<html><body><h1>Top10</h1><img src='cid:" + res.ContentId + @"'/></body></html>";
            AlternateView alternateView = AlternateView.CreateAlternateViewFromString(htmlBody, null, MediaTypeNames.Text.Html);
            alternateView.LinkedResources.Add(res);
            return alternateView;
        }
        private void WriteLogEntry(object sender, ElapsedEventArgs e)
        {
            try
            {
                int hour = System.DateTime.Now.Hour;
                int minute = System.DateTime.Now.Minute;
                if (hour == 10 && minute == 0)
                {
                    DataTable dt = DataAccess.GetQueryOutput(MDXQueries.GetMailQuery);
                    IList<GainerLooserList> list = new List<GainerLooserList>();
                    foreach (DataRow dr in dt.Rows)
                    {
                        GainerLooserList item = new GainerLooserList();
                        item.Name = dr[0].ToString()+ " - " +dr[1].ToString();
                        item.Value = stringToDouble(dr[2].ToString());
                        list.Add(item);
                    }
                    list = list.OrderBy(p => p.Value).ToList();
                    AlternateView alternateView = GetMailEmbedded(list);
                    List<string> recepeint = new List<string>();
                    recepeint.Add("anoop.m@aqinsights.com");
                    recepeint.Add("srinidhi.gk@aqinsights.com");
                    if (Email.SendMail(recepeint, "testing", alternateView, System.Net.Mail.MailPriority.High, true))
                    {
                        Log.LogMessage("Mail sent at : " + e.SignalTime);
                    }
                    else
                    {
                        Log.LogMessage("Mail failed at : " + e.SignalTime);
                    }
                }
            }
            catch(Exception ex)
            {
                Log.LogException(ex);
            }
        }

    }
}