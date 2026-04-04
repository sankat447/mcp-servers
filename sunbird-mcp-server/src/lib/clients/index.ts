/**
 * Singleton client instances used across the application.
 *
 * Import from here rather than constructing clients manually so the
 * codebase shares a single Axios/cache instance per service.
 */

export { BaseClient } from './base-client.js';
export { DcTrackClient } from './dctrack.client.js';
export { PowerIQClient } from './poweriq.client.js';

import { DcTrackClient } from './dctrack.client.js';
import { PowerIQClient } from './poweriq.client.js';

export const dctrackClient = new DcTrackClient();
export const poweriqClient = new PowerIQClient();
