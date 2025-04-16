import { providers } from "ethers"
import { getAddress } from "ethers/lib/utils"
import { JsonRpcSigner } from "./JsonRpcSigner"
import { OnboardInfo } from "../types";

export abstract class JsonRpcApiProvider extends providers.JsonRpcProvider {

    constructor(url?: string | providers.JsonRpcProvider['connection'], network?: providers.Networkish) {
        super(url, network)
    }

    getSigner(addressOrIndex?: string | number): providers.JsonRpcSigner;
    getSigner(addressOrIndex: string | number, userOnboardInfo?: OnboardInfo): JsonRpcSigner;
    getSigner(addressOrIndex?: string | number, userOnboardInfo?: OnboardInfo): providers.JsonRpcSigner | JsonRpcSigner {
        if (addressOrIndex == null) { addressOrIndex = 0; }

        if (userOnboardInfo) {
            // For the custom onboarding signer, we use our extended version
            return new JsonRpcSigner(this, addressOrIndex, userOnboardInfo);
        }

        // Use the default ethers implementation for the non-onboard version
        return super.getSigner(addressOrIndex);
    }
}