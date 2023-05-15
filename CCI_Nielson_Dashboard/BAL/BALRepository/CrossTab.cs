using DAL;
using Entities;
using System;
using System.Collections.Generic;
using System.Data;
using System.Linq;

namespace BAL
{
    public class CrossTab : ICrossTab
    {
        internal readonly IUnitOfWork _unitOfWork;

        public CrossTab(IUnitOfWork unitOfWork)
        {
            _unitOfWork = unitOfWork;
        }

        public IList<CrossTabOutput> GetOutput(CrossTabRequest crossTabRequest, FilterData filterData)
        {
            IList<CrossTabOutput>output =  new List<CrossTabOutput>();
            DataTable dt = _unitOfWork.GetRepository<ICrossTabRepository>().CrossTabData(crossTabRequest, filterData);
            CrossTabFilterEntity column = crossTabRequest.crossTabFilterEntityList[0];
            CrossTabFilterEntity row = crossTabRequest.crossTabFilterEntityList[1];
            CrossTabFilterEntity kpi = crossTabRequest.crossTabFilterEntityList[3];
            if (((row.Selection[0].Name.ToLower() == "product" && row.Selection[0].Selection[0].Name.ToLower() == "pack")
                || (column.Selection[0].Name.ToLower() == "product" && column.Selection[0].Selection[0].Name.ToLower() == "pack"))
                && (row.Selection[0].Name.ToLower() == "kpi" || column.Selection[0].Name.ToLower() == "kpi"))
            {
                foreach (DataRow dr in dt.Rows)
                {
                    int index = 1;
                    foreach (Selections sel in kpi.Selection)
                    {
                        CrossTabOutput item = new CrossTabOutput();
                        Selections entity = null;
                        item.column = (column.Selection[0].Name.ToLower() == "product" && column.Selection[0].Selection[0].Name.ToLower() == "pack") ? dr[1].ToString() + " - " + dr[0].ToString() : (column.Selection[0].Name.ToLower() == "kpi" ? sel.Name : dr[0].ToString());
                        item.row = (row.Selection[0].Name.ToLower() == "product" && row.Selection[0].Selection[0].Name.ToLower() == "pack") ? dr[1].ToString() + " - " + dr[0].ToString() : (row.Selection[0].Name.ToLower() == "kpi" ? sel.Name : dr[0].ToString());
                        item.valueNumber = dr[++index] == DBNull.Value ? null : stringToDouble(dr[index].ToString());
                        item.changeNumber = dr[++index] == DBNull.Value ? null : stringToDouble(dr[index].ToString());
                        if (row.Selection[0].Name.ToLower() == "product" && column.Selection[0].Name.ToLower() == "product")
                        {
                            entity = crossTabRequest.crossTabFilterEntityList[4].Selection.AsEnumerable().FirstOrDefault(x => x.Name.ToLower() == "pack" && x.Selection[0].Name == ((row.Selection[0].Name.ToLower() == "product" && row.Selection[0].Selection[0].Name.ToLower() == "pack") ? item.row : item.column));
                        }
                        else
                        {
                            entity = crossTabRequest.crossTabFilterEntityList[4].Selection.AsEnumerable().FirstOrDefault(x => x.Name == ((row.Selection[0].Name.ToLower() == "product" && row.Selection[0].Selection[0].Name.ToLower() == "pack") ? item.row : item.column));
                        }
                        if (entity != null)
                        {
                            output.Add(item);
                        }
                    }
                }
            }
            else if (row.Selection[0].Name.ToLower() == "kpi" || column.Selection[0].Name.ToLower() == "kpi")
            {
                foreach (DataRow dr in dt.Rows)
                {
                    int index = 0;
                    foreach (Selections sel in kpi.Selection)
                    {
                        CrossTabOutput item = new CrossTabOutput();
                        item.column = column.Selection[0].Name.ToLower() == "kpi"? sel.Name: dr[0].ToString();
                        item.row = row.Selection[0].Name.ToLower() == "kpi"? sel.Name : dr[0].ToString();
                        item.valueNumber = dr[++index] == DBNull.Value ? null : stringToDouble(dr[index].ToString());
                        item.changeNumber = dr[++index] == DBNull.Value ? null : stringToDouble(dr[index].ToString());
                        output.Add(item);
                    }
                }
            }
            else if ((row.Selection[0].Name.ToLower() == "product" && row.Selection[0].Selection[0].Name.ToLower() == "pack") || (column.Selection[0].Name.ToLower() == "product" && column.Selection[0].Selection[0].Name.ToLower() == "pack"))
            {
                foreach (DataRow dr in dt.Rows)
                {
                    CrossTabOutput item = new CrossTabOutput();
                    Selections entity = null;
                    item.column = (column.Selection[0].Name.ToLower() == "product" && column.Selection[0].Selection[0].Name.ToLower() == "pack") ? dr[2].ToString() + " - " + dr[0].ToString() : dr[0].ToString();
                    item.row = (row.Selection[0].Name.ToLower() == "product" && row.Selection[0].Selection[0].Name.ToLower() == "pack") ? dr[2].ToString()+ " - " + dr[1].ToString(): dr[1].ToString();
                    item.valueNumber = dr[3] == DBNull.Value ? null : stringToDouble(dr[3].ToString());
                    item.changeNumber = dr[4] == DBNull.Value ? null : stringToDouble(dr[4].ToString());
                    if (row.Selection[0].Name.ToLower() == "product" && column.Selection[0].Name.ToLower() == "product")
                    {
                        entity = crossTabRequest.crossTabFilterEntityList[4].Selection.AsEnumerable().FirstOrDefault(x => x.Name.ToLower() == "pack" && x.Selection[0].Name == ((row.Selection[0].Name.ToLower() == "product" && row.Selection[0].Selection[0].Name.ToLower() == "pack") ? item.row : item.column));
                    }
                    else
                    {
                        entity = crossTabRequest.crossTabFilterEntityList[4].Selection.AsEnumerable().FirstOrDefault(x => x.Name == ((row.Selection[0].Name.ToLower() == "product" && row.Selection[0].Selection[0].Name.ToLower() == "pack") ? item.row : item.column));
                    }
                    if (entity != null)
                    {
                        output.Add(item);
                    }
                }
            }
            else
            {
                foreach (DataRow dr in dt.Rows)
                {
                    CrossTabOutput item = new CrossTabOutput();
                    item.column = dr[0].ToString();
                    item.row = dr[1].ToString();
                    item.valueNumber = dr[2] == DBNull.Value ? null : stringToDouble(dr[2].ToString());
                    item.changeNumber = dr[3] == DBNull.Value ? null : stringToDouble(dr[3].ToString());
                    output.Add(item);
                }
            }
            if(row.Selection[0].Name.ToLower() == "timeperiod")
            {
                foreach(CrossTabOutput item in output)
                {
                    item.row = FormatTimePeriod(row.Selection[0].Selection[0].Name, item.row);
                }
            }
            else if(column.Selection[0].Name.ToLower() == "timeperiod")
            {
                foreach (CrossTabOutput item in output)
                {
                    item.column = FormatTimePeriod(column.Selection[0].Selection[0].Name, item.column);
                }
            }
            return output;
        }

