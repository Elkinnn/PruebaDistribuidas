import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { HospitalModel } from "./hospital.model";
import { EspecialidadModel } from "./especialidad.model";

@Entity("hospitalespecialidad")
export class HospitalEspecialidadModel {
    @PrimaryGeneratedColumn()
    id!: number;

    @ManyToOne(() => HospitalModel, (hospital) => hospital.id, { onDelete: "CASCADE" })
    @JoinColumn({ name: "hospitalId" })
    hospital!: HospitalModel;

    @Column({ type: "int" })
    hospitalId!: number;

    @ManyToOne(() => EspecialidadModel, (especialidad) => especialidad.id, { onDelete: "CASCADE" })
    @JoinColumn({ name: "especialidadId" })
    especialidad!: EspecialidadModel;

    @Column({ type: "int" })
    especialidadId!: number;
}
