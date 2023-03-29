import { Injectable, HttpStatus, HttpException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { AssetsStatusrevEntity } from "../infrastructure/entities/assets-statusrev.entity";


@Injectable()
export class ApplicationService {

    constructor(
        @InjectRepository(AssetsStatusrevEntity) private entity: Repository<AssetsStatusrevEntity>,
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
        let V_QUERY: any,
            V_QUERY2: any,
            V_QUERY3: any,
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
                                VALUES (${goodInNumber}, '${DIREC}', '${eventInId}', 'AVA', '${reasonsIn}')`;

                    // exceute query
                    await this.entity.query(qs);
                }

                V_QUERY2 = await this.entity.query(`SELECT COUNT( DISTINCT(UPPER(AREA_RESPONSABLE))) AS C FROM SERA.CAT_MOTIVOSREV WHERE ID_MOTIVO IN ('${reasonsInNumber}')`);

                // OPEN SALIDA FOR V_QUERY2 ;
                for (let index = 0; index < V_QUERY2[0]?.C; index++) {
                    // SALIDA;
                    MOT_COUNT++;
                }

                V_QUERY = await this.entity.query(`SELECT DISTINCT(UPPER(AREA_RESPONSABLE)) AREA FROM SERA.CAT_MOTIVOSREV WHERE ID_MOTIVO IN ('${reasonsInNumber}') ORDER BY AREA ASC`);

                // OPEN SALIDA FOR V_QUERY;
                for (let index = 0; index < V_QUERY[0]?.AREA; index++) {
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
                await this.entity.query(`DELETE FROM SERA.BIENES_ESTATUSREV WHERE NO_BIEN = ${goodInNumber}
                                    AND TIPO_BIEN= ${DIREC}
                                    AND ESTATUS_INICIAL = 'AVA'
                                    AND ID_EVENTO = ${eventInId}`);

                await this.entity.query(`DELETE FROM SERA.RESPONSABLES_ATENCION WHERE NO_BIEN = ${goodInNumber}
                                    AND ESTATUS_INICIAL ='AVA'
                                    AND ID_EVENTO = ${eventInId}`);
            }
            return { message: RESPON };
        } catch (e) {
            console.log(e)
            return { message: e };
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