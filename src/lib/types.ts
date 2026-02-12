export interface CalculatorConfig {
  events: number;
  ticketsPerEvent: number;
  avgTicketPrice: number;
}

export interface ClientLink {
  id: string;
  client_name: string;
  slug: string;
  password_hash: string;
  config: CalculatorConfig;
  created_at: string;
  is_active: boolean;
}
