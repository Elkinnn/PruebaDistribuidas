import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { MarcaModel } from "./marca.model";
import { ModeloModel } from "./modelo.model";
import { ColorModel } from "./color.model";

@Entity("vehiculos")
export class VehiculoModel {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column({ unique: true })
    placa!: string;

    @Column()
    chasis!: string;

    @Column()
    anio!: number; 

    @ManyToOne(() => MarcaModel, (marca) => marca.vehiculos)
    @JoinColumn({ name: "marca_id" }) 
    marca!: MarcaModel;

    @ManyToOne(() => ModeloModel, (modelo) => modelo.vehiculos)
    @JoinColumn({ name: "modelo_id" }) 
    modelo!: ModeloModel;

    @ManyToOne(() => ColorModel, (color) => color.vehiculos)
    @JoinColumn({ name: "color_id" }) 
    color!: ColorModel;
}
