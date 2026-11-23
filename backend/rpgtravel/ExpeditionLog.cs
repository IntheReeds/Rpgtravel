
namespace rpgtravel {


    public class ExpeditionLog
    {
        public int id {get; set; }
        public int expedition_id { get; set; }
        public string? stage_name { get; set; }
        public int cycle_days { get; set; }
        public string? log_text {get; set;}
    }

}