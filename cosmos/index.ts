import * as mongoose from 'mongoose';

const dbOptions: mongoose.ConnectOptions = { dbName: 'water_pressure' };
mongoose.connect(process.env.AZURE_COSMOS_CONN_STRING, dbOptions)
  .then(() => console.log('mongoose connected!'))
  .catch(err => console.error(err));

export { Measurement, MeasurementModel, MeasurementStatus } from './measurement';
export { Notification, NotificationModel, NotificationType } from './notification';
