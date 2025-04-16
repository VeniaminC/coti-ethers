import { Wallet } from "ethers";
import { formatEther, getAddress, isAddress } from "ethers/lib/utils";
import { providers, BigNumber } from "ethers";
import { isProviderConnected } from "./network";
import { validateGasEstimation } from "./transaction";

export async function printAccountDetails(provider: providers.Provider, address: string) {
    if (!(await isProviderConnected(provider) && addressValid(address))) {
        throw Error("provider not connected or address is not valid address");
    }
    console.log("account address:", address);
    const balanceInWei = await getAccountBalance(address, provider)
    console.log("account balance: ", balanceInWei, 'wei (', formatEther(balanceInWei), 'ether)');
    console.log("account nonce: ", await getNonce(provider, address))
}

export async function getAccountBalance(address: string, provider: providers.Provider) {
    if (!(await isProviderConnected(provider) && addressValid(address))) {
        throw Error("provider not connected or address is not valid address");
    }
    return provider.getBalance(address);
}

export function validateAddress(address: string): { valid: boolean; safe: string } {
    return {'valid': isAddress(address), 'safe': getAddress(address)}
}

export async function getNonce(provider: providers.Provider, address: string) {
    if (!(await isProviderConnected(provider) && addressValid(address))) {
        throw Error("provider not connected or address is not valid address");
    }
    return await provider.getTransactionCount(address)
}

export function addressValid(address: string): boolean {
    return validateAddress(address).valid
}

export async function getNativeBalance(provider: providers.Provider, address: string) {
    if (!(await isProviderConnected(provider) && addressValid(address))) {
        throw Error("provider not connected or address is not valid address");
    }
    return formatEther(await getAccountBalance(address, provider))
}

export async function getEoa(accountPrivateKey: string) {
    const wallet = new Wallet(accountPrivateKey);
    if (!addressValid(wallet.address))
        throw new Error("Address generated from pk is not valid");
    return wallet.address;
}

export async function transferNative(provider: providers.Provider, wallet: Wallet, recipientAddress: string, amountToTransferInWei: BigInt, nativeGasUnit: number) {
    const gasPrice = await provider.getGasPrice();

    const tx: providers.TransactionRequest = {
        to: recipientAddress,
        from: wallet.address,
        value: amountToTransferInWei.toString(),
        nonce: await provider.getTransactionCount(wallet.address),
        gasLimit: nativeGasUnit,
        gasPrice: gasPrice
    };
    try {
        await validateGasEstimation(provider, tx)
        const transaction = await wallet.sendTransaction(tx);
        await transaction.wait();

        console.log('Transaction successful with hash:', transaction.hash);
        return transaction;
    } catch (error) {
        console.error('Transaction failed:', error);
    }
}