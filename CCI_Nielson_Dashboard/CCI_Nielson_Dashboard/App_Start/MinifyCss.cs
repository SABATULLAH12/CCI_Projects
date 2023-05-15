using System;
using System.IO;

namespace CCI_Nielson_Dashboard.App_Start
{
    public class MinifyCss
    {
        /// <summary>
        /// Creates New File with
        /// </summary>
        /// <param name="FolderPath">Relative Folder Path</param>
        public MinifyCss(string FolderPath)
        {
            try
            {
                var minifier = new Microsoft.Ajax.Utilities.Minifier();
                foreach (string file in Directory.EnumerateFiles(FolderPath + "\\Css", "*.css"))
                {
                    string unMinifiedString = File.ReadAllText(file);
                    Microsoft.Ajax.Utilities.CssSettings settings = new Microsoft.Ajax.Utilities.CssSettings();
                    settings.CommentMode = Microsoft.Ajax.Utilities.CssComment.None;
                    var MinifiedString = minifier.MinifyStyleSheet(unMinifiedString, settings);
                    var Newpath = new FileInfo(file);
                    if (!Directory.Exists(FolderPath + "\\MinifiedCss"))
                    {
                        System.IO.Directory.CreateDirectory(FolderPath + "\\MinifiedCss");
                    }
                    string outFile = FolderPath + "\\MinifiedCss\\" + Newpath.Name.Replace("css", "min.css");
                    StreamWriter wrt = new StreamWriter(outFile);
                    wrt.Write(MinifiedString);
                    wrt.Close();
                }
            }
            catch
            {
                throw new NotImplementedException();
            }
        }
    }
}