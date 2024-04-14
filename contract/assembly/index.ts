import { User, Donate, listedDonates, saved_users, History } from "./model";
import { ContractPromiseBatch, context, u128 } from "near-sdk-as";

/**
 *
 * @dev minimum donation that will be set as the publication amount or for donation
 *
 */
const MIN_DONATION: u128 = new u128(100000000000000000000000);

/**
 *
 * @dev setUser is only called when the user wants to edit his profile
 * no need to assert the address because the sender of the transaction is used as the user's address
 *
 * @param user - a user to be added to the blockchain
 *
 */
export function setUser(user: User): void {
  saved_users.set(context.sender, user);
}

/**
 *
 * A function that returns the user information
 *
 * @param account - user address on the blockchain
 *
 * @returns User | null, user details for a given @param account
 *
 */
export function getUser(account: string): User | null {
  return saved_users.get(account);
}

/**
 *
 * @dev create or update donate post
 *
 * @param donate - donate post object
 *
 */
export function setDonate(donate: Donate): void {
  assert(context.sender == donate.author, "You have no permission.");

  // status can be set to ended only from @setHistory method
  assert(donate.status !== 3, "Status can't be ended at this moment");

  assert(donate.amount >= MIN_DONATION, "Min donation must be 0.1 NEAR");

  donate.timestamp = context.blockTimestamp;

  listedDonates.set(donate.id, donate);
}

/**
 *
 * A function that returns the donate post information
 *
 * @param id - donate post id
 *
 * @returns Donate | null, post details for a given @param id
 *
 */
export function getDonate(id: string): Donate | null {
  return listedDonates.get(id);
}

/**
 *
 * A function that returns the donate history information
 *
 * @param id - donate post id
 *
 * @returns History[] | null, an array with all donations made to the post with @param id
 *
 */
export function getHistory(id: string): History[] | null {
  let donate = getDonate(id);

  if (donate != null) return donate.history;

  return null;
}

/**
 *
 * Returns total donations amount
 *
 * @param id - donate post id
 *
 * @returns u128
 *
 */
export function getTotalDonated(id: string): u128 {
  const donate = getDonate(id);

  assert(donate !== null, "Donate not found");

  return Donate.totalDonated(<Donate>donate);
}

/**
 *
 * @dev adds new donation to the list
 *
 * @param donate_id
 * @param history - history (donation) object
 *
 */
export function addHistory(donate_id: string, history: History): void {
  let donate = getDonate(donate_id);

  if (donate === null) {
    throw new Error("Donate post not found");
  }

  // cannot donate to a disabled or ended post
  assert(donate.status === 1, "Donate post is not active.");

  assert(
    context.attachedDeposit > MIN_DONATION,
    "Min donation must be 0.1 NEAR"
  );

  ContractPromiseBatch.create(donate.author).transfer(context.attachedDeposit);

  const total = u128.add(context.attachedDeposit, getTotalDonated(donate_id));

  // set status as ended when amount is reached
  if (total >= donate.amount) {
    donate.changeStatus(3);
  }

  history.timestamp = context.blockTimestamp;

  donate.addHistory(history);
  listedDonates.set(donate.id, donate);
}

/**
 *
 * Returns all donate posts
 * @returns Donate[] | null
 *
 */
export function getDonates(): Donate[] | null {
  return listedDonates.values();
}
