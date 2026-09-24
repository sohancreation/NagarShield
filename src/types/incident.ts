/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type IncidentType =
  | 'waterlogging'
  | 'fallen_tree'
  | 'electrical_wire'
  | 'open_manhole'
  | 'road_damage'
  | 'gas_leak'
  | 'fire_smoke'
  | 'traffic_gridlock'
  | 'other';

export type IncidentSeverity = 'low' | 'medium' | 'high' | 'critical';

export type IncidentStatus = 'reported' | 'investigating' | 'dispatched' | 'resolved';

export interface IncidentReport {
  id: string;
  type: IncidentType;
  severity: IncidentSeverity;
  title: string;
  description: string;
  division: string;
  zilla: string;
  upazila: string;
  landmark: string;
  lat: number;
  lon: number;
  waterDepthCm?: number;
  photoPreset?: string;
  status: IncidentStatus;
  upvotes: number;
  upvotedUserIds?: string[];
  reportedBy: {
    uid?: string;
    name: string;
    role?: string;
  };
  createdAt: string;
  updatedAt: string;
}
