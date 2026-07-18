import { LartCoinBalanceData } from '../actions';

const formatDate = (date: Date) =>
  new Intl.DateTimeFormat('id-ID', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(date));

interface LartCoinBalanceCardProps {
  data: LartCoinBalanceData;
}

export function LartCoinBalanceCard({ data }: LartCoinBalanceCardProps) {
  return (
    <div className="bg-white shadow sm:rounded-lg">
      <div className="px-4 py-5 sm:p-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg leading-6 text-gray-900 font-bold">Lart Coin</h3>
            <p className="mt-1 text-sm text-gray-500">
              Earned from your purchases. Spend them on coin-priced menus.
            </p>
          </div>
          <p className="flex items-center gap-2 text-3xl font-bold text-amber-600">
            <span aria-hidden="true">🪙</span>
            {data.balance}
          </p>
        </div>

        {data.transactions.length > 0 && (
          <div className="mt-6 border-t border-gray-100 pt-4">
            <h4 className="text-sm font-medium text-gray-700 mb-3">Recent activity</h4>
            <ul className="flex flex-col divide-y divide-gray-100">
              {data.transactions.map((tx) => (
                <li key={tx.id} className="flex items-center justify-between py-2 text-sm">
                  <div className="min-w-0 pr-4">
                    <p className="truncate text-gray-700">{tx.description || tx.type}</p>
                    <p className="text-xs text-gray-400">{formatDate(tx.createdAt)}</p>
                  </div>
                  <span className={`font-semibold ${tx.coins >= 0 ? 'text-green-600' : 'text-red-500'}`}>
                    {tx.coins >= 0 ? `+${tx.coins}` : tx.coins}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
