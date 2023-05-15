using System;
using System.Globalization;
using System.Linq;
namespace Entities
{
    public static class CommonFunctions
    {

        public static string GenerateRandomString(int length)
        {
            var chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
            var random = new Random();
            var result = new string(
                Enumerable.Repeat(chars, Convert.ToInt32(length))
                          .Select(s => s[random.Next(s.Length)])
                          .ToArray());
            return result.ToString();

        }
        public static int GetWeekNumber()
        {
            DateTime dt = DateTime.ParseExact("", "MM dd yyyy", CultureInfo.InvariantCulture);
            return CultureInfo.CurrentCulture.Calendar.GetWeekOfYear(dt, CalendarWeekRule.FirstDay, DayOfWeek.Saturday);
        }
    }
}
