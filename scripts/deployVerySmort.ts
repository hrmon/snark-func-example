import { toNano } from 'ton-core';
import { VerySmort } from '../wrappers/VerySmort';
import { compile, NetworkProvider } from '@ton-community/blueprint';

export async function run(provider: NetworkProvider) {
    const verySmort = provider.open(
        VerySmort.createFromConfig(
            {
                id: Math.floor(Math.random() * 10000),
                counter: 0,
            },
            await compile('VerySmort')
        )
    );

    await verySmort.sendDeploy(provider.sender(), toNano('0.05'));

    await provider.waitForDeploy(verySmort.address);

    console.log('ID', await verySmort.getID());
}
