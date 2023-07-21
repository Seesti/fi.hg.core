// Copyright (c) 2023. Heusala Group Oy <info@heusalagroup.fi>. All rights reserved.

import { ProcessUtils } from "../ProcessUtils";
ProcessUtils.initEnvFromDefaultFiles();

import HTTP from "http";
import HTTPS from "https";
import { NodeRequestClient } from "../../node/requestClient/node/NodeRequestClient";
import { RequestClient } from "../RequestClient";
import { HttpOpAuthClient } from "./HttpOpAuthClient";
import { LogLevel } from "../types/LogLevel";
import { HgNode } from "../../node/HgNode";
import { OP_SANDBOX_URL } from "./op-constants";

const API_SERVER = process.env.OP_SANDBOX_URL ?? OP_SANDBOX_URL;
const CLIENT_ID = process.env.OP_CLIENT_ID ?? '';
const CLIENT_SECRET = process.env.OP_CLIENT_SECRET ?? '';
const MTLS_KEY = process.env.OP_MTLS_KEY ?? '';
const MTLS_CRT = process.env.OP_MTLS_CRT ?? '';

/**
 * To run these tests, create `.env` file like this:
 * ```
 * OP_SANDBOX_URL=sandbox-url
 * OP_CLIENT_ID=clientId
 * OP_CLIENT_SECRET=clientSecret
 * OP_MTLS_KEY="-----BEGIN RSA PRIVATE KEY-----
 * ...
 * -----END RSA PRIVATE KEY-----"
 * OP_MTLS_CRT="-----BEGIN CERTIFICATE-----
 * ...
 * -----END CERTIFICATE-----"
 * ```
 *
 * @see https://op-developer.fi/products/banking/docs/op-corporate-payment-api#section/Usage-example
 */
describe('system', () => {
    (CLIENT_ID ? describe : describe.skip)('HttpOpAuthClient', () => {
        let client : HttpOpAuthClient;

        beforeAll(() => {
            RequestClient.setLogLevel(LogLevel.NONE);
            NodeRequestClient.setLogLevel(LogLevel.NONE);
            HttpOpAuthClient.setLogLevel(LogLevel.NONE);
            HgNode.initialize();
        });

        beforeEach(() => {
            const requestClient = RequestClient.create(
                NodeRequestClient.create(
                    HTTP,
                    HTTPS,
                    {
                        cert: MTLS_CRT,
                        key: MTLS_KEY,
                    }
                )
            );
            client = HttpOpAuthClient.create(
                requestClient,
                CLIENT_ID,
                CLIENT_SECRET,
                API_SERVER,
            );
        });

        describe('#isAuthenticated', () => {
            it('should return false if not authenticated', () => {
                expect(client.isAuthenticated()).toBeFalsy();
            });
        });

        describe('#authenticate', () => {
            it('should authenticate successfully', async () => {
                await client.authenticate();
                expect(client.isAuthenticated()).toBeTruthy();
            });
        });

        describe('#getAccessKey', () => {

            it('should throw an error if not authenticated', () => {
                expect(() => {
                    client.getAccessKey();
                }).toThrowError('Not authenticated');
            });

            it('should return access key when authenticated', async () => {
                await client.authenticate();
                const accessKey = client.getAccessKey();
                expect(typeof accessKey).toBe('string');
            });

        });

    });

});
