// Authorized admin emails — can generate and manage client proposals
export const ADMIN_EMAILS = [
  "paul.joseph@platinumlist.net",
  "alex.yutkin@platinumlist.net",
  "ahmed.rayan@platinumlist.net",
  "22sunje22@gmail.com", // dev/owner
];

export function isAdminEmail(email: string): boolean {
  return ADMIN_EMAILS.includes(email.toLowerCase().trim());
}
