import Constants from 'expo-constants';
import { Platform } from 'react-native';

const PRODUCTION_API_BASE = 'https://petbuddy-production-b407.up.railway.app';
const DEFAULT_LOCAL_API_IP = '10.0.0.45';

function trimTrailingSlash(url: string) {
  return url.replace(/\/+$/, '');
}

export function getApiBase() {
  const configuredUrl = process.env.EXPO_PUBLIC_BACKEND_URL;
  if (configuredUrl) {
    return trimTrailingSlash(configuredUrl);
  }

  if (!__DEV__) {
    return PRODUCTION_API_BASE;
  }

  if (Platform.OS === 'web') {
    return 'http://localhost:8000';
  }

  const host =
    Constants.expoConfig?.hostUri ||
    (Constants as any).manifest?.debuggerHost ||
    (Constants as any).manifest2?.extra?.expoGo?.debuggerHost ||
    null;

  const isTunnel = host?.includes('.exp.direct') || host?.includes('exp.host');
  const configuredIp = process.env.EXPO_PUBLIC_API_IP;
  const ip = (!isTunnel && host) ? host.split(':')[0] : (configuredIp || DEFAULT_LOCAL_API_IP);
  return `http://${ip}:8000`;
}
