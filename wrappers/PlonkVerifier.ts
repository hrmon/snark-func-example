import { Address, beginCell, Cell, Contract, contractAddress, ContractProvider, Sender, SendMode, TupleBuilder, Builder, Slice, TupleItem } from 'ton-core';

export type PlonkVerifierConfig = {};

export function plonkVerifierConfigToCell(config: PlonkVerifierConfig): Cell {
    return beginCell().endCell();
}

export class PlonkVerifier implements Contract {
    constructor(readonly address: Address, readonly init?: { code: Cell; data: Cell }) {}

    static createFromAddress(address: Address) {
        return new PlonkVerifier(address);
    }

    static createFromConfig(config: PlonkVerifierConfig, code: Cell, workchain = 0) {
        const data = plonkVerifierConfigToCell(config);
        const init = { code, data };
        return new PlonkVerifier(contractAddress(workchain, init), init);
    }

    async sendDeploy(provider: ContractProvider, via: Sender, value: bigint) {
        await provider.internal(via, {
            value,
            sendMode: SendMode.PAY_GAS_SEPARATELY,
            body: beginCell().endCell(),
        });
    }

    async getProofVerification(provider: ContractProvider, proof: TupleItem[], publicSignals: TupleItem[]) {
        const args = new TupleBuilder();
        args.writeTuple(proof);
        args.writeTuple(publicSignals);
        const result = await provider.get('verify_proof', args.build());
        return result.stack.readNumber();
    }
}