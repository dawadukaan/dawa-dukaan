import { StatsCard } from '../ui/StatsCard';
import { STATS_CARDS } from '@/constants/dashboard/stats-cards';
import { 
  FiDollarSign, 
  FiShoppingCart, 
  FiBox, 
  FiUsers 
} from 'react-icons/fi';

// Default icon as fallback
import { FiActivity } from 'react-icons/fi';

const ICONS = {
  revenue: FiDollarSign,
  orders: FiShoppingCart,
  products: FiBox,
  customers: FiUsers,
  // Add a default icon for any other id
  default: FiActivity
};

export function StatsSummary({ stats = STATS_CARDS, isLoading }) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-white rounded-xl shadow-sm p-6">
            <div className="animate-pulse flex justify-between">
              <div className="space-y-3">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-6 bg-gray-200 rounded w-1/2"></div>
                <div className="h-4 bg-gray-200 rounded w-1/4"></div>
              </div>
              <div className="h-12 w-12 bg-gray-200 rounded-lg"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((card) => (
        <StatsCard
          key={card.id || `stat-${card.title}`}
          title={card.title}
          value={card.value}
          trend={card.trend}
          icon={ICONS[card.id] || ICONS.default} // Use default icon if specific one not found
          iconBg={card.iconBg}
          iconColor={card.iconColor}
        />
      ))}
    </div>
  );
}