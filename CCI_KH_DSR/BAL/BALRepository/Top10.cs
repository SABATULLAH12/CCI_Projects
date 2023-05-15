using DAL;
using Entities;
using OfficeOpenXml;
using System;
using System.Collections.Generic;
using System.Data;
using System.IO;
using System.Linq;
using System.Web;

namespace BAL
{
    public class Top10:ITop10
    {
        internal readonly IUnitOfWork _unitOfWork;

        public Top10(IUnitOfWork unitOfWork)
        {
            _unitOfWork = unitOfWork;
        }
        public IList<GainerLooserList> GetPieChartOutput(Top10Request request,FilterDataWithMapping mapping)
        {
            IList<GainerLooserList> list = new List<GainerLooserList>();
            DataTable dt = _unitOfWork.GetRepository<ITop10Repository>().GetchartOuput(request,mapping);
            foreach(DataRow dr in dt.Rows)
            {
                int column = 0;
                GainerLooserList item = new GainerLooserList();
                item.Name = (request.Module[7].Selection[0].Name == "all bus" || request.Module[7].Selection[0].Parent != null)?dr[++column].ToString():item.Name = dr[column].ToString();
                column++;
                item.Name = string.Concat(item.Name," - ", dr[column++].ToString());
                item.Name = string.Concat(item.Name, (request.Module[6].Selection[0].Name == "all")? "": " - " + dr[column++].ToString());
                item.Value = stringToDouble(dr[column].ToString());
                list.Add(item);
            }
            return list.OrderBy(p => p.Value).ToList();
        }

        public double? stringToDouble(string inputText)
        {
            double outputValue = 0.0;
            if (!double.TryParse(inputText, out outputValue)) outputValue = 0.0;
            return outputValue;
        }
        private string GetTemplatePath(Top10Request request)
        {
            string tempPath = string.Empty;

            if (request.ExportsType == Constants.PPT_Text)
            {
                //tempPath = Constants.top10ppt;
            }

            else if (request.ExportsType == Constants.Excel_Text)
            {
                 tempPath = Constants.Top10ExcelTemplate;
            }
            return tempPath;
        }
        private IList<GainerLooserList> GetDataForExports(Top10Request request, FilterDataWithMapping mapping)
        {
            return GetPieChartOutput(request, mapping);
        }
        public StringResponse ExportPPTExcel(Top10Request request, FilterDataWithMapping mapping)
        {
            StringResponse resp = new StringResponse();
            resp.value = string.Empty;
            try
            {
                var templatePath = GetTemplatePath(request);
                if (request.ExportsType.ToLower().Equals(Constants.PPT_Text))
                {
                    //please code for ppt here//
                }
                else if (request.ExportsType.ToLower().Equals(Constants.Excel_Text))
                {
                    var response = GetDataForExports(request, mapping);
                    resp.value = GenerateTop10Excel(request, mapping, response, templatePath);
                }

            }
            catch (Exception ex)
            {
                Log.LogException(ex);
                resp.Error = ex.Message;
            }
            return resp;
        }


        public string GenerateTop10Excel(Top10Request request, FilterDataWithMapping mapping, IList<GainerLooserList> response, string templatePath)
        {
            string tempFolderName = CommonFunctions.GenerateRandomString(15);
            string tempFileName = "KnowledgeHub_DSR_(" + System.DateTime.Now.ToString("MM-dd-yyyy") + "_" + System.DateTime.Now.ToString("HH-mm-ss") + ").xlsx";
            templatePath = HttpContext.Current.Server.MapPath(templatePath);
            if (Directory.Exists(System.Web.HttpContext.Current.Server.MapPath(Constants.Top10DownloadPath + tempFolderName)))
                Directory.Delete(System.Web.HttpContext.Current.Server.MapPath(Constants.Top10DownloadPath + tempFolderName), true);
            Directory.CreateDirectory(System.Web.HttpContext.Current.Server.MapPath(Constants.Top10DownloadPath + tempFolderName));
            string tempFilePath = System.Web.HttpContext.Current.Server.MapPath(Constants.Top10DownloadPath + tempFolderName + "/" + tempFileName);

            File.Copy(templatePath, tempFilePath);
            var file = new FileInfo(tempFilePath);

            int _row = 0, _col = 0; int _footerRow = 0;
            using (ExcelPackage package = new ExcelPackage(file))
            {
                      ExcelWorksheet ws1 = package.Workbook.Worksheets[1];
                      var ExcelSheetName = "Top 10 Data";
                      ws1.Name = ExcelSheetName;
                      ws1.Name = ws1.Name.Trim();

                #region Selection Summary
                _row = 2;
                _col = 1;
                //var r1;
                //for (int j = 0; j < selectionNames.Length; j++)
                //{
                //    r1 = ws1.Cells[_row, _col];
                //    r1.RichText.Clear();
                //    r1.RichText.Add(selectionNames[j]).Color = Color.FromArgb(79, 33, 112);
                //    r1.Style.Font.Bold = true;
                //    _row = _row + 1;
                //}
                
                #endregion
                ws1.Cells.AutoFitColumns();
                package.Save();
            }
            return (Constants.Top10DownloadPath.Replace("~", "..") + tempFolderName + "/" + tempFileName);
        }
    }
}
