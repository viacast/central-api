import HttpClient from './src/HttpClient';

const client = new HttpClient({
  port: 4440,
  prefix: '/v1',
});

client.authLogin('admin', 'admin').then(async r => {
  console.log(await client.userMe());
});
