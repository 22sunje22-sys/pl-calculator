export const BANK_FEE = 2.6;

export const TIERS = [
  { name: "Tier 4", minEvents: 0, plFee: 5.5, marketingCredit: 0 },
  { name: "Tier 3", minEvents: 3, plFee: 4.5, marketingCredit: 0.5 },
  { name: "Tier 2", minEvents: 10, plFee: 3.9, marketingCredit: 0.75 },
  { name: "Tier 1", minEvents: 25, plFee: 2.9, marketingCredit: 1.5 },
];

export function getTier(events: number) {
  let tier = TIERS[0];
  for (const t of TIERS) {
    if (events >= t.minEvents) tier = t;
  }
  return tier;
}

export function getNextTier(events: number) {
  const currentTier = getTier(events);
  const currentIndex = TIERS.indexOf(currentTier);
  if (currentIndex < TIERS.length - 1) {
    return TIERS[currentIndex + 1];
  }
  return null;
}

export function calculateRates(events: number) {
  const tier = getTier(events);
  const grossFee = BANK_FEE + tier.plFee;
  const effectiveRate = grossFee - tier.marketingCredit;
  return {
    tierName: tier.name,
    bankFee: BANK_FEE,
    plFee: tier.plFee,
    marketingCredit: tier.marketingCredit,
    grossFee,
    effectiveRate,
  };
}

export function calculateFinancials(
  events: number,
  ticketsPerEvent: number,
  avgTicketPrice: number
) {
  const rates = calculateRates(events);
  const totalRevenue = events * ticketsPerEvent * avgTicketPrice;
  const totalFees = totalRevenue * (rates.effectiveRate / 100);
  const marketingCreditValue = totalRevenue * (rates.marketingCredit / 100);
  const nextTier = getNextTier(events);
  const eventsToNextTier = nextTier ? nextTier.minEvents - events : 0;

  return {
    ...rates,
    totalRevenue,
    totalFees,
    marketingCreditValue,
    eventsToNextTier,
    nextTierName: nextTier?.name || null,
  };
}

export function getOptimizationBenchmarks(
  currentEvents: number,
  ticketsPerEvent: number,
  avgTicketPrice: number
) {
  const current = calculateFinancials(currentEvents, ticketsPerEvent, avgTicketPrice);
  const growth = calculateFinancials(currentEvents + 5, ticketsPerEvent, avgTicketPrice);
  const highVolume = calculateFinancials(
    Math.max(currentEvents + 15, 25),
    ticketsPerEvent,
    avgTicketPrice
  );

  return [
    { label: "Current Plan", events: currentEvents, ...current },
    { label: `Growth Scenario (+5 Events)`, events: currentEvents + 5, ...growth },
    {
      label: `High-Volume Scenario (+${Math.max(25 - currentEvents, 15)} Events)`,
      events: Math.max(currentEvents + 15, 25),
      ...highVolume,
    },
  ];
}
