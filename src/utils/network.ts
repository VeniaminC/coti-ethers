import { providers } from "ethers";
import { CotiNetwork } from "../types";

export function getDefaultProvider(cotiNetwork: CotiNetwork) {
    return new providers.JsonRpcProvider(cotiNetwork)
}

export async function printNetworkDetails(provider: providers.Provider) {
    if (!await isProviderConnected(provider)) {
        throw Error("provider not connected");
    }
    if (provider instanceof providers.JsonRpcProvider) {
        console.log(`provider: ${provider.connection.url}`)
    }
    const network = await provider.getNetwork();
    console.log(`chainId: ${network.chainId}`)
    console.log(`latest block: ${await getLatestBlock(provider)}`)
}

export async function getLatestBlock(provider: providers.Provider) {
    if (!await isProviderConnected(provider)) {
        throw Error("provider not connected or address is not valid address");
    }
    return await provider.getBlockNumber()
}

export async function isProviderConnected(provider: providers.Provider): Promise<boolean> {
    if (provider == undefined) {
        throw Error('Provider does not exist.')
    }
    const network = await provider.getNetwork();
    if (!network)
        return false
    return true
}