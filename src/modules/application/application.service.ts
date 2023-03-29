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
        let vQuery: any, //V_QUERY
            vQuery2: any, //V_QUERY2
            vQuery3: any, //V_QUERY3
            direc: string, //DIREC
            responsable: string = 'RESPONSABLE_', //RESPONSABLE
            contador: number, //CONTADOR
            salida: any, //SALIDA
            areaResp: string, //AREA_RESP
            respon: string, //RESPON
            existe: string, //EXISTE
            columnas: string, //COLUMNAS
            valores: string, //VALORES
            motCount: number, //MOT_COUNT
            estatusIIni: string = 'AVA', //ESTATUS_INI
            noBienRe: number; //NO_BIEN_RE

        try {
            if (actionIn == "I") {

                const qs = `SELECT NO_BIEN FROM SERA.BIENES_ESTATUSREV
                            WHERE NO_BIEN = ${goodInNumber}
                            AND TIPO_BIEN = ${direc}
                            AND ESTATUS_INICIAL = 'AVA'
                            AND ID_EVENTO = ${eventInId}`;

                // excute query
                noBienRe = await this.entity.query(qs);

                if (noBienRe == null) {
                    const qs = `INSERT INTO SERA.BIENES_ESTATUSREV
                                (NO_BIEN, TIPO_BIEN, ID_EVENTO, ESTATUS_INICIAL, ID_EVENTO)
                                VALUES (${goodInNumber}, '${direc}', '${eventInId}', 'AVA', '${reasonsIn}')`;

                    // exceute query
                    await this.entity.query(qs);
                }

                vQuery2 = await this.entity.query(`SELECT COUNT( DISTINCT(UPPER(AREA_RESPONSABLE))) AS C FROM SERA.CAT_MOTIVOSREV WHERE ID_MOTIVO IN ('${reasonsInNumber}')`);

                // OPEN salida FOR vQuery2 ;
                for (let index = 0; index < vQuery2[0]?.C; index++) {
                    // salida;
                    motCount++;
                }

                vQuery = await this.entity.query(`SELECT DISTINCT(UPPER(AREA_RESPONSABLE)) AREA FROM SERA.CAT_MOTIVOSREV WHERE ID_MOTIVO IN ('${reasonsInNumber}') ORDER BY AREA ASC`);

                // OPEN salida FOR vQuery;
                for (let index = 0; index < vQuery[0]?.AREA; index++) {
                    // salida;
                    contador++;

                    const qs = `SELECT NO_BIEN
                                FROM SERA.RESPONSABLES_ATENCION
                                WHERE NO_BIEN = ${goodInNumber}
                                AND ESTATUS_INICIAL = 'AVA' `;

                    // excute query
                    existe = await this.entity.query(qs);

                    if (existe == null) {
                        if (contador <= motCount) {
                            columnas = columnas + ", ";
                            valores = valores + ", ";
                        }
                        columnas = columnas + " " + responsable + " " + contador;
                        valores = valores + " " + areaResp;
                    }
                }

                if (columnas != null && valores != null) {
                    vQuery3 = `INSERT INTO SERA.RESPONSABLES_ATENCION (NO_BIEN,ESTATUS_INICIAL, ID_EVENTO'${columnas}') 
                    VALUES( '${goodInNumber}','${estatusIIni}','${eventInId}${valores}')`;

                    // excute query
                    await this.entity.query(vQuery3);

                    // PA_SEPARA_MOTIVOS
                    await this.paSeparaMotivos(goodInNumber, eventInId);
                }
            } else if (actionIn == "D") {
                await this.entity.query(`DELETE FROM SERA.BIENES_ESTATUSREV WHERE NO_BIEN = ${goodInNumber}
                                    AND TIPO_BIEN= ${direc}
                                    AND ESTATUS_INICIAL = 'AVA'
                                    AND ID_EVENTO = ${eventInId}`);

                await this.entity.query(`DELETE FROM SERA.RESPONSABLES_ATENCION WHERE NO_BIEN = ${goodInNumber}
                                    AND ESTATUS_INICIAL ='AVA'
                                    AND ID_EVENTO = ${eventInId}`);
            }
            return {
                statusCode: HttpStatus.OK,
                message: 'OK'
            };
        } catch (e) {
            return {
                statusCode: 500,
                message: e
            };
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