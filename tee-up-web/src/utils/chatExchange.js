/** Each participant must send at least this many messages before reviews unlock. */
export const MIN_MESSAGES_PER_USER = 3;

export function countMessagesBySender(messages = []) {
  let me = 0;
  let other = 0;
  for (const m of messages) {
    if (String(m.id ?? '').startsWith('temp_')) continue;
    if (m.sender === 'me') me += 1;
    else if (m.sender === 'other') other += 1;
  }
  return { me, other, total: me + other };
}

export function hasMinimumExchange(messages = []) {
  const { me, other } = countMessagesBySender(messages);
  return me >= MIN_MESSAGES_PER_USER && other >= MIN_MESSAGES_PER_USER;
}

/** Informational only — does not block sending. */
export function getExchangeHint(messages = [], otherName = 'them') {
  if (hasMinimumExchange(messages)) return null;

  const { me, other } = countMessagesBySender(messages);
  const needMe = Math.max(0, MIN_MESSAGES_PER_USER - me);
  const needOther = Math.max(0, MIN_MESSAGES_PER_USER - other);

  if (needMe > 0 && needOther > 0) {
    return `Keep chatting — ${needMe} more from you and ${needOther} from ${otherName} (${MIN_MESSAGES_PER_USER} each) to unlock reviews.`;
  }
  if (needMe > 0) {
    return `Send ${needMe} more message${needMe === 1 ? '' : 's'} — reviews unlock after ${MIN_MESSAGES_PER_USER} from each of you.`;
  }
  return `Waiting for ${needOther} more message${needOther === 1 ? '' : 's'} from ${otherName} to unlock reviews.`;
}
