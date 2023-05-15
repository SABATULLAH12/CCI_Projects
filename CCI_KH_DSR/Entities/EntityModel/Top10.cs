using System.Collections.Generic;

namespace Entities
{
    public class Top10Request
    {
        public IList<Top10Module> Module { get; set; }
        public string SelectedDate { get; set; }
        public string ExportsType { get; set; }
    }
    public class Top10Module
    {
        public string Name { get; set; }
        public IList<Top10Selection> Selection { get; set; }
    }

    public class Top10Selection
    {
        public string Name { get; set; }
        public string Parent { get; set; }

    }

    public class GainerLooserList
    {
        public string Name { get; set; }
        public double? Value { get; set; }
    }
}
