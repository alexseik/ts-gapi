import GoogleAuthService from '../google-auth.service';
jest.mock('../utils');
import { loadScript } from '../utils';

const originalLog = console.log;
const originalError = console.error;

describe('GoogleAuthService', () => {
  let googleAuthService: GoogleAuthService;
  let clientConfig;
  let gapi;

  beforeEach(() => {
    clientConfig = {
      apiKey: '<YOUR_API_KEY>',
      clientId: '<YOUR_CLIENT_ID>.apps.googleusercontent.com',
      discoveryDocs: ['https://sheets.googleapis.com/$discovery/rest?version=v4'],
      // see all available scopes here: https://developers.google.com/identity/protocols/googlescopes'
      scope: 'https://www.googleapis.com/auth/spreadsheets',

      // works only with `ux_mode: "prompt"`
      refreshToken: true
    };
    googleAuthService = new GoogleAuthService(clientConfig);
    (loadScript as jest.Mock).mockImplementation(() => Promise.resolve());
    gapi = {
      load: jest.fn((libraries, cb) => cb()),
      client: {
        init: jest.fn(() => Promise.resolve())
      },
      auth: {},
      auth2: {
        getAuthInstance: jest.fn(() => ({}))
      }
    };
    (window as any).gapi = gapi;
  });

  describe('resolveGapiClient', () => {
    test('should exist', () => {
      expect(googleAuthService.resolveGapiClient).toBeDefined();
    });

    test('should throws errors if gapi is not loaded', async () => {
      delete (window as any).gapi;
      console.error = jest.fn();
      try {
        await googleAuthService.resolveGapiClient();
      } catch (error) {
        expect(error).toEqual(new Error('Failed to load gapi!'));
      }

      expect(console.error).toBeCalled();
      expect((console.error as jest.Mock).mock.calls.length).toBe(1);
      expect(console.error as jest.Mock).toHaveBeenCalledWith('Failed to load gapi!');

      console.error = originalError;
    });

    test("should return previous gapi object if it's already initialized", async () => {
      const response = await googleAuthService.resolveGapiClient();

      expect(response).toEqual(gapi);
    });

    test('should call gapi.load and gapi.client.init to initialize if it is not initialized', async () => {
      console.log = jest.fn();
      delete gapi.auth;
      await googleAuthService.resolveGapiClient();

      expect(gapi.load.mock.calls[0][0]).toBe('client:auth2');
      expect(gapi.client.init).toBeCalledWith(clientConfig);
      console.log = originalLog;
      delete (window as any).gapi;
    });

    test('should throw errors if gapi.client.init fail', async () => {
      console.error = jest.fn();
      delete gapi.auth;
      gapi.client.init = jest.fn(() =>
        Promise.reject({
          error: {
            message: 'test error',
            status: '400',
            code: 400
          }
        })
      );

      let errorTest;
      try {
        await googleAuthService.resolveGapiClient();
      } catch (error) {
        errorTest = error;
      }
      expect(errorTest).toBeDefined();
      console.error = originalError;
    });

    test('should only throw error if error is not standard', async () => {
      console.error = jest.fn();
      delete gapi.auth;
      gapi.client.init = jest.fn(() => Promise.reject('A not standard error'));
      let errorTest;
      try {
        await googleAuthService.resolveGapiClient();
      } catch (error) {
        errorTest = error;
      }

      expect(errorTest).toBeDefined();
      expect(console.error).not.toBeCalled();
      console.error = originalError;
    });

    test('should initialize auth2 instance', async () => {
      console.log = jest.fn();
      delete gapi.auth;
      expect(googleAuthService.authInstance).not.toBeDefined();

      await googleAuthService.resolveGapiClient();

      expect(googleAuthService.authInstance).toBeDefined();

      console.log = originalLog;
    });
  });

  describe('login', () => {
    beforeEach(() => {
      googleAuthService.authInstance = {
        signIn: jest.fn(() => Promise.resolve())
      };
    });
    test('should exist', () => {
      expect(googleAuthService.login).toBeDefined();
    });

    test('should return a promise', () => {
      return expect(googleAuthService.login()).resolves.toBe(undefined);
    });

    test('should call authInstance.signIn method', async () => {
      await googleAuthService.login();
      expect(googleAuthService.authInstance.signIn).toBeCalled();
    });
  });
});
