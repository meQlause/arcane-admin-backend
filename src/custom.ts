export enum UserRole {
    Admin = 'admin',
    Member = 'member',
    Unregistered = 'unregistered',
}

export type AuthResponse = {
    access_token: string | undefined;
    address: string;
    role: UserRole;
};

export type JWTData = {
    address: string;
    role: UserRole;
};

export interface VaultNftId {
    vaultAddress: string;
    nftId: string;
}

export interface ResponseData {
    ledger_state: LedgerState;
    items: Item[];
}
export interface LedgerState {
    network: string;
    state_version: number;
    proposer_round_timestamp: string;
    epoch: number;
    round: number;
}
export interface Item {
    address: string;
    fungible_resources: any;
    non_fungible_resources: Nfts;
    metadata: any;
    details: any;
}

export interface Nfts {
    total_count: number;
    items: NFTData[];
}

export interface NFTData {
    vaults: Vaults;
    aggregation_level: string;
    resource_address: string;
}

export interface Vaults {
    total_count: number;
    items: VaultData[];
}

export interface VaultData {
    total_count: number;
    items: string[];
    vault_address: string;
    last_updated_at_state_version: number;
}
