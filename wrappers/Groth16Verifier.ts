import { Address, beginCell, Cell, Contract, contractAddress, ContractProvider, Sender, SendMode, TupleBuilder, Builder, Slice, TupleItem } from 'ton-core';

export type Groth16VerifierConfig = {};

export function groth16VerifierConfigToCell(config: Groth16VerifierConfig): Cell {
    return beginCell().endCell();
}

export class Groth16Verifier implements Contract {
    constructor(readonly address: Address, readonly init?: { code: Cell; data: Cell }) {}

    static createFromAddress(address: Address) {
        return new Groth16Verifier(address);
    }

    static createFromConfig(config: Groth16VerifierConfig, code: Cell, workchain = 0) {
        const data = groth16VerifierConfigToCell(config);
        const init = { code, data };
        return new Groth16Verifier(contractAddress(workchain, init), init);
    }

    async sendDeploy(provider: ContractProvider, via: Sender, value: bigint) {
        await provider.internal(via, {
            value,
            sendMode: SendMode.PAY_GAS_SEPARATELY,
            body: beginCell().endCell(),
        });
    }

    async getProofVerification(provider: ContractProvider, pA: Slice, pB: Slice, pC: Slice, publicSignals: TupleItem[]) {
        const args = new TupleBuilder();
        [pA, pB, pC].forEach(item => { args.writeSlice(item); });
        args.writeTuple(publicSignals);
        const result = await provider.get('verify_proof', args.build());
        return result.stack.readNumber();
    }
}