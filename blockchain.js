const Block = require('./block');

class Blockchain{
    constructor(){
        this.chain = [Block.genesis()];
    }

    addBlock(data){
        const lastBlock = this.chain[this.chain.length - 1];
        const block = Block.mineBlock(lastBlock, data);
        this.chain.push(block);

        return block;
    }

    isValidChain(chain){
        if(JSON.stringify(chain[0]) !== JSON.stringify(Block.genesis())) return false;

        for (let i=1; i<chain.length; i++){
            const currblock = chain[i];
            const previousblock = chain[i-1];

            if(currblock.lasthash !== previousblock.hash ||
               currblock.hash !== Block.blockHash(currblock)){
                return false;
            }
        }

        return true;
    }


}

module.exports = Blockchain;