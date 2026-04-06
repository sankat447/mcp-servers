import { z } from 'zod';

export const listDatacentersSchema = z.object({});

export const listPDUsSchema = z.object({
  datacenterId: z.number().optional(),
  cabinetId: z.number().optional(),
  pageSize: z.number().default(1000),
});

export const getPDUSchema = z.object({
  pduId: z.number().describe('The unique identifier of the PDU'),
});

export const getPDUReadingsSchema = z.object({
  pduId: z.number(),
  includeOutlets: z.boolean().default(false),
});

export const listSensorsSchema = z.object({
  sensorType: z.enum(['temperature', 'humidity', 'airflow', 'pressure']).optional(),
  cabinetId: z.number().optional(),
  pageSize: z.number().default(1000),
});

export const getSensorReadingsSchema = z.object({
  sensorId: z.number(),
});

export const getPUESchema = z.object({
  datacenterId: z.number().optional(),
  startTime: z.string().optional(),
  endTime: z.string().optional(),
  resolution: z.enum(['hourly', 'daily', 'weekly', 'monthly']).default('hourly'),
});

export const listAlertsSchema = z.object({
  severity: z.enum(['critical', 'warning', 'info']).optional(),
  type: z.enum(['power', 'environmental', 'device', 'connectivity']).optional(),
  acknowledged: z.boolean().optional(),
  limit: z.number().default(1000),
});

export const listITDevicesSchema = z.object({
  cabinetId: z.number().optional(),
  pageSize: z.number().default(1000),
});

export const getOutletReadingsSchema = z.object({
  pduId: z.number(),
});
