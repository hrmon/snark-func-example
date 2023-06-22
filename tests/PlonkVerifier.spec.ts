import { Blockchain, SandboxContract } from '@ton-community/sandbox';
import { Cell, TupleBuilder, toNano, Builder, Slice, beginCell } from 'ton-core';
import { PlonkVerifier } from '../wrappers/PlonkVerifier';
import '@ton-community/test-utils';
import { compile } from '@ton-community/blueprint';

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
        var proof = new TupleBuilder();
        proof.writeSlice(hexToSlice("ad59f73341d165c81e7c94137cc0b73b72ad974cdbef66d9c78354ac8e5369648a4577c15f94ddb3aa93414d95740641"));
        proof.writeSlice(hexToSlice("b28f06868ebaabdf45d2ccac5bffc7dd0646a6418301d3b3406c1ac2de3979a55205727caf54d9958bac618b486011a4"));
        proof.writeSlice(hexToSlice("90b72dad4296ec642e45b2f3cde27df32741cc2c0c5b2a0d63b9722693cf710f8b45f25007b950739f553067cb1bd1a1"));
        proof.writeSlice(hexToSlice("91259bc51e4966f825c676bad60773e011ac49479337e075037d3b940d138097aa19a95b32ac2bcd01962967afc2a494"));
        proof.writeSlice(hexToSlice("92fbf1f3ce8b0cd366741cafdc502a3d1dd51f149a85542538e6401585a61fbc951a3e1eef278e744ef7976288fe0e09"));
        proof.writeSlice(hexToSlice("a6d5753a899bf170508ab7d39f323aa73477b0f6e17a0ec7cead522573c6b6dea9f771fc51d07bb61cd27833339d4568"));
        proof.writeSlice(hexToSlice("a32ca809d3355cbf138f92ad6652d351617f9d0552ac18b29dd8d3eefdd457e541a43f4a7ffe43a39bae8332c36ec007"));
        proof.writeSlice(hexToSlice("998fcafb3a38ebaa6bb0fd88ac59b453aafe6a25480270a786e48855fab528b1992f08a9ab18f1cedcd425ff2fe13a59"));
        proof.writeSlice(hexToSlice("866004416dfa02f70df94c6e47419b0279935bff76d18452e1a82ec2552632526124d045aa971ee55242413dbc4c7c5c"));

        proof.writeNumber(BigInt("38126993977292336255890198510047159228940122347179641355705970045909737464519"));
        proof.writeNumber(BigInt("37527020203570210225676171256961772306154578244466928614814903735143745057966"));
        proof.writeNumber(BigInt("31586997641831162691158324673499601815235809450907793373087224789894884941142"));
        proof.writeNumber(BigInt("26297273882509242221642603983812585369096765093353133041734540158276710116954"));
        proof.writeNumber(BigInt("25660014378165531169063054088567360357329524460273662113539822485003295447703"));
        proof.writeNumber(BigInt("47269453395694308035624120155650473486695846739267162287515244490130092320602"));
        
        const gid = await plonkVerifier.getProofVerification(proof.build(), [33]);
        expect(gid).toBe(-1);
    });

    it('should not verify incorrect proof', async () => {
        var proof = new TupleBuilder();
        proof.writeSlice(hexToSlice("ad59f73341d165c81e7c94137cc0b73b72ad974cdbef66d9c78354ac8e5369648a4577c15f94ddb3aa93414d95740641"));
        proof.writeSlice(hexToSlice("b28f06868ebaabdf45d2ccac5bffc7dd0646a6418301d3b3406c1ac2de3979a55205727caf54d9958bac618b486011a4"));
        proof.writeSlice(hexToSlice("90b72dad4296ec642e45b2f3cde27df32741cc2c0c5b2a0d63b9722693cf710f8b45f25007b950739f553067cb1bd1a1"));
        proof.writeSlice(hexToSlice("91259bc51e4966f825c676bad60773e011ac49479337e075037d3b940d138097aa19a95b32ac2bcd01962967afc2a494"));
        proof.writeSlice(hexToSlice("92fbf1f3ce8b0cd366741cafdc502a3d1dd51f149a85542538e6401585a61fbc951a3e1eef278e744ef7976288fe0e09"));
        proof.writeSlice(hexToSlice("a6d5753a899bf170508ab7d39f323aa73477b0f6e17a0ec7cead522573c6b6dea9f771fc51d07bb61cd27833339d4568"));
        proof.writeSlice(hexToSlice("a32ca809d3355cbf138f92ad6652d351617f9d0552ac18b29dd8d3eefdd457e541a43f4a7ffe43a39bae8332c36ec007"));
        proof.writeSlice(hexToSlice("998fcafb3a38ebaa6bb0fd88ac59b453aafe6a25480270a786e48855fab528b1992f08a9ab18f1cedcd425ff2fe13a59"));
        proof.writeSlice(hexToSlice("866004416dfa02f70df94c6e47419b0279935bff76d18452e1a82ec2552632526124d045aa971ee55242413dbc4c7c5c"));

        proof.writeNumber(BigInt("38126993977292336255890198510047159228940122347179641355705970045909737464555"));
        proof.writeNumber(BigInt("37527020203570210225676171256961772306154578244466928614814903735143745057966"));
        proof.writeNumber(BigInt("31586997641831162691158324673499601815235809450907793373087224789894884941142"));
        proof.writeNumber(BigInt("26297273882509242221642603983812585369096765093353133041734540158276710116954"));
        proof.writeNumber(BigInt("25660014378165531169063054088567360357329524460273662113539822485003295447703"));
        proof.writeNumber(BigInt("47269453395694308035624120155650473486695846739267162287515244490130092320602"));
        
        const gid = await plonkVerifier.getProofVerification(proof.build(), [33]);
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