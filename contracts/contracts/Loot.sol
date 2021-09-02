//SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./Oracle.sol";
import "./Traits.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/IERC721Metadata.sol";
import "@openzeppelin/contracts/utils/introspection/IERC165.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721Receiver.sol";
import "@openzeppelin/contracts/utils/introspection/ERC165.sol";
import "@openzeppelin/contracts/utils/Address.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

/**
 * @title Loot NFT
 * @dev This contract is a light implementation of ERC721 to save on gas and bloat
 * @notice Much of this code is taken from the OpenZeppelin ERC721 implementation
 *         https://docs.openzeppelin.com/contracts/4.x/api/token/erc721
 */
contract Loot is ERC165, IERC721, IERC721Metadata {
    using Address for address;
    using Strings for uint256;

    // Token name
    string private _name;

    // Token symbol
    string private _symbol;

    // Token base URI
    string private _baseURI;

    // The oracle
    Oracle private _oracle;

    // Index of the current token
    uint256 private _index;

    // Mapping of the index to a specific trait
    mapping(uint256 => Traits.Trait) private _tokens;

    // Mapping from token ID to owner address
    mapping(uint256 => address) private _owners;

    // Mapping owner address to token count
    mapping(address => uint256) private _balances;

    // Mapping from token ID to approved address
    mapping(uint256 => address) private _tokenApprovals;

    // Mapping from owner to operator approvals
    mapping(address => mapping(address => bool)) private _operatorApprovals;

    // Mapping that checks if punk has already been looted
    mapping(uint256 => bool) private _punkMinted;

    // Event called when a punk is consumed
    event PunkConsumed(uint256 indexed punkId, address indexed to);

    /**
     * @dev Initializes the contract by setting a `name` and a `symbol` to the token collection
     */
    constructor(
        string memory name_,
        string memory symbol_,
        string memory baseURI_,
        address oracle_
    ) {
        _name = name_;
        _symbol = symbol_;
        _baseURI = baseURI_;
        _oracle = Oracle(oracle_);
    }

    /**
     * @dev Modifier that only oracle operators may call
     */
    modifier onlyOracleOperator() {
        require(
            msg.sender == _oracle.operator(),
            "Only the oracle operator may perform this action"
        );
        _;
    }

    /**
     * @dev Gets the oracle operator address
     */
    function getOracle() public view returns (address) {
        return address(_oracle);
    }

    /**
     * @dev Defines the ERC165 interfaces
     */
    function supportsInterface(bytes4 interfaceId)
        public
        view
        virtual
        override(ERC165, IERC165)
        returns (bool)
    {
        return
            interfaceId == type(IERC721).interfaceId ||
            interfaceId == type(IERC721Metadata).interfaceId ||
            super.supportsInterface(interfaceId);
    }

    /**
     * @dev Check the balance of the provided address
     * @notice Does not throw for zero address queries
     */
    function balanceOf(address owner)
        public
        view
        virtual
        override
        returns (uint256)
    {
        return _balances[owner];
    }

    /**
     * @dev Get the owner of a specific token
     * @notice Does not throw for zero address queries
     */
    function ownerOf(uint256 tokenId)
        public
        view
        virtual
        override
        returns (address)
    {
        address owner = _owners[tokenId];
        return owner;
    }

    /**
     * @dev Transfers a token and checks that the receiver accepts ERC721 tokens
     */
    function safeTransferFrom(
        address from,
        address to,
        uint256 tokenId
    ) public virtual override {
        address owner = Loot.ownerOf(tokenId);
        require(_owners[tokenId] != address(0), "The token does not exist");
        require(
            msg.sender == owner ||
                getApproved(tokenId) == msg.sender ||
                isApprovedForAll(owner, msg.sender),
            "The operator is not approved to transfer this token"
        );
        require(
            owner == from,
            "The sender does not own the token to be transfered"
        );
        require(
            to != address(0),
            "The token may not be sent to the zero address"
        );
        require(
            _checkOnERC721Received(from, to, tokenId),
            "The receiver cannot accept ERC721 tokens"
        );

        _balances[from] -= 1;
        _balances[to] += 1;
        _owners[tokenId] = to;

        emit Transfer(from, to, tokenId);
    }

    /**
     * @dev Defaults to the safe transfer method and discards data
     * @notice Required for ERC721 standard
     */
    function safeTransferFrom(
        address from,
        address to,
        uint256 tokenId,
        bytes memory _data
    ) public virtual override {
        safeTransferFrom(from, to, tokenId);
    }

    /**
     * @dev Defaults to the safe transfer method
     * @notice Required for ERC721 interface
     */
    function transferFrom(
        address from,
        address to,
        uint256 tokenId
    ) public virtual override {
        safeTransferFrom(from, to, tokenId);
    }

    /**
     * @dev Checks if the receiver can handle receiving an ERC721
     */
    function _checkOnERC721Received(
        address from,
        address to,
        uint256 tokenId
    ) private returns (bool) {
        if (to.isContract()) {
            try
                IERC721Receiver(to).onERC721Received(
                    msg.sender,
                    from,
                    tokenId,
                    ""
                )
            returns (bytes4 retval) {
                return retval == IERC721Receiver.onERC721Received.selector;
            } catch (bytes memory reason) {
                if (reason.length == 0) {
                    revert("The receiver cannot accept ERC721 tokens");
                } else {
                    assembly {
                        revert(add(32, reason), mload(reason))
                    }
                }
            }
        } else {
            return true;
        }
    }

    /**
     * @dev Approves an operator to handle the ERC721
     */
    function approve(address to, uint256 tokenId) public virtual override {
        address owner = Loot.ownerOf(tokenId);
        require(to != owner, "The owner does not need to be approved");

        require(
            msg.sender == owner || isApprovedForAll(owner, msg.sender),
            "Only owners or operators may call this function"
        );

        _tokenApprovals[tokenId] = to;
        emit Approval(Loot.ownerOf(tokenId), to, tokenId);
    }

    /**
     * @dev Checks which address is approved for given token ID
     */
    function getApproved(uint256 tokenId)
        public
        view
        virtual
        override
        returns (address)
    {
        require(
            _owners[tokenId] != address(0),
            "The provided token ID does not exist"
        );

        return _tokenApprovals[tokenId];
    }

    /**
     * @dev Approve or remove operator as an operator for the caller
     */
    function setApprovalForAll(address operator, bool approved)
        public
        virtual
        override
    {
        require(operator != msg.sender, "The sender may not be the operator");

        _operatorApprovals[msg.sender][operator] = approved;
        emit ApprovalForAll(msg.sender, operator, approved);
    }

    /**
     * @dev Returns if the operator is allowed to manage all of the assets of owner
     */
    function isApprovedForAll(address owner, address operator)
        public
        view
        virtual
        override
        returns (bool)
    {
        return _operatorApprovals[owner][operator];
    }

    /**
     * @dev Returns the name of the token
     * @notice Required for ERC721
     */
    function name() public view virtual override returns (string memory) {
        return _name;
    }

    /**
     * @dev Returns the symbol of the token
     * @notice Required for ERC721
     */
    function symbol() public view virtual override returns (string memory) {
        return _symbol;
    }

    /**
     * @dev Returns the base URI of the token
     * @notice Required for ERC721
     */
    function tokenURI(uint256 tokenId)
        public
        view
        virtual
        override
        returns (string memory)
    {
        require(
            _owners[tokenId] != address(0),
            "The provided token ID does not exist"
        );

        string memory baseURI = _baseURI;
        return
            bytes(baseURI).length > 0
                ? string(abi.encodePacked(baseURI, tokenId.toString()))
                : "";
    }

    function mint(
        uint256 punkId,
        address to,
        uint8[] memory ids,
        bool shiny
    ) public onlyOracleOperator {
        require(
            to != address(0),
            "The token may not be sent to the zero address"
        );
        require(!_punkMinted[punkId], "The CryptoPunk was already minted");

        uint256 newIndex = _index + ids.length;

        for (_index; _index < newIndex; _index++) {
            require(
                _owners[_index] == address(0),
                "The provided token ID does not exist"
            );
            require(
                _checkOnERC721Received(address(0), to, _index),
                "The receiver cannot accept ERC721 tokens"
            );

            _balances[to] += 1;
            _owners[_index] = to;

            emit Transfer(address(0), to, _index);
        }

        _punkMinted[punkId] = true;
        emit PunkConsumed(punkId, to);
    }
}
