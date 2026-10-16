// `cloudflare:sockets` only exists inside workerd. The tests hand sendMail their own `connect`,
// so this stub only has to let worker/smtp.js be imported under vitest.
export const connect = () => {
  throw new Error('cloudflare:sockets is not available outside the Workers runtime');
};