        private string FormatTimePeriod(string timePeriodType,string value)
        {
            string result = "";
            string year = value.Substring(0, 4);
            if (timePeriodType.ToLower() == "ytd")
            {
                switch (value.Substring(4, 2))
                {
                    case "01": result = year + " - Jan"; break;
                    case "02": result = year + " - Feb"; break;
                    case "03": result = year + " - Mar"; break;
                    case "04": result = year + " - Apr"; break;
                    case "05": result = year + " - May"; break;
                    case "06": result = year + " - Jun"; break;
                    case "07": result = year + " - Jul"; break;
                    case "08": result = year + " - Aug"; break;
                    case "09": result = year + " - Sep"; break;
                    case "10": result = year + " - Oct"; break;
                    case "11": result = year + " - Nov"; break;
                    case "12": result = year + " - Dec"; break;
                }
            }
            else if (timePeriodType.ToLower() == "qtd")
            {
                switch (value.Substring(4, 2))
                {

                    case "01": result = year + " - Q1"; break;
                    case "02": result = year + " - Q2"; break;
                    case "03": result = year + " - Q3"; break;
                    case "04": result = year + " - Q4"; break;
                }
            }
            return result;
        }

        public double? stringToDouble(string inputText)
        {
            double outputValue = 0.0;
            if (!double.TryParse(inputText, out outputValue)) outputValue = 0.0;
            return outputValue;
        }
    }
}
