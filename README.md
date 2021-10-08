```sh
yarn add @viacast/central-api
```

```sh
npm i @viacast/central-api
```

```js
// import { CentralApi } from '@viacast/central-api';
const { CentralApi } = require('@viacast/central-api');

const api = new CentralApi({
  host: 'localhost',
  port: 4440,
  prefix: '/v1',
});

api.authLogin('key', 'password').then(async () => {
  const me = await api.userMe();
  console.log(me);
});
```
