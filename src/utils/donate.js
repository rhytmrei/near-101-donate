import { v4 as uuid4 } from "uuid";
import {
  formatNearAmount,
  parseNearAmount,
} from "near-api-js/lib/utils/format";

export const convertTimeStamp = (nanoseconds) => {
  return new Date(nanoseconds / 1000000).toLocaleDateString("en-US");
};

export const formatDonations = (amount, total) => {
  const perc =
    total !== 0
      ? ((formatNearAmount(total) / formatNearAmount(amount)) * 100).toFixed(2)
      : 0;
  const left = amount - total;

  return { perc, left };
};

export const PostStatus = {
  1: "active",
  2: "disabled",
  3: "ended",
};

const GAS = 100000000000000;

export function createDonate(donate) {
  donate.id = uuid4();
  donate.amount = parseNearAmount(donate.amount.toString());

  return window.contract.setDonate({ donate });
}

export function updateDonate(donate) {
  donate.amount = donate.amount.toString();

  return window.contract.setDonate({ donate });
}

export function getDonate(id) {
  return window.contract.getDonate({ id });
}

export function getDonates() {
  return window.contract.getDonates();
}

export function getHistory(id) {
  return window.contract.getHistory({ id });
}

export function getTotalDonated(id) {
  return window.contract.getTotalDonated({ id });
}

export async function addHistory(id, history) {
  history.amount = parseNearAmount(history.amount.toString());

  await window.contract.addHistory(
    { donate_id: id, history },
    GAS,
    history.amount
  );
}
