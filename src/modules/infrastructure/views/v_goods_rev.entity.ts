
import { ViewColumn, ViewEntity } from "typeorm";

@ViewEntity("v_bienes_rev",{schema:"sera"})
export class VGoodsRevEntity{

    @ViewColumn({name:"no_bien"})
    goodNumber: number;
    
    @ViewColumn({name:"id_evento"})
    idEvent: number;
    
    @ViewColumn({name:"estatus"})
    status: string;
    
    @ViewColumn({name:"responsable"})
    responsible: string;
    
    @ViewColumn({name:"motivos"})
    moves:string;
}
