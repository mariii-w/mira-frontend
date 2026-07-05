import { afterEach, describe, expect, it, vi } from "vitest";
import {
  finishPasskeyAuthentication,
  finishPasskeyRegistration,
  startPasskeyAuthentication,
  startPasskeyRegistration,
} from "../api/mira";
import { registerPasskey, startPasskeyLogin } from "../lib/passkeyAuth";

vi.mock("../api/mira", () => ({
  finishPasskeyAuthentication: vi.fn(),
  finishPasskeyRegistration: vi.fn(),
  startPasskeyAuthentication: vi.fn(),
  startPasskeyRegistration: vi.fn(),
}));

const mockedFinishAuthentication = vi.mocked(finishPasskeyAuthentication);
const mockedFinishRegistration = vi.mocked(finishPasskeyRegistration);
const mockedStartAuthentication = vi.mocked(startPasskeyAuthentication);
const mockedStartRegistration = vi.mocked(startPasskeyRegistration);

function bytes(value: string) {
  return Uint8Array.from(value, (char) => char.charCodeAt(0));
}

function base64Url(value: string) {
  return btoa(value).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

afterEach(() => {
  vi.restoreAllMocks();
});

describe("passkey auth", () => {
  it("starts username-less passkey authentication and finishes with the credential JSON", async () => {
    class TestPublicKeyCredential {
      id = "credential-id";
      rawId = bytes("raw-id").buffer;
      type = "public-key";
      response = {
        authenticatorData: bytes("authenticator-data").buffer,
        clientDataJSON: bytes("client-data").buffer,
        signature: bytes("signature").buffer,
        userHandle: bytes("user-handle").buffer,
      };
    }
    Object.defineProperty(window, "PublicKeyCredential", {
      configurable: true,
      value: TestPublicKeyCredential,
    });
    const challengeId = "challenge-1";
    mockedStartAuthentication.mockResolvedValue({
      data: {
        challengeId,
        options: {
          challenge: base64Url("challenge"),
          rpId: "localhost",
          userVerification: "preferred",
        },
      },
      status: 200,
      headers: new Headers(),
    });
    mockedFinishAuthentication.mockResolvedValue({
      data: { accessToken: "access-token" },
      status: 200,
      headers: new Headers(),
    });
    const credentialsGet = vi
      .fn()
      .mockResolvedValue(new TestPublicKeyCredential());
    Object.defineProperty(navigator, "credentials", {
      configurable: true,
      value: { get: credentialsGet },
    });

    await expect(startPasskeyLogin()).resolves.toEqual({
      accessToken: "access-token",
    });

    expect(mockedStartAuthentication).toHaveBeenCalledWith({
      credentials: "include",
    });
    expect(credentialsGet).toHaveBeenCalledWith({
      publicKey: {
        challenge: bytes("challenge").buffer,
        rpId: "localhost",
        userVerification: "preferred",
      },
    });
    expect(mockedFinishAuthentication).toHaveBeenCalledWith(
      {
        challengeId,
        credential: {
          id: "credential-id",
          rawId: base64Url("raw-id"),
          type: "public-key",
          response: {
            authenticatorData: base64Url("authenticator-data"),
            clientDataJSON: base64Url("client-data"),
            signature: base64Url("signature"),
            userHandle: base64Url("user-handle"),
          },
        },
      },
      { credentials: "include" },
    );
  });

  it("starts passkey registration and finishes with the attestation credential JSON", async () => {
    class TestPublicKeyCredential {
      id = "new-credential-id";
      rawId = bytes("new-raw-id").buffer;
      type = "public-key";
      response = {
        attestationObject: bytes("attestation-object").buffer,
        clientDataJSON: bytes("registration-client-data").buffer,
        getTransports: () => ["internal"],
      };
      getClientExtensionResults = () => ({ credProps: { rk: true } });
    }
    Object.defineProperty(window, "PublicKeyCredential", {
      configurable: true,
      value: TestPublicKeyCredential,
    });
    const challengeId = "registration-challenge-1";
    mockedStartRegistration.mockResolvedValue({
      data: {
        challengeId,
        options: {
          publicKey: {
            challenge: base64Url("registration-challenge"),
            rp: { name: "Mira", id: "localhost" },
            user: {
              id: base64Url("user-id"),
              name: "mira@example.com",
              displayName: "Mira Hofer",
            },
            pubKeyCredParams: [{ type: "public-key", alg: -7 }],
            authenticatorSelection: {
              residentKey: "required",
              userVerification: "preferred",
            },
            excludeCredentials: [
              { id: base64Url("existing-credential"), type: "public-key" },
            ],
          },
        },
      },
      status: 200,
      headers: new Headers(),
    });
    mockedFinishRegistration.mockResolvedValue({
      data: { accessToken: "fresh-access-token" },
      status: 200,
      headers: new Headers(),
    });
    const credentialsCreate = vi
      .fn()
      .mockResolvedValue(new TestPublicKeyCredential());
    Object.defineProperty(navigator, "credentials", {
      configurable: true,
      value: { create: credentialsCreate },
    });

    await expect(registerPasskey()).resolves.toEqual({
      accessToken: "fresh-access-token",
    });

    expect(mockedStartRegistration).toHaveBeenCalledWith({
      credentials: "include",
    });
    expect(credentialsCreate).toHaveBeenCalledWith({
      publicKey: {
        challenge: bytes("registration-challenge").buffer,
        rp: { name: "Mira", id: "localhost" },
        user: {
          id: bytes("user-id").buffer,
          name: "mira@example.com",
          displayName: "Mira Hofer",
        },
        pubKeyCredParams: [{ type: "public-key", alg: -7 }],
        authenticatorSelection: {
          residentKey: "required",
          userVerification: "preferred",
        },
        excludeCredentials: [
          { id: bytes("existing-credential").buffer, type: "public-key" },
        ],
      },
    });
    expect(mockedFinishRegistration).toHaveBeenCalledWith(
      {
        challengeId,
        credential: {
          id: "new-credential-id",
          rawId: base64Url("new-raw-id"),
          type: "public-key",
          response: {
            attestationObject: base64Url("attestation-object"),
            clientDataJSON: base64Url("registration-client-data"),
            transports: ["internal"],
          },
          clientExtensionResults: { credProps: { rk: true } },
        },
      },
      { credentials: "include" },
    );
  });
});
