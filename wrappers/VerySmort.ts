import { Address, beginCell, Cell, Contract, contractAddress, ContractProvider, Sender, SendMode, TupleBuilder, Builder } from 'ton-core';

export type VerySmortConfig = {
    id: number;
    counter: number;
};

export function verySmortConfigToCell(config: VerySmortConfig): Cell {
    return beginCell().storeUint(config.id, 32).storeUint(config.counter, 32).endCell();
}

export const Opcodes = {
    increase: 0x7e8764ef,
};

export class VerySmort implements Contract {
    constructor(readonly address: Address, readonly init?: { code: Cell; data: Cell }) {}

    static createFromAddress(address: Address) {
        return new VerySmort(address);
    }

    static createFromConfig(config: VerySmortConfig, code: Cell, workchain = 0) {
        const data = verySmortConfigToCell(config);
        const init = { code, data };
        return new VerySmort(contractAddress(workchain, init), init);
    }

    async sendDeploy(provider: ContractProvider, via: Sender, value: bigint) {
        await provider.internal(via, {
            value,
            sendMode: SendMode.PAY_GAS_SEPARATELY,
            body: beginCell().endCell(),
        });
    }

    async sendIncrease(
        provider: ContractProvider,
        via: Sender,
        opts: {
            increaseBy: number;
            value: bigint;
            queryID?: number;
        }
    ) {
        await provider.internal(via, {
            value: opts.value,
            sendMode: SendMode.PAY_GAS_SEPARATELY,
            body: beginCell()
                .storeUint(Opcodes.increase, 32)
                .storeUint(opts.queryID ?? 0, 64)
                .storeUint(opts.increaseBy, 32)
                .endCell(),
        });
    }

    async getCounter(provider: ContractProvider) {
        const result = await provider.get('get_counter', []);
        return result.stack.readNumber();
    }

    async getID(provider: ContractProvider) {
        const result = await provider.get('get_id', []);
        return result.stack.readNumber();
    }

    async getGlobalID(provider: ContractProvider, pA: string, pB: string, pC: string, publicSignals: number[]) {
        const publicSignalsTuple = new TupleBuilder();
        publicSignals.forEach(item => publicSignalsTuple.writeNumber(item));
        const args = new TupleBuilder();
        [pA, pB, pC].forEach(item => {
            const builder = beginCell();
            writeStringHex(item, builder);
            args.writeSlice(builder.asSlice());
        });
        args.writeTuple(publicSignalsTuple.build());
        const result = await provider.get('verify_proof', args.build());
        return result.stack.readNumber();
        // const result = await provider.get('go_global', []);
        // return result.stack.readNumber();
    }

    // async verifyProof(provider: ContractProvider, pA: string, pB: string, pC: string, publicSignals: number[]) {
        
    // }
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