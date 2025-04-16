import { providers } from "ethers";
import { BigNumber } from "ethers";

export async function validateGasEstimation(provider: providers.Provider, tx: providers.TransactionRequest) {
    const {valid, gasEstimation} = await isGasEstimationValid(provider, tx);
    if (!valid)
        throw new Error(`Not enough gas for tx. Provided: ${tx.gasLimit}, needed: ${gasEstimation}`);
}

export async function isGasEstimationValid(provider: providers.Provider, tx: providers.TransactionRequest) {
    const estimatedGas = await provider.estimateGas(tx)
    const gasLimit = tx.gasLimit ? BigNumber.from(tx.gasLimit).toNumber() : 0;

    if (!estimatedGas || estimatedGas.gt(BigNumber.from(gasLimit))) {
        throw new Error(`Not enough gas for tx. Provided: ${gasLimit}, needed: ${estimatedGas.toString()}`);
    }
    return {valid: true, gasEstimation: estimatedGas}
}