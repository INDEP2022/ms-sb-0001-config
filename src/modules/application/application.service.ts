import { Injectable, HttpStatus, HttpException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { PaginateQuery } from "nestjs-paginate";
import { CommonFilterService } from "src/shared/service/common-filter.service";
import { Repository } from "typeorm";



@Injectable()
export class ApplicationService {

    constructor(
        // @InjectRepository(VGoodsTrackerTmpEntity) private entity: Repository<VGoodsTrackerTmpEntity>,
        private commonFilterService: CommonFilterService
    ) { }
    /**
     * PROCEDURE "SERA"."SP_INSERTA_MOTIVOSREV"'
     *
     * @param {number} goodInNumber = NO_BIEN_IN
     * @param {number} eventInId = ID_EVENTO_IN
     * @param {string} reasonsIn = MOTIVOS_IN
     * @param {string} reasonsInNumber = NO_MOTIVOS_IN
     * @param {string} actionIn = ACCION_IN
     * @memberof ApplicationService
     */
    async insertMotivosRev(goodInNumber: number, eventInId: number, reasonsIn: string, reasonsInNumber: string, actionIn: string) {
        let V_QUERY: string,
            V_QUERY2: string,
            V_QUERY3: string,
            DIREC: string,
            RESPONSABLE: string = 'RESPONSABLE_',
            CONTADOR: number,
            SALIDA: any,
            AREA_RESP: string,
            RESPON: string,
            EXISTE: string,
            COLUMNAS: string,
            VALORES: string,
            MOT_COUNT: number,
            ESTATUS_INI: string = 'AVA',
            NO_BIEN_RE: number;

        try {
            if (actionIn == "I") {

                const qs = `SELECT NO_BIEN FROM SERA.BIENES_ESTATUSREV
                            WHERE NO_BIEN = ${goodInNumber}
                            AND TIPO_BIEN = ${DIREC}
                            AND ESTATUS_INICIAL = 'AVA'
                            AND ID_EVENTO = ${eventInId}`;

                // excute query
                NO_BIEN_RE = await this.entity.query(qs);

                if (NO_BIEN_RE == null) {
                    const qs = `INSERT INTO SERA.BIENES_ESTATUSREV
                                (NO_BIEN, TIPO_BIEN, ID_EVENTO, ESTATUS_INICIAL, ID_EVENTO)
                                VALUES (${goodInNumber}, ${DIREC}, ${eventInId}, 'AVA', ${reasonsIn})`;

                    // exceute query
                    await this.entity.query(qs);
                }

                V_QUERY2 = await this.entity.query(`SELECT COUNT( DISTINCT(UPPER(AREA_RESPONSABLE))) FROM SERA.CAT_MOTIVOSREV WHERE ID_MOTIVO IN ('${reasonsInNumber}')`);

                // OPEN SALIDA FOR V_QUERY2 ;
                for (let index = 0; index < array.length; index++) {
                    // SALIDA;
                    MOT_COUNT = SALIDA;
                }

                V_QUERY = await this.entity.query(`SELECT DISTINCT(UPPER(AREA_RESPONSABLE)) AREA FROM SERA.CAT_MOTIVOSREV WHERE ID_MOTIVO IN ('${reasonsInNumber}') ORDER BY AREA ASC`);

                // OPEN SALIDA FOR V_QUERY;
                for (let index = 0; index < array.length; index++) {
                    // SALIDA;
                    CONTADOR++;

                    const qs = `SELECT NO_BIEN
                                FROM SERA.RESPONSABLES_ATENCION
                                WHERE NO_BIEN = ${goodInNumber}
                                AND ESTATUS_INICIAL = 'AVA' `;

                    // excute query
                    EXISTE = await this.entity.query(qs);

                    if (EXISTE == null) {
                        if (CONTADOR <= MOT_COUNT) {
                            COLUMNAS = COLUMNAS + ", ";
                            VALORES = VALORES + ", ";
                        }
                        COLUMNAS = COLUMNAS + " " + RESPONSABLE + " " + CONTADOR;
                        VALORES = VALORES + " " + AREA_RESP;
                    }
                }

                if (COLUMNAS != null && VALORES != null) {
                    V_QUERY3 = `INSERT INTO SERA.RESPONSABLES_ATENCION (NO_BIEN,ESTATUS_INICIAL, ID_EVENTO'${COLUMNAS}')
                    VALUES( '${goodInNumber}','${ESTATUS_INI}','${eventInId}${VALORES}')`;

                    // excute query
                    await this.entity.query(V_QUERY3);

                    // PA_SEPARA_MOTIVOS
                    await this.paSeparaMotivos(goodInNumber, eventInId);
                }
            } else if (actionIn == "D") {
                await this.entity.query(`DELETE FROM SERA.BIENES_ESTATUSREV
                                        WHERE NO_BIEN = ${goodInNumber}
                                        AND TIPO_BIEN= ${DIREC}
                                        AND ESTATUS_INICIAL = 'AVA'
                                        AND ID_EVENTO = ${eventInId}`);

                await this.entity.query(`DELETE FROM SERA.RESPONSABLES_ATENCION
                                        WHERE NO_BIEN = ${goodInNumber}
                                        AND ESTATUS_INICIAL ='AVA'
                                        AND ID_EVENTO = ${eventInId}`);
            }

            return { message: RESPON };

        } catch (e) {
            console.log(e)
            throw new HttpException(e, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * PROCEDURE "SERA"."PA_SEPARA_MOTIVOS"
     *
     * @param {number} goodInNumber
     * @param {number} eventInId
     */
    async paSeparaMotivos(goodInNumber: number, eventInId: number) {
        throw new Error("Function not implemented.");
    }
}