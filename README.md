# [EthDenver 2021 workshop](https://ceramicstudio.github.io/eth-denver-2021/)

An example app built with [IDX](https://idx.xyz/).

## Technologies

- [Ceramic HTTP Client](https://developers.ceramic.network/reference/javascript/clients/#http-client): Provides access to the Ceramic Network via a remote node running Ceramic (and IPFS).
- [3ID Connect](https://developers.ceramic.network/build/authentication/#did-provider-or-wallet): Provides authentication to a DID (used by Ceramic) from a blockchain wallet, and stores a link from this blockchain account to your DID in IDX.
- [IDX](https://idx.xyz/): Provides a way to create identity records for a DID. Records are stored on Ceramic and can represent links to blockchain accounts or other user data.

## Using demo app as a template



### Instructions
Install dependencies:
```sh
npm ci
```
Start the development server:
```sh
npm start
```

Install Ceramic and IDX:

```sh
npm install -g @ceramicnetwork/cli @ceramicstudio/idx-cli
```

Run the Ceramic daemon:

```sh
ceramic deamon
```

Create a developer DID used to author the schema and definition:

```sh
idx did:create --label=local
```

Publish the schema (can be found below):

```sh
idx schema:publish local '{"$schema":"http://json-schema.org/draft-07/schema#"...'
```

Create the definition:

```sh
idx definition:create local --schema=<schema-url-from-above> --name="Secret Notes" --description="Seret notes for myself and others"
```

Open the `src/idx.ts` file and edit the aliases variable `secretNotes ` to the DocID returned by the previous command.

### Schema used by this app

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "type": "object",
  "title": "SecretNotes",
  "properties": {
    "notes": {
      "type": "array",
      "items": { "$ref": "#/definitions/NoteJWE" }
    }
  },
  "additionalProperties": false,
  "required": [ "notes" ],
  "definitions": {
    "NoteJWE": {
      "type": "object",
      "properties": {
        "protected": { "type": "string" },
        "iv": { "type": "string" },
        "ciphertext": { "type": "string" },
        "tag": { "type": "string" },
        "aad": { "type": "string" },
        "recipients": {
          "type": "array",
          "items": {
            "type": "object",
            "properties": {
              "header": { "type": "object" },
              "encrypted_key": { "type": "string" }
            },
            "required": [ "header", "encrypted_key" ]
          }
        }
      },
      "required": [ "protected", "iv", "ciphertext", "tag" ]
    }
  }
}
```






## License

Apache-2.0 OR MIT
