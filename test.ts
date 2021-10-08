import { CentralApi } from './src';

const api = new CentralApi();

api.authLogin('6379', 'tstrt12').then(async () => {
  api.socketConnect(
    async () => {
      console.log('socket connected');
      api.deviceOnUpdateConfig(info => {
        console.log(info);
      });
    },
    error => {
      console.log('connection error:', error);
    },
  );
});
