
using System.Xml.Schema;

namespace rpgtravel {


    public class Expedition
    {
        public int? id {get; set; }
        public string name { get; set; }

        public decimal? total_gold_cost { get; set; }
        public int? current_cycle_number { get; set; }
    }

}