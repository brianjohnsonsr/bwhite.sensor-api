import { index, prop, getModelForClass } from '@typegoose/typegoose';
 
export type MeasurementStatus = 'OK'|'WARN'|'ALERT'|'UNKNOWN';

@index({ createdAt: 1 })
export class Measurement {
  @prop({ required: true })
  public key: string;
 
  @prop({ required: true })
  public status: MeasurementStatus;

  @prop({ required: true })
  public measurement: number;

  @prop()
  public rssi: number

  public createdAt: Date;
  public updatedAt: Date;
}

export const MeasurementModel = getModelForClass(Measurement, { schemaOptions: { timestamps: true } });
