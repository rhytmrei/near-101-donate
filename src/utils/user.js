const GAS = 100000000000000;

export function getUser(account) {
  return window.contract.getUser({ account: account }); // get_products for the Rust contract
}

export async function setUser(user) {
  await window.contract.setUser({ user }, GAS);
}
