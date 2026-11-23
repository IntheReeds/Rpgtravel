export type resturant = {
    id : string;
    name : string;
    amenity : string;
    cuisine : string;
    openinghours : string;
};

export type objectInsertion = {

    name : string;
    gc : number;
    weight : number;
    object_type : string;

};

export type objectTemplate = {
    id : number ;
    name : string;
    gc : number;
    weight : number;
    object_type : string;

};

export type Expedition = {
    id : number ;
    name : string ;
    total_gold_cost : number | null ;
    current_cycle_number : number | null ;

};

export type objectInstance = {
    id : number | null;
    expedition_id : number;
    template_id : number;
    quantity : number;
    modifier : number;
    notes : string | null;
    template_name : string | null
    gc : number | null;
    weight : number | null;
    object_type : string | null;
    total_GC : number | null;
    cycle_number : number | null;

};

export type ActiveSupply = {
    template_id : number;
    expedition_id : number;
    quantity : number;
    ration_type : string ;
    name : string ;
    

};

export type ExpeditionLog = {
    id : number;
    expedition_id : number;
    stage_name : string;
    cycle_days : number;
    log_text : string;
    
    
};
