using System;
using System.Xml;

class Program
{
    static void Main()
    {
        XmlDocument doc = new XmlDocument();
        doc.Load("tesst.xml");

        XmlNamespaceManager nsmgr = new XmlNamespaceManager(doc.NameTable);

        // More specific XPath:
        // 1. Find LinearLayout under ListView
        // 2. Get the TextView with index="1" under that specific LinearLayout
        string xpath = "//node[@class='android.widget.ListView']" +
                      "/node[@class='android.widget.LinearLayout']" +
                      "/node[@index='1' and @class='android.widget.TextView']/@text";

        XmlNode node = doc.SelectSingleNode(xpath, nsmgr);
        
        if (node != null)
        {
            Console.WriteLine($"Found value: {node.Value}");
        }
        else
        {
            Console.WriteLine("Node not found");
        }
    }
}
