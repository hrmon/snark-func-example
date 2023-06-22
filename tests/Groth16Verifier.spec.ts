import { Blockchain, SandboxContract } from '@ton-community/sandbox';
import { Cell, toNano, Slice, TupleItem } from 'ton-core';
import { Groth16Verifier } from '../wrappers/Groth16Verifier';
import '@ton-community/test-utils';
import { compile } from '@ton-community/blueprint';
import generateFuncCallData from './groth16_func_call';

describe('Groth16Verifier', () => {
    let code: Cell;

    beforeAll(async () => {
        code = await compile('Groth16Verifier');
    });

    let blockchain: Blockchain;
    let groth16Verifier: SandboxContract<Groth16Verifier>;

    beforeEach(async () => {
        blockchain = await Blockchain.create();

        groth16Verifier = blockchain.openContract(
            Groth16Verifier.createFromConfig({}, code)
        );

        const deployer = await blockchain.treasury('deployer');

        const deployResult = await groth16Verifier.sendDeploy(deployer.getSender(), toNano('0.05'));

        expect(deployResult.transactions).toHaveTransaction({
            from: deployer.address,
            to: groth16Verifier.address,
            deploy: true,
            success: true,
        });
    });

    it('should deploy', async () => {
        // the check is done inside beforeEach
        // blockchain and groth16Verifier are ready to use
    });


    it('should verify correct proof', async () => {
        const [A, B, C, publicSignals] = generateFuncCallData() as [Slice, Slice, Slice, TupleItem[]];
        
        const gid = await groth16Verifier.getProofVerification(A, B, C, publicSignals);
        expect(gid).toBe(-1);
    });

});