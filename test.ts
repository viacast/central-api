import { CentralServiceType } from './src/typings';
import { CentralApi } from './src';

const api = new CentralApi({
  host: 'localhost',
});

api.authLogin('8742', 'tstrt12').then(async () => {
  api.socketConnect(
    async () => {
      console.log('socket connected');
      // api.deviceOnUpdateConfig(info => {
      //   console.log(info);
      // });
      api
        .deviceUpdateServiceOperationModes([
          {
            operationMode: 'livecast',
            displayName: 'Livecast',
            type: CentralServiceType.FEED,
            configLayout: '',
          },
          {
            operationMode: 'decoder-dvb',
            displayName: 'Decoder DVB',
            type: CentralServiceType.OUTPUT,
            configLayout: '',
          },
        ])
        .then(console.log);
    },
    error => {
      console.log('connection error:', error);
    },
  );
});
