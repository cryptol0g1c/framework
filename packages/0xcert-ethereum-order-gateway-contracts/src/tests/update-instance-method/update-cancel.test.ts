import { XcertUpdateProxyAbilities } from '@0xcert/ethereum-proxy-contracts/src/core/types';
import { XcertAbilities } from '@0xcert/ethereum-xcert-contracts/src/core/types';
import { Spec } from '@specron/spec';
import { OrderGatewayAbilities } from '../../core/types';
import * as common from '../helpers/common';

/**
 * Test definition.
 * ERC20: ZXC, BNB, OMG, BAT, GNT
 * ERC721: Cat, Dog, Fox, Bee, Ant, Ape, Pig
 */

interface Data {
  orderGateway?: any;
  updateProxy?: any;
  cat?: any;
  owner?: string;
  bob?: string;
  sara?: string;
  id1?: string;
  imprint1?: string;
  imprint2?: string;
  signatureTuple?: any;
  dataTuple?: any;
}

const spec = new Spec<Data>();

spec.beforeEach(async (ctx) => {
  const accounts = await ctx.web3.eth.getAccounts();
  ctx.set('owner', accounts[0]);
  ctx.set('bob', accounts[1]);
  ctx.set('sara', accounts[3]);
});

spec.beforeEach(async (ctx) => {
  ctx.set('id1', '1');
  ctx.set('imprint1', '0x1e205550c221490347e5e2393a02e94d284bbe9903f023ba098355b8d75974c8');
  ctx.set('imprint2', '0x5e20552dc271490347e5e2391b02e94d684bbe9903f023fa098355bed7597434');
});

/**
 * Cat
 * Jane owns: #1
 */
spec.beforeEach(async (ctx) => {
  const bob = ctx.get('bob');
  const owner = ctx.get('owner');
  const imprint1 = ctx.get('imprint1');
  const id = ctx.get('id1');
  const cat = await ctx.deploy({
    src: '@0xcert/ethereum-xcert-contracts/build/xcert-mock.json',
    contract: 'XcertMock',
    args: ['cat', 'CAT', 'http://0xcert.org/', '0xa65de9e6', ['0xbda0e852']],
  });
  await cat.instance.methods
  .create(bob, id, imprint1)
  .send({
    from: owner,
  });
  ctx.set('cat', cat);
});

spec.beforeEach(async (ctx) => {
  const updateProxy = await ctx.deploy({
    src: '@0xcert/ethereum-proxy-contracts/build/xcert-update-proxy.json',
    contract: 'XcertUpdateProxy',
  });
  ctx.set('updateProxy', updateProxy);
});

spec.beforeEach(async (ctx) => {
  const updateProxy = ctx.get('updateProxy');
  const owner = ctx.get('owner');
  const orderGateway = await ctx.deploy({
    src: './build/order-gateway.json',
    contract: 'OrderGateway',
  });
  await orderGateway.instance.methods.grantAbilities(owner, OrderGatewayAbilities.SET_PROXIES).send();
  await orderGateway.instance.methods.addProxy(updateProxy.receipt._address).send({ from: owner });
  ctx.set('orderGateway', orderGateway);
});

spec.beforeEach(async (ctx) => {
  const updateProxy = ctx.get('updateProxy');
  const orderGateway = ctx.get('orderGateway');
  const owner = ctx.get('owner');
  await updateProxy.instance.methods.grantAbilities(orderGateway.receipt._address, XcertUpdateProxyAbilities.EXECUTE).send({ from: owner });
});

spec.beforeEach(async (ctx) => {
  const orderGateway = ctx.get('orderGateway');
  const bob = ctx.get('bob');
  const cat = ctx.get('cat');
  const imprint2 = ctx.get('imprint2');
  const id = ctx.get('id1');
  const owner = ctx.get('owner');
  const updateProxy = ctx.get('updateProxy');

  const actions = [
    {
      kind: 2,
      proxy: 0,
      token: cat.receipt._address,
      param1: imprint2,
      to: '0x0000000000000000000000000000000000000000',
      value: id,
    },
  ];
  const orderData = {
    maker: owner,
    taker: bob,
    actions,
    seed: common.getCurrentTime(),
    expiration: common.getCurrentTime() + 600,
  };
  const orderDataTuple = ctx.tuple(orderData);
  const claim = await orderGateway.instance.methods.getOrderDataClaim(orderDataTuple).call();

  const signature = await ctx.web3.eth.sign(claim, owner);
  const signatureData = {
    r: signature.substr(0, 66),
    s: `0x${signature.substr(66, 64)}`,
    v: parseInt(`0x${signature.substr(130, 2)}`) + 27,
    kind: 0,
  };
  const signatureDataTuple = ctx.tuple(signatureData);

  await cat.instance.methods.grantAbilities(updateProxy.receipt._address, XcertAbilities.UPDATE_ASSET_IMPRINT).send({ from: owner });

  ctx.set('signatureTuple', signatureDataTuple);
  ctx.set('dataTuple', orderDataTuple);
});

spec.test('succeeds', async (ctx) => {
  const signatureTuple = ctx.get('signatureTuple');
  const dataTuple = ctx.get('dataTuple');
  const orderGateway = ctx.get('orderGateway');
  const owner = ctx.get('owner');
  const bob = ctx.get('bob');

  const logs = await orderGateway.instance.methods.cancel(dataTuple).send({ from: owner });
  ctx.not(logs.events.Cancel, undefined);
  await ctx.reverts(() => orderGateway.instance.methods.perform(dataTuple, signatureTuple).send({ from: bob }), '015007');
});

spec.test('throws when trying to cancel an already performed atomic swap', async (ctx) => {
  const signatureTuple = ctx.get('signatureTuple');
  const dataTuple = ctx.get('dataTuple');
  const orderGateway = ctx.get('orderGateway');
  const owner = ctx.get('owner');
  const bob = ctx.get('bob');

  await orderGateway.instance.methods.perform(dataTuple, signatureTuple).send({ from: bob });
  await ctx.reverts(() => orderGateway.instance.methods.cancel(dataTuple).send({ from: owner }), '015008');
});

spec.test('throws when a third party tries to cancel an atomic swap', async (ctx) => {
  const dataTuple = ctx.get('dataTuple');
  const orderGateway = ctx.get('orderGateway');
  const sara = ctx.get('sara');

  await ctx.reverts(() => orderGateway.instance.methods.cancel(dataTuple).send({ from: sara }), '015009');
});

export default spec;
