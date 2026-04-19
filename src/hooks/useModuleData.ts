import { useState, useEffect, useCallback } from 'react';
import type { TimeRange } from '../types';
import {
  generateSalesRevenueData,
  generateCustomerAcquisitionData,
  generateBroadbandData,
  generateSmartHomeData,
  generateRightsProductsData,
  generateHomeNetworkingData,
  generateHomePreviewData,
} from '../utils/dataGenerator';

export type ModuleKey =
  | 'sales-revenue'
  | 'customer-acquisition'
  | 'broadband'
  | 'smart-home'
  | 'rights-products'
  | 'home-networking'
  | 'home-preview';

const generators = {
  'sales-revenue': generateSalesRevenueData,
  'customer-acquisition': generateCustomerAcquisitionData,
  broadband: generateBroadbandData,
  'smart-home': generateSmartHomeData,
  'rights-products': generateRightsProductsData,
  'home-networking': generateHomeNetworkingData,
} as const;

export function useModuleData<T>(moduleKey: ModuleKey, timeRange: TimeRange) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);

  const refresh = useCallback(() => {
    setLoading(true);
    // Simulate async data fetch
    setTimeout(() => {
      if (moduleKey === 'home-preview') {
        setData(generateHomePreviewData() as T);
      } else {
        const generator = generators[moduleKey as Exclude<ModuleKey, 'home-preview'>];
        setData(generator(timeRange) as T);
      }
      setLoading(false);
    }, 600);
  }, [moduleKey, timeRange]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { data, loading, refresh };
}
