import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { VehiculoModel } from "./vehiculo.model";

@Entity("colores")
export class ColorModel {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column()
    name!: string;

    @OneToMany(() => VehiculoModel, (vehiculo) => vehiculo.marca)
    vehiculos!: VehiculoModel[];
}