import { toNano } from 'ton-core';
import { PlonkVerifier } from '../wrappers/PlonkVerifier';
import { compile, NetworkProvider } from '@ton-community/blueprint';

export async function run(provider: NetworkProvider) {
    const plonkVerifier = provider.open(PlonkVerifier.createFromConfig({}, await compile('PlonkVerifier')));

    await plonkVerifier.sendDeploy(provider.sender(), toNano('0.05'));

    await provider.waitForDeploy(plonkVerifier.address);

    // run methods on `plonkVerifier`
}
