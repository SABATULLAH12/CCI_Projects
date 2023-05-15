using System;
using System.IO;

namespace CCI_KH_DSR
{
    public class MinifyJavascript
    {
        /// <summary>
        /// Creates New File with
        /// </summary>
        /// <param name="FolderPath">Relative Folder Path</param>
        public MinifyJavascript(string FolderPath)
        {
            try
            {
                var minifier = new Microsoft.Ajax.Utilities.Minifier();
                foreach (string file in Directory.EnumerateFiles(FolderPath, "*.js"))
                {
                    string unMinifiedString = File.ReadAllText(file);
                    var x = new Microsoft.Ajax.Utilities.CodeSettings();
                    x.MinifyCode = false;
                    var MinifiedString = minifier.MinifyJavaScript(unMinifiedString, x);
                    var Newpath = new FileInfo(file);
                    if (!Directory.Exists(FolderPath + "\\Minified"))
                    {
                        System.IO.Directory.CreateDirectory(FolderPath + "\\Minified");
                    }
                    string outFile = FolderPath + "\\Minified\\" + Newpath.Name.Replace("js", "min.js");
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