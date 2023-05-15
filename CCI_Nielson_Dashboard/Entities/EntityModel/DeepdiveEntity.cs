
using System.Collections.Generic;

namespace Entities
{
    public class DeepdiveMapping
    {
        public IList<CategoryMapping> categoryMapping { get; set; }
        public IList<MeasureMapping> measureMapping { get; set; }
        public IList<CompanyMapping> companyMapping { get; set; }
        public IList<BrandMapping> BrandMapping { get; set; }
        public IList<TimeperiodMapping> timeperiodMapping { get; set; }
        public IList<NodeMapping> regionMapping { get; set; }
        public IList<NodeMapping> popMapping { get; set; }

        public IList<NodeMapping> channelMapping { get; set; }
        public IList<NodeMapping> RootMapping { get; set; }
        public DeepdiveMapping()
        {
            categoryMapping = new List<CategoryMapping>();
            measureMapping = new List<MeasureMapping>();
            companyMapping = new List<CompanyMapping>();
            timeperiodMapping = new List<TimeperiodMapping>();
            regionMapping = new List<NodeMapping>();
            popMapping = new List<NodeMapping>();
            channelMapping = new List<NodeMapping>();
            RootMapping = new List<NodeMapping>();
            BrandMapping = new List<BrandMapping>();
        }
    }
    public class NodeMapping
    {
        public int Id { get; set; }
        public string Name { get; set; }
        public string SubName { get; set; }
        public int ParentId { get; set; }
        public string ColumnName { get; set; }
        public string QueryId { get; set; }
    }
    public class MeasureMapping
    {
        public string Level1Name { get; set; }
        public string Level2Name { get; set; }
        public string ValueCubeColumnName { get; set; }
        public string ChangeCubeColumnName { get; set; }
        public string ChangeorGrowthMonth { get; set; }

    }
    public class CategoryMapping
    {
        public string Level1Name { get; set; }
        public string CubeColumnName { get; set; }

    }
    public class BrandMapping
    {
        public string Name { get; set; }
        public string CubeColumnName { get; set; }
        public string Company { get; set; }
        public string Category { get; set; }
        public string DropDownName { get; set; }
        public string IsSelectable { get; set; }
    }
    public class CompanyMapping
    {
        public string Level1Name { get; set; }
        public string CubeColumnName { get; set; }

    }

    public class selecteditem
    {
        public int Id { get; set; }
        public string Name { get; set; }
        public string Value { get; set; }
        public string ColumnName { get; set; }
        public string RootRowName { get; set; }
        public string ColumnNameMT { get; set; }

    }
    public class RegPopChnl
    {
        public string selectedFName { get; set; }
        public bool parent { get; set; }
        public string MDXColumns { get; set; }
        public List<PopupDrilldownitems> DrillDownSelected { get; set; }
        public string ParentOf_PopUp { get; set; } //this is parent of Leaf Node PopUp(need when use Back Button)
        public RegPopChnl()
        {
            DrillDownSelected =new List<PopupDrilldownitems>();
        }
    }
    public class PopupDrilldownitems
    {
        public int id { get; set; }
        public string selectedPopupName { get; set; }
    }
    public class DeepdiveInput
    {

        public selecteditem Timpeperiod { get; set; }
        public selecteditem Company { get; set; }
        public selecteditem Category { get; set; }
        public selecteditem Brand { get; set; }
        public selecteditem Measure { get; set; }
        public selecteditem Region { get; set; }
        public selecteditem Pop { get; set; }
        public selecteditem Channel { get; set; }
        public selecteditem ChildLevel { get; set; }
        public selecteditem PopUp { get; set; }
        public RegPopChnl RegPopChnl { get; set; }
        public bool UseMonthColumn { get; set; }
        public int isMTQry { get; set; } // null = total 3 query , 1 = NotMTData , 2 = MTData
        public DeepdiveInput()
        {
            Timpeperiod = new selecteditem();
            Company = new selecteditem();
            Category = new selecteditem();
            Brand = new selecteditem();
            Measure = new selecteditem();
            Region = new selecteditem();
            Pop = new selecteditem();
            Channel = new selecteditem();
            ChildLevel = new selecteditem();
            PopUp = new selecteditem();
            RegPopChnl = new RegPopChnl();
        }

    }
    public class OrgOutputeach
    {
        public string id { get; set; }
        public string name { get; set; }
        public string parent { get; set; }
        public string Dvalue { get; set; }
        public double? tooltip { get; set; }
        public bool isMTQry  { get; set; }
}
    public class DeepdiveOrgOutput
    {
        public List<OrgOutputeach> DeepdiveOrgOutputData { get; set; }
        public DeepdiveOrgOutput()
        {
            DeepdiveOrgOutputData = new List<Entities.OrgOutputeach>();
        }
    }
}
