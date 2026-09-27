import { MockRoute } from './mockData';
import { IUserPreferences } from '../models/User';

export interface ScoredRoute {
  route: MockRoute;
  score: number; // 0 to 100 (higher is better)
  matchPercentage: number;
  isRecommended: boolean;
  badge?: 'Best Overall' | 'Fastest' | 'Cheapest' | 'Least Crowded' | 'Eco Hero' | 'Fewer Transfers';
  whyThisRoute: string;
  scoringBreakdown: {
    timeScore: number;
    costScore: number;
    crowdScore: number;
    delayScore: number;
    transferScore: number;
    walkScore: number;
    modeBonus: number;
  };
  alternativeSuggestion?: {
    isAvailable: boolean;
    reason: string;
    savingsText: string;
    alternativeRouteId: string;
  };
}

export interface RecommendationOptions {
  origin?: string;
  destination?: string;
  preferredModes?: string[];
  maxTravelTime?: number;
  maxBudget?: number;
  preferFastest?: boolean;
  preferCheapest?: boolean;
  avoidCrowds?: boolean;
  avoidTransfers?: boolean;
  minimizeWalking?: boolean;
  departureTime?: string;
}

/**
 * Smart Personalized Route Recommendation Engine
 * Calculates multi-criteria ranking based on commuter preferences & live conditions.
 */
