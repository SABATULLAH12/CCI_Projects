
using System;
using Entities;
using System.Data;
using System.Collections.Generic;

namespace DAL
{
    public class DeepdiveRepository : IDeepdiveRepository
    {
        public DataSet GetOutput(DeepdiveInput deepdiveInput)
        {
            string BrandDropDown = (deepdiveInput.Brand == null || deepdiveInput.Brand.Name == null || deepdiveInput.Brand.Name.ToLower() == "all") ? "" : $",{{{deepdiveInput.Brand.Value}}}";
            string WhereStart = getFixedWhereStart(deepdiveInput);
            List<string> query = new List<string>();
            string RootColumn = deepdiveInput.RegPopChnl.MDXColumns; //"[Measures].[17. Local Category MS Value],[Measures].[17. Local Category MS Value vs PY]";
            string RootRow = SetRow(true, deepdiveInput); //"{[PRODUCTS].[Local Category].&[SPARKLING SOFT DRINKS]},{[MARKET].[Short Description].&[All India (U+R)]}";
            string RootWhere = SetWhere(true, deepdiveInput, BrandDropDown); //",{[PERIODS].[H_Date].[Year].&[2019].&[H2].&[Q3].&[July]},{[PRODUCTS].[Company].&[COCA-COLA INDIA]}";

            string LeafColumn = deepdiveInput.RegPopChnl.MDXColumns;// "[Measures].[17. Local Category MS Value],[Measures].[17. Local Category MS Value vs PY]";
            string LeafRow = SetRow(false, deepdiveInput);// "[MARKET].[Short Description].&[All India - Conv],[MARKET].[Short Description].&[All India - E&D],[MARKET].[Short Description].&[All India - Grocer/GS Total]";
            string LeafWhere = SetWhere(false, deepdiveInput, BrandDropDown); //",{[PERIODS].[H_Date].[Year].&[2019].&[H2].&[Q3].&[July]},{[PRODUCTS].[Company].&[COCA-COLA INDIA] },{[PRODUCTS].[Local Category].&[SPARKLING SOFT DRINKS]}";

            query.Add(string.Format(MDXQueries.Query_DeepDive_RootStructure, RootColumn, RootRow, WhereStart, RootWhere));
            GetChildNodQuery(deepdiveInput,WhereStart, query, LeafColumn, LeafRow, LeafWhere);

            Log.LogMDXquery("DeepDive :Root Query-", query[0]);
            Log.LogMDXquery("DeepDive :Leaf Query-", query[1]);
            return DataAccess.GetQueryOutput(query);
        }

        private  void GetChildNodQuery(DeepdiveInput deepdiveInput,string WhereStart, List<string> query, string LeafColumn, string LeafRow, string LeafWhere)
        {
            string MTQuery = string.Empty;
            switch (deepdiveInput.RegPopChnl.selectedFName)
            {
                case "R":
                        MTQuery = deepdiveInput.Region.ColumnNameMT;
                    break;
                case "C":
                        MTQuery = deepdiveInput.Channel.ColumnNameMT;
                    break;
                case "P":
                        MTQuery = deepdiveInput.Pop.ColumnNameMT;
                    break;
            }


            if (deepdiveInput.RegPopChnl.selectedFName.ToUpper() == "C" && deepdiveInput.isMTQry == 1)
            {
                WhereStart = getFixedWhereStart_ForChannel(deepdiveInput, WhereStart, true);
            }
            else
                WhereStart = getFixedWhereStart_ForChannel(deepdiveInput, WhereStart, false);
            query.Add(string.Format(MDXQueries.Query_DeepDive_LeafStructure, LeafColumn, LeafRow, WhereStart, LeafWhere));
            if (deepdiveInput.isMTQry==3 && MTQuery != string.Empty)
            {
                WhereStart = getFixedWhereStart_ForChannel(deepdiveInput,WhereStart, true);
                query.Add(string.Format(MDXQueries.Query_DeepDive_LeafStructure, LeafColumn, MTQuery, WhereStart, LeafWhere));
            }
        }

        private string getFixedWhereStart_ForChannel(DeepdiveInput deepdiveInput, string WhereStart, bool isMTQuery)
        {
            if (deepdiveInput.RegPopChnl.selectedFName.ToUpper() != "C")
                return WhereStart;
            bool add2ndcond = check_BR_Pt_Ps_Sr(deepdiveInput);
            if(!isMTQuery)
                return "{[PRODUCTS].[Local Share Ind].&[Y]}";

            if (add2ndcond && deepdiveInput.Channel.Name.ToLower() == "state - outlet") //"states - tt+mt"
                return "{[PRODUCTS].[Hierarchy Level Name].&[Item]},{[PRODUCTS].[Hierarchy Name].&[LEVEL]}";
            else if (!add2ndcond && deepdiveInput.Channel.Name.ToLower() == "states - tt+mt")
                return "{[PRODUCTS].[Hierarchy Level Name].&[Company]},{[PRODUCTS].[Hierarchy Name].&[LEVEL]}";
            else if (!add2ndcond)
                return "{[PRODUCTS].[Local Share Ind].&[T]}";
            else
                return "{[PRODUCTS].[Local Share Ind].&[Y]}";


        }

