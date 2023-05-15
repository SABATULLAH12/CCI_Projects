using System.Linq;
using Entities;
using System.Globalization;
using System.Collections.Generic;

namespace DAL
{
    public static class MDXQueries
    {
        #region Raw Filter MDXQueries

        public static string CategoryMappingQuery = @"WITH
        MEMBER CategoryID AS [PRODUCTS].[Local Category].CURRENTMEMBER.UNIQUENAME
        SELECT {CategoryID} ON COLUMNS
        ,{[PRODUCTS].[Local Category].[Local Category].ALLMEMBERS}
        HAVING CATEGORYID <> '[PRODUCTS].[Local Category].&'ON ROWS
        FROM [Model]";

        //Packs Mapping
        public static string PackMappingQuery = @"WITH
        MEMBER PackID AS [PRODUCTS].[PK Size].CURRENTMEMBER.UNIQUENAME
        MEMBER PackType AS [PRODUCTS].[PK Type].CURRENTMEMBER.properties('member_name')
        SELECT {PackID} ON COLUMNS
        ,{[PRODUCTS].[PK Type].[PK Type].ALLMEMBERS * [PRODUCTS].[PK Size].[PK Size].ALLMEMBERS}
        HAVING(PackID<>'[PRODUCTS].[PK Size].&' and PackType<>'')ON ROWS
        FROM [Model]
        WHERE {[PRODUCTS].[Local Category].&[SPARKLING SOFT DRINKS]}";

        //company Mapping  
        public static string CompanyMapping = @"WITH MEMBER CompanyID AS [PRODUCTS].[Company].CURRENTMEMBER.UNIQUENAME
        SELECT {CompanyID} ON COLUMNS
        ,{[PRODUCTS].[Company].[Company].ALLMEMBERS}
        HAVING CompanyID <> '[PRODUCTS].[Company].&'ON ROWS
        FROM [Model]";

        //Brand Mapping 
        public static string BrandMapping = @"WITH MEMBER BrandID AS [PRODUCTS].[Brand].CURRENTMEMBER.UNIQUENAME
        SELECT {BrandID} ON COLUMNS
        ,{[PRODUCTS].[Brand].[Brand].ALLMEMBERS}
        HAVING BrandID <> '[PRODUCTS].[Brand].&'ON ROWS
        FROM [Model]";

        //Flavours Mapping 
        public static string FlavoursMapping = @"WITH MEMBER FlavourId AS [PRODUCTS].[Flavours].CURRENTMEMBER.UNIQUENAME
        SELECT {FlavourId} ON COLUMNS
        ,{[PRODUCTS].[Flavours].[Flavours].ALLMEMBERS}
        HAVING FlavourId <> '[PRODUCTS].[Flavours].&'ON ROWS
        FROM [Model]";

        public static string TimePeriodMapping = @"WITH MEMBER MonthName AS left([PERIODS].[H_Date].CURRENTMEMBER.PROPERTIES('MEMBER_NAME'),3)
        MEMBER MonthId AS [PERIODS].[H_Date].CURRENTMEMBER.UNIQUENAME
        MEMBER YTDName AS left([PERIODS].[H_Date].CURRENTMEMBER.PROPERTIES('MEMBER_NAME'),3)
        MEMBER YTDId AS [PERIODS].[H_Date].CURRENTMEMBER.UNIQUENAME
        MEMBER MATName AS left([PERIODS].[H_Date].CURRENTMEMBER.PROPERTIES('MEMBER_NAME'),3)
        MEMBER MATId AS [PERIODS].[H_Date].CURRENTMEMBER.UNIQUENAME
        MEMBER YearName AS [PERIODS].[H_Date].CURRENTMEMBER.PARENT.PARENT.PARENT.PROPERTIES('MEMBER_NAME')
        MEMBER MonthNumber As CASE WHEN Monthname = 'Jan' THEN 1 WHEN Monthname = 'Feb' THEN 2 WHEN Monthname = 'Mar' THEN 3
        WHEN Monthname = 'Apr' THEN 4 WHEN Monthname = 'May' THEN 5 WHEN Monthname = 'Jun' THEN 6 WHEN Monthname = 'Jul' THEN 7
        WHEN Monthname = 'Aug' THEN 8 WHEN Monthname = 'Sep' THEN 9 WHEN Monthname = 'Oct' THEN 10 WHEN Monthname = 'Nov' THEN 11
        WHEN Monthname = 'Dec' THEN 12 END
        SELECT{YearName,MonthName,MonthId,YTDName,YTDId,MATName,MATId,MonthNumber}ON COLUMNS
        ,{[PERIODS].[H_Date].[Month Name].ALLMEMBERS}ON ROWS
        FROM [Model]";
        #endregion

        #region RawCrossTab MDXQUERIES
        public static string CrosstabQuery =
            @"SELECT {{{0}}}ON COLUMNS
            ,({1}{2}{4})ON ROWS
            FROM [Model]
            WHERE ({3}{5}
            ,{{[IN_FMCG_PRODUCTS].[Hierarchy Name].&[LEVEL]}}
            ,{{[IN_FMCG_PRODUCTS].[Category].&[SPARKLING SOFT DRINKS]}})";
        #endregion
        #region DeepDive
        //public static string Query_DeepDive_RootStructure = $"SELECT {{{{ {{0}} }}}} ON Columns,( {{1}}  ) On Rows FROM [Model] WHERE ({{{{[PRODUCTS].[Local Share Ind].&[Y]}}}} {{2}} ) ";
        //public static string Query_DeepDive_LeafStructure = $"SELECT {{{{  {{0}} }}}}  ON Columns,( {{{{ {{1}} }}}}) On Rows FROM [Model] WHERE ({{{{[PRODUCTS].[Local Share Ind].&[Y]}}}} {{2}} )";
        public static string Query_DeepDive_RootStructure = $"SELECT {{{{ {{0}} }}}} ON Columns,( {{1}}  ) On Rows FROM [Model] WHERE ({{2}} {{3}} ) ";
        public static string Query_DeepDive_LeafStructure = $"SELECT {{{{  {{0}} }}}}  ON Columns,( {{{{ {{1}} }}}}) On Rows FROM [Model] WHERE ({{2}} {{3}} )";
        #endregion
    }
}
