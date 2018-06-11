const ChainUtil = require('../chain-util');
const { MINING_REWARD } = require('../config');

class Transaction{
    constructor(){
        this.id = ChainUtil.id();
        this.input = null;
        this.outputs = [];
        this.fee = 1;
    }

    static transactionWithOutputs(senderWallet, outputs, fee){
        const transaction = new this();
        transaction.fee = fee;
        transaction.outputs.push(...outputs);
        Transaction.signTransaction(transaction, senderWallet);
        return transaction;
    }

    static newTransaction(senderWallet, recipient, amount, fee){
        if (fee <= 0){
            console.log(`Fee : ${fee} should be greater than zero, using default fee value.`);
            fee = 1;
        }

        if(amount + fee > senderWallet.balance){
            console.log(`Amount: ${amount} exceeds the balance.`);
            return;
        }

        let outputs = [];
        outputs.push({amount: senderWallet.balance - amount - fee, address: senderWallet.publicKey}); // sending remaining balance to self
        outputs.push({amount: amount, address: recipient}); // sending to recipient

        return Transaction.transactionWithOutputs(senderWallet, outputs, fee);
    }

    static rewardTransaction(minerWallet, blockchainWallet, transactions){

        /// collect transaction fees
        var totalFee = 0;
        transactions.forEach(transaction => {
            totalFee = totalFee + transaction.fee;
        });

        return Transaction.transactionWithOutputs(blockchainWallet, [{
            amount: MINING_REWARD + totalFee,
            address: minerWallet.publicKey
        }]);
    }

    static signTransaction(transaction, senderWallet){
        transaction.input = {
            timestamp: Date.now(),
            amount: senderWallet.balance,
            address: senderWallet.publicKey,
            signature: senderWallet.sign(ChainUtil.hash(transaction.outputs))
        }
    }

    static verifyTransaction(transaction){
        return ChainUtil.verifySignature(transaction.input.address,
            transaction.input.signature,
            ChainUtil.hash(transaction.outputs));
    }

    update(senderWallet, recipient, amount, fee){
        if (fee <= 0){
            console.log(`Fee : ${fee} should be greater than zero, using default fee value.`);
            fee = 1;
        }

        const senderOutput = this.outputs.find(output => output.address === senderWallet.publicKey);

        if(amount + fee > senderOutput.amount){
            console.log(`Amount: ${amount} exceeds balance.`);
            return;
        }
        this.fee = this.fee + fee;
        senderOutput.amount = senderOutput.amount - amount - fee;
        this.outputs.push({amount, address: recipient});
        Transaction.signTransaction(this, senderWallet);
        return this;
    }
}

module.exports = Transaction;