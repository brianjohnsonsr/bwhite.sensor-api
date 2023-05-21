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
        senderAddress: 'DoNotReply@76e01699-3a30-4045-ad9e-7c997fe50d4c.azurecomm.net',
        content: {
            subject: 'Water Pressure Below Threshold',
            plainText: `Water pressure is low; please take action.\nMeasurement: ${measurement} psi`,
        },
        recipients: {
            to: [
                {
                    address: 'brian.sr.johnson@gmail.com',
                    displayName: 'Brian Johnson',
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
        senderAddress: 'DoNotReply@76e01699-3a30-4045-ad9e-7c997fe50d4c.azurecomm.net',
        content: {
            subject: 'Water Pressure Normal',
            plainText: `Water pressure is back to normal.\nMeasurement: ${measurement} psi`,
        },
        recipients: {
            to: [
                {
                    address: 'brian.sr.johnson@gmail.com',
                    displayName: 'Brian Johnson',
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
