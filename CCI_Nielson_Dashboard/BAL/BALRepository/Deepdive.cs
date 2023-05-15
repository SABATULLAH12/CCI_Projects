using System;
using DAL;
using Entities;
using System.Data;
using System.Collections.Generic;
using System.Linq;

namespace BAL
{
    public class Deepdive : IDeepdive
    {
        internal readonly IUnitOfWork _unitOfWork;

        public Deepdive(IUnitOfWork unitOfWork)
        {
            _unitOfWork = unitOfWork;
        }


        public DeepdiveOrgOutput GetOutput(DeepdiveInput deepdiveInput, FilterData filterData)
        {
            getColumnName(deepdiveInput, filterData);
            DataSet dsOrgData = _unitOfWork.GetRepository<IDeepdiveRepository>().GetOutput(deepdiveInput);

            return fillOrgChart(dsOrgData, deepdiveInput);
        }

        private DeepdiveOrgOutput fillOrgChart(DataSet dsOrgData,DeepdiveInput deepdiveInput)
        {
            if (dsOrgData.Tables[0].Rows.Count < 1)
                return null;
            DeepdiveOrgOutput OrgChart = new DeepdiveOrgOutput();
            OrgOutputeach orgEachNode = new OrgOutputeach();
            orgEachNode.id = "1";
            orgEachNode.name = $"{ Convert.ToString(dsOrgData.Tables[0].Rows[0][1])}";//-{Convert.ToString(dsOrgData.Tables[0].Rows[0][0])}
            orgEachNode.Dvalue = Convert.ToString(dsOrgData.Tables[0].Rows[0][3]);
            orgEachNode.tooltip = getDecimalornull(dsOrgData.Tables[0].Rows[0][2]);
            orgEachNode.parent = "0";
            OrgChart.DeepdiveOrgOutputData.Add(orgEachNode);
            if (dsOrgData.Tables[1].Rows.Count < 1)
                return OrgChart;
            MergeMTData_2and3rd(dsOrgData, deepdiveInput.isMTQry);
            int id = 2;
            bool isMTQrythr = dsOrgData.Tables[1].Columns.Contains("isMTQry");
            foreach (DataRow drENod in dsOrgData.Tables[1].Rows)
            {
                if (Convert.ToString(drENod[2]) != "" && drENod[2] != DBNull.Value)
                {
                    orgEachNode = new OrgOutputeach();
                    orgEachNode.id = (id++).ToString();
                    orgEachNode.name = Convert.ToString(drENod[0]);
                    orgEachNode.Dvalue = Convert.ToString(drENod[2]);
                    orgEachNode.tooltip = getDecimalornull(drENod[1]);
                    orgEachNode.parent = "1";
                    if (isMTQrythr)
                        orgEachNode.isMTQry = ((drENod[3] == null) || (drENod[3] == DBNull.Value) || Convert.ToBoolean(drENod[3]));
                    OrgChart.DeepdiveOrgOutputData.Add(orgEachNode);
                }
            }
            int colmnumber = 2;
            if (OrgChart.DeepdiveOrgOutputData.Count > 1)
            {
                foreach (OrgOutputeach item in OrgChart.DeepdiveOrgOutputData.OrderByDescending(x => x.tooltip).ToList())
                {
                    if (item.parent == "0")
                        item.id = "1";
                    else
                        item.id = colmnumber.ToString();
                    colmnumber++;
                }
            }

            return OrgChart;

        }

