// Copyright (c) 2023. Heusala Group Oy <info@heusalagroup.fi>. All rights reserved.

import { ProcessUtils } from "../ProcessUtils";

ProcessUtils.initEnvFromDefaultFiles();

import HTTP from "http";
import HTTPS from "https";
import { HgNode } from "../../node/HgNode";
import { OP_SANDBOX_URL } from "./op-constants";
import { OpPaymentClient } from "./OpPaymentClient";
import { OpPaymentRequestDTO } from "./types/OpPaymentRequestDTO";
import { Currency } from "../types/Currency";
import { CountryCode } from "../types/CountryCode";
import { OpPaymentResponseDTO } from "./types/OpPaymentResponseDTO";
import { NodeRequestClient } from "../../node/requestClient/node/NodeRequestClient";
import { RequestClient } from "../RequestClient";
import { HttpOpPaymentClient } from "./HttpOpPaymentClient";
import { HttpOpAuthClient } from "./HttpOpAuthClient";
import { LogLevel } from "../types/LogLevel";

const API_SERVER = OP_SANDBOX_URL;
const CLIENT_ID = process.env.OP_CLIENT_ID ?? '';
const CLIENT_SECRET = process.env.OP_CLIENT_SECRET ?? '';
const SIGNING_KEY = process.env.OP_SIGNING_KEY ?? '';
const SIGNING_KID = process.env.OP_SIGNING_KID ?? '';
const MTLS_KEY = process.env.OP_MTLS_KEY ?? '';
const MTLS_CRT = process.env.OP_MTLS_CRT ?? '';

/**
 * To run these tests, create `.env` file like this:
 * ```
 * OP_CLIENT_ID=clientId
 * OP_CLIENT_SECRET=clientSecret
 * OP_SIGNING_KEY="-----BEGIN RSA PRIVATE KEY-----
 * ...
 * -----END RSA PRIVATE KEY-----"
 * OP_SIGNING_KID=signing-kid
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
    (CLIENT_ID ? describe : describe.skip)('HttpOpPaymentClient', () => {
        let client : OpPaymentClient;

        beforeAll(() => {
            RequestClient.setLogLevel(LogLevel.NONE);
            NodeRequestClient.setLogLevel(LogLevel.NONE);
            HttpOpAuthClient.setLogLevel(LogLevel.NONE);
            HttpOpPaymentClient.setLogLevel(LogLevel.NONE);
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
            client = HttpOpPaymentClient.create(
                requestClient,
                HttpOpAuthClient.create(
                    requestClient,
                    CLIENT_ID,
                    CLIENT_SECRET,
                    API_SERVER,
                ),
                SIGNING_KEY,
                SIGNING_KID,
                API_SERVER,
            );
        });

        describe('#createPayment', () => {

            it('should return a successful response with valid input', async () => {

                const instructionId = `${Date.now()}`; // unique instruction id
                const endToEndId = "endToEndId";

                const paymentRequest : OpPaymentRequestDTO = {
                    instructionId,
                    endToEndId,
                    creditor: {
                        name: "Creditor Name",
                        iban: "FI3859991620004143",
                        address: {
                            addressLine: ["a1", "a2"],
                            country: CountryCode.FI
                        }
                    },
                    debtor: {
                        name: "Debtor Name",
                        iban: "FI6359991620004275",
                        address: {
                            addressLine: ["a1", "a2"],
                            country: CountryCode.FI
                        }
                    },
                    instructedAmount: {
                        currency: Currency.EUR,
                        amount: "0.16"
                    },
                    reference: "00000000000000482738"
                };

                const paymentResponse : OpPaymentResponseDTO = await client.createPayment(paymentRequest);
                expect(paymentResponse).toBeDefined();
                expect(paymentResponse.transactionId).toBeDefined();
                expect(paymentResponse.status).toBeDefined();
                expect(paymentResponse.endToEndId).toBe(endToEndId);

            });

        });

    });

});
