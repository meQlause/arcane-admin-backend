import { Item, NFTData, ResponseData, UserRole, VaultNftId } from 'src/custom';
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
        aggregation_level: 'Vault',
    };

    return fetch(process.env.GATEWAY_API, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
    })
        .then((response) => response.json())
        .then((data) => {
            const { items }: ResponseData = data;
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

export const getAdminVaultAddressAndNftId = async (
    address: string
): Promise<VaultNftId> => {
    const body = {
        addresses: [address],
        aggregation_level: 'Vault',
        opt_ins: {
            non_fungible_include_nfids: true,
        },
    };
    const res: ResponseData = await fetch(process.env.GATEWAY_API, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
    }).then((response) => response.json());
    let nftData: NFTData | null = null;
    res.items[0].non_fungible_resources.items.some((nft) => {
        if (nft.resource_address === process.env.ADMIN_RESOURCE_ADDRESS) {
            nftData = nft;
        }
    });

    console.log(nftData);
    const vaultAddress = nftData?.vaults.items[0].vault_address;
    const nftId = nftData?.vaults.items[0].items[0];
    return { vaultAddress, nftId };
};