        private void MergeMTData_2and3rd(DataSet dsOrgData,int isParentisMT)
        {
            if (dsOrgData.Tables.Count > 2 && dsOrgData.Tables[2].Rows.Count>0)
            {
                //identify MT Data
                dsOrgData.Tables[1].Columns.Add("isMTQry", typeof(bool));
                dsOrgData.Tables[1].Columns["isMTQry"].DefaultValue = false;
                foreach(DataRow drMT in dsOrgData.Tables[2].Rows)
                {
                    DataRow dr = dsOrgData.Tables[1].NewRow();
                    int echcl = 0;
                    foreach(dynamic eachcol in drMT.ItemArray)
                    {
                        dr[echcl++] = eachcol;
                    }
                    dsOrgData.Tables[1].Rows.Add(dr);
                }
                //if (checkColumnType(dsOrgData))
                //    dsOrgData.Tables[1].Merge(dsOrgData.Tables[2]);
                //else
                //    MergeDifferentDataType(dsOrgData);
            }else if(isParentisMT == 1)
            {
                dsOrgData.Tables[1].Columns.Add("isMTQry", typeof(bool));
                dsOrgData.Tables[1].Columns["isMTQry"].DefaultValue = true;
            }
        }

     
        private bool checkColumnType(DataSet dsOrgData)
        {
            if (dsOrgData.Tables[1].Rows.Count > 0 && dsOrgData.Tables[2].Rows.Count > 0)
            {
            }
            else if (dsOrgData.Tables[1].Rows.Count == 0)
            {
            }
            else if (dsOrgData.Tables[2].Rows.Count > 0)
            {

            }
                //foreach (DataColumn dtCol in dsOrgData.Tables[1].Columns)
                //{
                //    string colname = Convert.ToString(dsOrgData.Tables[1].Rows[eachrow]);
                //    if (dsOrgData.Tables[1].Rows[1].GetType() != dsOrgData.Tables[2].Rows[colname].GetType())
                //        return false;
                //    eachrow++;
                //}
            
            return true;
        }

        private static double? getDecimalornull(dynamic value)
        {
            if (Convert.ToString(value) != "")
                return Convert.ToDouble(value);
            return null;
        }

