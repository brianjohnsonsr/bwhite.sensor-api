import { differenceInHours } from 'date-fns';
import { EmailClient, EmailMessage } from '@azure/communication-email';
import { Measurement, MeasurementModel } from '../cosmos';

const email = new EmailClient(process.env.AZURE_COMMS_CONN_STRING);

export async function getMostRecentMeasurement(): Promise<Measurement> {
    return await MeasurementModel.findOne().sort('-createdAt');
}

export function getMeasurementAgeInHours(measurement: Measurement): number {
    return differenceInHours(new Date(), measurement.createdAt);
}

export async function sendSensorOfflineEmail(hoursSinceLastCheckIn: number): Promise<void> {
    const message: EmailMessage = {
        senderAddress: process.env.AZURE_COMMS_FROM_EMAIL,
        content: {
            subject: 'Water Pressure Sensor Offline',
            plainText: `No data has been received from the sensor in over ${hoursSinceLastCheckIn} hours. Please check WiFi & power source.`,
        },
        recipients: {
            to: [
                {
                    address: process.env.AZURE_COMMS_TO_EMAIL,
                    displayName: process.env.AZURE_COMMS_TO_NAME,
                },
            ],
        },
    };
    await email.beginSend(message);
    // only send if most recent alert message is > some time
}