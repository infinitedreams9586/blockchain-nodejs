const Transaction = require('./transaction');
const Wallet = require('./index');

describe('Transaction', () => {
    let transaction, wallet, recipient, amount;

    beforeEach(() =>{
        wallet = new Wallet();
        amount = 50;
        recipient = 'r3c1p13nt';
        transaction = Transaction.newTransaction(wallet, recipient, amount);
    });

    it('outputs the amount subtracted from the wallet balance for sender to himself', () =>{
        expect(transaction.outputs.find(output => output.address === wallet.publicKey).amount).toEqual(wallet.balance - amount);
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

    describe('upating a transaction', ()=>{
        let nextAmount, nextRecipient;
        beforeEach(()=>{
            nextAmount = 20;
            nextRecipient = 'n3xt-r3c1p13nt';
            transaction = transaction.update(wallet, nextRecipient, nextAmount);
        });

        it('calculates the next amount properly', ()=>{
            expect(transaction.outputs.find(output => output.address === wallet.publicKey).amount).toEqual(wallet.balance - amount - nextAmount)
        });

        it('outputs amount for the next recipient', ()=>{
            expect(transaction.outputs.find(output => output.address === nextRecipient).amount).toEqual(nextAmount);
        });
    });

    describe('transacting with an amount that exceeds the balance', () =>{
        beforeEach(() => {
            amount = 50000;
            transaction = Transaction.newTransaction(wallet, recipient, amount);
        });

        it('does not create the transaction', () =>{
            expect(transaction).toEqual(undefined);
        });
    });

});