        private string getFixedWhereStart(DeepdiveInput deepdiveInput)
        {
            bool add2ndcond= check_BR_Pt_Ps_Sr(deepdiveInput);//check if any of the selection contain "Brand","Pack Type","Pack Size" Or "Server"
            if (deepdiveInput.RegPopChnl.selectedFName.ToUpper() == "R")
            {
                if (deepdiveInput.Region.Name.ToLower() == "states - tt+mt")
                {
                    if (add2ndcond)
                        return "{[PRODUCTS].[Hierarchy Level Name].&[Item]},{[PRODUCTS].[Hierarchy Name].&[LEVEL]}";
                    else
                        return "{[PRODUCTS].[Hierarchy Level Name].&[Company]},{[PRODUCTS].[Hierarchy Name].&[LEVEL]}";
                }
                else if (add2ndcond)
                    return "{[PRODUCTS].[Local Share Ind].&[Y]}";
                else
                    return "{[PRODUCTS].[Local Share Ind].&[T]}";
                
            }
            else
                return "{[PRODUCTS].[Local Share Ind].&[Y]}";
        }

        private bool check_BR_Pt_Ps_Sr(DeepdiveInput deepdiveInput)
        {
            if (deepdiveInput.Brand.Name != null && deepdiveInput.Brand.Name.ToLower() != "all")
                return true;
            foreach (PopupDrilldownitems itm in deepdiveInput.RegPopChnl.DrillDownSelected)
            {
                switch(itm.id)
                {
                    case 1:
                    case 2:
                    case 3:
                    //case 4: Flavor
                    case 5:
                        return true;
                        break;
                }
            }
            return false;
        }

        private string SetWhere(bool root,DeepdiveInput deepdiveInput,string BrandDropDown)
        {
           
            if (root)
            {
                if (deepdiveInput.PopUp.Id != 0 && deepdiveInput.RegPopChnl.DrillDownSelected.Count>1)
                    return $",{{{deepdiveInput.Timpeperiod.ColumnName }}},{{{  deepdiveInput.Company.ColumnName}}},{deepdiveInput.PopUp.RootRowName}{BrandDropDown}";
                else
                    return $",{{{deepdiveInput.Timpeperiod.ColumnName }}},{{{  deepdiveInput.Company.ColumnName}}}{BrandDropDown}";
            }
            else
                return LeafQrywhere(deepdiveInput, BrandDropDown);
        }

        private static string LeafQrywhere(DeepdiveInput deepdiveInput,string BrandDropDown)
        {
            if (deepdiveInput.PopUp.Id != 0)
            {
                if (deepdiveInput.PopUp.ColumnName != null)
                    return $",{{{deepdiveInput.Timpeperiod.ColumnName }}},{{{  deepdiveInput.Company.ColumnName}}},{{{deepdiveInput.Category.ColumnName}}},{deepdiveInput.PopUp.RootRowName},{deepdiveInput.PopUp.ColumnName}{BrandDropDown}";
                else
                    return $",{{{deepdiveInput.Timpeperiod.ColumnName }}},{{{  deepdiveInput.Company.ColumnName}}},{{{deepdiveInput.Category.ColumnName}}},{deepdiveInput.PopUp.RootRowName}{BrandDropDown}";
            }
            else
                return $",{{{deepdiveInput.Timpeperiod.ColumnName }}},{{{  deepdiveInput.Company.ColumnName}}},{{{deepdiveInput.Category.ColumnName}}}{BrandDropDown}";
        }

        private string SetRow(bool root,DeepdiveInput deepdiveInput)
        {
           
            switch(deepdiveInput.RegPopChnl.selectedFName.ToUpper())
            {
                case "R":
                    if (root)
                    {
                        if (deepdiveInput.PopUp.Id != 0 && deepdiveInput.PopUp.ColumnName != null)
                            return $"{{{deepdiveInput.Category.ColumnName }}},{{{ deepdiveInput.PopUp.ColumnName}}}";
                        else
                            return $"{{{deepdiveInput.Category.ColumnName }}},{{{ deepdiveInput.Region.RootRowName}}}"; //POP ID WILL BE THERE BUT NOT POP NAME(1st level)
                    }
                    else
                        return $"{{{ ((deepdiveInput.PopUp.Id != 0) ? deepdiveInput.PopUp.Value : deepdiveInput.Region.ColumnName)}}}";
                case "P":
                    if (root)
                        return $"{{{deepdiveInput.Category.ColumnName }}},{{{((deepdiveInput.PopUp.Id != 0 && deepdiveInput.PopUp.ColumnName != null) ? deepdiveInput.PopUp.ColumnName : deepdiveInput.Pop.RootRowName)}}}";
                    else
                        return $"{{{((deepdiveInput.PopUp.Id != 0) ? deepdiveInput.PopUp.Value : deepdiveInput.Pop.ColumnName)}}}";
                case "C":
                    if (root)
                        return $"{{{deepdiveInput.Category.ColumnName }}},{{{((deepdiveInput.PopUp.Id!=0 && deepdiveInput.PopUp.ColumnName != null) ? deepdiveInput.PopUp.ColumnName : deepdiveInput.Channel.RootRowName)}}}";
                    else
                        return $"{{{((deepdiveInput.PopUp.Id != 0) ? deepdiveInput.PopUp.Value : deepdiveInput.Channel.ColumnName)}}}";
                default:
                    return "";
            }


        }
    }
}
