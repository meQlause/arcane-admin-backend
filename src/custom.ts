export enum UserRole {
    Admin = 'admin',
    Member = 'member',
    Unregistered = 'unregistered',
}

export enum Status {
    ACTIVE = 'active',
    PENDING = 'pending',
    REJECTED = 'rejected',
    CLOSED = 'closed',
}

export interface ContainBadgeData {
    vault_address: string | null;
    nft_id: string | null;
    role: UserRole;
}

export interface ResponseNftData {
    non_fungible_id_type: string;
    ledger_state: string;
    resource_address: string;
    non_fungible_ids: {
        is_burned: boolean;
        non_fungible_id: string;
        data: {
            raw_hex: string;
            programmatic_json: {
                fields: {
                    variant_name: string;
                };
                kind: string;
                type_name: string;
            };
        };
        last_updated_at_state_version: number;
    }[];
}

export type AuthResponse = {
    access_token: string | undefined;
    nft_id: string | undefined;
    address: string;
    role: UserRole;
};

export type JWTData = {
    address: string;
    role: UserRole;
};

export type KeyHexData = {
    key_hex: string;
};

export type KeyValueMap = {
    key: string;
    value: string;
};

export type UserData = {
    admin: { vault: string; nftId: string } | null;
    member: { vault: string; nftId: string } | null;
};
export interface VaultNftId {
    vaultAddress: string;
    nftId: string;
}

export interface ResponseDataKVSKeyState {
    ledger_state: LedgerState;
    items: {
        key: {
            raw_hex: string;
            programmatic_json: {
                value: string;
                kind: string;
            };
        };
        last_updated_at_state_version: number;
    }[];
}

export interface ResponseDataKVSDataState {
    ledger_state: LedgerState;
    key_value_store_address: string;
    entries: {
        key: {
            raw_hex: string;
            programmatic_json: {
                kind: string;
                value: string;
            };
        };
        value: {
            raw_hex: string;
            programmatic_json: {
                value: string;
                kind: boolean;
                type_name: string;
            };
        };
        last_updated_at_state_version: number;
        is_locked: boolean;
    }[];
}

export interface ResponseDataTxDetails {
    ledger_state: LedgerState;
    transaction: {
        transaction_status: string;
        state_version: number;
        epoch: number;
        round: number;
        round_timestamp: string;
        payload_hash: string;
        intent_hash: string;
        fee_paid: string;
        confirmed_at: string;
        receipt: {
            status: string;
            state_updates: {
                created_substates: Array<any>;
                deleted_substates: Array<any>;
                updated_substates: Array<any>;
                deleted_partitions: Array<any>;
                new_global_entities: {
                    is_global: boolean;
                    entity_type: string;
                    entity_address: string;
                }[];
            };
        };
    };
}

export interface NFTData {
    vaults: {
        total_count: number;
        items: {
            total_count: number;
            items: {
                total_count: number;
                items: string[];
            };
            vault_address: string;
            last_updated_at_state_version: number;
        }[];
    };
    aggregation_level: string;
    resource_address: string;
}

export interface NFT_ID {}
export interface Item {
    address: string;
    fungible_resources: any;
    non_fungible_resources: {
        total_count: number;
        items: NFTData[];
    };
    metadata: any;
    details: {
        package_address: string;
        blueprint_name: string;
        blueprint_version: string;
        state: {
            kind: string;
            type_name: string;
            fields: {
                kind: string;
                type_name: string;
                field_name: string;
                value: string;
            }[];
        };
        role_assignments: any;
        type: string;
    };
}
[];
export interface ResponseDataEntityState {
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
