const Wallet = require('./index');
const Transaction = require('./transaction');
const TransactionPool = require('./transaction-pool');
const Blockchain = require('../blockchain');

const { INITIAL_BALANCE } = require('../config');

describe('Wallet', () =>{
    let wallet, tp, bc;
    beforeEach(() => {
        wallet = new Wallet();
        tp = new TransactionPool();
        bc = new Blockchain();
    });

    describe('creating a transaction', () =>{
        let transaction, sendAmount, recipient, fee;
        beforeEach(() =>{
            sendAmount = 50;
            recipient = 'random-address';
            fee = 2;
            transaction = wallet.createTransaction(recipient, sendAmount, bc, tp, fee);
        });

        describe('and doing the same transaction again', () => {
            beforeEach(()=>{
                wallet.createTransaction(recipient, sendAmount, bc, tp, fee);
            });

            it('doubles the sendAmount subtracted from the wallet balance', () => {
                expect(transaction.outputs.find(output => output.address === wallet.publicKey).amount)
                    .toEqual(wallet.balance - sendAmount * 2 - fee * 2);
            });

            it('clones the sendAmount output for the recipient', () =>{
                expect(transaction.outputs.filter(output => output.address === recipient).map(output => output.amount)).toEqual([sendAmount, sendAmount]);
            });
        });

    });

    describe('calculating a balance', () => {
        let addBalance, repeatAdd, senderWallet, fee;

        beforeEach(()=>{
            senderWallet = new Wallet();
            addBalance = 100;
            repeatAdd = 3;
            fee = 1;
            for(let i=0; i<repeatAdd; i++){
                senderWallet.createTransaction(wallet.publicKey, addBalance, bc, tp, fee);
            }
            bc.addBlock(tp.transactions);
        });

        it('calculates the balance for blockchain transactions matching the recipient', () =>{
            expect(wallet.calculateBalance(bc)).toEqual(INITIAL_BALANCE + (addBalance * repeatAdd));
        });

        it('calculates the balance for blockchain transations matching the sender', ()=>{
            expect(senderWallet.calculateBalance(bc)).toEqual(INITIAL_BALANCE - (addBalance * repeatAdd) - (fee * repeatAdd));
        });

        describe('and the recipient conducts a transaction', ()=>{
            let subtractBalance, recipientBalance;

            beforeEach(() =>{
                tp.clear();
                subtractBalance = 60;
                recipientBalance = wallet.calculateBalance(bc);
                fee = 1;
                wallet.createTransaction(senderWallet.publicKey, subtractBalance, bc, tp, fee);
                bc.addBlock(tp.transactions);
            });

            describe('and the sender sends another transaction to the recipient', () => {
                beforeEach(() => {
                    tp.clear();
                    fee = 1;
                    senderWallet.createTransaction(wallet.publicKey, addBalance, bc, tp, fee);
                    bc.addBlock(tp.transactions);
                });

                it('calculate the recipient balance only using transactions since its most recent one', () =>{
                    expect(wallet.calculateBalance(bc)).toEqual(recipientBalance - subtractBalance + addBalance - fee);
                });
            });
        });
    });
});
