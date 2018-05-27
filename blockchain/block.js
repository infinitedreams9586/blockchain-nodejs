const SHA256 = require('crypto-js/sha256');
const { DIFFICULTY, MINE_RATE } = require('../config');

class Block {
    constructor(timestamp, lasthash, hash, data, nonce, difficulty){
        this.timestamp = timestamp;
        this.lasthash = lasthash;
        this.hash = hash;
        this.data = data;
        this.nonce = nonce;
        this.difficulty = difficulty || DIFFICULTY;
    }

    toString(){
        return `Block -
            Timestamp  : ${this.timestamp}
            Last Hash  : ${this.lasthash.substring(0, 10)}
            Hash       : ${this.hash.substring(0, 10)}
            Nonce      : ${this.nonce}
            Difficulty : ${this.difficulty}
            Data       : ${this.data}`;
    }

    static genesis(){
        return new this('Genesis time', '------', 'f1r57-h45h', [], 0, DIFFICULTY);
    }

    static mineBlock(lastBlock, data){
        const lastHash = lastBlock.hash;
        let nonce = 0;
        let hash, timestamp;
        let { difficulty } = lastBlock;
        do{
            nonce++;
            timestamp = Date.now();
            difficulty = Block.adjustDifficulty(lastBlock, timestamp);
            hash = Block.hash(timestamp, lastHash, data, nonce, difficulty);
        } while (hash.substring(0, difficulty) !== '0'.repeat(difficulty));

        return new this(timestamp, lastHash, hash, data, nonce, difficulty);
    }

    static hash(timestamp, lastHash, data, nonce, difficulty){
        return SHA256(`${timestamp}${lastHash}${data}${nonce}${difficulty}`).toString();
    }

    static blockHash(block) {
        const {timestamp, lasthash, data, nonce, difficulty} = block;
        return Block.hash(timestamp, lasthash, data, nonce, difficulty);
    }

    static adjustDifficulty(lastBlock, currentTime){
        let { difficulty } = lastBlock;
        let mine_rate_timestamp = lastBlock.timestamp + MINE_RATE;
        if (mine_rate_timestamp > currentTime){
            difficulty ++ ;
        } else if (mine_rate_timestamp < currentTime){
            difficulty --;
        }
        return difficulty;
    }
}

module.exports = Block;