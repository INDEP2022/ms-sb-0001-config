import { Column, Entity, PrimaryColumn } from "typeorm";
@Entity("responsables_atencion", { schema: "sera" })
export class ResponsibleAttentionEntity {
  @PrimaryColumn({
    type: "numeric",
    name: "no_bien",

    precision: 10,
  })
  goodNumber: number;

  @PrimaryColumn({
    type: "numeric",
    name: "id_evento",

    precision: 10,
  })
  eventId: number;

  @PrimaryColumn({
    type: "character varying",
    name: "estatus_inicial",
    length: "5",
  })
  statusInitial: string;

  @Column({
    type: "character varying",
    name: "responsable_1",
    length: "50",
  })
  responsibleOne: string;

  @Column({
    type: "character varying",
    name: "responsable_2",
    length: "50",
  })
  responsibleTwo: string;

  @Column({
    type: "character varying",
    name: "responsable_3",
    length: "50",
  })
  responsibleThree: string;

  @Column({
    type: "character varying",
    name: "responsable_4",
    length: "50",
  })
  responsibleFour: string;

  @Column({
    type: "character varying",
    name: "responsable_5",
    length: "50",
  })
  responsiblefFive: string;

  @Column({
    type: "character varying",
    name: "responsable_6",
    length: "50",
  })
  responsibleSix: string;

  @Column({
    type: "character varying",
    name: "responsable_7",
    length: "50",
  })
  responsibleSeven: string;

  @Column({
    type: "character varying",
    name: "responsable_8",
    length: "50",
  })
  responsibleEight: string;

  @Column({
    type: "character varying",
    name: "responsable_9",
    length: "50",
  })
  responsibleNine: string;

  @Column({
    type: "character varying",
    name: "responsable_10",
    length: "50",
  })
  responsibleTen: string;

  @Column({
    type: "character varying",
    name: "nb_origen",
  })
  nbOrigin: string;
}
