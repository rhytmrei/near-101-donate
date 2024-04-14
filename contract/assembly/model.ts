import { PersistentUnorderedMap, u128, context } from "near-sdk-as";

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
}

// DONATE MODEL

@nearBindgen
export class History {
  donor: string;
  comment: string;
  amount: u128;
  timestamp: u64;
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

    return donate;
  }

  public static totalDonated(payload: Donate): u128 {
    const donates = payload.history;
    let total = u128.from(0);

    for (let i = 0; i < donates.length; i++) {
      const donate = donates[i];

      total = u128.add(total, donate.amount);
    }

    return <u128>total;
  }

  public addHistory(h: History): void {
    if (this.history == null) this.history = [];
    this.history.push(h);
  }

  public changeStatus(to: u8): void {
    this.status = to;
  }
}

export const listedDonates = new PersistentUnorderedMap<string, Donate>(
  "LD:v2"
);

export const saved_users = new PersistentUnorderedMap<string, User>("SU:v2");
