import { Blockchain, SandboxContract } from '@ton-community/sandbox';
import { Cell, toNano } from 'ton-core';
import { VerySmort } from '../wrappers/VerySmort';
import '@ton-community/test-utils';
import { compile } from '@ton-community/blueprint';

describe('VerySmort', () => {
    let code: Cell;

    beforeAll(async () => {
        code = await compile('VerySmort');
    });

    let blockchain: Blockchain;
    let verySmort: SandboxContract<VerySmort>;

    beforeEach(async () => {
        blockchain = await Blockchain.create();

        verySmort = blockchain.openContract(
            VerySmort.createFromConfig(
                {
                    id: 0,
                    counter: 0,
                },
                code
            )
        );

        const deployer = await blockchain.treasury('deployer');

        const deployResult = await verySmort.sendDeploy(deployer.getSender(), toNano('0.05'));

        expect(deployResult.transactions).toHaveTransaction({
            from: deployer.address,
            to: verySmort.address,
            deploy: true,
            success: true,
        });
    });

    it('should deploy', async () => {
        // the check is done inside beforeEach
        // blockchain and verySmort are ready to use
    });

    it('should increase counter', async () => {
        const increaseTimes = 3;
        for (let i = 0; i < increaseTimes; i++) {
            console.log(`increase ${i + 1}/${increaseTimes}`);

            const increaser = await blockchain.treasury('increaser' + i);

            const counterBefore = await verySmort.getCounter();

            console.log('counter before increasing', counterBefore);

            const increaseBy = Math.floor(Math.random() * 100);

            console.log('increasing by', increaseBy);

            const increaseResult = await verySmort.sendIncrease(increaser.getSender(), {
                increaseBy,
                value: toNano('0.05'),
            });

            expect(increaseResult.transactions).toHaveTransaction({
                from: increaser.address,
                to: verySmort.address,
                success: true,
            });

            const counterAfter = await verySmort.getCounter();

            console.log('counter after increasing', counterAfter);

            expect(counterAfter).toBe(counterBefore + increaseBy);
        }
    });

    it('should has global id', async () => {
        const gid = await verySmort.getGlobalID();
        console.log(gid);
        expect(gid).toBe(0);
    });
});
