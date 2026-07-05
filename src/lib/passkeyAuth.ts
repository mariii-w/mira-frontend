import type { TokenResponse } from "../api/model";
import type { PasskeyFinishRequest } from "../api/model/passkeyFinishRequest";
import {
  finishPasskeyAuthentication,
  finishPasskeyRegistration,
  startPasskeyAuthentication,
  startPasskeyRegistration,
} from "../api/mira";

type PublicKeyCredentialRequestOptionsJSON = Omit<
  PublicKeyCredentialRequestOptions,
  "allowCredentials" | "challenge"
> & {
  challenge: string;
  allowCredentials?: Array<
    Omit<PublicKeyCredentialDescriptor, "id"> & { id: string }
  >;
};

type PublicKeyCredentialCreationOptionsJSON = Omit<
  PublicKeyCredentialCreationOptions,
  "challenge" | "excludeCredentials" | "user"
> & {
  challenge: string;
  excludeCredentials?: Array<
    Omit<PublicKeyCredentialDescriptor, "id"> & { id: string }
  >;
  user: Omit<PublicKeyCredentialUserEntity, "id"> & { id: string };
};

type PublicKeyOptionsEnvelope<T> = T | { publicKey: T };

type AuthenticatorAssertionResponseJSON = {
  authenticatorData: string;
  clientDataJSON: string;
  signature: string;
  userHandle?: string;
};

type PublicKeyCredentialJSON = {
  id: string;
  rawId: string;
  type: PublicKeyCredential["type"];
  response: AuthenticatorAssertionResponseJSON;
  clientExtensionResults: AuthenticationExtensionsClientOutputs;
};

type AuthenticatorAttestationResponseJSON = {
  attestationObject: string;
  clientDataJSON: string;
  transports?: string[];
};

type PublicKeyCredentialRegistrationJSON = {
  id: string;
  rawId: string;
  type: PublicKeyCredential["type"];
  response: AuthenticatorAttestationResponseJSON;
  clientExtensionResults: AuthenticationExtensionsClientOutputs;
};

function base64UrlToArrayBuffer(value: string): ArrayBuffer {
  const base64 = value.replace(/-/g, "+").replace(/_/g, "/");
  const padded = base64 + "=".repeat((4 - (base64.length % 4)) % 4);
  const binary = atob(padded);
  const bytes = new Uint8Array(binary.length);

  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index);
  }

  return bytes.buffer;
}

function arrayBufferToBase64Url(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = "";

  for (const byte of bytes) {
    binary += String.fromCharCode(byte);
  }

  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function toCredentialRequestOptions(
  optionsEnvelope: PublicKeyOptionsEnvelope<PublicKeyCredentialRequestOptionsJSON>,
): PublicKeyCredentialRequestOptions {
  const options =
    "publicKey" in optionsEnvelope ? optionsEnvelope.publicKey : optionsEnvelope;

  return {
    ...options,
    challenge: base64UrlToArrayBuffer(options.challenge),
    allowCredentials: options.allowCredentials?.map((credential) => ({
      ...credential,
      id: base64UrlToArrayBuffer(credential.id),
    })),
  };
}

function toCredentialCreationOptions(
  optionsEnvelope: PublicKeyOptionsEnvelope<PublicKeyCredentialCreationOptionsJSON>,
): PublicKeyCredentialCreationOptions {
  const options =
    "publicKey" in optionsEnvelope ? optionsEnvelope.publicKey : optionsEnvelope;

  return {
    ...options,
    challenge: base64UrlToArrayBuffer(options.challenge),
    user: {
      ...options.user,
      id: base64UrlToArrayBuffer(options.user.id),
    },
    excludeCredentials: options.excludeCredentials?.map((credential) => ({
      ...credential,
      id: base64UrlToArrayBuffer(credential.id),
    })),
  };
}

function toCredentialJSON(
  credential: PublicKeyCredential,
): PublicKeyCredentialJSON {
  const response = credential.response as AuthenticatorAssertionResponse;

  return {
    id: credential.id,
    rawId: arrayBufferToBase64Url(credential.rawId),
    type: credential.type,
    clientExtensionResults: credential.getClientExtensionResults(),
    response: {
      authenticatorData: arrayBufferToBase64Url(response.authenticatorData),
      clientDataJSON: arrayBufferToBase64Url(response.clientDataJSON),
      signature: arrayBufferToBase64Url(response.signature),
      ...(response.userHandle
        ? { userHandle: arrayBufferToBase64Url(response.userHandle) }
        : {}),
    },
  };
}

function toRegistrationCredentialJSON(
  credential: PublicKeyCredential,
): PublicKeyCredentialRegistrationJSON {
  const response = credential.response as AuthenticatorAttestationResponse;

  return {
    id: credential.id,
    rawId: arrayBufferToBase64Url(credential.rawId),
    type: credential.type,
    clientExtensionResults: credential.getClientExtensionResults(),
    response: {
      attestationObject: arrayBufferToBase64Url(response.attestationObject),
      clientDataJSON: arrayBufferToBase64Url(response.clientDataJSON),
      ...(response.getTransports
        ? { transports: response.getTransports() }
        : {}),
    },
  };
}

export async function startPasskeyLogin(): Promise<TokenResponse> {
  if (!window.PublicKeyCredential || !navigator.credentials) {
    throw new Error("Passkey authentication is not supported in this browser.");
  }

  const optionsResponse = await startPasskeyAuthentication({
    credentials: "include",
  });

  if (optionsResponse.status !== 200) {
    throw new Error("Passkey authentication could not be started.");
  }
  const { challengeId, options } = optionsResponse.data;
  if (!challengeId || !options) {
    throw new Error("Passkey authentication options are incomplete.");
  }

  const credential = await navigator.credentials.get({
    publicKey: toCredentialRequestOptions(
      options as unknown as PublicKeyCredentialRequestOptionsJSON,
    ),
  });

  if (!(credential instanceof PublicKeyCredential)) {
    throw new Error("Passkey authentication was cancelled.");
  }

  const finishResponse = await finishPasskeyAuthentication(
    {
      challengeId,
      credential: toCredentialJSON(credential),
    } as unknown as PasskeyFinishRequest,
    {
      credentials: "include",
    },
  );

  if (finishResponse.status !== 200) {
    throw new Error("Passkey authentication failed.");
  }

  return finishResponse.data;
}

export async function registerPasskey(): Promise<TokenResponse> {
  if (!window.PublicKeyCredential || !navigator.credentials) {
    throw new Error("Passkey registration is not supported in this browser.");
  }

  const optionsResponse = await startPasskeyRegistration({
    credentials: "include",
  });

  if (optionsResponse.status !== 200) {
    throw new Error("Passkey registration could not be started.");
  }
  const { challengeId, options } = optionsResponse.data;
  if (!challengeId || !options) {
    throw new Error("Passkey registration options are incomplete.");
  }

  const credential = await navigator.credentials.create({
    publicKey: toCredentialCreationOptions(
      options as unknown as PublicKeyCredentialCreationOptionsJSON,
    ),
  });

  if (!(credential instanceof PublicKeyCredential)) {
    throw new Error("Passkey registration was cancelled.");
  }

  const finishResponse = await finishPasskeyRegistration(
    {
      challengeId,
      credential: toRegistrationCredentialJSON(credential),
    } as unknown as PasskeyFinishRequest,
    {
      credentials: "include",
    },
  );

  if (finishResponse.status !== 200) {
    throw new Error("Passkey registration failed.");
  }

  return finishResponse.data;
}
