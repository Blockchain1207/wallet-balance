import axios from "axios"
import { ethers } from "ethers";
import { userData } from './data.js';

var g_amount = 30;


// function sleep(milliseconds) {
//     const date = Date.now();
//     let currentDate = null;
//     do {
//        currentDate = Date.now();
//     } while (currentDate - date < milliseconds)
// }

const getTokenPrice = async (tokenAddress, decimals) => {
    try {
        let res = null;
        try {
            res = await axios.get(`https://api.coingecko.com/api/v3/simple/token_price/binance-smart-chain?contract_addresses=${tokenAddress}&vs_currencies=usd`);
            if (res.data[tokenAddress] != undefined) {
                if (res.data[tokenAddress].usd != undefined)
                    return res.data[tokenAddress].usd;
            }
        } catch (e) {
            return 0;
        }
    } catch (e) {
        return 0;
    }
}

let curIndex = 103;

var userWalletTokenList;

async function initialize() {
    const address = userData[curIndex];
    console.log("[STATE]=>", curIndex, address);

    if (curIndex >= userData.length) {
        clearInterval(myInterval);
        return;
    }

    curIndex++;

    let userWalletRes;
    try {
        userWalletRes = await axios.get("https://deep-index.moralis.io/api/v2/" + address + "/erc20?chain=bsc", {
            headers: { "X-API-Key": "UQrG1xNph2AGdbqtZeQvkEj3XL8VIgSpOMAs2jSedlDsCE8SPnw3A5G6sP9VOD2o" },
        });
    } catch (error) {
    }


    userWalletTokenList = userWalletRes.data;

    // console.log(userWalletTokenList);
    const topIndex = Math.min(20, userWalletTokenList.length);

    for (let index = 0; index < topIndex; index++) {
        let token = userWalletTokenList[index];
    // for (let token of userWalletTokenList) {
        try {
            let tokenBalance = null;
            tokenBalance = ethers.utils.formatUnits(token.balance, token.decimals);

            const tokenPrice = await getTokenPrice(token.token_address, token.decimals, address);
            let moneyBalance = tokenPrice * tokenBalance;

            console.log("[BALANCE]", index, moneyBalance);

            if (Number(moneyBalance) > Number(g_amount)) {
                console.log("==>", address, moneyBalance, token.token_address);
            }

            // sleep(2000);
        }
        catch (error) {
            // console.log("err:", address);
        }
    }
}

initialize();
const myInterval = setInterval(initialize, 40000);