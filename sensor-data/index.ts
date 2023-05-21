import { Context, HttpRequest } from '@azure/functions';
import { getMostRecentStatus, saveMeasurement, Measurement, sendAlertEmail, sendAllIsGoodEmail } from './service';

interface HttpResponse {
    status?: number,
    body?: string
}

export default async function sensorData(ctx: Context, req: HttpRequest): Promise<HttpResponse> {
    const sensorData: Measurement = req.body;
    switch (sensorData.status) {
        case 'OK':
            const mostRecentStatus = await getMostRecentStatus();
            if (mostRecentStatus === 'ALERT') {
                await sendAllIsGoodEmail(sensorData.measurement);
            }
            break;
        case 'ALERT':
            await sendAlertEmail(sensorData.measurement);
            break;
    }
    await saveMeasurement(sensorData);
    return { body: req.body };
};