        private void getColumnName(DeepdiveInput deepdiveInput, FilterData filterData)
        {
            if (deepdiveInput.Timpeperiod != null)
                deepdiveInput.Timpeperiod.ColumnName = filterData.deepdiveFilterMapping.timeperiodMapping.Where(x => x.Level1Name.ToLower() == deepdiveInput.Timpeperiod.Name.ToLower() && x.Level2Name.ToLower() == deepdiveInput.Timpeperiod.Value.ToLower()).Select(y => y.CubeColumnName).FirstOrDefault();
            if (deepdiveInput.Company != null)
                deepdiveInput.Company.ColumnName = filterData.deepdiveFilterMapping.companyMapping.Where(x => x.Level1Name.ToLower() == deepdiveInput.Company.Name.ToLower()).Select(y => y.CubeColumnName).FirstOrDefault();
            if (deepdiveInput.Category != null)
                deepdiveInput.Category.ColumnName = filterData.deepdiveFilterMapping.categoryMapping.Where(x => x.Level1Name.ToLower() == deepdiveInput.Category.Name.ToLower()).Select(y => y.CubeColumnName).FirstOrDefault();
            if (deepdiveInput.Measure != null)
                deepdiveInput.Measure.ColumnName = $"{ filterData.deepdiveFilterMapping.measureMapping.Where(x => x.Level1Name.ToLower() == deepdiveInput.Measure.Name.ToLower() && x.Level2Name.ToLower() == deepdiveInput.Timpeperiod.Value.ToLower()).Select(y => y.ChangeCubeColumnName).FirstOrDefault()}";//,{filterData.deepdiveFilterMapping.measureMapping.Where(x => x.Level1Name.ToLower() == deepdiveInput.Measure.Name.ToLower() && x.Level2Name.ToLower() == deepdiveInput.Timpeperiod.Value.ToLower()).Select(y => y.ValueCubeColumnName).First()}
            if (deepdiveInput.RegPopChnl.parent == false)
            {
                if (deepdiveInput.Region != null)
                {
                    deepdiveInput.Region.ColumnName = string.Join(",", filterData.deepdiveFilterMapping.regionMapping.Where(x => (x.QueryId != "3") && (x.Name.ToLower() == deepdiveInput.Region.Value.ToLower() && x.ParentId == deepdiveInput.Region.Id)).Select(y => y.ColumnName).ToList<string>()); ////&& x.Id == Convert.ToInt32(deepdiveInput.Region.Id.ToLower())
                    deepdiveInput.Region.ColumnNameMT = string.Join(",", filterData.deepdiveFilterMapping.regionMapping.Where(x => (x.QueryId == "3") && (x.Name.ToLower() == deepdiveInput.Region.Value.ToLower() && x.ParentId == deepdiveInput.Region.Id)).Select(y => y.ColumnName).ToList<string>());
                }
                if (deepdiveInput.Pop != null)
                {
                    deepdiveInput.Pop.ColumnName = string.Join(",", filterData.deepdiveFilterMapping.popMapping.Where(x => (x.QueryId != "3") && x.Name.ToLower() == deepdiveInput.Pop.Value.ToLower() && x.ParentId == deepdiveInput.Pop.Id).Select(y => y.ColumnName).ToList<string>()); //
                    deepdiveInput.Pop.ColumnNameMT = string.Join(",", filterData.deepdiveFilterMapping.popMapping.Where(x => (x.QueryId == "3") && x.Name.ToLower() == deepdiveInput.Pop.Value.ToLower() && x.ParentId == deepdiveInput.Pop.Id).Select(y => y.ColumnName).ToList<string>()); //
                }
                if (deepdiveInput.Channel != null)
                {
                    deepdiveInput.Channel.ColumnName = string.Join(",", filterData.deepdiveFilterMapping.channelMapping.Where(x => (x.QueryId != "3") && x.Name.ToLower() == deepdiveInput.Channel.Value.ToLower() && x.ParentId == deepdiveInput.Channel.Id).Select(y => y.ColumnName).ToList<string>()); //
                    deepdiveInput.Channel.ColumnNameMT = string.Join(",", filterData.deepdiveFilterMapping.channelMapping.Where(x => (x.QueryId == "3") && x.Name.ToLower() == deepdiveInput.Channel.Value.ToLower() && x.ParentId == deepdiveInput.Channel.Id).Select(y => y.ColumnName).ToList<string>()); //
                }
            }
            else
            {
                if (deepdiveInput.Region != null)
                {
                    deepdiveInput.Region.ColumnName = string.Join(",", filterData.deepdiveFilterMapping.regionMapping.Where(x =>(x.QueryId!="3")&&(x.ParentId == deepdiveInput.Region.Id)).Select(y => y.ColumnName).ToList<string>()); //&& x.Id == Convert.ToInt32(deepdiveInput.Region.Id.ToLower())
                    deepdiveInput.Region.ColumnNameMT = string.Join(",", filterData.deepdiveFilterMapping.regionMapping.Where(x => (x.QueryId == "3")&&(x.ParentId == deepdiveInput.Region.Id)).Select(y => y.ColumnName).ToList<string>()); 
                }
                if (deepdiveInput.Pop != null)
                {
                    deepdiveInput.Pop.ColumnName = string.Join(",", filterData.deepdiveFilterMapping.popMapping.Where(x => (x.QueryId != "3") && x.ParentId == deepdiveInput.Pop.Id).Select(y => y.ColumnName).ToList<string>());
                    deepdiveInput.Pop.ColumnNameMT = string.Join(",", filterData.deepdiveFilterMapping.popMapping.Where(x => (x.QueryId == "3") && x.ParentId == deepdiveInput.Pop.Id).Select(y => y.ColumnName).ToList<string>());
                }
                if (deepdiveInput.Channel != null)
                {
                    deepdiveInput.Channel.ColumnName = string.Join(",", filterData.deepdiveFilterMapping.channelMapping.Where(x => (x.QueryId != "3") && x.ParentId == deepdiveInput.Channel.Id).Select(y => y.ColumnName).ToList<string>());
                    deepdiveInput.Channel.ColumnNameMT = string.Join(",", filterData.deepdiveFilterMapping.channelMapping.Where(x => (x.QueryId == "3") && x.ParentId == deepdiveInput.Channel.Id).Select(y => y.ColumnName).ToList<string>());
                }
            }


            switch (deepdiveInput.RegPopChnl.selectedFName.ToUpper())
            {
                case "R":
                    deepdiveInput.RegPopChnl.ParentOf_PopUp = filterData.deepdiveFilterMapping.regionMapping.Where(x => (x.SubName.ToLower() == deepdiveInput.RegPopChnl.ParentOf_PopUp.ToLower())).Select(y => y.ColumnName).FirstOrDefault();
                    deepdiveInput.Region.RootRowName = filterData.deepdiveFilterMapping.RootMapping.Where(x => x.Name == deepdiveInput.Region.Value && x.SubName.ToUpper() == "REGION").Select(y => y.ColumnName).FirstOrDefault();
                    if (deepdiveInput.PopUp.Id != 0)
                    {
                        if (deepdiveInput.PopUp.Id != 0 && deepdiveInput.PopUp.Name == null)
                        {
                            deepdiveInput.PopUp.RootRowName = getPopupWhereFilterColumn(deepdiveInput.PopUp.Id, ".CHILDREN");
                            deepdiveInput.Region.RootRowName = deepdiveInput.RegPopChnl.ParentOf_PopUp;
                        }
                        else
                        {
                            deepdiveInput.PopUp.RootRowName = filterData.deepdiveFilterMapping.regionMapping.Where(x => (x.SubName.ToLower() == deepdiveInput.PopUp.Name.ToLower())).Select(y => y.ColumnName).FirstOrDefault();
                            deepdiveInput.Region.RootRowName = deepdiveInput.PopUp.RootRowName;
                        }
                    }
                    break;
                case "P":
                    deepdiveInput.RegPopChnl.ParentOf_PopUp = filterData.deepdiveFilterMapping.popMapping.Where(x => (x.SubName.ToLower() == deepdiveInput.RegPopChnl.ParentOf_PopUp.ToLower())).Select(y => y.ColumnName).FirstOrDefault();
                    deepdiveInput.Pop.RootRowName = filterData.deepdiveFilterMapping.RootMapping.Where(x => x.Name == deepdiveInput.Pop.Value && x.SubName.ToUpper() == "POP").Select(y => y.ColumnName).FirstOrDefault();
                    if (deepdiveInput.PopUp.Id != 0)
                    {
                        if (deepdiveInput.PopUp.Id != 0 && deepdiveInput.PopUp.Name == null)
                        {
                            deepdiveInput.PopUp.RootRowName = getPopupWhereFilterColumn(deepdiveInput.PopUp.Id, ".CHILDREN");
                            deepdiveInput.Pop.RootRowName = deepdiveInput.RegPopChnl.ParentOf_PopUp;
                        }
                        else
                        {
                            deepdiveInput.PopUp.RootRowName = filterData.deepdiveFilterMapping.popMapping.Where(x => (x.SubName.ToLower() == deepdiveInput.PopUp.Name.ToLower())).Select(y => y.ColumnName).FirstOrDefault();
                            deepdiveInput.Pop.RootRowName = deepdiveInput.PopUp.RootRowName;
                        }
                    }
                    break;
                case "C":
                    deepdiveInput.RegPopChnl.ParentOf_PopUp = filterData.deepdiveFilterMapping.channelMapping.Where(x => (x.SubName.ToLower() == deepdiveInput.RegPopChnl.ParentOf_PopUp.ToLower())).Select(y => y.ColumnName).FirstOrDefault();
                    deepdiveInput.Channel.RootRowName = filterData.deepdiveFilterMapping.RootMapping.Where(x => x.Name == deepdiveInput.Channel.Value && x.SubName.ToUpper() == "CHANNEL").Select(y => y.ColumnName).FirstOrDefault();
                    if (deepdiveInput.PopUp.Id != 0)
                    {
                        if (deepdiveInput.PopUp.Id != 0 && deepdiveInput.PopUp.Name == null)
                        {
                            deepdiveInput.PopUp.RootRowName = getPopupWhereFilterColumn(deepdiveInput.PopUp.Id, ".CHILDREN");
                            deepdiveInput.Channel.RootRowName = deepdiveInput.RegPopChnl.ParentOf_PopUp;
                        }
                        else
                        {
                            deepdiveInput.PopUp.RootRowName = filterData.deepdiveFilterMapping.channelMapping.Where(x => (x.SubName.ToLower() == deepdiveInput.PopUp.Name.ToLower())).Select(y => y.ColumnName).FirstOrDefault();
                            deepdiveInput.Channel.RootRowName = deepdiveInput.PopUp.RootRowName;
                        }
                    }
                    break;
            }
            //if (deepdiveInput.PopUp.Id != 0 && deepdiveInput.PopUp.Name != null)
            getRootChidren(deepdiveInput);
            getColumns(deepdiveInput, filterData);
            getSelectedPopUpForWhereCondition(deepdiveInput);
        }

