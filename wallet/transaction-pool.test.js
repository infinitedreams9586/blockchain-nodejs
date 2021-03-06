const TransactionPool = require('./transaction-pool');
const Transaction = require('./transaction');
const Wallet = require('./index');
const Blockchain = require('../blockchain');

describe('TransactionPool', () =>{
   let tp, wallet, transaction, bc, fee;

   beforeEach(() =>{
       tp = new TransactionPool();
       wallet = new Wallet();
       bc = new Blockchain();
       fee = 1;
       transaction = wallet.createTransaction('random-address', 30, bc, tp, fee);
   });

   it('adds a transaction to the pool', ()=>{
        expect(tp.transactions.find(t => t.id === transaction.id)).toEqual(transaction);
   });

   it('updates a transaction in the pool', () => {
       const oldTransaction = JSON.stringify(transaction);
       const newTransaction = transaction.update(wallet, 'foo-address', 40, fee);
       tp.updateOrAddTransaction(newTransaction);
       expect(JSON.stringify(tp.transactions.find(t => t.id === newTransaction.id))).not.toEqual(oldTransaction);
   });

   it('clears transactions', ()=> {
        tp.clear();
        expect(tp.transactions).toEqual([]);
   });

   describe('Mixing Valid and Corrupt Transactions', () =>{
       let validTransactions;

       beforeEach(() => {
            validTransactions = [...tp.transactions];
            fee = 1;
            for(let i=0; i<6; i++){
                wallet = new Wallet();
                transaction = wallet.createTransaction('random-address', 10, bc, tp, fee);
                if(i%2==0){
                    // corrupt transaction
                    transaction.input.amount = 5000;
                } else {
                    validTransactions.push(transaction);
                }
            }
       });

       it('shows a difference between valid and corrupt transactions', ()=>{
            expect(JSON.stringify(tp.transactions)).not.toEqual(JSON.stringify(validTransactions));
       });

       it('grabs valid transactions', () =>{
           var vt = tp.validTransactions()
           expect(vt).toEqual(validTransactions);
       });
   });

});

