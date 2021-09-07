from typing import Literal

from dotenv import dotenv_values

config = dotenv_values()


networks = {
    "mainnet": {
        "infura_url": f"https://mainnet.infura.io/v3/{config['WEB3_INFURA_PROJECT_ID']}",
        "cryptopunks_address": "0xb47e3cd837dDF8e4c57F05d70Ab865de6e193BBB",
    },
    "rinkeby": {
        "infura_url": f"https://rinkeby.infura.io/v3/{config['WEB3_INFURA_PROJECT_ID']}",
        "cryptopunks_address": "0xA8473D175b07aAE923081FCCd4FD1528869c4080",
    },
}

Network = Literal[networks.keys()]
