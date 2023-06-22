import { toNano } from 'ton-core';
import { Groth16Verifier } from '../wrappers/Groth16Verifier';
import { compile, NetworkProvider } from '@ton-community/blueprint';

export async function run(provider: NetworkProvider) {
    const groth16Verifier = provider.open(
        Groth16Verifier.createFromConfig(
            {},
            await compile('Groth16Verifier')
        )
    );

    await groth16Verifier.sendDeploy(provider.sender(), toNano('0.05'));

    await provider.waitForDeploy(groth16Verifier.address);

    console.log('DONE!');
}
