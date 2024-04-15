import { PersistentUnorderedMap, u128, context, ContractPromiseBatch } from "near-sdk-as";

// USER MODEL
@nearBindgen
export class User {
  account: string;
  image_src: string;
  description: string;

  public static fromPayload(payload: User): User {
    const user = new User();
    user.account = context.sender;
    user.image_src = payload.image_src;
    user.description = payload.description;
    return user;
  }

  public updateUser(image_src: string, description: string): void {
    this.image_src = image_src;
    this.description = description;
  }
}

// DONATE MODEL
@nearBindgen
export class History {
  donor: string;
  comment: string;
  amount: u128;
  timestamp: u64;

  constructor(donor: string, comment: string, amount: u128) {
    this.donor = donor;
    this.comment = comment;
    this.amount = amount;
    this.timestamp = context.blockTimestamp;
  }
}

@nearBindgen
export class Donate {
  id: string;
  author: string;
  timestamp: u64;
  image_src: string;
  name: string;
  description: string;
  // 1 - active, 2 - disabled, 3 - required amount has been collected
  status: u8;
  amount: u128;
  history: Array<History>;
  totalDonated: u128;

  public static fromPayload(payload: Donate): Donate {
    const donate = new Donate();
    donate.id = payload.id;
    donate.author = payload.author;
    donate.timestamp = payload.timestamp;
    donate.image_src = payload.image_src;
    donate.name = payload.name;
    donate.description = payload.description;
    donate.status = payload.status;
    donate.history = payload.history;
    donate.amount = payload.amount;
    donate.totalDonated = Donate.calculateTotalDonated(payload.history);
    return donate;
  }

  private static calculateTotalDonated(history: Array<History>): u128 {
    let total = u128.from(0);
    for (let i = 0; i < history.length; i++) {
      const donate = history[i];
      total = u128.add(total, donate.amount);
    }
    return total;
  }

  public addHistory(comment: string, amount: u128): void {
    const history = new History(context.sender, comment, amount);
    this.history.push(history);
    this.totalDonated = u128.add(this.totalDonated, amount);
    if (this.totalDonated >= this.amount) {
      this.changeStatus(3);
    }
  }

  public changeStatus(to: u8): void {
    this.status = to;
  }

  public donate(comment: string, amount: u128): void {
    if (this.status == 1) {
      this.addHistory(comment, amount);
      ContractPromiseBatch.create(this.author).transfer(amount);
    } else {
      throw new Error("Donation is not active or already completed.");
    }
  }
}

export const listedDonates = new PersistentUnorderedMap<string, Donate>("LD:v2");
export const saved_users = new PersistentUnorderedMap<string, User>("SU:v2");

export function addUser(user: User): void {
  const userAccount = user.account;
  const isRegistered = saved_users.contains(userAccount);
  if (!isRegistered) {
    saved_users.set(userAccount, User.fromPayload(user));
  } else {
    throw new Error("User already registered.");
  }
}

export function getUser(account: string): User | null {
  return saved_users.get(account);
}

export function removeUser(account: string): void {
  if (saved_users.contains(account)) {
    saved_users.remove(account);
  } else {
    throw new Error("User not found.");
  }
}

export function addDonate(donate: Donate): void {
  const donateId = donate.id;
  const isListed = listedDonates.contains(donateId);
  if (!isListed) {
    listedDonates.set(donateId, Donate.fromPayload(donate));
  } else {
    throw new Error("Donation with this ID already exists.");
  }
}

export function getDonate(id: string): Donate | null {
  return listedDonates.get(id);
}

export function removeDonate(id: string): void {
  if (listedDonates.contains(id)) {
    listedDonates.remove(id);
  } else {
    throw new Error("Donation with this ID does not exist.");
  }
}