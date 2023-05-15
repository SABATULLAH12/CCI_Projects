using DAL;
using Entities;
using System;
using System.Collections.Generic;
using System.Configuration;
using System.Data;
using System.Linq;
using System.Threading.Tasks;
using System.Web;
using System.Web.Script.Serialization;

namespace BAL
{
    public class FilterPanel : IFilterPanel
    {
        internal readonly IUnitOfWork _unitOfWork;

        public FilterPanel(IUnitOfWork unitOfWork)
        {
            _unitOfWork = unitOfWork;
        }

        public ClientSideFilterFormat GetFilterData()
        {
            ClientSideFilterFormat FilterData = new ClientSideFilterFormat();
            FilterData Filter = GetFilter();
            // FilterData.CrosstabFilterList = Filter.CrosstabFilterList;
            FilterData.DeepDiveFilterList = Filter.DeepDiveFilterList;
            FilterData.BrandMapping = setBrandId(Filter.DeepDiveFilterList, Filter.deepdiveFilterMapping.BrandMapping);
            return FilterData;
        }

        private IList<BrandMapping> setBrandId(List<FilterEntity> deepDiveFilterList, IList<BrandMapping> brandMapping)
        {
            return brandMapping;
        }

        public FilterData GetFilter()
        {
            FilterData Filter = GetDynamicFilter();
            if (Convert.ToBoolean(ConfigurationManager.AppSettings["LoadDynamicFilterFromCube"])
                && Filter.DynamicMappingUpdateOn < DateTime.UtcNow.AddHours(-1))
            {
                string AppDataPath = HttpContext.Current.Server.MapPath("~/App_Data/");
                Task.Run(() => SetDynamicFilter(AppDataPath));
            }
            return Filter;
        }

        private FilterData GetDynamicFilter()
        {
            string DynamicFilterJson = System.IO.File.ReadAllText(HttpContext.Current.Server.MapPath("~/App_Data/") + "DynamicFilter.json");
            JavaScriptSerializer serializer = new JavaScriptSerializer();
            serializer.MaxJsonLength = Int32.MaxValue;
            FilterData filterData = serializer.Deserialize<FilterData>(DynamicFilterJson);
            return filterData;
        }

        private FilterData GetStaticFilter(string AppDataPath) {
            string StaticFilterJson = System.IO.File.ReadAllText(AppDataPath + "StaticFilter.json");
            JavaScriptSerializer serializer = new JavaScriptSerializer();
            serializer.MaxJsonLength = Int32.MaxValue;
            FilterData filterData = serializer.Deserialize<FilterData>(StaticFilterJson);
            return filterData;
        }

        private void SetDynamicFilter(string AppDataPath)
        {
            if (Convert.ToBoolean(ConfigurationManager.AppSettings["LoadStaticFilterFromDB"]))
            {
                SetStaticFilter(AppDataPath);
            }
            FilterData Filter = GetStaticFilter(AppDataPath);
            Filter.DynamicMappingUpdateOn = DateTime.UtcNow;
            DataSet ds = _unitOfWork.GetRepository<IFilterPanelRepository>().GetFilterMappingData();
            MergeCrossTabFilterMapping(Filter, ds);
            MergeDeepdiveFilterMapping(Filter, ds);
            JavaScriptSerializer serializer = new JavaScriptSerializer();
            serializer.MaxJsonLength = Int32.MaxValue;
            string FilterData = serializer.Serialize(Filter);
            System.IO.File.WriteAllText(AppDataPath + "DynamicFilter.json", FilterData);
        }

