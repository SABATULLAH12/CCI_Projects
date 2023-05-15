using Entities;
using MdxClient;
using Microsoft.Practices.EnterpriseLibrary.Data.Sql;
using System;
using System.Collections.Generic;
using System.Configuration;
using System.Data;
using System.Threading.Tasks;

namespace DAL
{
    public class DataAccess
    {

        public static DataSet GetData(IDbConnection conn, string strSPName)
        {
            DataSet dsData = new DataSet();

            SqlDatabase database = new SqlDatabase(conn.ConnectionString);
            dsData = database.ExecuteDataSet(strSPName);

            return dsData;
        }
        /// <summary>
        /// get data from Database
        /// </summary>
        /// <param name="conn"></param>
        /// <param name="strSPName"></param>
        /// <returns></returns>
        public static DataSet GetData(IDbConnection conn, string strSPName, object[] param)
        {
            DataSet dsData;

            SqlDatabase database = new SqlDatabase(conn.ConnectionString);
            dsData = database.ExecuteDataSet(strSPName, param);

            return dsData;
        }
        /// <summary>
        /// Run One query with inbuilt connetion
        /// </summary>
        /// <param name="query"></param>
        /// <returns></returns>
        public static DataTable GetQueryOutput(string query)
        {
            string connectionString = ConfigurationManager.ConnectionStrings[ConfigurationManager.AppSettings["CubeConnectionString"]].ConnectionString;
            var OpenConnwatch = new System.Diagnostics.Stopwatch();
            OpenConnwatch.Start();
            var RunQuerywatch = new System.Diagnostics.Stopwatch();
            var CloseConnwatch = new System.Diagnostics.Stopwatch();
            DataTable td = new DataTable();
            var connection = new MdxConnection(connectionString);
            using (connection)
            {
                connection.Open();
                OpenConnwatch.Stop();
                RunQuerywatch.Start();
                using (var command = connection.CreateCommand())
                {
                    command.CommandText = query;
                    using (var dataAdapter = new MdxDataAdapter())
                    {
                        dataAdapter.SelectCommand = command;
                        dataAdapter.Fill(td);
                    }
                }
                RunQuerywatch.Stop();
                CloseConnwatch.Start();
                connection.Close();
                CloseConnwatch.Stop();
            }
            Log.LogMessage("time Taken To open Connection: " + OpenConnwatch.ElapsedMilliseconds + "ms");
            Log.LogMessage("time Taken To run query: " + RunQuerywatch.ElapsedMilliseconds + "ms");
            Log.LogMessage("time Taken To Close Connection: " + CloseConnwatch.ElapsedMilliseconds + "ms");
            return td;
        }

        /// <summary>
        /// Run parallel
        /// </summary>
        /// <param name="conn"></param>
        /// <param name="queryList"></param>
        /// <returns></returns>
        public static DataSet GetQueryOutput(IList<string> queryList)
        {
            string connectionString = ConfigurationManager.ConnectionStrings[ConfigurationManager.AppSettings["CubeConnectionString"]].ConnectionString;
            var RawDataSet = new DataSet();
            var FinalDataSet = new DataSet();
            var options = new ParallelOptions()
            {
                MaxDegreeOfParallelism = 5
            };
            IList<QueryInfo> Querylist = new List<QueryInfo>();
            int count = 0;
            foreach (var query in queryList)
            {
                QueryInfo queryInfo = new QueryInfo();
                queryInfo.id = count++;
                queryInfo.query = query;
                Querylist.Add(queryInfo);
            }
            Parallel.ForEach(Querylist, options, query =>
            {
                var OpenConnwatch = new System.Diagnostics.Stopwatch();
                OpenConnwatch.Start();
                var RunQuerywatch = new System.Diagnostics.Stopwatch();
                var CloseConnwatch = new System.Diagnostics.Stopwatch();
                var connection = new MdxConnection(connectionString);
                using (connection)
                {
                    connection.Open();
                    OpenConnwatch.Stop();
                    RunQuerywatch.Start();
                    DataTable td = new DataTable();
                    using (var command = connection.CreateCommand())
                    {
                        command.CommandText = query.query;
                        using (var dataAdapter = new MdxDataAdapter())
                        {
                            dataAdapter.SelectCommand = command;
                            dataAdapter.Fill(td);
                        }
                    }
                    td.ExtendedProperties.Add("query", query.query);
                    td.ExtendedProperties.Add("id", query.id);
                    RawDataSet.Tables.Add(td);
                    RunQuerywatch.Stop();
                    CloseConnwatch.Start();
                    connection.Close();
                    CloseConnwatch.Stop();
                }

                Log.LogMessage("time Taken To open Connection: " + OpenConnwatch.ElapsedMilliseconds + "ms for query:" + query.id);
                Log.LogMessage("time Taken To run query: " + RunQuerywatch.ElapsedMilliseconds + "ms for query:" + query.id);
                Log.LogMessage("time Taken To Close Connection: " + CloseConnwatch.ElapsedMilliseconds + "ms for query:" + query.id);
            });

            for (int i = 0; i < queryList.Count; i++)
            {
                foreach (DataTable td in RawDataSet.Tables)
                {
                    if (Convert.ToInt32(td.ExtendedProperties["id"]) == i)
                    {
                        DataTable tn = td.Copy();
                        tn.TableName = "table" + i;
                        FinalDataSet.Tables.Add(tn);
                    }
                }
            }
            return FinalDataSet;
        }
    }
}
