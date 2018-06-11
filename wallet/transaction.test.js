const Transaction = require('./transaction');
const Wallet = require('./index');
const { MINING_REWARD } = require('../config');

describe('Transaction', () => {
    let transaction, wallet, recipient, amount, fee;

    beforeEach(() =>{
        wallet = new Wallet();
        amount = 50;
        recipient = 'r3c1p13nt';
        fee = 2;
        transaction = Transaction.newTransaction(wallet, recipient, amount, fee);
    });

    it('outputs the amount subtracted from the wallet balance for sender to himself', () =>{
        expect(transaction.outputs.find(output => output.address === wallet.publicKey).amount).toEqual(wallet.balance - amount - fee);
    });

    it('outputs the amount as sent amount for recipient', () =>{
       expect(transaction.outputs.find(output => output.address === recipient).amount).toEqual(amount);
    });

    it('inputs the balance of the wallet', ()=> {
        expect(transaction.input.amount).toEqual(wallet.balance);
    });

    it('validates a valid transation', () => {
        expect(Transaction.verifyTransaction(transaction)).toBe(true);
    });

    it('invalidates a corrupt transaction', () => {
       transaction.outputs[0].amount = 100;
       expect(Transaction.verifyTransaction(transaction)).toBe(false);
    });

    describe('updating a transaction', ()=>{
        let nextAmount, nextRecipient;
        beforeEach(()=>{
            nextAmount = 20;
            nextRecipient = 'n3xt-r3c1p13nt';
            fee = 5;
            transaction = transaction.update(wallet, nextRecipient, nextAmount, fee);
        });

        it('calculates the next amount properly', ()=>{
            expect(transaction.outputs.find(output => output.address === wallet.publicKey).amount).toEqual(wallet.balance - amount - nextAmount - transaction.fee)
        });

        it('outputs amount for the next recipient', ()=>{
            expect(transaction.outputs.find(output => output.address === nextRecipient).amount).toEqual(nextAmount);
        });
    });

    describe('transacting with an amount that exceeds the balance', () =>{
        beforeEach(() => {
            amount = 50000;
            transaction = Transaction.newTransaction(wallet, recipient, amount, fee);
        });

        it('does not create the transaction', () =>{
            expect(transaction).toEqual(undefined);
        });
    });

    describe('creating a reward transaction', () => {
        beforeEach(() => {
            transaction = Transaction.rewardTransaction(wallet, Wallet.blockchainWallet(), [transaction]);
        });

        it('reward the miner wallet', ()=>{
            expect(transaction.outputs.find(output => output.address === wallet.publicKey).amount)
                .toEqual(MINING_REWARD + fee);
        });
    });

});