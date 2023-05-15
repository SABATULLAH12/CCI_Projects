using Microsoft.VisualStudio.TestTools.UnitTesting;

namespace CCI_KH_DSR.Tests
{
    [TestClass]
    public class UnitTest1
    {
        [TestMethod]
        public void TestMethod1()
        {
            Assert.AreEqual(1, 1);
            throw new System.NotSupportedException();
        }
    }
}
