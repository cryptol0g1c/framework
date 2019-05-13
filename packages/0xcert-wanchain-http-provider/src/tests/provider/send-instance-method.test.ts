import { Spec } from '@hayspec/spec';
import { HttpProvider } from '../..';

const spec = new Spec<{
  provider: HttpProvider;
}>();

spec.before(async (stage) => {
  const provider = new HttpProvider({
    url: 'http://139.59.44.13:9000/node/5c9a341860626f3d2aad1dc0',
  });
  stage.set('provider', provider);
});

spec.test('returns block data', async (ctx) => {
  const provider = ctx.get('provider');
  const tx = '0x1f5b1b974c399a1c50a6035d05fe13235cc18f09fe8162349cf5d459b7e49a43';
  const res = await provider.post({
    method: 'eth_getTransactionByHash',
    params: [tx],
  });
  ctx.is(res.result.hash, tx);
});

export default spec;
