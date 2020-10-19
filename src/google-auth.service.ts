import { loadScript } from './utils';

const GAPI_URL = 'https://apis.google.com/js/api.js';

const LIBRARIES_TO_LOAD = 'client:auth2';

// TODO Type authInstance
// TODO Type clientConfig

export default class GoogleAuthService {
  authenticated: boolean;
  authInstance: any;
  offlineAccessCode: any;

  constructor(public clientConfig: any) {}

  // TODO type clientConfig
  // TODO rename to getGapiClient
  async resolveGapiClient() {
    await loadScript(GAPI_URL);
    const gapi = (window as any).gapi;
    if (!gapi) {
      const error = 'Failed to load gapi!';
      console.error(error);
      throw new Error(error);
    }
    if (!gapi.auth) {
      return new Promise((resolve, reject) => {
        gapi.load(LIBRARIES_TO_LOAD, async () => {
          try {
            await gapi.client.init(this.clientConfig);
            console.log('gapi client initialised.');
            this.authInstance = gapi.auth2.getAuthInstance();
            resolve(gapi);
          } catch (err) {
            if (err.error) {
              const error = err.error;
              console.error(
                'Failed to initialize gapi: %s (status=%s, code=%s)',
                error.message,
                error.status,
                error.code,
                err
              );
            }
            reject(err);
          }
        });
      });
    } else {
      return gapi;
    }
  }

  async login() {
    await this.resolveGapiClient();
    if (!this.authInstance) throw new Error('gapi not initialized');
    await this.authInstance.signIn();
  }
}
