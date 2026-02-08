import { MMKV } from 'react-native-mmkv';

/**
 * Local storage for non-sensitive data
 * Uses MMKV for fast, synchronous storage
 *
 * Use this for:
 * - User preferences
 * - Cache data
 * - Recent searches
 * - UI state
 *
 * DO NOT use for sensitive data like tokens or passwords!
 * For sensitive data, use secureStorage instead.
 */
const localStorage = new MMKV();

export default localStorage;
