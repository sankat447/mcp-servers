import { z } from 'zod';

export const getRackSummarySchema = z
  .object({
    cabinetId: z.number().optional(),
    cabinetName: z.string().optional(),
  })
  .refine((d) => d.cabinetId || d.cabinetName, {
    message: 'Either cabinetId or cabinetName must be provided',
  });

export const findCapacitySchema = z.object({
  requiredU: z.number().describe('Required rack units'),
  requiredPowerKw: z.number().describe('Required power in kW'),
  requiredPorts: z.number().optional(),
  locationId: z.number().optional(),
  contiguous: z.boolean().default(true),
});

export const getHealthStatusSchema = z.object({
  locationId: z.number().optional(),
  includeAlerts: z.boolean().default(true),
  includePUE: z.boolean().default(true),
});

export const identifyGhostServersSchema = z.object({
  locationId: z.number().optional(),
  powerThresholdWatts: z.number().default(10),
});

export const getPowerChainSchema = z.object({
  itemId: z.number(),
});

export const thermalAnalysisSchema = z.object({
  locationId: z.number().optional(),
  cabinetId: z.number().optional(),
  includeRecommendations: z.boolean().default(true),
});
