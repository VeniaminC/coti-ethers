import { providers } from "ethers"
import { JsonRpcApiProvider } from "./JsonRpcApiProvider"

const defaultOptions = {
    pollingInterval: 4000
}

// Custom interface for connection info with polling
interface ConnectionInfo {
    url: string;
    pollingInterval?: number;
    [key: string]: any;
}

export abstract class JsonRpcApiPollingProvider extends JsonRpcApiProvider {
    readonly #pollingInterval: number;
    
    constructor(url?: string | ConnectionInfo, network?: providers.Networkish) {
        super(url, network);

        let pollingInterval = defaultOptions.pollingInterval;
        
        // Check if we have polling interval in the connection object
        if (typeof url === 'object' && url && 'pollingInterval' in url) {
            pollingInterval = url.pollingInterval || defaultOptions.pollingInterval;
        }

        this.#pollingInterval = pollingInterval;
    }

    /**
     *  The polling interval (default: 4000 ms)
     */
    get pollingInterval(): number { 
        return this.#pollingInterval; 
    }

    // Override any internal methods that need polling interval as needed
    // This is a simplified version that doesn't try to access internal ethers methods
}