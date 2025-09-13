
import { trainData } from '../data/dummy-data';

// Helper function to normalize a value to a 0-100 scale
const normalize = (value: number, min: number, max: number) => {
  if (max === min) return 100;
  return Math.max(0, Math.min(100, ((value - min) / (max - min)) * 100));
};

// --- Scoring Functions ---

// 1. Readiness Score (Certificates & Maintenance)
const calculateReadiness = (train: any) => {
  let score = 100;
  // Certificate check
  for (const cert of train.certificates) {
    if (!cert.valid) {
      score -= 50; // Heavy penalty for invalid certs
    }
    const daysRemaining = (new Date(cert.expires).getTime() - new Date().getTime()) / (1000 * 3600 * 24);
    if (daysRemaining < 7) {
      score -= 20; // Penalty for certs expiring within a week
    }
  }

  // Work order check
  for (const wo of train.workOrders) {
    if (wo.severity === 'critical') score -= 60;
    if (wo.severity === 'high') score -= 30;
    if (wo.severity === 'medium') score -= 15;
  }

  // Last maintenance check
  const daysSinceMaint = (new Date().getTime() - new Date(train.lastMaintenance).getTime()) / (1000 * 3600 * 24);
  if (daysSinceMaint > 180) {
    score -= 20; // Penalty for maintenance over 6 months ago
  }

  return Math.max(0, score);
};

// 2. Branding Score
const calculateBranding = (train: any) => {
  if (!train.branding) return 50; // Neutral score if no contract
  const { hours, target } = train.branding;
  const completion = (hours / target) * 100;
  // Reward trains that are behind schedule to help them catch up
  if (completion < 80) return 90;
  if (completion < 100) return 70;
  return 50; // Lower score for completed contracts
};

// 3. Mileage Balance Score
const calculateMileageBalance = (train: any, allTrains: any[]) => {
  const odometers = allTrains.map(t => t.telemetry.odometer);
  const minOdometer = Math.min(...odometers);
  const maxOdometer = Math.max(...odometers);
  // Invert the score: lower mileage is better
  return 100 - normalize(train.telemetry.odometer, minOdometer, maxOdometer);
};

// 4. Shunt Cost Score (simplified)
const calculateShuntCost = (train: any) => {
  // Simple logic: farther bays have higher cost
  const bayLetter = train.location.charAt(4);
  if (bayLetter === 'A') return 100;
  if (bayLetter === 'B') return 80;
  if (bayLetter === 'C') return 60;
  if (bayLetter === 'D') return 40;
  return 20;
};

// 5. Withdrawal Risk Score (simplified)
const calculateWithdrawalRisk = (train: any) => {
  let risk = 0;
  if (train.telemetry.vibration !== 'Normal') risk += 20;
  if (train.telemetry.hvac !== 'Operational') risk += 20;
  // Invert the risk to get a score
  return 100 - risk;
};

export const runOptimizer = (weights: any, allTrains: any[]) => {

  const rankedTrains = allTrains
    .filter(train => train.status !== 'blocked') // Exclude blocked trains
    .map(train => {
      const readiness = calculateReadiness(train);
      const branding = calculateBranding(train);
      const mileage = calculateMileageBalance(train, allTrains);
      const shuntCost = calculateShuntCost(train);
      const withdrawalRisk = calculateWithdrawalRisk(train);

      const totalScore = 
        (readiness * weights.alpha.value / 100) +
        (branding * weights.beta.value / 100) +
        (mileage * weights.gamma.value / 100) +
        (shuntCost * weights.delta.value / 100) +
        (withdrawalRisk * weights.epsilon.value / 100);

      return {
        trainId: train.id,
        rank: 0, // will be assigned after sorting
        readiness: Math.round(readiness),
        branding: Math.round(branding),
        mileage: Math.round(mileage),
        shuntCost: shuntCost > 80 ? 'Low' : shuntCost > 50 ? 'Medium' : 'High',
        withdrawalRisk: 100 - Math.round(withdrawalRisk),
        totalScore: Math.round(totalScore * 100) / 100,
        reasoning: `R:${Math.round(readiness)} B:${Math.round(branding)} M:${Math.round(mileage)}`, // Simplified reasoning
        badges: [] // Can be populated with more logic
      };
    });

  // Sort by total score descending
  rankedTrains.sort((a, b) => b.totalScore - a.totalScore);

  // Assign ranks
  rankedTrains.forEach((train, index) => {
    train.rank = index + 1;
  });

  return rankedTrains;
};
