import { Context, Timer } from '@azure/functions';
import { getMostRecentMeasurement, getMeasurementAgeInHours, sendSensorOfflineEmail } from './service';

export default async function (ctx: Context, timer: Timer): Promise<void> {
    const measurement = await getMostRecentMeasurement();
    const ageInHours = getMeasurementAgeInHours(measurement);
    if (ageInHours > 2) {
        await sendSensorOfflineEmail(ageInHours);
    }

    // TODO: delete old measurement records
    // 1. Get a count of records < expiry time to ensure at least 10 records remains
    // 2. If > 10 records would remain, remove all records > expiry time
    // Repeat for notification records
};