        private void SetStaticFilter(string AppDataPath)
        {
            FilterData Filter = new FilterData();
            Filter.StaticMappingUpdatedOn = DateTime.UtcNow;
            #region CrossTabMapping
            DataSet ds = _unitOfWork.GetRepository<IFilterPanelRepository>().GetStaticCrossTabFilterPanel();
            Filter.CrosstabFilterList.Add(GetCrossTabCompareData(ds.Tables[0]));
            Filter.CrosstabFilterList.Add(GetCrossTabRegionData(ds.Tables[1]));
            Filter.CrosstabFilterList.Add(GetCrossTabKpIdata(ds.Tables[2]));
            Filter.CrosstabFilterList.Add(GetCrossTabProductData(ds.Tables[3]));
            Filter.CrosstabFilterList.Add(GetCrossTabTimePeriodData(ds.Tables[4]));
            foreach (DataRow level in ds.Tables[5].Rows)
            {
                Filter.CrossTabfilterMapping.regionMapping.Add(new RegionMapping()
                {
                    Level1Name = Convert.ToString(level["RegionType"]),
                    Level2Name = Convert.ToString(level["ParentRegion"]),
                    Level3Name = Convert.ToString(level["RegionName"]),
                    CubeColumnName = Convert.ToString(level["VariableValue"])
                });
            }
            foreach (DataRow level in ds.Tables[6].Rows)
            {
                Filter.CrossTabfilterMapping.kpiMapping.Add(new KpiMapping()
                {
                    Level1Name = Convert.ToString(level["KPI"]),
                    YTDCubeChangeColumnName = Convert.ToString(level["YTDChange"]),
                    YTDCubeValueColumnName = Convert.ToString(level["YTD"]),
                    MATCubeChangeColumnName = Convert.ToString(level["MATChange"]),
                    MATCubeValueColumnName = Convert.ToString(level["MAT"]),
                    MonthCubeChangeColumnName = Convert.ToString(level["MonthChange"]),
                    MonthCubeValueColumnName = Convert.ToString(level["Month"]),
                    QTDCubeChangeColumnName = Convert.ToString(level["QTDChange"]),
                    QTDCubeValueColumnName = Convert.ToString(level["QTD"])
                });
            }
            #endregion CrossTabMapping

            #region DeepDiveMapping
            DataSet ds2 = _unitOfWork.GetRepository<IFilterPanelRepository>().GetStaticDeepdiveFilterPanel();
            Filter.DeepDiveFilterList.Add(GetDeepdiveTimePeriodData(ds2.Tables[0]));
            Filter.DeepDiveFilterList.Add(GetDeepdiveCompanyData(ds2.Tables[1]));
            foreach (DataRow level in ds2.Tables[1].Rows)
            {
                Filter.deepdiveFilterMapping.companyMapping.Add(new CompanyMapping()
                {
                    Level1Name = Convert.ToString(level["Name"]),
                    CubeColumnName = Convert.ToString(level["ColumnName"])
                });
            }
            Filter.DeepDiveFilterList.Add(GetDeepdiveCategoryData(ds2.Tables[2]));
            foreach (DataRow level in ds2.Tables[2].Rows)
            {
                Filter.deepdiveFilterMapping.categoryMapping.Add(new CategoryMapping()
                {
                    Level1Name = Convert.ToString(level["Name"]),
                    CubeColumnName = Convert.ToString(level["ColumnName"])
                });
            }
            Filter.DeepDiveFilterList.Add(GetDeepdiveMeasureData(ds2.Tables[3]));
            foreach (DataRow level in ds2.Tables[4].Rows)
            {
                Filter.deepdiveFilterMapping.measureMapping.Add(new MeasureMapping()
                {
                    Level1Name = Convert.ToString(level["KPINAME"]),
                    Level2Name = Convert.ToString(level["TIMEPERIODDESC"]),
                    ValueCubeColumnName = Convert.ToString(level["MEASURECOLUMN"]),
                    ChangeCubeColumnName = Convert.ToString(level["CHANGEORGROWTHCOLUMN"]),
                    ChangeorGrowthMonth = Convert.ToString(level["VsMonth_ChangeorGrowthColumn"])
                });
            }
            Filter.DeepDiveFilterList.Add(GetDeepdiveRegionData(ds2.Tables[5]));
            foreach (DataRow level in ds2.Tables[5].Rows)
            {
                Filter.deepdiveFilterMapping.regionMapping.Add(new NodeMapping()
                {
                    Id = Convert.ToInt32(level["Id"]),
                    ParentId = Convert.ToInt32(level["ParentId"]),
                    Name = Convert.ToString(level["Name"]),
                    SubName = Convert.ToString(level["SubName"]),
                    ColumnName = Convert.ToString(level["ColumnName"]),
                    QueryId = Convert.ToString(level["Query"])
                });
            }
            Filter.DeepDiveFilterList.Add(GetDeepdivePopData(ds2.Tables[6]));
            foreach (DataRow level in ds2.Tables[6].Rows)
            {
                Filter.deepdiveFilterMapping.popMapping.Add(new NodeMapping()
                {
                    Id = Convert.ToInt32(level["Id"]),
                    ParentId = Convert.ToInt32(level["ParentId"]),
                    Name = Convert.ToString(level["Name"]),
                    SubName = Convert.ToString(level["SubName"]),
                    ColumnName = Convert.ToString(level["ColumnName"]),
                    QueryId = Convert.ToString(level["Query"])
                });
            }
            Filter.DeepDiveFilterList.Add(GetDeepdiveChannelData(ds2.Tables[7]));
            foreach (DataRow level in ds2.Tables[7].Rows)
            {
                Filter.deepdiveFilterMapping.channelMapping.Add(new NodeMapping()
                {
                    Id = Convert.ToInt32(level["Id"]),
                    ParentId = Convert.ToInt32(level["ParentId"]),
                    Name = Convert.ToString(level["Name"]),
                    SubName = Convert.ToString(level["SubName"]),
                    ColumnName = Convert.ToString(level["ColumnName"]),
                    QueryId = Convert.ToString(level["Query"])
                });
            }
            foreach (DataRow level in ds2.Tables[8].Rows)
            {
                Filter.deepdiveFilterMapping.RootMapping.Add(new NodeMapping()
                {
                   // Id = Convert.ToInt32(level["Id"]),
                   // ParentId = Convert.ToInt32(level["ParentId"]),
                    Name = Convert.ToString(level["Name"]),
                    SubName = Convert.ToString(level["DropDown"]),
                    ColumnName = Convert.ToString(level["ColumnName"])
                });
            }
            //-------added aj---
            foreach (DataRow level in ds2.Tables[9].Rows)
            {
                Filter.deepdiveFilterMapping.BrandMapping.Add(new BrandMapping()
                {
                    Name = Convert.ToString(level["BrandName"]),
                    CubeColumnName = Convert.ToString(level["ColumnName"]),
                    Category = Convert.ToString(level["CategoryName"]),
                    Company = Convert.ToString(level["CompanyName"]),
                    DropDownName = Convert.ToString(level["DropDownName"]),
                    IsSelectable = Convert.ToString(level["IsSelectable"])
                });
            }
                //--------------------
            #endregion DeepDiveMapping
            string FilterData = new JavaScriptSerializer().Serialize(Filter);
            System.IO.File.WriteAllText(AppDataPath + "StaticFilter.json", FilterData);
        }
        private void MergeDeepdiveFilterMapping(FilterData Filter, DataSet MappingSet)
        {
            foreach (FilterEntity entity in Filter.DeepDiveFilterList)
            {
                if (entity.Name == "timeperiod")
                {
                    int id = 1000;
                    DataTable dt = MappingSet.Tables[4].AsEnumerable()
                   .OrderBy(r => Convert.ToInt32(r[1]))
                   .ThenBy(r => Convert.ToInt32(r[8]))
                   .CopyToDataTable();

                    foreach (FilterEntity timeperiod in entity.Data)
                    {
                        if (timeperiod.Name.ToLower() == "ytd")
                        {
                            foreach (DataRow level in dt.Rows)
                            {
                                TimeperiodMapping tMapping = new TimeperiodMapping()
                                {
                                    Level1Name = timeperiod.Name.ToLower(),
                                    Level2Name = Convert.ToString(level[1]) + " - " + Convert.ToString(level[4]),
                                    CubeColumnName = Convert.ToString(level[5])
                                };
                                if (Filter.deepdiveFilterMapping.timeperiodMapping.Count(item => item.Level1Name == timeperiod.Name.ToLower() && item.Level2Name == tMapping.Level2Name) == 0)
                                {
                                    Filter.deepdiveFilterMapping.timeperiodMapping.Add(tMapping);
                                    timeperiod.Data.Add(new FilterEntity()
                                    {
                                        Id = id++,
                                        Name = tMapping.Level2Name,
                                        Data = new List<FilterEntity>()
                                    });
                                }
                            }
                        }
                        else if (timeperiod.Name.ToLower() == "mat")
                        {
                            foreach (DataRow level in dt.Rows)
                            {
                                TimeperiodMapping tMapping = new TimeperiodMapping()
                                {
                                    Level1Name = timeperiod.Name.ToLower(),
                                    Level2Name = Convert.ToString(level[1]) + " - " + Convert.ToString(level[6]),
                                    CubeColumnName = Convert.ToString(level[7])
                                };
                                if (Filter.deepdiveFilterMapping.timeperiodMapping.Count(item => item.Level1Name == timeperiod.Name.ToLower() && item.Level2Name == tMapping.Level2Name) == 0)
                                {
                                    Filter.deepdiveFilterMapping.timeperiodMapping.Add(tMapping);
                                    timeperiod.Data.Add(new FilterEntity()
                                    {
                                        Id = id++,
                                        Name = tMapping.Level2Name,
                                        Data = new List<FilterEntity>()
                                    });
                                }
                            }
                        }
                        else if (timeperiod.Name.ToLower() == "month")
                        {
                            foreach (DataRow level in dt.Rows)
                            {
                                TimeperiodMapping tMapping = new TimeperiodMapping()
                                {
                                    Level1Name = timeperiod.Name.ToLower(),
                                    Level2Name = Convert.ToString(level[1]) + " - " + Convert.ToString(level[2]),
                                    CubeColumnName = Convert.ToString(level[3])
                                };
                                if (Filter.deepdiveFilterMapping.timeperiodMapping.Count(item => item.Level1Name == timeperiod.Name.ToLower() && item.Level2Name == tMapping.Level2Name) == 0)
                                {
                                    Filter.deepdiveFilterMapping.timeperiodMapping.Add(tMapping);
                                    timeperiod.Data.Add(new FilterEntity()
                                    {
                                        Id = id++,
                                        Name = tMapping.Level2Name,
                                        Data = new List<FilterEntity>()
                                    });
                                }
                            }
                        }
                        //else if (timeperiod.Name.ToLower() == "qtd")
                        //{
                        //    foreach (DataRow level in MappingSet.Tables[4].Rows)
                        //    {
                        //        TimeperiodMapping tMapping = new TimeperiodMapping()
                        //        {
                        //            Level1Name = timeperiod.Name.ToLower(),
                        //            Level2Name = Convert.ToString(level[3]) + " - " + Convert.ToString(level[6]),
                        //            CubeColumnName = Convert.ToString(level[7])
                        //        };
                        //        if (Filter.deepdiveFilterMapping.timeperiodMapping.Count(item => item.Level1Name == timeperiod.Name.ToLower() && item.Level2Name == tMapping.Level2Name) == 0)
                        //        {
                        //            Filter.deepdiveFilterMapping.timeperiodMapping.Add(tMapping);
                        //            timeperiod.Data.Add(new FilterEntity()
                        //            {
                        //                Id = id++,
                        //                Name = tMapping.Level2Name,
                        //                Data = new List<FilterEntity>()
                        //            });
                        //        }
                        //    }
                        //}
                    }
                }
            }
        }
        private void MergeCrossTabFilterMapping(FilterData Filter, DataSet MappingSet)
        {
            foreach (FilterEntity entity in Filter.CrosstabFilterList)
            {
                if (entity.Name == "product")
                {
                    int id = 100;
                    foreach (FilterEntity product in entity.Data)
                    {
                        if (product.Name.ToLower() == "company")
                        {
                            foreach (DataRow level in MappingSet.Tables[0].Rows)
                            {
                                Filter.CrossTabfilterMapping.productMapping.Add(new ProductMapping()
                                {
                                    Level1Name = "company",
                                    Level2Name = Convert.ToString(level[0]),
                                    CubeColumnName = Convert.ToString(level[1])
                                });
                                product.Data.Add(new FilterEntity
                                {
                                    Id = id++,
                                    Name = Convert.ToString(level[0]),
                                    Data = new List<FilterEntity>(),
                                });
                            }
                        }
                        else if (product.Name.ToLower() == "brand")
                        {
                            foreach (DataRow level in MappingSet.Tables[1].Rows)
                            {
                                Filter.CrossTabfilterMapping.productMapping.Add(new ProductMapping()
                                {
                                    Level1Name = "brand",
                                    Level2Name = Convert.ToString(level[0]),
                                    CubeColumnName = Convert.ToString(level[1])
                                });
                                product.Data.Add(new FilterEntity()
                                {
                                    Id = id++,
                                    Name = Convert.ToString(level[0]),
                                    Data = new List<FilterEntity>(),
                                });
                            }
                        }
                        else if (product.Name.ToLower() == "pack")
                        {
                            foreach (DataRow level in MappingSet.Tables[2].Rows)
                            {
                                Filter.CrossTabfilterMapping.productMapping.Add(new ProductMapping()
                                {
                                    Level1Name = "pack",
                                    Level2Name = Convert.ToString(level[0]) + " - " + Convert.ToString(level[1]),
                                    CubeColumnName = Convert.ToString(level[2])
                                });
                                product.Data.Add(new FilterEntity()
                                {
                                    Id = id++,
                                    Name = Convert.ToString(level[0]) + " - " + Convert.ToString(level[1]),
                                    Data = new List<FilterEntity>()
                                });
                            }
                        }
                        else if (product.Name.ToLower() == "flavour")
                        {
                            foreach (DataRow level in MappingSet.Tables[3].Rows)
                            {
                                Filter.CrossTabfilterMapping.productMapping.Add(new ProductMapping()
                                {
                                    Level1Name = "flavour",
                                    Level2Name = Convert.ToString(level[0]),
                                    CubeColumnName = Convert.ToString(level[1])
                                });
                                product.Data.Add(new FilterEntity()
                                {
                                    Id = id++,
                                    Name = Convert.ToString(level[0]),
                                    Data = new List<FilterEntity>(),
                                });
                            }
                        }
                        else if (product.Name.ToLower() == "category")
                        {
                            foreach (DataRow level in MappingSet.Tables[5].Rows)
                            {
                                Filter.CrossTabfilterMapping.productMapping.Add(new ProductMapping()
                                {
                                    Level1Name = "category",
                                    Level2Name = Convert.ToString(level[0]),
                                    CubeColumnName = Convert.ToString(level[1])
                                });
                                product.Data.Add(new FilterEntity()
                                {
                                    Id = id++,
                                    Name = Convert.ToString(level[0]),
                                    Data = new List<FilterEntity>(),
                                });
                            }
                        }
                    }
                }
                else if (entity.Name == "timeperiod")
                {
                    int id = 1000;
                    DataTable dt = MappingSet.Tables[4].AsEnumerable()
                   .OrderBy(r => Convert.ToInt32(r[1]))
                   .ThenBy(r => Convert.ToInt32(r[8]))
                   .CopyToDataTable();
                    foreach (FilterEntity timeperiod in entity.Data)
                    {
                        if (timeperiod.Name.ToLower() == "ytd")
                        {
                            foreach (DataRow level in dt.Rows)
                            {

                                TimeperiodMapping tMapping = new TimeperiodMapping()
                                {
                                    Level1Name = timeperiod.Name.ToLower(),
                                    Level2Name = Convert.ToString(level[1]) + " - " + Convert.ToString(level[4]),
                                    CubeColumnName = Convert.ToString(level[5])
                                };
                                if (Filter.CrossTabfilterMapping.timeperiodMapping.Count(item => item.Level1Name == timeperiod.Name.ToLower() && item.Level2Name == tMapping.Level2Name) == 0)
                                {
                                    Filter.CrossTabfilterMapping.timeperiodMapping.Add(tMapping);
                                    timeperiod.Data.Add(new FilterEntity()
                                    {
                                        Id = id++,
                                        Name = tMapping.Level2Name,
                                        Data = new List<FilterEntity>()
                                    });
                                }
                            }
                        }
                        else if (timeperiod.Name.ToLower() == "mat")
                        {
                            foreach (DataRow level in dt.Rows)
                            {
                                TimeperiodMapping tMapping = new TimeperiodMapping()
                                {
                                    Level1Name = timeperiod.Name.ToLower(),
                                    Level2Name = Convert.ToString(level[1]) + " - " + Convert.ToString(level[6]),
                                    CubeColumnName = Convert.ToString(level[7])
                                };
                                if (Filter.CrossTabfilterMapping.timeperiodMapping.Count(item => item.Level1Name == timeperiod.Name.ToLower() && item.Level2Name == tMapping.Level2Name) == 0)
                                {
                                    Filter.CrossTabfilterMapping.timeperiodMapping.Add(tMapping);
                                    timeperiod.Data.Add(new FilterEntity()
                                    {
                                        Id = id++,
                                        Name = tMapping.Level2Name,
                                        Data = new List<FilterEntity>()
                                    });
                                }
                            }
                        }
                        else if (timeperiod.Name.ToLower() == "month")
                        {
                            foreach (DataRow level in dt.Rows)
                            {
                                TimeperiodMapping tMapping = new TimeperiodMapping()
                                {
                                    Level1Name = timeperiod.Name.ToLower(),
                                    Level2Name = Convert.ToString(level[1]) + " - " + Convert.ToString(level[2]),
                                    CubeColumnName = Convert.ToString(level[3])
                                };
                                if (Filter.CrossTabfilterMapping.timeperiodMapping.Count(item => item.Level1Name == timeperiod.Name.ToLower() && item.Level2Name == tMapping.Level2Name) == 0)
                                {
                                    Filter.CrossTabfilterMapping.timeperiodMapping.Add(tMapping);
                                    timeperiod.Data.Add(new FilterEntity()
                                    {
                                        Id = id++,
                                        Name = tMapping.Level2Name,
                                        Data = new List<FilterEntity>()
                                    });
                                }
                            }
                        }
                        //else if (timeperiod.Name.ToLower() == "qtd")
                        //{
                        //    foreach (DataRow level in dt.Rows)
                        //    {
                        //        TimeperiodMapping tMapping = new TimeperiodMapping()
                        //        {
                        //            Level1Name = timeperiod.Name.ToLower(),
                        //            Level2Name = Convert.ToString(level[3]) + " - " + Convert.ToString(level[6]),
                        //            CubeColumnName = Convert.ToString(level[7])
                        //        };
                        //        if(Filter.CrossTabfilterMapping.timeperiodMapping.Count(item => item.Level1Name == timeperiod.Name.ToLower() && item.Level2Name == tMapping.Level2Name) == 0)
                        //        {
                        //            Filter.CrossTabfilterMapping.timeperiodMapping.Add(tMapping);
                        //            timeperiod.Data.Add(new FilterEntity()
                        //            {
                        //                Id = id++,
                        //                Name = tMapping.Level2Name,
                        //                Data = new List<FilterEntity>()
                        //            });
                        //        }

                        //    }
                        //}
                    }

                }
            }
        }