        private void getSelectedPopUpForWhereCondition(DeepdiveInput deepdiveInput)
        {
            if (deepdiveInput.RegPopChnl.DrillDownSelected.Count < 1)
                return;
            if (deepdiveInput.RegPopChnl.ParentOf_PopUp != "")
                deepdiveInput.PopUp.RootRowName = $"{{{deepdiveInput.RegPopChnl.ParentOf_PopUp}}}";
            if (deepdiveInput.RegPopChnl.DrillDownSelected.Count == 1)
                return;
            string where = $"{{{string.Join("},{", deepdiveInput.RegPopChnl.DrillDownSelected.Where(x => x.selectedPopupName != null && x.selectedPopupName != "").Select(y => getPopupWhereFilterColumn(y.id, y.selectedPopupName)).ToList<string>())}}}";
            if (where.Contains(","))
            {
                deepdiveInput.PopUp.ColumnName = where.Substring(where.LastIndexOf(",") + 1);
                deepdiveInput.PopUp.RootRowName = $"{{{deepdiveInput.PopUp.RootRowName}}},{where.Substring(0, where.LastIndexOf(","))}";
            }
            else if (where != "")
            { deepdiveInput.PopUp.ColumnName = where; }
            // string where = 
        }

        private string getPopupWhereFilterColumn(int id, string selectedPopupName)
        {
            return $"{getPopupColumnPrifix(id)}.&[{selectedPopupName}]";
        }

