import { CentralServiceType } from './src/typings';
import { CentralApi } from './src';

const api = new CentralApi({
  host: 'localhost',
});

api.authLogin('0872', 'pSN72UsM4c6Eb2aS4sZB3Q').then(async r => {
  console.log('logged in', r);
  api.onUnauthorized(() => {
    console.log('unauthorized');
  });
  setTimeout(() => {
    api.deviceMe();
  }, 1000);
  // api.socketConnect(
  //   async () => {
  //     console.log('socket connected');
  //     // api.deviceOnUpdateConfig(info => {
  //     //   console.log(info);
  //     // });
  //     api
  //       .deviceUpdateServiceOperationModes([
  //         {
  //           operationMode: 'livecast',
  //           displayName: 'Livecast',
  //           type: CentralServiceType.FEED,
  //           configLayout: '',
  //         },
  //         {
  //           operationMode: 'decoder-dvb',
  //           displayName: 'Decoder DVB',
  //           type: CentralServiceType.OUTPUT,
  //           configLayout: '',
  //         },
  //       ])
  //       .then(console.log);
  //   },
  //   error => {
  //     console.log('connection error:', error);
  //   },
  // );
});
