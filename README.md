# Punk Loot

> The metaverse's first loot oracle, made for utilisation with [CryptoPunks](https://github.com/larvalabs/cryptopunks) by [LarvaLabs](https://www.larvalabs.com/) (_not affiliated_).

### Table of Contents

1. [Loot Oracles](#loot-oracles)
1. [Plain English (for non-developers)](#plain-english)
1. [Small Changes](#small-changes)

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

**View the source code of the contracts in [contracts/](contracts/)**.

### API

The external API will act as an Ethereum event listener with the following requirements:

- The external API **_must_** contain the private key for the oracle operator address
- The logic **_must_** prevent against duplicate mints (1 original NFT = 1 loot mint)
- If the API has downtime, it **_must_** be able to resume missed transactions

**View the source code of the API in [api/](api/)**.

## Plain English

To a non-developer, a loot oracle seems like a foreign concept. This section aims to break down what a loot oracle does in plain english.

The goal of a loot oracle is to take one NFT and break it down into many NFTs. For example, you may have an original CryptoPunk that is a Zombie, has a Beanie, Sunglasses, and an Earring. Right now you have _one_ NFT but in the end you would have _four_: Zombie Head, Beanie, Sunglasses, and Earring, all of which can be traded seperately.

First you would transfer the original _Wrapped_<sup>\*</sup> CryptoPunk to the oracle. Once the oracle receives the CryptoPunk, it will trigger the blockchain to release a message saying that it received the CryptoPunk.

A server exists outside of the blockchain (called the external API) that continuously listens for this message on the blockchain. Once it finds the message, it then mints the four new items to the same account that sent the original CryptoPunk.

After the loot oracle mints the new loot NFTs, they are now freely tradeable on NFT marketplaces and will appear in your wallet.

Because the external API needs to mint new items, the oracle must be funded to cover gas fees. The oracle fees are subject to change but will be a flat fee of some amount of Ether. At the project genesis, the price for the oracle is `0.1 ETH` or `100000000000000000 wei`.

In most cases, a web application will walk you through this process. The classic example for this repository is [punk.loot.st](https://punk.loot.st/) which is open source in the [web-app](web-app/) folder.

<sup>\* The CryptoPunk must be wrapped because original CryptoPunks do not follow the ERC721 standard and are not treated as real NFTs.</sup>

## Small Changes

- For every item that is minted, there is a 1/100 chance that the loot item is shiny (like [shiny Pokémon](https://bulbapedia.bulbagarden.net/wiki/Shiny_Pok%C3%A9mon)), meaning if you have 3 punk attributes, there is a 3/100 chance you will receive an extra rare loot item
- All punks regardless of species can be changed to either Large (forrmerly known as "Male") or Petite (formerly known as "Female"), at no extra cost
- All punks of the Human species can change skin color between Default, Dark, Darker, Light, and Lighter, at no extra cost
- Vampire hair trait was moved to the facial hair slot since it was previously it's own slot, but the minter will receive both the facial hair and the vampire hair loot in their wallet
