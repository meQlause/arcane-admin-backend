import envConfig from 'src/config/env.config';
import {
    Item,
    KeyHexData,
    KeyValueMap,
    NFTData,
    ResponseDataEntityState,
    ResponseDataKVSDataState,
    ResponseDataKVSKeyState,
    ResponseDataTxDetails,
    UserRole,
    VaultNftId,
} from 'src/custom';

/**
 * Verifies the role of a user based on the items and role provided.
 * @param {Item} items - The items to verify.
 * @param {UserRole} role - The role to verify.
 * @returns {boolean} - True if the role is verified, false otherwise.
 */
const verifyRole = (items: Item, role: UserRole): boolean => {
    const neededResourceAddress =
        role === UserRole.Admin
            ? envConfig().adminResourceAddress!
            : envConfig().memberResourceAddress!;

    return items.non_fungible_resources.items.some((item: NFTData) => {
        return item.resource_address === neededResourceAddress;
    });
};

/**
 * Checks if a wallet contains a badge.
 * @param {string} address - The wallet address.
 * @returns {Promise<UserRole>} - The role of the user.
 */
export const isWalletContainsBadge = async (
    address: string
): Promise<UserRole> => {
    const body = {
        addresses: [address],
        opt_ins: {
            non_fungible_include_nfids: true,
        },
    };
    try {
        const response = await fetch(
            `${envConfig().gatewayRadix}/state/entity/details`,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(body),
            }
        );

        const data: ResponseDataEntityState = await response.json();
        const { items } = data;

        const admin = verifyRole(items[0], UserRole.Admin);
        if (admin) {
            return UserRole.Admin;
        }

        const member = verifyRole(items[0], UserRole.Member);
        if (member) {
            return UserRole.Member;
        }

        return UserRole.Unregistered;
    } catch (err: any) {
        throw new Error(err);
    }
};

/**
 * Retrieves the vault address and NFT ID.
 * @param {string} address - The address to retrieve from.
 * @param {UserRole} role - The role to consider.
 * @returns {Promise<VaultNftId>} - The vault address and NFT ID.
 */
export const getVaultAddressAndNftId = async (
    address: string,
    role: UserRole
): Promise<VaultNftId> => {
    const body = {
        addresses: [address],
        aggregation_level: 'Vault',
        opt_ins: {
            non_fungible_include_nfids: true,
        },
    };

    try {
        const response = await fetch(
            `${envConfig().gatewayRadix}/state/entity/details`,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(body),
            }
        );

        const res: ResponseDataEntityState = await response.json();

        let nftData: NFTData | null = null;
        const neededResourceAddress =
            role === UserRole.Admin
                ? envConfig().adminResourceAddress
                : envConfig().memberResourceAddress;

        res.items[0].non_fungible_resources.items.some((nft: NFTData) => {
            if (nft?.resource_address === neededResourceAddress) {
                nftData = nft;
                return true;
            }
        });

        const vaultAddress = nftData?.vaults.items[0].vault_address;
        const nftId = nftData?.vaults.items[0].items[0];

        return { vaultAddress, nftId };
    } catch (err: any) {
        throw new Error(err);
    }
};

/**
 * Retrieves the vote component address.
 * @param {string} tx_id - The transaction ID.
 * @returns {Promise<string>} - The vote component address.
 */
export const getVoteComponentAddress = async (
    tx_id: string
): Promise<string> => {
    const body = {
        intent_hash: `${tx_id}`,
        opt_ins: {
            receipt_state_changes: true,
            receipt_output: false,
        },
    };
    try {
        const response = await fetch(
            `${envConfig().gatewayRadix}/transaction/committed-details`,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(body),
            }
        );

        const res: ResponseDataTxDetails = await response.json();

        let componentVoteAddress: string | null = null;
        res.transaction.receipt.state_updates.new_global_entities.some(
            (entity) => {
                if (entity.entity_address.startsWith('component')) {
                    componentVoteAddress = entity.entity_address;
                    return true;
                }
            }
        );

        return componentVoteAddress; // Return an empty string if componentVoteAddress is null
    } catch (err: any) {
        throw new Error(err);
    }
};

/**
 * Retrieves the votes key-value store address from a component address.
 * @param {string} componentAddress - The component address.
 * @returns {Promise<string>} - The votes key-value store address.
 */
export const getVotesKeyValueStoreAddressFromComponent = async (
    componentAddress: string
): Promise<string> => {
    const body = {
        addresses: [componentAddress],
    };
    try {
        const response = await fetch(
            `${envConfig().gatewayRadix}/state/entity/details`,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(body),
            }
        );

        const res: ResponseDataEntityState = await response.json();

        let votesKeyValueStoreAddress: string | null = null;
        res.items[0].details.state.fields.some((data) => {
            if (data.field_name === 'votes') {
                votesKeyValueStoreAddress = data.value;
                return true;
            }
        });

        return votesKeyValueStoreAddress;
    } catch (err: any) {
        throw new Error(err);
    }
};

/**
 * Retrieves the vote key-value map.
 * @param {string} keyValueStoreAddress - The key-value store address.
 * @returns {Promise<KeyValueMap[]>} - The vote key-value map.
 */
export const getVoteKeyValueMap = async (
    keyValueStoreAddress: string
): Promise<KeyValueMap[]> => {
    const body = {
        key_value_store_address: `${keyValueStoreAddress}`,
    };
    try {
        const response = await fetch(
            `${envConfig().gatewayRadix}/state/key-value-store/keys`,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(body),
            }
        );

        const res: ResponseDataKVSKeyState = await response.json();

        const keyHexMap: KeyHexData[] = res.items.map((item) => ({
            key_hex: item.key.raw_hex,
        }));

        return await getVoteData(keyValueStoreAddress, keyHexMap);
    } catch (err: any) {
        throw new Error(err);
    }
};

const getVoteData = async (
    keyValueStoreAddress: string,
    raw_hex: KeyHexData[]
): Promise<KeyValueMap[]> => {
    const body = {
        key_value_store_address: `${keyValueStoreAddress}`,
        keys: raw_hex,
    };
    try {
        const response = await fetch(
            `${envConfig().gatewayRadix}/state/key-value-store/data`,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(body),
            }
        );

        const res: ResponseDataKVSDataState = await response.json();

        const keyValueMap: KeyValueMap[] = res.entries.map((item) => ({
            key: item.key.programmatic_json.value,
            value: item.value.programmatic_json.value,
        }));

        return keyValueMap;
    } catch (err: any) {
        throw new Error(err);
    }
};
