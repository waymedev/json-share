// verify expiredAt is expired
export function isExpired(expiredAt: number) {
  return expiredAt > 0 && expiredAt < Date.now();
}
