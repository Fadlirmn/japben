// Smoke tests for the non-trivial pure logic (auth, SSRF allowlist). No test
// framework added — console.assert matches this repo's existing convention
// (see src/lib/services/learning/selfcheck.ts on the frontend side).
process.env.JWT_SECRET ??= 'selfcheck-only-secret';

const { hashPassword, verifyPassword, signToken, verifyToken } = await import('./auth.ts');
const { parseAllowedHosts } = await import('./routes/aiProxy.ts');

async function run() {
  const hash = await hashPassword('correct-horse-battery-staple');
  console.assert(await verifyPassword('correct-horse-battery-staple', hash), 'correct password should verify');
  console.assert(!(await verifyPassword('wrong-password', hash)), 'wrong password should not verify');

  const token = signToken('user-123');
  console.assert(verifyToken(token) === 'user-123', 'valid token should resolve to its subject');
  console.assert(verifyToken('garbage.token.value') === null, 'invalid token should return null');

  const hosts = parseAllowedHosts(undefined);
  console.assert(hosts.includes('api.anthropic.com'), 'default allowlist should include api.anthropic.com');
  console.assert(!hosts.includes('169.254.169.254'), 'default allowlist should not include an internal/metadata host');

  console.log('selfcheck: all assertions ran (see above for any failures)');
}

run();
