import { Injectable, HttpStatus, HttpException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { AssetsStatusrevEntity } from "../infrastructure/entities/assets-statusrev.entity";


@Injectable()
export class ApplicationService {

    constructor(
        @InjectRepository(AssetsStatusrevEntity) private Repository: Repository<AssetsStatusrevEntity>,

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
     * @returns {Promise<any>}
     */
    async insertMotivosRev(goodInNumber: number, eventInId: number, reasonsIn: string, reasonsInNumber: string, actionIn: string): Promise<any> {
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
            motCount: number = 1, //MOT_COUNT
            estatusIni: string = 'AVA', //ESTATUS_INI
            noBienRe: number; //NO_BIEN_RE

        try {
            const qb = this.Repository.createQueryBuilder('comer_eventos')
                .select('comer_eventos.direccion')
                .where('comer_eventos.id_evento = :id_evento', { id_evento: eventInId });

            direc = await qb.getRawOne();

            if (actionIn == "I") {

                const qbSelectNoBienRe = this.Repository.createQueryBuilder('sera.buenes_estatusrev')
                    .select('sera.buenes_estatusrev.no_bien')
                    .where('sera.buenes_estatusrev.no_bien = :no_bien', { no_bien: goodInNumber })
                    .andWhere('sera.buenes_estatusrev.tipo_bien = :tipo_bien', { tipo_bien: direc })
                    .andWhere('sera.buenes_estatusrev.estatus_inicial = :tipo_bien', { tipo_bien: direc })
                    .andWhere('sera.buenes_estatusrev.estatus_inicial = :estatus_inicial', { estatus_inicial: estatusIni })
                    .andWhere('sera.buenes_estatusrev.id_evento = :id_evento', { id_evento: eventInId });

                // excute query
                noBienRe = await qbSelectNoBienRe.getRawOne();

                if (noBienRe == null) {
                    const qbInsertNoBienRe = this.Repository.createQueryBuilder('sera.buenes_estatusrev')
                        .insert()
                        .into('sera.buenes_estatusrev')
                        .values([
                            { no_bien: goodInNumber, tipo_bien: direc, id_evento: eventInId, estatus_inicial: estatusIni, motivos: reasonsIn }
                        ]);

                    // excute query
                    await qbInsertNoBienRe.execute();
                }

                const qbSelectvQuery2 = this.Repository.createQueryBuilder('sera.cat_motivosrev')
                    .select('sera.cat_motivosrev.area_responsable')
                    .where('sera.cat_motivosrev.id_motivo IN (:id_motivo)', { id_motivo: reasonsInNumber });

                vQuery2 = await qbSelectvQuery2.getCount();

                // OPEN salida FOR vQuery2 ;
                for (let index = 0; index < vQuery2; index++) {
                    // salida;
                    motCount++;
                }

                const qbSelectvQuery = this.Repository.createQueryBuilder('sera.cat_motivosrev')
                    .select('sera.cat_motivosrev.area_responsable')
                    .where('sera.cat_motivosrev.id_motivo IN (:id_motivo)', { id_motivo: reasonsInNumber })
                    .orderBy('sera.cat_motivosrev.area_responsable', 'ASC');

                vQuery = await qbSelectvQuery.execute();

                let vQueryCount = await qbSelectvQuery.getCount();

                // OPEN salida FOR vQuery;
                for (let index = 0; index < vQueryCount; index++) {
                    // salida;
                    contador++;

                    const qsSelectExiste = this.Repository.createQueryBuilder('sera.responsables_atencion')
                        .select('sera.responsables_atencion.no_bien')
                        .where('sera.responsables_atencion.no_bien = :no_bien', { no_bien: goodInNumber })
                        .andWhere('sera.responsables_atencion.estatus_inicial = :estatus_inicial', { estatus_inicial: estatusIni });

                    // excute query
                    existe = await qsSelectExiste.getRawOne();


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
                    vQuery3 = `INSERT INTO SERA.RESPONSABLES_ATENCION (NO_BIEN,ESTATUS_INICIAL, ID_EVENTO, '${columnas}')
                    VALUES( '${goodInNumber}','${estatusIni}','${eventInId}', ${valores}')`;

                    // excute query
                    await this.Repository.query(vQuery3);

                    // PA_SEPARA_MOTIVOS
                    await this.paSeparaMotivos(goodInNumber, eventInId);
                }
            } else if (actionIn == "D") {
                const qbDelete1 = this.Repository.createQueryBuilder('sera.buenes_estatusrev')
                    .delete()
                    .where('sera.buenes_estatusrev.no_bien = :no_bien', { no_bien: goodInNumber })
                    .andWhere('sera.buenes_estatusrev.tipo_bien = :tipo_bien', { tipo_bien: direc })
                    .andWhere('sera.buenes_estatusrev.estatus_inicial = :estatus_inicial', { estatus_inicial: estatusIni })
                    .andWhere('sera.buenes_estatusrev.id_evento = :id_evento', { id_evento: eventInId });

                await qbDelete1.execute();

                const qbDelete2 = this.Repository.createQueryBuilder('sera.responsables_atencion')
                    .delete()
                    .where('sera.responsables_atencion.no_bien = :no_bien', { no_bien: goodInNumber })
                    .andWhere('sera.responsables_atencion.estatus_inicial = :estatus_inicial', { estatus_inicial: estatusIni })
                    .andWhere('sera.responsables_atencion.id_evento = :id_evento', { id_evento: eventInId });

                await qbDelete2.execute();
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