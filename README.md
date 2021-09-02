# Punk Loot

> The metaverse's first loot oracle, made for utilisation with [CryptoPunks](https://github.com/larvalabs/cryptopunks) by [LarvaLabs](https://www.larvalabs.com/) (*not affiliated*).

## Loot Oracles

Punk Loot aims to be the first step in defining a standard for loot oracles pertaining to `ERC721` and `ERC1155` NFTs.

The concept behind a loot oracle is as follows:

1. An original NFT exists on the blockchain but it's traits exist off the chain
2. The NFT is sent to an oracle that handles the reception of either ERC721 or ERC1155 tokens
3. The oracle emits an event, `ERC721Received` or `ERC1155Received`, that is listened for by an external API
4. The external API uses it's logic to mint a new loot item (or multiple loot items)

### Contracts

- `Oracle.sol` is an `ERC721Receiver` or `ERC1155Receiver`
- `Loot.sol` is an `ERC721` or `ERC1155` token
- `Traits.sol` is a library that defines the new loot items

**View the source code of the contracts in [contracts/](contracts/)**.

### API

The external API will act as an Ethereum event listener with the following requirements:

- The external API ***must*** contain the private key for the oracle operator address
- The logic ***must*** prevent against duplicate mints (1 original NFT = 1 loot mint)
- If the API has downtime, it ***must*** be able to resume missed transactions

**View the source code of the API in [api/](api/)**.
