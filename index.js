const request = require('request-promise');
const colors = require('colors');
const _ = require('lodash');
const fs = require('fs');
const glob = require('fast-glob');

let chain_ids = [1, 56];
let token = "your key";
//let addresses = [`0x75bc75e4521c3585a96f8379137ebb647f1c252d`, `0xee18f57babffed9fb165e39299a0d69f45437d2d`, `0xf60c2Ea62EDBfE808163751DD0d8693DCb30019c`, `0xff99a19D2db3fFb0462F304B77B51e6A7FF89A46`, `0xAfadc4302f07e9460Eb4c31ec741C0f3e308fF3a`];
let addresses = [];
let addresses_paths = [];

function logo() {
    console.log(``);
    console.log(`    
         ╭━━┳╮╭┳━━┳━━┳━━┳━┳━━┳━━┳━╮
         ┃╭╮┃╰╯┃┃━┫╭╮┃╭╮┃╭┫━━┫┃━┫╭╯
         ┃╭╮┣╮╭┫┃━┫╰╯┃╭╮┃┃┣━━┃┃━┫┃
         ╰╯╰╯╰╯╰━━┫╭━┻╯╰┻╯╰━━┻━━┻╯
         ╱╱╱╱╱╱╱╱╱┃┃ Metamask & BNC
         ╱╱╱╱╱╱╱╱╱╰╯ 
    `.green);
    console.log(``);
}

async function check() {
    logo();
    console.log(` $`.green, ` Начинаю флексить...`);
    console.log(``);
    if (fs.existsSync(`./results.txt`) == true) {
        fs.unlinkSync(`./results.txt`);
    }
    fs.appendFileSync(`./results.txt`, `
            ╭━━┳╮╭┳━━┳━━┳━━┳━┳━━┳━━┳━╮
            ┃╭╮┃╰╯┃┃━┫╭╮┃╭╮┃╭┫━━┫┃━┫╭╯
            ┃╭╮┣╮╭┫┃━┫╰╯┃╭╮┃┃┣━━┃┃━┫┃
            ╰╯╰╯╰╯╰━━┫╭━┻╯╰┻╯╰━━┻━━┻╯
            ╱╱╱╱╱╱╱╱╱┃┃ Metamask & BNC
            ╱╱╱╱╱╱╱╱╱╰╯\n\n`);
    return new Promise(async (resolve, reject) => {
        let i = 0;
        for (address of addresses) {
            i++;
            let tempETC = [];
            let tempBNC = [];
            if (!/^[\w.-]{0,55}[0-9a-zA-Z]$/.test(address)) return reject("Err");
            for (networkid of chain_ids) {
                try {
                    let response = await request({
                        'url': `https://api.covalenthq.com/v1/${networkid}/address/${address}/balances_v2/?&key=${token}`,
                        'method': "GET",
                        json: true
                    });
                    let x = await response.data.items.flat();
                    if (networkid == 1) {
                        let y = x.flat();
                        for (chain of y) {
                            let chain_balance = chain.quote;
                            tempETC.push(chain_balance);
                        }
                    }
                    else if (networkid == 56) {
                        let y = x.flat();
                        for (chain of y) {
                            let chain_balance = chain.quote;
                            tempBNC.push(chain_balance);
                        }
                    }
                } catch (err) {

                }
            }
            sum1 = _.sum(tempBNC).toFixed(2);
            sum2 = _.sum(tempETC).toFixed(2);
            sum3 = parseFloat(sum1) + parseFloat(sum2);
            console.log(``);
            console.log(``, `${` ${address} `.bgWhite.black}`, `\n\n`, "Balance:".white, `${sum3}${`$`.green}`, `\n`, "Binance Smart Chain:".yellow, `${sum1}${`$`.green}`, `\n`, "Ethereum Mainnet Chain:".yellow, `${sum2}${`$`.green}`);
            fs.appendFileSync(`./results.txt`, `\nAddress: ${address} > Balance: ${sum3} > BNC: ${sum1} > ETC: ${sum2} > Path: ${addresses_paths[i - 1]}`);
        }
        resolve("Ok");
    });
}

function finder() {
    return new Promise(async (resolve, reject) => {

        let results = [];
        let results_dirs = [];

        let dirs = await glob.sync(`./logs/**/**/**.log`);

        for (dir of dirs) {
            if (dir.includes("BinanceChain") || dir.includes("Binance Chain") || dir.includes("Binancechain") || dir.includes("Binance chain")) {
                let tempstring = [];
                let data = await fs.readFileSync(dir, 'utf-8');
                var find = "infos";
                var i = 0;
                do {
                    var x = await data.indexOf(find, i);
                    i = x + 1;
                    if (x >= 1) {
                        await tempstring.push(x);
                    }
                } while (x != -1)
                for (massindex of tempstring) {
                    let junkindex = data.indexOf(":\\\"", massindex);
                    let finded_string = data.substr(junkindex + 25, 42);
                    if (!/^[\w.-]{0,55}[0-9a-zA-Z]$/.test(finded_string));
                    else {
                        results.push(finded_string);
                        results_dirs.push(dir);
                    }
                }
            }

            else if (dir.includes("Metamask") || dir.includes("Meta mask") || dir.includes("MetaMask") || dir.includes("Meta Mask")) {
                let tempstring = [];
                let data = await fs.readFileSync(dir, 'utf-8');
                var find = `"cachedBalances":{"`;
                var i = 0;
                do {
                    var x = data.indexOf(find, i);
                    i = x + 1;
                    if (x >= 1) {
                        await tempstring.push(x);
                    }
                } while (x != -1)
                for (massindex of tempstring) {
                    let junkindex = await data.indexOf(`":{"`, massindex);
                    let finded_string = await data.substr(junkindex + 11, 42);
                    if (!/^[\w.-]{0,55}[0-9a-zA-Z]$/.test(finded_string));
                    else {
                        results.push(finded_string);
                        results_dirs.push(dir);
                    }
                }
            }
        }

        for (adtp of results) {
            addresses.push(adtp);
        }
        for (dirp of results_dirs) {
            addresses_paths.push(dirp);
        }
        resolve("Ok");
    });
}

setTimeout(() => {
    finder().then(async (result) => {
        if (result == "Ok") {
            check().then(async (result1) => {
                if (result1 == "Ok") {
                    console.log(``);
                    console.log(` $`.green, ` Флекс закончен, спасибо за внимание`);
                    console.log(``);
                }
            })
        }
    });
}, 500);
