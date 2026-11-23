
namespace rpgtravel {


    public class ObjectInstance
    {
        public int? id {get; set; }
        public int expedition_id { get; set; }
        public int template_id { get; set; }
        public int quantity { get; set; }
        public decimal modifier { get; set; }
        public string notes { get; set; }
        public string? template_name { get; set; }
        public decimal? gc { get; set; }
        public decimal? weight { get; set; }
        public string? object_type { get; set; }
        public decimal? total_GC {get; set;}
        public int? cycle_number {get; set;}
    }

}

