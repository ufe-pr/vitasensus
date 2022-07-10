import { ReactNode, useCallback, useEffect, useState } from 'react';
import { Proposal } from '../client/types';
import { Block } from './Block';
import tw from 'tailwind-styled-components';
import { XIcon } from '@heroicons/react/outline';

const AddTransactionButton = tw.button`
    rounded-full 
    px-4 py-2 
    border border-skin-alt 
    focus:border-skin-text hover:border-skin-text
    text-skin-text-muted
    focus:text-skin-primary hover:text-skin-primary
    focus:outline-none
    transition-all duration-200
`;

const TransactionInput = ({ label, input }: { label: string; input: ReactNode }) => {
	return (
		<div className="rounded-full border border-skin-alt focus-within:border-skin-text space-x-3 flex">
			<label className="h-full p-3 !pr-0 md:p-4 border-r-0 basis-auto shrink-0 border-skin-alt text-skin-muted">
				{label}
			</label>
			<div className="outline-none border-none h-full px-3 md:px-4 !pl-0 min-w-0 self-center grow">
				{input}
			</div>
		</div>
	);
};

enum TransactionType {
	transfer = 0,
	contract = 1,
}

class Transaction {
	type: TransactionType;
	tokenIdOrAddress: string;
	amount: string;
	dataOrTo: string;

	constructor({
		type,
		tokenIdOrAddress,
		amount,
		dataOrTo,
	}: {
		type: TransactionType;
		tokenIdOrAddress: string;
		amount: string;
		dataOrTo: string;
	}) {
		this.type = type;
		this.tokenIdOrAddress = tokenIdOrAddress;
		this.amount = amount;
		this.dataOrTo = dataOrTo;
	}
}

class TransactionBatch extends Array<Transaction> {}

const TransactionBlock = ({
	index,
	transaction,
	setTransaction,
	removeTransaction,
}: {
	index: number;
	transaction: Transaction;
	setTransaction: (t: Transaction) => void;
	removeTransaction: () => void;
}) => {
	const updateValue = useCallback(
		(key: keyof Transaction) => (value: string) => {
			setTransaction({ ...transaction, [key]: value });
		},
		[transaction, setTransaction]
	);
	const updateTransactionType = useCallback(
		(type: TransactionType) => {
			const newTransaction = new Transaction({
				amount: '0',
				dataOrTo: '',
				tokenIdOrAddress: '',
				type,
			});
			setTransaction(newTransaction);
		},
		[setTransaction]
	);

	const handleTransactionChange = (e: any) =>
		updateTransactionType(TransactionType[e.target.value as keyof typeof TransactionType]);
	return (
		<Block>
			<div className="flex justify-between w-full mb-3">
				<span className="text-skin-primary rounded-full leading-none border border-skin-text block h-9 w-9 xy text-sm">
					{index + 1}
				</span>
				<button className="block w-6 h-6" onClick={removeTransaction}>
					<XIcon />
				</button>
			</div>
			<div className="space-y-3">
				<TransactionInput
					label="Type"
					input={
						<select
							value={TransactionType[transaction.type]}
							onChange={handleTransactionChange}
							className="w-full py-3 md:py-4"
						>
							<option
								value={TransactionType[TransactionType.transfer]}
								className="text-skin-bg-base"
							>
								Transfer
							</option>
							<option
								value={TransactionType[TransactionType.contract]}
								className="text-skin-bg-base"
							>
								Contract interaction
							</option>
						</select>
					}
				/>
				<TransactionInput
					label={transaction.type === TransactionType.transfer ? 'Token ID' : 'Address'}
					input={
						<input
							type="text"
							value={transaction.tokenIdOrAddress}
							className="w-full py-3 md:py-4"
							onChange={(e) => updateValue('tokenIdOrAddress')(e.target.value)}
						/>
					}
				/>
				<TransactionInput
					label={transaction.type === TransactionType.transfer ? 'To' : 'Data'}
					input={
						<input
							type="text"
							value={transaction.dataOrTo}
							className="w-full py-3 md:py-4"
							onChange={(e) => updateValue('dataOrTo')(e.target.value)}
						/>
					}
				/>
				<TransactionInput
					label={transaction.type === TransactionType.transfer ? 'Amount (attov)' : 'Value (attov)'}
					input={
						<input
							type="text"
							value={transaction.amount}
							className="w-full py-3 md:py-4"
							onChange={(e) => updateValue('amount')(e.target.value)}
						/>
					}
				/>
			</div>
		</Block>
	);
};

export const SpaceCreateProposalTransactions = ({ proposal }: { proposal: Proposal }) => {
	const [batches, setBatches] = useState<Array<TransactionBatch>>([]);

	const addTransactionToBatch = useCallback(
		(batchIndex: number) => {
			const batch = batches[batchIndex];
			const newBatch = [
				...batch,
				new Transaction({
					amount: '0',
					dataOrTo: '',
					tokenIdOrAddress: '',
					type: TransactionType.transfer,
				}),
			];
			setBatches([...batches.slice(0, batchIndex), newBatch, ...batches.slice(batchIndex + 1)]);
		},
		[batches]
	);

	const removeTransactionFromBatch = useCallback(
		(batchIndex: number, transactionIndex: number) => {
			const batch = batches[batchIndex];
			const newBatch = [...batch.slice(0, transactionIndex), ...batch.slice(transactionIndex + 1)];
			setBatches([...batches.slice(0, batchIndex), newBatch, ...batches.slice(batchIndex + 1)]);
		},
		[batches]
	);

	const updateBatchTransaction = useCallback(
		(batchIndex: number, transactionIndex: number, transaction: Transaction) => {
			const batch = batches[batchIndex];
			const newBatch = [
				...batch.slice(0, transactionIndex),
				transaction,
				...batch.slice(transactionIndex + 1),
			];
			setBatches([...batches.slice(0, batchIndex), newBatch, ...batches.slice(batchIndex + 1)]);
		},
		[batches]
	);

	useEffect(() => {
		setBatches(new Array(proposal.choices.length).fill(new TransactionBatch()));
	}, [proposal.choices.length]);
	return (
		<Block title="Transactions">
			<div className="space-y-3 md:space-y-6">
				{batches.map((batch, i) => {
					return (
						<Block title={'Transactions for choice ' + (i + 1) + ' (' + proposal.choices[i] + ')'}>
							<div className="space-y-3">
								{batch.map((transaction, j) => {
									return (
										<TransactionBlock
											index={j}
											key={j}
											transaction={transaction}
											setTransaction={(t) => updateBatchTransaction(i, j, t)}
											removeTransaction={() => removeTransactionFromBatch(i, j)}
										/>
									);
								})}
								{batch.length < 10 && (
									<div className="flex justify-center">
										<AddTransactionButton onClick={() => addTransactionToBatch(i)}>
											Add transaction
										</AddTransactionButton>
									</div>
								)}
							</div>
						</Block>
					);
				})}
			</div>
		</Block>
	);
};
