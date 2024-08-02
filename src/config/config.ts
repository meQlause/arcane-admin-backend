import * as dotenv from 'dotenv';
dotenv.config();

const mode = `${process.env.MODE}`;
console.log(mode);
if (!['dev_stokenet', 'public_stokenet', 'mainnet'].includes(mode)) {
    throw new Error(`Invalid mode`);
}

export type config = {
    port: number;
    ipfsKey: string;
    jwtSecret: string;
    gatewayRadix: string;
    expectedOrigin: string;
    userDb: string;
    passwordDb: string;
    dappsName: string;
    arcaneBadgeAddress: string;
    dappsDefinitionAddress: string;
};

const data = {
    public_stokenet: {
        port: 4000,
        jwtSecret: 'arcane123$$$$$@!@',
        ipfsKey: 'sk_live_00998243-feff-49f8-a092-8cb33d87e5c9',
        gatewayRadix: 'https://stokenet.radixdlt.com',
        expectedOrigin: 'https://arcanedev.site',
        userDb: `${process.env.USER_DB}`,
        passwordDb: `${process.env.PASSWORD_DB}`,
        dappsName: 'Arcane Labyrinth',
        arcaneBadgeAddress:
            'resource_tdx_2_1nfyuwrfm07kr78fhxhdut2vhhfrz64cgfhkn2j6p2yyg6vaklk35ga',
        dappsDefinitionAddress:
            'account_tdx_2_129wsptp9d7fdrj7pqgpnwv59k2q9ywc2cy38047peha5axkgugrvkc',
    } satisfies config,
    dev_stokenet: {
        port: 4000,
        jwtSecret: 'arcane123$$$$$@!@',
        ipfsKey: 'sk_live_00998243-feff-49f8-a092-8cb33d87e5c9',
        gatewayRadix: 'https://stokenet.radixdlt.com',
        expectedOrigin: 'https://172.18.116.39',
        userDb: 'postgres',
        passwordDb: 'postgres',
        dappsName: 'Arcane Labyrinth',
        arcaneBadgeAddress:
            'resource_tdx_2_1n2f8uyhay45rdnfmjxc8x60jcpzp6rzzul9xd0se7gmdupjz8ctgug',
        dappsDefinitionAddress:
            'account_tdx_2_12xzlmnujxlzkwhpk6efeeg3a7dsjqj7wtdv39psu9uzdqalnukkame',
    } satisfies config,
}[mode];

const envConfig = { mode, ...data };

export default envConfig;
