# CryptoPunk Loot Oracle

> The metaverse's first Loot Oracle, made for utilisation with [CryptoPunks](https://github.com/larvalabs/cryptopunks) by [LarvaLabs](https://www.larvalabs.com/) (_not affiliated_).

### Table of Contents

1. [Theory](#theory)
1. [Loot Oracles](#loot-oracles)
1. [Plain English (for non-developers)](#plain-english)

## Theory

Traditional NFTs are stored as numbers on the blockchain that corresponded to images on the internet. Loot takes the approach of storing NFT traits on a blockchain that can be interpreted by external applications in any way they choose.

It is important to note that **there will never be more items than already exist on CryptoPunks**, therefore should not impact the value or rarity of any Loot for CryptoPunks items. One CryptoPunk will always yield it's respective items.

With original CryptoPunks there are 10,000 NFTs. With Loot for CryptoPunks there are potentially 37,539 NFTs.

With original CryptoPunks, there are 10,000 combinations. With Loot for CryptoPunks, there are 185,569,280 possible combinations.

## Loot Oracles

CryptoPunk Loot aims to be the first step in defining a standard for Loot Oracles pertaining to `ERC721` and `ERC1155` NFTs.

The concept behind a Loot Oracle is as follows:

1. An original NFT exists on the blockchain but it's traits exist off the chain
2. The NFT is sent to an Oracle Contract that handles the reception of either ERC721 or ERC1155 tokens
3. The Oracle Contract emits an event, `ERC721Received` or `ERC1155Received`, that is listened for by an Oracle
4. The external Oracle uses it's logic to mint a new Loot item (or multiple Loot items)

### Contracts

- `Oracle.sol` is an `ERC721Receiver` or `ERC1155Receiver`
- `Loot.sol` is an `ERC721` or `ERC1155` token

**View the source code of the contracts in [contracts/](contracts/)**.

### Oracle

The external Oracle will act as an Ethereum event listener with the following requirements:

- The external Oracle **_must_** contain the private key for the Oracle operator address
- The logic **_must_** prevent against duplicate mints (1 original NFT = 1 Loot mint)
- If the Oracle has downtime, it **_must_** be able to resume missed transactions

**View the source code of the Oracle in [oracle/](oracle/)**.

## Plain English

To a non-developer, a Loot Oracle seems like a foreign concept. This section aims to break down what a Loot Oracle does in plain english.

The goal of a Loot Oracle is to take one NFT and break it down into many NFTs. For example, you may have an original CryptoPunk that is a Zombie, has a Beanie, Sunglasses, and an Earring. Right now you have _one_ NFT but in the end you would have _four_: Zombie Head, Beanie, Sunglasses, and Earring, all of which can be traded seperately. These new NFT's are known as "**Loot**".

The process is as follows:

First an original CryptoPunk is sent to the Oracle. Once the Oracle receives the CryptoPunk, it will trigger the blockchain to release a message saying that it received the CryptoPunk.

A server exists outside of the blockchain (called the external Oracle) that continuously listens for this message on the blockchain. Once it finds the message, it then mints the four new items to the same account that sent the original CryptoPunk.

After the Loot Oracle mints the new Loot NFTs, they are now freely tradeable on NFT marketplaces and will appear in your wallet.

Because the external Oracle needs to mint new items, the Oracle must be funded to cover gas fees. The Oracle fees are subject to change but will be a flat fee of some amount of Ether. At the project genesis, the price for the Oracle is `0.1 ETH` or `100000000000000000 wei`.

In most cases, a web application will walk you through this process. The classic example for this repository is [punk.loot.st](https://punk.loot.st/) which is open source in the [web-app](web-app/) folder.
