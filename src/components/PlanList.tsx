/**
 * Plan List Component
 *
 * Lists all imported protocol plans with filtering and status
 */

import React, { useEffect, useState, useCallback } from 'react';
import {
  FileText,
  Filter,
  Search,
  Calendar,
  TrendingUp,
  AlertTriangle,
} from 'lucide-react';
import type { ProtocolPlan } from '../types/plan';
import { getAllPlans, getPlansByStatus } from '../services/PlanDatabase';

interface PlanListProps {
  onSelectPlan: (plan: ProtocolPlan) => void;
  refreshTrigger?: number;
}

type PlanStatus = 'all' | 'active' | 'paused' | 'completed' | 'expired';

export const PlanList: React.FC<PlanListProps> = ({
  onSelectPlan,
  refreshTrigger,
}) => {
  const [plans, setPlans] = useState<ProtocolPlan[]>([]);
  const [filteredPlans, setFilteredPlans] = useState<ProtocolPlan[]>([]);
  const [statusFilter, setStatusFilter] = useState<PlanStatus>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  /**
   * Load plans from database
   */
  const loadPlans = useCallback(async () => {
    setLoading(true);

    try {
      let loadedPlans: ProtocolPlan[];

      if (statusFilter === 'all') {
        loadedPlans = await getAllPlans();
      } else {
        loadedPlans = await getPlansByStatus(statusFilter);
      }

      setPlans(loadedPlans);
      setFilteredPlans(loadedPlans);
    } catch (err) {
      console.error('Failed to load plans:', err);
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  // Load plans on mount and when filter changes
  useEffect(() => {
    loadPlans();
  }, [loadPlans, refreshTrigger]);

  // Apply search filter
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredPlans(plans);
      return;
    }

    const query = searchQuery.toLowerCase();
    const filtered = plans.filter(
      (plan) =>
        plan.plan.title.toLowerCase().includes(query) ||
        plan.plan.description.toLowerCase().includes(query) ||
        plan.meta.practitioner.name.toLowerCase().includes(query)
    );

    setFilteredPlans(filtered);
  }, [searchQuery, plans]);

  /**
   * Status badge component
   */
  const StatusBadge: React.FC<{ status?: string }> = ({ status = 'active' }) => {
    const styles = {
      active: 'bg-green-500/20 text-green-400 border-green-500/30',
      paused: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
      completed: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
      expired: 'bg-red-500/20 text-red-400 border-red-500/30',
    };

    return (
      <span
        className={`px-2 py-0.5 rounded-full text-xs font-medium border ${
          styles[status as keyof typeof styles] || styles.active
        }`}
      >
        {status}
      </span>
    );
  };

  return (
    <div className="w-full">
      {/* Header */}
      <div className="mb-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-semibold text-white">Protocol Plans</h2>
          <div className="flex items-center space-x-2 text-sm text-gray-400">
            <FileText className="w-4 h-4" />
            <span>{filteredPlans.length} plans</span>
          </div>
        </div>

        {/* Search and Filter */}
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input
              type="text"
              placeholder="Search plans..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-gray-800/50 border border-gray-700 rounded-lg text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-neuro-500"
            />
          </div>

          {/* Status Filter */}
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as PlanStatus)}
              className="pl-10 pr-8 py-2 bg-gray-800/50 border border-gray-700 rounded-lg text-sm text-white appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-neuro-500"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="paused">Paused</option>
              <option value="completed">Completed</option>
              <option value="expired">Expired</option>
            </select>
          </div>
        </div>
      </div>

      {/* Loading */}
      {loading && (
        <div className="flex items-center justify-center py-12">
          <div className="w-8 h-8 border-4 border-neuro-500 border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      {/* Empty State */}
      {!loading && filteredPlans.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
          <FileText className="w-12 h-12 text-gray-600 mb-4" />
          <h3 className="text-sm font-medium text-white mb-1">
            {searchQuery
              ? 'No plans found'
              : statusFilter === 'all'
              ? 'No plans imported'
              : `No ${statusFilter} plans`}
          </h3>
          <p className="text-xs text-gray-500 max-w-xs leading-relaxed">
            {searchQuery
              ? 'Try adjusting your search query'
              : 'Import your first protocol plan to get started'}
          </p>
        </div>
      )}

      {/* Plan List */}
      {!loading && filteredPlans.length > 0 && (
        <div className="space-y-3">
          {filteredPlans.map((plan) => (
            <button
              key={plan._id}
              onClick={() => onSelectPlan(plan)}
              className="w-full p-4 bg-gray-800/50 hover:bg-gray-800/70 border border-gray-700 hover:border-neuro-500/50 rounded-xl transition-all text-left group"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-1">
                    <h3 className="text-base font-medium text-white group-hover:text-neuro-400 transition-colors">
                      {plan.plan.title}
                    </h3>
                    {plan._tampered && (
                      <AlertTriangle className="w-4 h-4 text-red-400 flex-shrink-0" />
                    )}
                  </div>
                  <p className="text-sm text-gray-400 line-clamp-2">
                    {plan.plan.description}
                  </p>
                </div>

                <StatusBadge status={plan._status} />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4 text-xs text-gray-500">
                  {/* Practitioner */}
                  <div className="flex items-center space-x-1.5">
                    <FileText className="w-3.5 h-3.5" />
                    <span>{plan.meta.practitioner.name}</span>
                  </div>

                  {/* Duration */}
                  <div className="flex items-center space-x-1.5">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>{plan.plan.duration_weeks} weeks</span>
                  </div>

                  {/* Phases */}
                  <div className="flex items-center space-x-1.5">
                    <TrendingUp className="w-3.5 h-3.5" />
                    <span>{plan.schedule.phases.length} phases</span>
                  </div>
                </div>

                {/* Imported date */}
                {plan._imported_at && (
                  <span className="text-xs text-gray-500">
                    Imported{' '}
                    {new Date(plan._imported_at).toLocaleDateString(undefined, {
                      month: 'short',
                      day: 'numeric',
                    })}
                  </span>
                )}
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
