export const environment = {
  production: false,
  // Use the canonical backend hostname (matches production/staging):
  apiUrl: 'https://asem.aviconncorp.com/api/',  // new server path (test_project)
  // Alarm endpoints (alarmList/, alarmListDetail/, alarmTypeApi/, alarmapi/,
  // snapshot/, consumptionAlarms/, gateway-status/, meter-disconnections/).
  // Plain HTTP: the server's certificate is for asem.aviconncorp.com, not this
  // IP, so https:// is rejected by browsers. Over HTTP the login token is sent
  // unencrypted, and an HTTPS-hosted dashboard will block these calls as mixed
  // content. Switch to an https:// hostname once the server has one.
  alarmApiUrl: 'http://43.204.53.81/api/',
};

