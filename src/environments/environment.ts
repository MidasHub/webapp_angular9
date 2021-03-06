// The file contents for the current environment will overwrite these during build.
// The build system defaults to the dev environment which uses `environment.ts`, but if you do
// `ng build --env=prod` then `environment.prod.ts` will be used instead.
// The list of which env maps to which file can be found in `.angular-cli.json`.

// `.env.ts` is generated by the `npm run env` command
import env from './.env';
//baseApiUrl: 'https://uat.tekcompay.com:9443',
export const environment = {
  production: false,
  version: env.midas_version + '-dev',
  fineractPlatformTenantId: 'default',  // For connecting to server running elsewhere update the tenant identifier
  baseApiUrl: JSON.parse(localStorage.getItem('midasServerURL')) ||'https://uat.tekcompay.com:9443',
  allowServerSwitch: env.allow_switching_backend_instance,
  apiProvider: '/midas/api',
  apiVersion: '/v1',
  serverUrl: '',
  GatewayApiUrl:  JSON.parse(localStorage.getItem('midasBillposServerURL')) ||'https://uat.tekcompay.com:8287',
  GatewayApiUrlPrefix: '/billPos',
  GatewayServerUrl: '',
  GatewayTenantId: 'default',
  oauth: {
    enabled: false,  // For connecting to Midas using OAuth2 Authentication change the value to true
    serverUrl: ''
  },
  defaultLanguage: 'vi-VN',
  supportedLanguages: [
    'en-US',
    'vi-VN'
  ],
  languagesName: {
    en: 'English',
    vi: 'Vietnamese',
  }
};

// Server URL
environment.serverUrl = `${environment.baseApiUrl}${environment.apiProvider}${environment.apiVersion}`;
environment.oauth.serverUrl = `${environment.baseApiUrl}${environment.apiProvider}`;
environment.GatewayServerUrl = `${environment.GatewayApiUrl}`;
