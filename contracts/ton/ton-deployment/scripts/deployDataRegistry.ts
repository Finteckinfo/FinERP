import { toNano } from '@ton/core';
import { DataRegistry } from '../build/DataRegistry/DataRegistry_DataRegistry';
import { NetworkProvider } from '@ton/blueprint';

export async function run(provider: NetworkProvider) {
    const dataRegistry = provider.open(await DataRegistry.fromInit());

    await dataRegistry.send(
        provider.sender(),
        {
            value: toNano('0.05'),
        },
        null,
    );

    await provider.waitForDeploy(dataRegistry.address);

    // run methods on `dataRegistry`
}
