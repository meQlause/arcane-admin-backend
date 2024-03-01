import * as dotenv from 'dotenv';
dotenv.config();

export default () => ({
    port: `${process.env.PORT}`,
    jwtSecret: `${process.env.JWT_SECRET}`,
    gatewayRadix: `${process.env.GATEWAY_API_RDX}`,
    expectedOrigin: `${process.env.EXPECTED_ORIGIN}`,
    userDb: `${process.env.USER_DB}`,
    passwordDb: `${process.env.PASSWORD_DB}`,
    dappsName: `${process.env.DAPPS_NAME}`,
    dappsDefinitionAddress: `${process.env.DAPPS_DEVICE_ADDRESS}`,
    adminResourceAddress: `${process.env.ADMIN_RESOURCE_ADDRESS}`,
    memberResourceAddress: `${process.env.MEMBER_RESOURCE_ADDRESS}`,
});
