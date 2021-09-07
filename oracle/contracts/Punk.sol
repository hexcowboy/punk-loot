//SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./Oracle.sol";

/**
 * @dev Defines the structure of a Punk NFT and can accept loot items
 * @notice This contract is not in use yet but will be a reference for
 * constructing a NFT from loot items in the future.
 */
contract Role {
    enum Species {
        ALIEN,
        APE,
        HUMAN,
        ZOMBIE
    }

    enum Size {
        LARGE,
        PETITE
    }

    enum Skin {
        DARK,
        DARKER,
        LIGHT,
        LIGHTER
    }

    enum Ear {
        NONE,
        EARRING
    }

    enum Eyes {
        NONE,
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
        WELDING_GOGGLES
    }

    enum Face {
        NONE,
        MOLE,
        ROSY_CHEEKS,
        SPOTS,
        VAMPIRE_HAIR
    }

    enum FacialHair {
        NONE,
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
        SHADOW_BEARD
    }

    enum Head {
        NONE,
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
        WILD_WHITE_HAIR
    }

    enum Mouth {
        NONE,
        BLACK_LIPSTICK,
        BUCK_TEETH,
        FROWN,
        HOT_LIPSTICK,
        MEDICAL_MASK,
        PURPLE_LIPSTICK,
        SMILE
    }

    enum Neck {
        NONE,
        CHOKER,
        GOLD_CHAIN,
        SILVER_CHAIN
    }

    enum Nose {
        NONE,
        CLOWN_NOSE
    }

    enum Smoke {
        NONE,
        CIGARETTE,
        PIPE,
        VAPE
    }

    struct Punk {
        Species species;
        Size size;
        Ear ear;
        Eyes eyes;
        Face face;
        FacialHair facial_hair;
        Head head;
        Mouth mouth;
        Neck neck;
        Nose nose;
        Smoke smoke;
    }

    // The Oracle contract
    Oracle public oracle;

    // A list of Punks
    Punk[] public punks;

    constructor(address oracleAddress) {
        oracle = Oracle(oracleAddress);
    }

    /**
     * @dev Modifier that only oracle operators may call
     */
    modifier onlyOracleOperator() {
        require(
            msg.sender == oracle.operator(),
            "Only the oracle operator may perform this action"
        );
        _;
    }

    /**
     * @dev Mints a new Punk given all slots
     * @notice Only oracle operators may call this
     */
    function mint(
        Species species,
        Size size,
        Ear ear,
        Eyes eyes,
        Face face,
        FacialHair facialHair,
        Head head,
        Mouth mouth,
        Neck neck,
        Nose nose,
        Smoke smoke
    ) public onlyOracleOperator {
        Punk memory punk = Punk(
            species,
            size,
            ear,
            eyes,
            face,
            facialHair,
            head,
            mouth,
            neck,
            nose,
            smoke
        );
        punks.push(punk);
    }

    function getSpecies(uint256 punkId) public returns (Species) {
        return punks[punkId].species;
    }
}
