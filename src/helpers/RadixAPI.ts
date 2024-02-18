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
import * as dotenv from 'dotenv';
dotenv.config();

const verifyRole = (items: Item, role: UserRole): boolean => {
    const neededResourceAddress: string =
        role === UserRole.Admin
            ? process.env.ADMIN_RESOURCE_ADDRESS!
            : process.env.MEMBER_RESOURCE_ADDRESS!;

    return items.non_fungible_resources.items.some((item: NFTData) => {
        return item.resource_address === neededResourceAddress;
    });
};

export const isWalletContainsBadge = async (
    address: string
): Promise<UserRole> => {
    const body = {
        addresses: [address],
        opt_ins: {
            non_fungible_include_nfids: true,
        },
    };
    return fetch(`${process.env.GATEWAY_API_RDX}/state/entity/details`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
    })
        .then((response) => response.json())
        .then((data) => {
            const { items }: ResponseDataEntityState = data;
            const admin = verifyRole(items[0], UserRole.Admin);
            if (admin) {
                return UserRole.Admin;
            }
            const member = verifyRole(items[0], UserRole.Member);
            if (member) {
                return UserRole.Member;
            }
            return UserRole.Unregistered;
        })
        .catch((err) => {
            throw new Error(err);
        })!;
};

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
    const res: ResponseDataEntityState = await fetch(
        `${process.env.GATEWAY_API_RDX}/state/entity/details`,
        {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(body),
        }
    )
        .then((response) => response.json())
        .catch((err) => {
            throw new Error(err);
        });
    let nftData: NFTData | null = null;
    const neededResourceAddress: string =
        role === UserRole.Admin
            ? process.env.ADMIN_RESOURCE_ADDRESS!
            : process.env.MEMBER_RESOURCE_ADDRESS!;

    res.items[0].non_fungible_resources.items.some((nft: any) => {
        if (nft?.resource_address === neededResourceAddress) {
            nftData = nft;
        }
    });

    const vaultAddress = nftData?.vaults.items[0].vault_address;
    const nftId = nftData?.vaults.items[0].items[0];
    return { vaultAddress, nftId };
};

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
    const res: ResponseDataTxDetails = await fetch(
        `${process.env.GATEWAY_API_RDX}/transaction/committed-details`,
        {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(body),
        }
    )
        .then((response) => response.json())
        .catch((err) => {
            throw new Error(err);
        });

    let componentVoteAddress: string | null = null;
    res.transaction.receipt.state_updates.new_global_entities.some((entity) => {
        if (entity.entity_address.slice(0, 9) === 'component') {
            componentVoteAddress = entity.entity_address;
        }
    });

    return componentVoteAddress;
};

export const getVotesKeyValueStoreAddressFromComponent = async (
    componentAddress: string
): Promise<string> => {
    const body = {
        addresses: [componentAddress],
    };
    const res: ResponseDataEntityState = await fetch(
        `${process.env.GATEWAY_API_RDX}/state/entity/details`,
        {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(body),
        }
    )
        .then((response) => response.json())
        .catch((err) => {
            throw new Error(err);
        });

    let votesKeyValueStoreAddress: string | null = null;
    res.items[0].details.state.fields.some((data) => {
        if (data.field_name === 'votes') {
            votesKeyValueStoreAddress = data.value;
        }
    });

    return votesKeyValueStoreAddress;
};

export const getVoteKeyValueMap = async (
    keyValueStoreAddress: string
): Promise<KeyValueMap[]> => {
    const body = {
        key_value_store_address: `${keyValueStoreAddress}`,
    };
    const res: ResponseDataKVSKeyState = await fetch(
        `${process.env.GATEWAY_API_RDX}/state/key-value-store/keys`,
        {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(body),
        }
    )
        .then((response) => response.json())
        .catch((err) => {
            throw new Error(err);
        });

    const keyHexMap: KeyHexData[] = res.items.map((item) => ({
        key_hex: item.key.raw_hex,
    }));

    return await getVoteData(keyValueStoreAddress, keyHexMap);
};

const getVoteData = async (
    keyValueStoreAddress: string,
    raw_hex: KeyHexData[]
): Promise<KeyValueMap[]> => {
    const body = {
        key_value_store_address: `${keyValueStoreAddress}`,
        keys: raw_hex,
    };
    const res: ResponseDataKVSDataState = await fetch(
        `${process.env.GATEWAY_API_RDX}/state/key-value-store/data`,
        {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(body),
        }
    )
        .then((response) => response.json())
        .catch((err) => {
            throw new Error(err);
        });

    const keyValueMap: KeyValueMap[] = res.entries.map((item) => ({
        key: item.key.programmatic_json.value,
        value: item.value.programmatic_json.value,
    }));
    return keyValueMap;
};
