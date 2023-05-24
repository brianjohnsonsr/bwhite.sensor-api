import { index, prop, getModelForClass } from '@typegoose/typegoose';

export type NotificationType = 'BACK_TO_NORMAL'|'BELOW_THRESHOLD'|'SENSOR_OFFLINE';

@index({ createdAt: 1 })
export class Notification {
  @prop({ required: true })
  public recipients: string[];

  @prop({ required: true })
  public type: NotificationType;

  @prop({ default: Date.now })
  public sentAt: Date;
}

export const NotificationModel = getModelForClass(Notification, { schemaOptions: { timestamps: true } });
