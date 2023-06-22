import { Blockchain, SandboxContract } from '@ton-community/sandbox';
import { Cell, toNano, TupleItem } from 'ton-core';
import { PlonkVerifier } from '../wrappers/PlonkVerifier';
import '@ton-community/test-utils';
import { compile } from '@ton-community/blueprint';
import generateFuncCallData from './plonk_func_call';

describe('PlonkVerifier', () => {
    let code: Cell;

    beforeAll(async () => {
        code = await compile('PlonkVerifier');
    });

    let blockchain: Blockchain;
    let plonkVerifier: SandboxContract<PlonkVerifier>;

    beforeEach(async () => {
        blockchain = await Blockchain.create();

        plonkVerifier = blockchain.openContract(PlonkVerifier.createFromConfig({}, code));

        const deployer = await blockchain.treasury('deployer');

        const deployResult = await plonkVerifier.sendDeploy(deployer.getSender(), toNano('0.05'));

        expect(deployResult.transactions).toHaveTransaction({
            from: deployer.address,
            to: plonkVerifier.address,
            deploy: true,
            success: true,
        });
    });

    it('should deploy', async () => {
        // the check is done inside beforeEach
        // blockchain and plonkVerifier are ready to use
    });

    it('should verify correct proof', async () => {
        const [proof, publicSignals] = generateFuncCallData() as [TupleItem[], TupleItem[]];
        const gid = await plonkVerifier.getProofVerification(proof, publicSignals);
        expect(gid).toBe(-1);
    });

});