        private List<FilterEntity> IgnoreRepeatedItem(List<FilterEntity> list)
        {
            List<FilterEntity> entityList = new List<FilterEntity>();
            foreach(FilterEntity entity in list)
            {
                if(!entityList.Any(S=>S.Name == entity.Name))
                {
                    entityList.Add(entity);
                }
            }
            return entityList;
        }

        private List<FilterEntity> GetParentData(DataTable table)
        {
            List<FilterEntity> entityList = new List<FilterEntity>();
            if (table != null)
            {
                entityList = table.AsEnumerable().Where(level1 => Convert.ToInt32(level1["ParentId"]) == -1)
                    .Select(level => new FilterEntity()
                    {
                        Id = table.Columns.Contains("Id") ? Convert.ToInt32(level["Id"]) : -404,
                        Name = table.Columns.Contains("Name") ? Convert.ToString(level["Name"]) : null,
                        Data = GetChildData(table, level, (table.Columns.Contains("LevelId") ? Convert.ToBoolean(level["LevelId"]): true))
                    }).ToList<FilterEntity>();
            }
            return entityList;
        }

        private List<FilterEntity> GetChildData(DataTable table, DataRow parentRow, bool AllowChild)
        {
            List<FilterEntity> entityList =  new List<FilterEntity>();
            if (AllowChild)
            {
                entityList = table.AsEnumerable().Where(level => Convert.ToInt32(level["ParentId"]) == Convert.ToInt32(parentRow["Id"]))
                    .Select(level => new FilterEntity()
                    {
                        Id = table.Columns.Contains("Id") ? Convert.ToInt32(level["Id"]) : -404,
                        Name = table.Columns.Contains("Name") ? Convert.ToString(level["Name"]) : null,
                        Data = GetChildData(table, level, table.Columns.Contains("LevelId") ? Convert.ToBoolean(level["LevelId"]) : true)
                    }).ToList<FilterEntity>();
            }
            return IgnoreRepeatedItem(entityList);
        }
        private FilterEntity GetCrossTabCompareData(DataTable table)
        {
            FilterEntity Entity = new FilterEntity();
            Entity.Name = "column";
            Entity.Id = 0;
            Entity.Data = GetParentData(table);
            return Entity;
        }
        private FilterEntity GetCrossTabRegionData(DataTable table)
        {
            FilterEntity Entity = new FilterEntity();
            Entity.Name = "region";
            Entity.Id = 1;
            Entity.Data = GetParentData(table);
            return Entity;
        }
        private FilterEntity GetCrossTabKpIdata(DataTable table)
        {
            FilterEntity Entity = new FilterEntity();
            Entity.Name = "kpi";
            Entity.Id = 2;
            Entity.Data = GetParentData(table);
            return Entity;
        }
        private FilterEntity GetCrossTabProductData(DataTable table)
        {
            FilterEntity Entity = new FilterEntity();
            Entity.Name = "product";
            Entity.Id = 3;
            Entity.Data = GetParentData(table);
            return Entity;
        }
        private FilterEntity GetCrossTabTimePeriodData(DataTable table)
        {
            FilterEntity Entity = new FilterEntity();
            Entity.Name = "timeperiod";
            Entity.Id = 4;
            Entity.Data = GetParentData(table);
            return Entity;
        }
        private FilterEntity GetDeepdiveTimePeriodData(DataTable table)
        {
            FilterEntity Entity = new FilterEntity();
            Entity.Name = "timeperiod";
            Entity.Id = 0;
            Entity.Data = GetParentData(table);
            return Entity;
        }
        private FilterEntity GetDeepdiveCategoryData(DataTable table)
        {
            FilterEntity Entity = new FilterEntity();
            Entity.Name = "category";
            Entity.Id = 1;
            Entity.Data = GetParentData(table);
            return Entity;
        }
        private FilterEntity GetDeepdiveCompanyData(DataTable table)
        {
            FilterEntity Entity = new FilterEntity();
            Entity.Name = "company";
            Entity.Id = 2;
            Entity.Data = GetParentData(table);
            return Entity;
        }
        private FilterEntity GetDeepdiveBrandData(DataTable table)
        {
            FilterEntity Entity = new FilterEntity();
            Entity.Name = "brand";
            Entity.Id = 2;
            Entity.Data = GetParentData(table);
            return Entity;
        }
        private FilterEntity GetDeepdiveMeasureData(DataTable table)
        {
            FilterEntity Entity = new FilterEntity();
            Entity.Name = "measure";
            Entity.Id = 3;
            Entity.Data = GetParentData(table);
            return Entity;
        }
        private FilterEntity GetDeepdiveRegionData(DataTable table)
        {
            FilterEntity Entity = new FilterEntity();
            Entity.Name = "region";
            Entity.Id = 4;
            Entity.Data = GetParentData(table);
            return Entity;
        }
        private FilterEntity GetDeepdivePopData(DataTable table)
        {
            FilterEntity Entity = new FilterEntity();
            Entity.Name = "pop";
            Entity.Id = 5;
            Entity.Data = GetParentData(table);
            return Entity;

        }
        private FilterEntity GetDeepdiveChannelData(DataTable table)
        {
            FilterEntity Entity = new FilterEntity();
            Entity.Name = "channel";
            Entity.Id = 6;
            Entity.Data = GetParentData(table);
            return Entity;
        }
    }
}
