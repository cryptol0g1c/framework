# Confirmed API

## Packages

```ts
import { GenericProvider } from '@0xcert/ethereum-generic-provider';

const provider = new GenericProvider({
  provider: window.ethereum,
  accountId: '',
  signMethod: SignMethod.EIP712,
});
provider.isSupported();
await provider.enable();
await provider.isEnabled();
await provider.queryContract({}); // eth_call
await provider.mutateContract({}); // eth_call
await provider.getBlock(); // eth_getBlockByNumber
await provider.getGasPrice(); // eth_gasPrice
await provider.getGasEstimation(); // eth_estimateGas
```
```ts
import { Mutation } from '@0xcert/ethereum-mutation';

const mutation = new Mutation(provider, txId);
mutation.on(MutationEvent.SUCCESS, handler);
mutation.on(MutationEvent.FAILURE, handler);
mutation.on(MutationEvent.ERROR, handler);
mutation.on(MutationEvent.CONFIRMATION, handler);
mutation.complete(); // promise which ends on SUCCESS
```
```ts
import { AssetLedger } from '@0xcert/ethereum-asset-ledger';

const ledger = await AssetLedger.deploy(provider, source);
const ledger = await AssetLedger.new(provider, ledgerId);

const ledger = new AssetLedger(provider, ledgerId);
ledger.platform;
ledger.id; // contract address
ledger.on(event, handler);
ledger.off(event, handler);
ledger.subscribe();
ledger.unsubscribe();
await ledger.getAbilities(accountId);
await ledger.getCapabilities();
await ledger.getInfo();
await ledger.getSupply();
await ledger.isEnabled();
await ledger.grantAbilities(accountId, abilities);
await ledger.revokeAbilities(accountId, abilities);
await ledger.setEnabled(state);
await ledger.transfer(to, assetid);
await ledger.create(assetId, imprint);
await ledger.approveAccount(tokenId, takerId); // ERC20 ERC721
await ledger.isAprovedAccount(takerId, tokenId); // ERC20 ERC721
await ledger.getAprovedAccount(tokenId); // ERC20 ERC721
```
```ts
import { ValueLedger } from '@0xcert/ethereum-value-ledger';

const ledger = await new ValueLedger(provider, ledgerId);
ledger.platform;
ledger.id; // contract address
ledger.on(event, handler);
ledger.off(event, handler);
ledger.subscribe();
ledger.unsubscribe();
await ledger.getInfo();
await ledger.getSupply();
await ledger.approveAccount(tokenId, takerId); // ERC20 ERC721
await ledger.isAprovedAccount(takerId, tokenId); // ERC20 ERC721
await ledger.getAprovedAccount(tokenId); // ERC20 ERC721
```
```ts
const order = {
  $schema: 'http...',
  $evidence: 'http...',
  id: '100',
  folderId: '0x...',
  makerId: '0x...',
  takerId: '0x...',
  actions: [],
  seed: 1234,
  expiration: 5678,
};
const asset = {
  $schema: 'http...',
  $evidence: 'http...',
  name: '',
  description: '',
  image: '',
};
```
```ts
import { OrderGateway } from '@0xcert/ethereum-order-gateway';

const gateway = new OrderGateway(context);
gateway.on(event, handler);
gateway.off(event, handler);
gateway.subscribe();
gateway.unsubscribe();
await gateway.claim(order); // signed claim (maker)
await gateway.cancel(order); // (maker)
await gateway.perform(order, signature); // (taker)
```
```ts
import { Cert } from '@0xcert/cert';

const cert = new Cert({ schema });
const imprints = await cert.notarize(data);
const imprints = await cert.disclose(defaultData, [ ...paths... ]);
const imprint = await cert.calculate(data, imprints);
const imprint = await cert.imprint(data);
```
```ts
import { MutationTracker } from '@0xcert/mutation-tracker';

const tracker = new MutationTracker(context);
tracker.on(event, handler);
tracker.off(event, handler);
tracker.add(transactionId, transactionId, ...);
tracker.check(transactionId);
tracker.remove(transactionId, transactionId, ...);
tracker.isRunning();
tracker.start();
tracker.stop();
tracker.clear();
```

# Structs


Asset JSON object:

```json
{
  "$schema": "",
  "$evidence": "",
  "name": "",
  "description": "",
  "image": ""
}
```

Asset evidence:

```js
const patsh = [
  ['books', 0, 'release', 'date'],
]
const json = {
  name: 'John',
  books: [
    {
      title: 'Start',
      release: {
        date: '',
      },
    },
  ],
};
const recipe = [
  {
    path: [],
    evidence: {
      imprints: [
        { index: 0, hash: '0x', key: 'name' },
        { index: 1, hash: '0x', key: 'book' },
        { index: 2, hash: '0x', key: 'books' },
      ],
      nodes: [
        { index: 0, hash: '0x' },
        { index: 1, hash: '0x' },
      ],
    },
  },
  {
    path: ['book'],
    evidence: {
      imprints: [
        { index: 0, hash: '0x', key: 'title' },
      ],
      nodes: [
        { index: 0, hash: '0x' },
      ],
    },
  },
  {
    path: ['books'],
    evidence: {
      imprints: [
        { index: 0, hash: '0x', key: 0 },
      ],
      nodes: [
        { index: 0, hash: '0x' },
      ],
    },
  },
  {
    path: ['books', 0],
    evidence: {
      imprints: [
        { index: 0, hash: '0x', key: 'title' },
      ],
      nodes: [
        { index: 0, hash: '0x' },
      ],
    },
  },
];
```









```ts
import { MetamaskProvider } from '@0xcert/ethereum-metamask-provider';
import { AssetLedger } from '@0xcert/ethereum-asset-ledger';
```
```ts
const provider = new MetamaskProvider({
  xcertTemplates: [
    { path: 'http://localhost:4444/tpls/default0.json', destroyable: true }
    { path: 'http://localhost:4444/tpls/default1.json', mutable: true }
  ],
});
```
```ts
const mutation = await AssetLedger.deploy({
  name: 'ZeroCert',
  symbol: 'CRT',
  capabilities: [
    AssetLedgerCapability.TOGGLE_TRANSFERS,
    AssetLedgerCapability.UPDATE_ASSET,
    AssetLedgerCapability.REVOKE_ASSET,
    AssetLedgerCapability.DESTROY_ASSET,
  ],
});
// OR
const mutation = await AssetLedger.deploy({
  name: 'ZeroCert',
  symbol: 'CRT',
  destroyable: true,
  mutable: true,
});
// OR
const mutation = await AssetLedger.deploy({
  name: 'ZeroCert',
  symbol: 'CRT',
  source: 'http://localhost:4444/tpls/default0.json',
});
// OR
const mutation = await AssetLedger.deploy({
  name: 'ZeroCert',
  symbol: 'CRT',
  source: '01010001001010001001...',
});
```
