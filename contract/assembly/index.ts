import { User, Donate, History } from "./model";
import { context, u128 } from "near-sdk-as";

// Enum for status values
enum DonateStatus {
  Active = 1,
  Ended = 3,
}

// Minimum donation amount
const MIN_DONATION: u128 = u128.from(100000000000000000000000);

// Function to set user profile
export function setUser(user: User): void {
  context.storage.set(context.sender, user);
}

// Function to get user profile
export function getUser(account: string): User | null {
  return context.storage.get<User>(account, null);
}

// Function to set or update donate post
export function setDonate(donate: Donate): void {
  assert(context.sender == donate.author, "You have no permission.");
  assert(donate.status !== DonateStatus.Ended, "Status can't be ended at this moment");
  assert(donate.amount >= MIN_DONATION, "Min donation must be 0.1 NEAR");

  donate.timestamp = context.blockTimestamp;

  context.storage.set(donate.id, donate);
}

// Function to get donate post
export function getDonate(id: string): Donate | null {
  return context.storage.get<Donate>(id, null);
}

// Function to get donate history
export function getHistory(id: string): History[] | null {
  const donate = getDonate(id);
  return donate ? donate.history : null;
}

// Function to get total donated amount
export function getTotalDonated(id: string): u128 {
  const donate = getDonate(id);
  assert(donate, "Donate not found");
  return donate!.totalDonated;
}

// Function to add new donation to the list
export function addHistory(donate_id: string, history: History): void {
  const donate = getDonate(donate_id);
  assert(donate, "Donate post not found");

  assert(donate!.status === DonateStatus.Active, "Donate post is not active.");
  assert(context.attachedDeposit >= MIN_DONATION, "Min donation must be 0.1 NEAR");

  // Transfer the donation to the author
  context.contractPromiseBatch.create(donate!.author).transfer(context.attachedDeposit);

  donate!.totalDonated = u128.add(donate!.totalDonated, context.attachedDeposit);

  // Set status as ended when amount is reached
  if (donate!.totalDonated >= donate!.amount) {
    donate!.status = DonateStatus.Ended;
  }

  history.timestamp = context.blockTimestamp;

  donate!.history.push(history);
  context.storage.set(donate_id, donate!);
}

// Function to get all donate posts
export function getDonates(): Donate[] {
  const donations: Donate[] = [];
  for (let i = 0; i < context.storage.length; i++) {
    const key = context.storage.key(i);
    const value = context.storage.get<Donate>(key, null);
    if (value) {
      donations.push(value);
    }
  }
  return donations;
}
