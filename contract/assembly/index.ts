/**
 * @file This file contains functions related to user management and donation handling.
 */

import { User, Donate, listedDonates, saved_users, History } from "./model";
import { ContractPromiseBatch, context, u128 } from "near-sdk-as";

/**
 * Minimum donation amount that will be set as the publication amount or for donation.
 */
const MIN_DONATION: u128 = new u128(100000000000000000000000);

/**
 * Sets or updates the user's profile information.
 *
 * @param user - The user object to be added or updated on the blockchain.
 * @throws Error if the user object is invalid or violates any constraints.
 */
export function setUser(user: User): void {
  // Validate the user object
  validateUser(user);

  saved_users.set(context.sender, user);
}

/**
 * Returns the user information for the given account.
 *
 * @param account - The user's account address on the blockchain.
 * @returns The user object associated with the given account, or null if not found.
 */
export function getUser(account: string): User | null {
  return saved_users.get(account);
}

/**
 * Creates or updates a donation post.
 *
 * @param donate - The donation post object.
 * @throws Error if the user is not authorized, the status is invalid, or the donation amount is below the minimum.
 */
export function setDonate(donate: Donate): void {
  // Validate the donation object
  validateDonate(donate);

  donate.timestamp = context.blockTimestamp;
  listedDonates.set(donate.id, donate);
}

/**
 * Returns the donation post information for the given ID.
 *
 * @param id - The ID of the donation post.
 * @returns The donation post object associated with the given ID, or null if not found.
 */
export function getDonate(id: string): Donate | null {
  return listedDonates.get(id);
}

/**
 * Returns the donation history for the given donation post ID.
 *
 * @param id - The ID of the donation post.
 * @returns An array of donation history objects associated with the given post ID, or null if the post is not found.
 */
export function getHistory(id: string): History[] | null {
  const donate = getDonate(id);
  if (donate != null) return donate.history;
  return null;
}

/**
 * Returns the total amount of donations for the given donation post ID.
 *
 * @param id - The ID of the donation post.
 * @returns The total amount of donations for the given post.
 * @throws Error if the donation post is not found.
 */
export function getTotalDonated(id: string): u128 {
  const donate = getDonate(id);
  if (donate === null) {
    throw new Error("Donate post with ID " + id + " not found");
  }
  return Donate.totalDonated(<Donate>donate);
}

/**
 * Adds a new donation to the specified donation post.
 *
 * @param donateId - The ID of the donation post.
 * @param history - The donation history object to be added.
 * @throws Error if the donation post is not found, not active, or the donation amount is below the minimum.
 */
export function addHistory(donateId: string, history: History): void {
  const donate = getDonate(donateId);
  if (donate === null) {
    throw new Error("Donate post with ID " + donateId + " not found");
  }

  // Validate the donation status and amount
  validateDonateStatus(donate);
  validateDonationAmount(context.attachedDeposit);

  // Transfer the donated amount to the post author
  ContractPromiseBatch.create(donate.author).transfer(context.attachedDeposit);

  const total = u128.add(context.attachedDeposit, getTotalDonated(donateId));

  // Update the donation post status if the total amount is reached
  if (total >= donate.amount) {
    donate.changeStatus(3); // Set status to ended
  }

  history.timestamp = context.blockTimestamp;
  donate.addHistory(history);
  listedDonates.set(donate.id, donate);
}

/**
 * Returns all the donation posts.
 *
 * @returns An array of donation post objects, or null if no posts are found.
 */
export function getDonates(): Donate[] | null {
  return listedDonates.values();
}

/**
 * Validates the user object for any constraints or invalid data.
 *
 * @param user - The user object to be validated.
 * @throws Error if the user object is invalid or violates any constraints.
 */
function validateUser(user: User): void {
  // Implement user object validation logic here
  // Example: Check if required fields are present, data types are correct, etc.
}

/**
 * Validates the donation object for any constraints or invalid data.
 *
 * @param donate - The donation object to be validated.
 * @throws Error if the donation object is invalid or violates any constraints.
 */
function validateDonate(donate: Donate): void {
  // Validate the author
  assert(context.sender == donate.author, "You have no permission.");

  // Validate the status
  assert(donate.status !== 3, "Status can't be ended at this moment");

  // Validate the donation amount
  assert(donate.amount >= MIN_DONATION, "Min donation must be 0.1 NEAR");
}

/**
 * Validates the donation status for a given donation post.
 *
 * @param donate - The donation post object.
 * @throws Error if the donation post is not active.
 */
function validateDonateStatus(donate: Donate): void {
  assert(donate.status === 1, "Donate post is not active.");
}

/**
 * Validates the donation amount against the minimum donation requirement.
 *
 * @param amount - The donation amount to be validated.
 * @throws Error if the donation amount is below the minimum.
 */
function validateDonationAmount(amount: u128): void {
  assert(amount > MIN_DONATION, "Min donation must be 0.1 NEAR");
}
