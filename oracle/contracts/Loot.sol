// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "../interfaces/IOracle.sol";
import "@openzeppelin/contracts/token/ERC1155/IERC1155.sol";
import "@openzeppelin/contracts/token/ERC1155/IERC1155Receiver.sol";
import "@openzeppelin/contracts/token/ERC1155/extensions/IERC1155MetadataURI.sol";
import "@openzeppelin/contracts/utils/Address.sol";
import "@openzeppelin/contracts/utils/introspection/ERC165.sol";

/**
 * @dev Implementation of the basic standard multi-token.
 * Modified version of OpenZeppelin's ERC1155 implementation
 * https://eips.ethereum.org/EIPS/eip-1155
 * https://docs.openzeppelin.com/contracts/4.x/api/token/erc1155
 */
contract Loot is ERC165, IERC1155, IERC1155MetadataURI {
    using Address for address;

    // Total balance of user
    mapping(address => uint256) private _balance;

    // Mapping from token ID to account balances
    mapping(uint256 => mapping(address => uint256)) private _balances;

    // Mapping from account to operator approvals
    mapping(address => mapping(address => bool)) private _operatorApprovals;

    // Used as the URI for all token types by relying on ID substitution, e.g. https://token-cdn-domain/{id}.json
    string private _uri;

    // Contract name (used for marketplaces)
    string public name;

    // Contract symbol (used for marketplaces)
    string public symbol;

    // The Oracle contract
    IOracle oracle;

    // Items
    enum Item {
        // Ear
        EARRING,
        // Eyes
        BIG_SHADES,
        BLUE_EYE_SHADOW,
        CLASSIC_SHADES,
        CLOWN_EYES_BLUE,
        CLOWN_EYES_GREEN,
        EYE_MASK,
        EYE_PATCH,
        GREEN_EYE_SHADOW,
        HORNED_RIM_GLASSES,
        NERD_GLASSES,
        PURPLE_EYE_SHADOW,
        REGULAR_SHADES,
        SMALL_SHADES,
        THREE_D_GLASSES,
        VR,
        WELDING_GOGGLES,
        // Face
        MOLE,
        ROSY_CHEEKS,
        SPOTS,
        VAMPIRE_HAIR,
        // Facial_hair
        BIG_BEARD,
        CHINSTRAP,
        FRONT_BEARD,
        FRONT_BEARD_DARK,
        GOAT,
        HANDLEBARS,
        LUXURIOUS_BEARD,
        MUSTACHE,
        MUTTONCHOPS,
        NORMAL_BEARD,
        NORMAL_BEARD_BLACK,
        SHADOW_BEARD,
        // Head
        BANDANA,
        BEANIE,
        BLONDE_BOB,
        BLONDE_SHORT,
        CAP,
        CAP_FORWARD,
        CLOWN_HAIR_GREEN,
        COWBOY_HAT,
        CRAZY_HAIR,
        DARK_HAIR,
        DO_RAG,
        FEDORA,
        FRUMPY_HAIR,
        HALF_SHAVED,
        HEADBAND,
        HOODIE,
        KNITTED_CAP,
        MESSY_HAIR,
        MOHAWK,
        MOHAWK_DARK,
        MOHAWK_THIN,
        ORANGE_SIDE,
        PEAK_SPIKE,
        PIGTAILS,
        PILOT_HELMET,
        PINK_WITH_HAT,
        POLICE_CAP,
        PURPLE_HAIR,
        RED_MOHAWK,
        SHAVED_HEAD,
        STRAIGHT_HAIR,
        STRAIGHT_HAIR_BLONDE,
        STRAIGHT_HAIR_DARK,
        STRINGY_HAIR,
        TASSLE_HAT,
        TIARA,
        TOP_HAT,
        WILD_BLONDE,
        WILD_HAIR,
        WILD_WHITE_HAIR,
        // Mouth
        BLACK_LIPSTICK,
        BUCK_TEETH,
        FROWN,
        HOT_LIPSTICK,
        MEDICAL_MASK,
        PURPLE_LIPSTICK,
        SMILE,
        // Neck
        CHOKER,
        GOLD_CHAIN,
        SILVER_CHAIN,
        // Nose
        CLOWN_NOSE,
        // Smoke
        CIGARETTE,
        PIPE,
        VAPE,
        // Species
        ALIEN,
        APE,
        HUMAN,
        ZOMBIE
    }

    /**
     * @dev See {_setURI}.
     */
    constructor(
        string memory name_,
        string memory symbol_,
        string memory uri_,
        address oracleAddress
    ) {
        name = name_;
        symbol = symbol_;
        _uri = uri_;
        oracle = IOracle(oracleAddress);
    }

    /**
     * @dev Modifier that only oracle operators may call
     */
    modifier onlyOracleOperator() {
        require(
            msg.sender == oracle.getOperator(),
            "Only the oracle operator may perform this action"
        );
        _;
    }

    /**
     * @dev See {IERC165-supportsInterface}.
     */
    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC165, IERC165)
        returns (bool)
    {
        return
            interfaceId == type(IERC1155).interfaceId ||
            interfaceId == type(IERC1155MetadataURI).interfaceId ||
            super.supportsInterface(interfaceId);
    }

    /**
     * @dev Returns the URI for token type `id`.
     */
    function uri(uint256) public view override returns (string memory) {
        return _uri;
    }

    /**
     * @dev Returns the total balance of `account`
     * @notice May not query the zero address
     */
    function balanceOf(address account)
        public
        view
        returns (uint256)
    {
        require(
            account != address(0),
            "ERC1155: balance query for the zero address"
        );
        return _balance[account];
    }

    /**
     * @dev Returns the amount of tokens of token type `id` owned by `account`.
     * @notice May not query the zero address
     */
    function balanceOf(address account, uint256 id)
        public
        view
        override
        returns (uint256)
    {
        require(
            account != address(0),
            "ERC1155: balance query for the zero address"
        );
        return _balances[id][account];
    }

    /**
     * @dev Batched version of balanceOf.
     * @notice May not query the zero address
     */
    function balanceOfBatch(address[] memory accounts, uint256[] memory ids)
        public
        view
        override
        returns (uint256[] memory)
    {
        require(
            accounts.length == ids.length,
            "ERC1155: accounts and ids length mismatch"
        );

        uint256[] memory batchBalances = new uint256[](accounts.length);

        for (uint256 i = 0; i < accounts.length; ++i) {
            batchBalances[i] = balanceOf(accounts[i], ids[i]);
        }

        return batchBalances;
    }

    /**
     * @dev Grants or revokes permission to `operator` to transfer the caller’s tokens, according to `approved`.
     * @notice `operator` cannot be the caller.
     */
    function setApprovalForAll(address operator, bool approved)
        public
        override
    {
        require(
            msg.sender != operator,
            "ERC1155: setting approval status for self"
        );

        _operatorApprovals[msg.sender][operator] = approved;
        emit ApprovalForAll(msg.sender, operator, approved);
    }

    /**
     * @dev Returns true if `operator` is approved to transfer `account`'s tokens.
     */
    function isApprovedForAll(address account, address operator)
        public
        view
        override
        returns (bool)
    {
        return _operatorApprovals[account][operator];
    }

    /**
     * @dev Transfers amount tokens of token type `id` from `from` to `to`.
     * @notice May not query the zero address
     * @notice If the caller is not `from`, it must be have been approved to spend `from`'s tokens via setApprovalForAll.
     * @notice `from` must have a balance of tokens of type `id` of at least `amount`.
     * @notice If `to` refers to a smart contract, it must implement IERC1155Receiver.onERC1155Received and return the acceptance magic value.
     */
    function safeTransferFrom(
        address from,
        address to,
        uint256 id,
        uint256 amount,
        bytes memory data
    ) public override {
        require(
            from == msg.sender || isApprovedForAll(from, msg.sender),
            "ERC1155: caller is not owner nor approved"
        );
        require(to != address(0), "ERC1155: transfer to the zero address");

        address operator = msg.sender;

        uint256 fromBalance = _balances[id][from];
        require(
            fromBalance >= amount,
            "ERC1155: insufficient balance for transfer"
        );
        unchecked {
            _balances[id][from] = fromBalance - amount;
            _balance[from] -= amount;
        }
        _balances[id][to] += amount;
        _balance[to] += amount;

        emit TransferSingle(operator, from, to, id, amount);

        _doSafeTransferAcceptanceCheck(operator, from, to, id, amount, data);
    }

    /**
     * @dev Batched version of safeTransferFrom.
     * @notice `ids` and `amounts` must have the same length.
     * @notice If `to` refers to a smart contract, it must implement IERC1155Receiver.onERC1155BatchReceived and return the acceptance magic value.
     */
    function safeBatchTransferFrom(
        address from,
        address to,
        uint256[] memory ids,
        uint256[] memory amounts,
        bytes memory data
    ) public override {
        require(
            from == msg.sender || isApprovedForAll(from, msg.sender),
            "ERC1155: transfer caller is not owner nor approved"
        );
        require(
            ids.length == amounts.length,
            "ERC1155: ids and amounts length mismatch"
        );
        require(to != address(0), "ERC1155: transfer to the zero address");

        address operator = msg.sender;

        for (uint256 i = 0; i < ids.length; ++i) {
            uint256 id = ids[i];
            uint256 amount = amounts[i];

            uint256 fromBalance = _balances[id][from];
            require(
                fromBalance >= amount,
                "ERC1155: insufficient balance for transfer"
            );
            unchecked {
                _balances[id][from] = fromBalance - amount;
                _balance[from] -= amount;
            }
            _balances[id][to] += amount;
            _balance[from] += amount;
        }

        emit TransferBatch(operator, from, to, ids, amounts);

        _doSafeBatchTransferAcceptanceCheck(
            operator,
            from,
            to,
            ids,
            amounts,
            data
        );
    }

    /**
     * @dev Creates `amount` tokens of token type `id`, and assigns them to `account`.
     * @notice `account` cannot be the zero address.
     * @notice If `account` refers to a smart contract, it must implement {IERC1155Receiver-onERC1155Received} and return the
     * acceptance magic value.
     */
    function mint(
        address account,
        uint256 id,
        uint256 amount,
        bytes memory data
    ) public onlyOracleOperator {
        require(account != address(0), "ERC1155: mint to the zero address");

        address operator = msg.sender;

        _balances[id][account] += amount;
        _balance[account] += amount;
        emit TransferSingle(operator, address(0), account, id, amount);

        _doSafeTransferAcceptanceCheck(
            operator,
            address(0),
            account,
            id,
            amount,
            data
        );
    }

    /**
     * @dev Batched version of _mint.
     * @notice `ids` and `amounts` must have the same length.
     * @notice - If `to` refers to a smart contract, it must implement {IERC1155Receiver-onERC1155BatchReceived} and return the
     * acceptance magic value.
     */
    function mintBatch(
        address to,
        uint256[] memory ids,
        uint256[] memory amounts,
        bytes memory data
    ) public onlyOracleOperator {
        require(to != address(0), "ERC1155: mint to the zero address");
        require(
            ids.length == amounts.length,
            "ERC1155: ids and amounts length mismatch"
        );

        address operator = msg.sender;

        for (uint256 i = 0; i < ids.length; i++) {
            _balances[ids[i]][to] += amounts[i];
            _balance[to] += amounts[i];
        }

        emit TransferBatch(operator, address(0), to, ids, amounts);

        _doSafeBatchTransferAcceptanceCheck(
            operator,
            address(0),
            to,
            ids,
            amounts,
            data
        );
    }

    function _doSafeTransferAcceptanceCheck(
        address operator,
        address from,
        address to,
        uint256 id,
        uint256 amount,
        bytes memory data
    ) private {
        if (to.isContract()) {
            try
                IERC1155Receiver(to).onERC1155Received(
                    operator,
                    from,
                    id,
                    amount,
                    data
                )
            returns (bytes4 response) {
                if (response != IERC1155Receiver.onERC1155Received.selector) {
                    revert("ERC1155: ERC1155Receiver rejected tokens");
                }
            } catch Error(string memory reason) {
                revert(reason);
            } catch {
                revert("ERC1155: transfer to non ERC1155Receiver implementer");
            }
        }
    }

    function _doSafeBatchTransferAcceptanceCheck(
        address operator,
        address from,
        address to,
        uint256[] memory ids,
        uint256[] memory amounts,
        bytes memory data
    ) private {
        if (to.isContract()) {
            try
                IERC1155Receiver(to).onERC1155BatchReceived(
                    operator,
                    from,
                    ids,
                    amounts,
                    data
                )
            returns (bytes4 response) {
                if (
                    response != IERC1155Receiver.onERC1155BatchReceived.selector
                ) {
                    revert("ERC1155: ERC1155Receiver rejected tokens");
                }
            } catch Error(string memory reason) {
                revert(reason);
            } catch {
                revert("ERC1155: transfer to non ERC1155Receiver implementer");
            }
        }
    }
}
