/*
 * File Created for APP Inc
 * Project: app
 * User: ***
 * Date: 9/24/2021
 */

import createCache from '@emotion/cache';

export default function createEmotionCache() {
  return createCache({ key: 'css' });
}
