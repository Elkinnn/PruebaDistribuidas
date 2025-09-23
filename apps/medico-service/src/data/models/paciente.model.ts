import { Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn, JoinColumn } from "typeorm";
import { HospitalModel } from "./hospital.model";
import { CitaModel } from "./cita.model";

@Entity("pacientes")
export class PacienteModel {
    @PrimaryGeneratedColumn()
    id!: number;

    @ManyToOne(() => HospitalModel, (hospital) => hospital.pacientes, { onDelete: "CASCADE" })
    @JoinColumn({ name: "hospitalId" })
    hospital!: HospitalModel;

    @Column()
    hospitalId!: string;

    @Column()
    nombres!: string;

    @Column()
    apellidos!: string;

    @Column({ type: "date", nullable: true })
    fechaNacimiento!: Date | null;

    @Column({
        type: "enum",
        enum: ["MASCULINO", "FEMENINO", "OTRO"],
        nullable: true
    })
    sexo!: "MASCULINO" | "FEMENINO" | "OTRO" | null;

    @Column({ nullable: true })
    telefono!: string | null;

    @Column({ nullable: true })
    email!: string | null;

    @Column({ default: true })
    activo!: boolean;

    @OneToMany(() => CitaModel, (cita) => cita.paciente)
    citas!: CitaModel[];
}
