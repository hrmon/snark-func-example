import { Blockchain, SandboxContract } from '@ton-community/sandbox';
import { Cell, toNano, Builder, beginCell, Slice, TupleBuilder } from 'ton-core';
import { Groth16Verifier } from '../wrappers/Groth16Verifier';
import '@ton-community/test-utils';
import { compile } from '@ton-community/blueprint';

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
        const A = hexToSlice("a9572cd434dfd77a84c93a8fa9b5eb1a9354aedabcde54a9e14f21a69a2d8093d9d4f8b1c8e6a98bf4f771108905f04a");
        const B = hexToSlice("b04f321aa3bc57468a56e07c04df38d330d471322dd558bfbe8bf028fc830a2313346d98383801caa0f7c5a57f2dd6a70177b38604174595366b6e9dff66282cc808f3fd3b5b9be5033066fae5a55089d4170ce66d241e5fa60dd0a76a901ad5");
        const C = hexToSlice("817304b348e3e75821fe378acd76dbdc3812ca801d547eb66d6a59685e102b32783da00d7bfeac2821ed2b7c7cd0b104");
        
        const publicSignals = new TupleBuilder();
        
        publicSignals.writeNumber(33);
        
        const gid = await groth16Verifier.getProofVerification(A, B, C, publicSignals.build());
        expect(gid).toBe(-1);
    });

    it('should not verify incorrect target', async () => {
        const A = hexToSlice("a9572cd434dfd77a84c93a8fa9b5eb1a9354aedabcde54a9e14f21a69a2d8093d9d4f8b1c8e6a98bf4f771108905f04a");
        const B = hexToSlice("b04f321aa3bc57468a56e07c04df38d330d471322dd558bfbe8bf028fc830a2313346d98383801caa0f7c5a57f2dd6a70177b38604174595366b6e9dff66282cc808f3fd3b5b9be5033066fae5a55089d4170ce66d241e5fa60dd0a76a901ad5");
        const C = hexToSlice("817304b348e3e75821fe378acd76dbdc3812ca801d547eb66d6a59685e102b32783da00d7bfeac2821ed2b7c7cd0b104");
        
        const publicSignals = new TupleBuilder();
        
        publicSignals.writeNumber(34);
        
        const gid = await groth16Verifier.getProofVerification(A, B, C, publicSignals.build());
        expect(gid).toBe(0);
    });

    it('should not verify incorrect proof', async () => {
        const A = hexToSlice("a9572cd434dfd77a84c93a8fa9b5eb1a9354aedabcde54a9e14f21a69a2d8093d9d4f8b1c8e6a98bf4f771108905f04a");
        const B = hexToSlice("904f321aa3bc57468a56e07c04df38d330d471322dd558bfbe8bf028fc830a2313346d98383801caa0f7c5a57f2dd6a70177b38604174595366b6e9dff66282cc808f3fd3b5b9be5033066fae5a55089d4170ce66d241e5fa60dd0a76a901ad5");
        const C = hexToSlice("817304b348e3e75821fe378acd76dbdc3812ca801d547eb66d6a59685e102b32783da00d7bfeac2821ed2b7c7cd0b104");
        
        const publicSignals = new TupleBuilder();
        
        publicSignals.writeNumber(33);
        
        const gid = await groth16Verifier.getProofVerification(A, B, C, publicSignals.build());
        expect(gid).toBe(0);
    });
});

function hexToSlice(src: string): Slice {
    const builder = beginCell();
    writeStringHex(src, builder);
    return builder.asSlice();
}


function writeStringHex(src: string, builder: Builder) {
    const buff = Buffer.from(src, "hex");
    writeBuffer(buff, builder);

    function writeBuffer(src: Buffer, builder: Builder) {
        if (src.length > 0) {
            let bytes = Math.floor(builder.availableBits / 8);
            if (src.length > bytes) {
                let a = src.subarray(0, bytes);
                let t = src.subarray(bytes);
                builder = builder.storeBuffer(a);
                let bb = beginCell();
                writeBuffer(t, bb);
                builder = builder.storeRef(bb.endCell());
            } else {
                builder = builder.storeBuffer(src);
            }
        }
    }
}
