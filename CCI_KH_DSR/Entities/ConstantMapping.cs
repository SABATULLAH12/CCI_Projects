using System.Collections.Generic;

namespace Entities
{
    public static class ConstantMapping
    {
        public static Dictionary<string, Dictionary<string, string>> measureMapping =
            new Dictionary<string, Dictionary<string, string>>
            {
                {
                    "growth",
                    new Dictionary<string, string>
                    {
                        { "ytd", "[Measures].[Unit Cases AC YTD % vs PY (CD)]" },
                        { "qtd", "[Measures].[Unit Cases AC QTD % vs PY (CD)]" },
                        { "mtd", "[Measures].[Unit Cases AC MTD % vs PY (CD)]" },
                        { "wtd", "[Measures].[Unit Cases AC WTD % vs PY (CD)]" },
                        { "daily", "[Measures].[Unit Cases AC % vs PY (CD)]" }
                    }
                },
                {
                    "volume",
                    new Dictionary<string, string>
                    {
                        { "ytd", "[Measures].[Unit Cases AC YTD]" },
                        { "qtd", "[Measures].[Unit Cases AC QTD]" },
                        { "mtd", "[Measures].[Unit Cases AC MTD]" },
                        { "wtd", "[Measures].[Unit Cases AC WTD]" },
                        { "daily", "[Measures].[Unit Cases AC]" }
                    }
                },
                {
                    "change",
                    new Dictionary<string, string>
                    {
                        { "ytd", "[Measures].[Unit Cases AC YTD vs PY]"},
                        { "qtd", "[Measures].[Unit Cases AC QTD vs PY]"},
                        { "mtd", "[Measures].[Unit Cases AC MTD vs PY]"},
                        { "wtd", "[Measures].[Unit Cases AC WTD vs PY]"},
                        { "daily", "[Measures].[Unit Cases AC vs PY]" }
                    }
                },
                {
                    "transactiongrowth",
                    new Dictionary<string, string>
                    {
                        { "ytd", "[Measures].[Transactions AC YTD % vs PY (CD)]" },
                        { "qtd", "[Measures].[Transactions AC QTD % vs PY (CD)]" },
                        { "mtd", "[Measures].[Transactions AC MTD % vs PY (CD)]" },
                        { "wtd", "[Measures].[Transactions AC WTD % vs PY (CD)]" },
                        { "daily", "[Measures].[Transactions AC % vs PY (CD)]" }
                    }
                },
                {
                    "transactionvolume",
                    new Dictionary<string, string>
                    {
                        { "ytd", "[Measures].[Transactions AC YTD]" },
                        { "qtd", "[Measures].[Transactions AC QTD]" },
                        { "mtd", "[Measures].[Transactions AC MTD]" },
                        { "wtd", "[Measures].[Transactions AC WTD]" },
                        { "daily", "[Measures].[Transactions AC]" }
                    }
                },
                {
                    "transactionchange",
                    new Dictionary<string, string>
                    {
                        { "ytd", "[Measures].[Transactions AC YTD vs PY]"},
                        { "qtd", "[Measures].[Transactions AC QTD vs PY]"},
                        { "mtd", "[Measures].[Transactions AC MTD vs PY]"},
                        { "wtd", "[Measures].[Transactions AC WTD vs PY]"},
                        { "daily", "[Measures].[Transactions AC vs PY]" }
                    }
                }
            };
        
        public class INSWA_MAP_ALL
        {
            public const string allmembers = "allmembers";
            public static List<INSWA_LevelNValue> Region;
            public static INSWA_LevelNValue Category;
            public static List<INSWA_LevelNValue> Brand;
            public static List<INSWA_LevelNValue> Packs;
            public class INSWA_LevelNValue
            {
                public int ID { get; set; }
                public string Level { get; set; }
                public string Value { get; set; }
            }
            static INSWA_MAP_ALL()
            {
                Region = new List<INSWA_LevelNValue>() {new INSWA_LevelNValue {ID=1, Level = "BUSINESSID", Value = "[Ship From].[Business Unit]" },
                    new INSWA_LevelNValue { ID=2, Level = "REGIONID", Value = "[Ship From].[L0 - Region]" },
                    new INSWA_LevelNValue { ID=3, Level = "BOTTLERGROUPID", Value = "[Ship From].[L0 - Entity]" },
                   new INSWA_LevelNValue {ID=4, Level = "ZONEID", Value = "[Ship From].[L0 - Zone]" },
                   new INSWA_LevelNValue {ID=5, Level = "BUSHIPID", Value = "[Ship From].[BU Ship From]" }
                   };
                Category = new INSWA_LevelNValue {ID=1, Level = "CATEGORYID", Value = "[Product].[L0 - Category]" };
                //Brand = new List<INSWA_LevelNValue>() { ID = 1, Level = "BRANDID", Value = "[Product].[L0 - Brand]" },new INSWA_LevelNValue { ID = 1, Level = "BRANDID", Value = "[Product].[L0 - Brand]" };

                Brand = new List<INSWA_LevelNValue>() {new INSWA_LevelNValue {ID=1, Level = "BRANDID", Value = "[Product].[L0 - Brand]" },  new INSWA_LevelNValue {ID=2, Level = "BEVERAGEPRODUCT", Value = "[Product].[L0 - Beverage Product]" } };

                Packs = new List<INSWA_LevelNValue>() {new INSWA_LevelNValue {ID=1, Level = "PACKTYPE", Value = "[Package].[L0 - Retail Container Type]" },
                    new INSWA_LevelNValue {ID=2, Level = "PACKSIZE", Value = "[Package].[L0 - Retail Container Pack]" } };
            }
            

        }
        

    }
}
