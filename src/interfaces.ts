export interface ResponseData {
    ledger_state: LedgerState;
    total_count: number;
    items: Array<Item>;
    address: string;
}
export interface LedgerState {
    network: string;
    state_version: number;
    proposer_round_timestamp: string;
    epoch: number;
    round: number;
}
export interface Item {
    amount: number;
    last_updated_at_state_version: number;
    aggregation_level: string;
    resource_address: string;
}
