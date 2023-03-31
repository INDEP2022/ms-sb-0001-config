import { Column, Entity, PrimaryColumn } from "typeorm";
@Entity("cat_motivosrev", { schema: "sera" })
export class CatReasonsrevEntity {
  @PrimaryColumn({
    type: "numeric",
    name: "id_motivo",
  })
  reasonId: number;

  @Column({
    type: "character varying",
    name: "estatus_inicial",
    length: "3",
  })
  statusInitial: string;

  @Column({
    type: "character varying",
    name: "descripcion_motivo",
    length: "80",
  })
  descriptionReason: string;

  @Column({
    type: "character varying",
    name: "tipo_bien",
    length: "1",
  })
  goodType: string;

  @Column({
    type: "character varying",
    name: "estatus_rev",
    length: "3",
  })
  statusRev: string;

  @Column({
    type: "character varying",
    name: "area_responsable",
    length: "50",
  })
  areaResponsible: string;

  @Column({
    type: "character varying",
    name: "estatus_fin",
    length: "3",
  })
  statusEnd: string;

  @Column({
    type: "character varying",
    name: "pantalla",
    length: "80",
  })
  screen: string;

  @Column({
    type: "character varying",
    name: "parametro",
    length: "30",
  })
  parameter: string;

  @Column({
    type: "character varying",
    name: "nb_origen",
  })
  nbOrigin: string;
}
