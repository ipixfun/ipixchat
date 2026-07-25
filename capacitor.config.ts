import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.ipix.chat',
  appName: 'ipixchat',
  webDir: 'public',
  server: {
    url: 'https://sukachub.my.id',
    cleartext: true
  }
};

export default config;