        private void getColumns(DeepdiveInput deepdiveInput, FilterData filterData)
        {
            string getTimeperiod = getTimperiodName(deepdiveInput, filterData);
            deepdiveInput.RegPopChnl.MDXColumns = filterData.deepdiveFilterMapping.measureMapping.Where(x => (x.Level1Name.ToLower() == deepdiveInput.Measure.Name.ToLower() && x.Level2Name.ToLower() == getTimeperiod)).Select(y => $"{y.ValueCubeColumnName},{((deepdiveInput.UseMonthColumn) ? y.ChangeorGrowthMonth : y.ChangeCubeColumnName)}").FirstOrDefault();
            //return filterData
        }

        private string getTimperiodName(DeepdiveInput deepdiveInput, FilterData filterData)
        {
            return filterData.deepdiveFilterMapping.timeperiodMapping.Where(x => (x.Level1Name.ToLower() == deepdiveInput.Timpeperiod.Name.ToLower())).Select(y => y.Level1Name.ToLower()).FirstOrDefault();
        }

        private void getRootChidren(DeepdiveInput deepdiveInput)
        {
            if (deepdiveInput.PopUp.Id != 0)
            {
                deepdiveInput.PopUp.Value = $"{getPopupColumnPrifix(deepdiveInput.PopUp.Id)}.CHILDREN";
            }


        }

        private static string getPopupColumnPrifix(int id)
        {
            switch (id)
            {
                case 1:
                    return "[PRODUCTS].[Brand]";
                case 2:
                    return "[PRODUCTS].[PK Type]";
                case 3:
                    return "[PRODUCTS].[PK Size]";
                case 4:
                    return "[PRODUCTS].[Flavours]";
                case 5:
                    return "[PRODUCTS].[Serve]";
                default:
                    return "";
            }
        }
    }
}
