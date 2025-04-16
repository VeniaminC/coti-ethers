import { providers } from "ethers";
import { JsonRpcApiPollingProvider } from "./JsonRpcApiPollingProvider";
import { JsonRpcSigner } from "./JsonRpcSigner";
import { OnboardInfo } from "../types";

// Define types from ethers v6 that we need
interface Eip1193Provider {
    request: (request: { method: string, params?: Array<any> | Record<string, any> }) => Promise<any>;
}

export class BrowserProvider extends JsonRpcApiPollingProvider {
    
    #provider: Eip1193Provider;

    /**
     *  Connect to the %%ethereum%% provider, optionally forcing the
     *  %%network%%.
     */
    constructor(ethereum: Eip1193Provider, url?: string | { url: string, pollingInterval?: number }, network?: providers.Networkish) {
        // Copy the options
        const providerOptions = { batchMaxCount: 1 };

        if (!ethereum || !ethereum.request) {
            throw new Error("invalid EIP-1193 provider");
        }

        super(url, network);
        
        this.#provider = ethereum;
    }

    async send(method: string, params: Array<any>): Promise<any> {
        return this._sendEip1193Request(method, params);
    }

    async _sendEip1193Request(method: string, params: Array<any>): Promise<any> {
        try {
            const result = await this.#provider.request({ method, params: params || [] });
            return result;
        } catch (e: any) {
            const error = new Error(e.message || "unknown error");
            (error as any).code = e.code;
            (error as any).data = e.data;
            throw error;
        }
    }

    /**
     *  Resolves to ``true`` if the provider manages the %%address%%.
     */
    async hasSigner(address: number | string): Promise<boolean> {
        if (address == null) { address = 0; }

        const accounts = await this.send("eth_accounts", []);
        if (typeof(address) === "number") {
            return (accounts.length > address);
        }

        address = (address as string).toLowerCase();
        return accounts.filter((a: string) => (a.toLowerCase() === address)).length !== 0;
    }

    getSigner(addressOrIndex?: string | number): providers.JsonRpcSigner;
    getSigner(addressOrIndex: string | number, userOnboardInfo?: OnboardInfo): JsonRpcSigner;
    getSigner(addressOrIndex?: string | number, userOnboardInfo?: OnboardInfo): providers.JsonRpcSigner | JsonRpcSigner {
        if (addressOrIndex == null) { addressOrIndex = 0; }

        // If we have userOnboardInfo, use our custom signer
        if (userOnboardInfo) {
            return new JsonRpcSigner(this, addressOrIndex, userOnboardInfo);
        }

        // Otherwise, use the parent's implementation
        return super.getSigner(addressOrIndex);
    }

    async requestAccounts(): Promise<Array<string>> {
        try {
            return await this._sendEip1193Request("eth_requestAccounts", []);
        } catch (error: any) {
            throw new Error(`Error requesting accounts: ${error.message || "Unknown error"}`);
        }
    }
}