export function rankAndScoreRoutes(
  routes: MockRoute[],
  userPreferences?: Partial<IUserPreferences>,
  searchOptions?: RecommendationOptions
): ScoredRoute[] {
  if (!routes || routes.length === 0) return [];

  // Merge defaults
  const prefs = {
    preferredModes: searchOptions?.preferredModes || userPreferences?.preferredModes || ['metro', 'bus', 'train', 'walk'],
    maxTravelTime: searchOptions?.maxTravelTime || userPreferences?.maxTravelTime || 60,
    maxBudget: searchOptions?.maxBudget || userPreferences?.maxBudget || 80,
    preferFastest: searchOptions?.preferFastest ?? userPreferences?.preferFastest ?? true,
    preferCheapest: searchOptions?.preferCheapest ?? userPreferences?.preferCheapest ?? false,
    avoidCrowds: searchOptions?.avoidCrowds ?? userPreferences?.avoidCrowds ?? true,
    avoidTransfers: searchOptions?.avoidTransfers ?? userPreferences?.avoidTransfers ?? false,
    minimizeWalking: searchOptions?.minimizeWalking ?? userPreferences?.minimizeWalking ?? false,
  };

  // 1. Dynamic weights calculation (Base out of 100)
  let wTime = userPreferences?.weightTime || 30;
  let wCost = userPreferences?.weightCost || 20;
  let wCrowd = userPreferences?.weightCrowd || 20;
  let wDelay = 15;
  let wTransfers = userPreferences?.weightTransfers || 10;
  let wWalking = userPreferences?.weightWalking || 5;

  if (prefs.preferFastest) {
    wTime += 25;
    wDelay += 10;
  }
  if (prefs.preferCheapest) {
    wCost += 25;
  }
  if (prefs.avoidCrowds) {
    wCrowd += 20;
  }
  if (prefs.avoidTransfers) {
    wTransfers += 20;
  }
  if (prefs.minimizeWalking) {
    wWalking += 15;
  }

  const totalWeights = wTime + wCost + wCrowd + wDelay + wTransfers + wWalking;

  // Find min/max for normalization
  const times = routes.map((r) => r.estimatedTime + (r.delayMinutes || 0));
  const costs = routes.map((r) => r.fare);
  const minTime = Math.min(...times);
  const maxTime = Math.max(...times) || minTime + 1;
  const minCost = Math.min(...costs);
  const maxCost = Math.max(...costs) || minCost + 1;

  const scored: ScoredRoute[] = routes.map((route) => {
    const totalTime = route.estimatedTime + (route.delayMinutes || 0);

    // 1. Time Score (0-100): Lower time is better
    const timeNorm = 1 - (totalTime - minTime) / (maxTime - minTime || 1);
    const timeScore = Math.max(0, Math.min(100, timeNorm * 100));

    // 2. Cost Score (0-100): Lower cost is better
    const costNorm = 1 - (route.fare - minCost) / (maxCost - minCost || 1);
    const costScore = Math.max(0, Math.min(100, costNorm * 100));

    // 3. Crowd Score (0-100): Low is 100, Moderate is 65, High is 25
    let crowdScore = 65;
    if (route.crowdLevel === 'low') crowdScore = 100;
    else if (route.crowdLevel === 'moderate') crowdScore = 65;
    else if (route.crowdLevel === 'high') crowdScore = 20;

    // 4. Delay Score (0-100): 0 min delay = 100, 10 min = 40, >15 min = 10
    const delayScore = Math.max(0, 100 - (route.delayMinutes || 0) * 8);

    // 5. Transfer Score (0-100): 0 transfers = 100, 1 transfer = 70, 2 transfers = 35
    const transferScore = Math.max(0, 100 - route.transfers * 35);

    // 6. Walking Score (0-100): <= 3 mins = 100, >= 15 mins = 20
    const walkScore = Math.max(0, 100 - Math.min(route.walkingTime * 6, 80));

    // 7. Mode Bonus: If route transportType is in preferredModes
    const isPreferredMode = prefs.preferredModes.includes(route.transportType) || route.transportType === 'mixed';
    const modeBonus = isPreferredMode ? 10 : -10;

    // Budget & Max Time hard constraint penalties
    let constraintPenalty = 0;
    if (route.fare > prefs.maxBudget) {
      constraintPenalty += 20;
    }
    if (totalTime > prefs.maxTravelTime) {
      constraintPenalty += 25;
    }
    if (route.status === 'disrupted' || route.status === 'cancelled') {
      constraintPenalty += 40;
    }

    // Weighted Total Score
    const rawWeightedScore =
      (timeScore * wTime +
        costScore * wCost +
        crowdScore * wCrowd +
        delayScore * wDelay +
        transferScore * wTransfers +
        walkScore * wWalking) /
      totalWeights;

    const finalScore = Math.round(
      Math.max(10, Math.min(99, rawWeightedScore + modeBonus - constraintPenalty))
    );

    // Dynamic "Why this route?" reasoning
    const reasons: string[] = [];
    if (totalTime <= minTime + 2) reasons.push('Fastest arrival time (' + totalTime + ' mins)');
    if (route.fare <= minCost + 5) reasons.push('Highly economical (₹' + route.fare + ')');
    if (route.crowdLevel === 'low') reasons.push('Low passenger density with guaranteed seats');
    if (route.transfers === 0) reasons.push('Direct zero-transfer connection');
    if (route.walkingTime <= 4) reasons.push('Minimal walking distance (' + route.walkingTime + ' mins)');
    if (route.delayMinutes > 0) reasons.push('Current ' + route.delayMinutes + 'm delay factored into schedule');

    const whyThisRoute =
      reasons.length > 0
        ? `Recommended because it ${reasons.slice(0, 3).join(', ')} and matches your commuter profile.`
        : 'Solid balanced option matching your general travel preferences.';

    return {
      route,
      score: finalScore,
      matchPercentage: Math.min(99, Math.max(35, Math.round((finalScore / 100) * 100))),
      isRecommended: false,
      whyThisRoute,
      scoringBreakdown: {
        timeScore: Math.round(timeScore),
        costScore: Math.round(costScore),
        crowdScore: Math.round(crowdScore),
        delayScore: Math.round(delayScore),
        transferScore: Math.round(transferScore),
        walkScore: Math.round(walkScore),
        modeBonus,
      },
    };
  });

  // Sort descending by score
  scored.sort((a, b) => b.score - a.score);

  if (scored.length > 0) {
    scored[0].isRecommended = true;
    scored[0].badge = 'Best Overall';
  }

  // Assign distinct badges
  const fastest = [...scored].sort((a, b) => a.route.estimatedTime - b.route.estimatedTime)[0];
  if (fastest && fastest !== scored[0]) fastest.badge = 'Fastest';

  const cheapest = [...scored].sort((a, b) => a.route.fare - b.route.fare)[0];
  if (cheapest && cheapest !== scored[0] && !cheapest.badge) cheapest.badge = 'Cheapest';

  const lowCrowd = scored.find((s) => s.route.crowdLevel === 'low' && !s.badge);
  if (lowCrowd) lowCrowd.badge = 'Least Crowded';

  // Check alternative route suggestions for delayed/disrupted routes
  scored.forEach((item) => {
    if (item.route.delayMinutes >= 5 || item.route.status === 'delayed' || item.route.status === 'disrupted') {
      const betterOption = scored.find(
        (other) =>
          other.route.routeId !== item.route.routeId &&
          other.route.delayMinutes === 0 &&
          other.route.estimatedTime <= item.route.estimatedTime + item.route.delayMinutes
      );
      if (betterOption) {
        const timeDiff =
          item.route.estimatedTime + item.route.delayMinutes - betterOption.route.estimatedTime;
        item.alternativeSuggestion = {
          isAvailable: true,
          reason: `Your selected route currently has a ${item.route.delayMinutes}-minute delay.`,
          savingsText: `${timeDiff > 0 ? timeDiff + ' mins faster • ' : ''}${betterOption.route.crowdLevel} crowd • ₹${betterOption.route.fare}`,
          alternativeRouteId: betterOption.route.routeId,
        };
      }
    }
  });

  return scored;
}
