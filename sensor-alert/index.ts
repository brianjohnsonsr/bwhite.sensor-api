import { AzureFunction, Context, HttpRequest } from '@azure/functions';

interface HttpResponse {
    status?: number,
    body?: string
}

interface SensorData {
    key: string,
    status: 'OK'|'WARN'|'ALERT',
    psi: number
}

const sensorAlert: AzureFunction = async function (ctx: Context, req: HttpRequest): Promise<HttpResponse> {
    const data: SensorData = req.body;
    console.log(data);
    return { body: req.body };
};

export default sensorAlert;