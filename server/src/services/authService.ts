export class NotImplementedError extends Error {}

/** Integration with the legacy .NET authentication service is not designed yet. */
export function requestPasswordReset(_email: string): never {
  throw new NotImplementedError('Password reset is not available yet.');
}

export function registerUser(): never {
  throw new NotImplementedError('Registration is not available yet.');
}

export function authenticate(_email: string, _password: string): never {
  throw new NotImplementedError('Login is not available yet.');
}
