import { Injectable, HttpStatus, HttpException } from "@nestjs/common"; 
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { AssetsStatusrevEntity } from "../../entities/assets-statusrev.entity";


@Injectable()
export class ApplicationService {

    constructor(
        @InjectRepository(AssetsStatusrevEntity) private repository: Repository<AssetsStatusrevEntity>,
    ){

    }
    async insertMotivosRev(goodInNumber: number, eventInId: number, reasonsIn: string, reasonsInNumber: string, actionIn: string) {

        let v_responsable : any,
        v_motivos : any,
        v_estatus: any,
        v_tipo_bien : any,
        v_id_evento : any,
        v_descripcion_motivo: any,
        v_tam_resp : number,
        v_act_motivosrev: string,
        v_subindice : number = 0,
        v_subindice_2 : number = 0,
        v_valor : number = 0,
        v_valresp : number,
        v_palabra : string,
        v_cadena : string,
        v_palresp : string


        try {
            
            const CUR_BIENES_REV = this.repository.query(
                `SELECT ESTATUS, RESPONSABLE, MOTIVOS, TIPO_BIEN, ID_EVENTO, LENGTH(RESPONSABLE) TAM_RESP
                FROM V_BIENES_REV 
                WHERE NO_BIEN = P_NO_BIEN
                    AND ID_EVENTO = P_ID_EVENTO
                ORDER BY TAM_RESP;`
                )
            
            const CUR_DESCMOT = this.repository.query(
                `
                CURSOR CUR_DESCMOT(P_RESPONSABLE IN VARCHAR, P_ESTATUS IN VARCHAR, P_TIPO_BIEN IN VARCHAR) IS
                SELECT DESCRIPCION_MOTIVO
                  FROM CAT_MOTIVOSREV 
                 WHERE AREA_RESPONSABLE = P_RESPONSABLE 
                   AND ESTATUS_INICIAL = P_ESTATUS 
                   AND TIPO_BIEN = P_TIPO_BIEN;
                `
            )
            
            const dir = this.repository.createQueryBuilder('COMER_EVENTOS')
                .select('direccion')
                .where('id_evento  = : id_evento', {id_evento:v_id_evento})
            
        
        } catch (error) {
            
        }

    }

}
