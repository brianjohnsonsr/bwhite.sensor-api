import { Measurement, MeasurementModel, NotificationModel, NotificationType } from '../cosmos';
import { differenceInHours } from 'date-fns';
import { EmailClient, EmailMessage } from '@azure/communication-email';

const email = new EmailClient(process.env.AZURE_COMMS_CONN_STRING);

export async function getMostRecentStatus() {
    const measurement = await MeasurementModel.findOne().sort('-createdAt');
    return measurement?.status || 'UNKNOWN';
}

export async function getMostRecentNotificationTime(type: NotificationType) {
    const notification = await NotificationModel.findOne({ type }).sort('-createdAt');
    return notification?.sentAt || new Date('2000-01-01');
}

export async function saveMeasurement(input: Measurement) {
    const measurement = await MeasurementModel.create(input);
    return measurement;
}

export async function sendAlertEmail(measurement: number) {
    const message: EmailMessage = {
        senderAddress: process.env.AZURE_COMMS_FROM_EMAIL,
        content: {
            subject: 'Water Pressure Below Threshold',
            plainText: `Water pressure is low; please take action.\nMeasurement: ${measurement} psi`,
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
    // only send if most recent alert message is > some time
    if (differenceInHours(new Date(), await getMostRecentNotificationTime('BELOW_THRESHOLD')) > 8) {
        await email.beginSend(message);
        await NotificationModel.create({ type: 'BELOW_THRESHOLD', recipients: message.recipients.to.map(x => x.address) });
    }
}

export async function sendAllIsGoodEmail(measurement: number) {
    const message: EmailMessage = {
        senderAddress: process.env.AZURE_COMMS_FROM_EMAIL,
        content: {
            subject: 'Water Pressure Normal',
            plainText: `Water pressure is back to normal.\nMeasurement: ${measurement} psi`,
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
    // only sent if an alarm message is more recent than an all-good message
    const lastAlertTime = await getMostRecentNotificationTime('BELOW_THRESHOLD');
    const lastAllGoodTime = await getMostRecentNotificationTime('BACK_TO_NORMAL');
    if (lastAlertTime > lastAllGoodTime) {
        await email.beginSend(message);
        await NotificationModel.create({ type: 'BACK_TO_NORMAL', recipients: message.recipients.to.map(x => x.address) });
    }
}

export { Measurement, Notification } from '../cosmos';
