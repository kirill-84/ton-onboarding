// @ts-ignore
import {Address, TonClient} from '@ton/ton';
import {unixNow} from '../lib/utils';
import {MineMessageParams, Queries} from '../wrappers/NftGiver';

async function mine() {
    const walletAddress = Address.parse('YOUR_WALLET_ADDRESS');
    const collectionAddress = Address.parse('EQDk8N7xM5D669LC2YACrseBJtDyFqwtSPCNhRWXU7kjEptX');

    // specify endpoint for Testnet
    const endpoint = "https://testnet.toncenter.com/api/v2/jsonRPC"

    // initialize ton library
    const client = new TonClient({endpoint});

    // @ts-ignore
    const miningData = await client.runMethod(collectionAddress, 'get_mining_data');

    //console.log(miningData.stack);

    // ... previous code

    const {stack} = miningData;

    const complexity = stack.readBigNumber();
    const lastSuccess = stack.readBigNumber();
    const seed = stack.readBigNumber();
    const targetDelta = stack.readBigNumber();
    const minCpl = stack.readBigNumber();
    const maxCpl = stack.readBigNumber();

    //console.log({complexity, lastSuccess, seed, targetDelta, minCpl, maxCpl});

    const mineParams: MineMessageParams = {
        expire: unixNow() + 300, // 5 min is enough to make a transaction
        mintTo: walletAddress, // your wallet
        data1: 0n, // temp variable to increment in the miner
        seed // unique seed from get_mining_data
    };

    let msg = Queries.mine(mineParams); // transaction builder

    const bufferToBigint = (buffer: Buffer) => BigInt('0x' + buffer.toString('hex'));

    while (bufferToBigint(msg.hash()) > complexity) {
        mineParams.expire = unixNow() + 300;
        mineParams.data1 += 1n;
        msg = Queries.mine(mineParams);
    }

    console.log('Yoo-hoo, you found something!');
}

mine();
