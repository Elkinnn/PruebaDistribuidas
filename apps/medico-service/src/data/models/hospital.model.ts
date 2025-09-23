import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { MedicoModel } from "./medico.model";
import { CitaModel } from "./cita.model";
import { PacienteModel } from "./paciente.model";

@Entity("hospitales")
export class HospitalModel {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column()
    nombre!: string;

    @Column()
    direccion!: string;

    @Column({ unique: true })
    telefono!: string;

    @Column()
    activo!: boolean;

    @OneToMany(() => MedicoModel, (medico) => medico.hospital)
    medicos!: MedicoModel[]

    @OneToMany(() => CitaModel, (cita) => cita.hospitalId)
    citas!: CitaModel[]

    @OneToMany(() => PacienteModel, (paciente) => paciente.hospitalId)
    pacientes!: PacienteModel[]
}