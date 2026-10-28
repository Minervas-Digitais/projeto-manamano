import { SetMetadata } from '@nestjs/common';

export const SKIP_GLOBAL_THROTTLE_KEY = 'skipGlobalThrottle';

export const SkipGlobalThrottle = () => SetMetadata(SKIP_GLOBAL_THROTTLE_KEY, true);
