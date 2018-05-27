const Blockchain = require('./index');
const Block = require('./block');

describe('Blockchain', () => {

    let blockchain;
    let blockchain2;

    beforeEach(() => {
        blockchain = new Blockchain();
        blockchain2 = new Blockchain();
    });

    it('starts with genesis block', () => {
        expect(blockchain.chain[0]).toEqual(Block.genesis());
    });

    it('adds a new block', () => {
        const data = 'foo';
        blockchain.addBlock(data);
        expect(blockchain.chain[blockchain.chain.length - 1].data).toEqual(data);
    });

    it('validates a valid chain', () => {
        blockchain2.addBlock('foo');
        expect(blockchain.isValidChain(blockchain2.chain)).toBe(true);
    });

    it('invalidates a chain with corrupt genesis block', () => {
        blockchain2.chain[0].data = "bad data";
        expect(blockchain.isValidChain(blockchain2.chain)).toBe(false);
    });

    it('invalids a corrupt chain', () => {
        blockchain2.addBlock('foo');
        blockchain2.chain[1].data = 'not foo';
        expect(blockchain.isValidChain(blockchain2.chain)).toBe(false);
    });

    it('replaces a chain with a new valid chain', () => {
       blockchain2.addBlock('goo');
       blockchain.replaceChain(blockchain2.chain);
       expect(blockchain.chain).toEqual(blockchain2.chain);
    });

    it('does not replace a chain with a new valid chain having same length', () => {
       blockchain2.addBlock('foo');
       blockchain.addBlock('goo');
       expect(blockchain.chain).not.toEqual(blockchain2.chain);
    });

    it('does not replace a chain with a new valid chain having less length', () => {
        blockchain.addBlock('goo');
        expect(blockchain.chain).not.toEqual(blockchain2.chain);
    });

});