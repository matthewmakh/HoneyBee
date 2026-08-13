import { requireClubAdmin } from '@/lib/auth';
import { getAllTransactions } from '@/lib/services/admin';
import { TransactionsList } from './transactions-list';

export default async function TransactionsPage() {
  await requireClubAdmin();

  const { transactions, total } = await getAllTransactions({
    sortBy: 'createdAt',
    sortOrder: 'desc',
    limit: 100,
  });

  // Serialize Decimal fields
  const serializedTransactions = transactions.map((tx) => ({
    ...tx,
    amount: Number(tx.amount),
  }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Transaction Log</h1>
        <p className="text-muted-foreground">
          Complete history of all platform transactions
        </p>
      </div>
      
      <TransactionsList transactions={serializedTransactions} totalCount={total} />
    </div>
  );
}
