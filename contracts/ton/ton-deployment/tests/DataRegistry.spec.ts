import { Blockchain, SandboxContract, TreasuryContract } from '@ton/sandbox';
import { toNano } from '@ton/core';
import { DataRegistry } from '../build/DataRegistry/DataRegistry_DataRegistry';
import '@ton/test-utils';

describe('DataRegistry', () => {
    let blockchain: Blockchain;
    let deployer: SandboxContract<TreasuryContract>;
    let dataRegistry: SandboxContract<DataRegistry>;

    beforeEach(async () => {
        blockchain = await Blockchain.create();

        dataRegistry = blockchain.openContract(await DataRegistry.fromInit());

        deployer = await blockchain.treasury('deployer');

        const deployResult = await dataRegistry.send(
            deployer.getSender(),
            {
                value: toNano('0.05'),
            },
            null,
        );

        expect(deployResult.transactions).toHaveTransaction({
            from: deployer.address,
            to: dataRegistry.address,
            deploy: true,
            success: true,
        });
    });

    it('should deploy', async () => {
        // the check is done inside beforeEach
        // blockchain and dataRegistry are ready to use
    });
});
