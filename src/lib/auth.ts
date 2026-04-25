export function validateApiKey(request: Request): boolean {
  const authHeader = request.headers.get('authorization');
  const apiKey = process.env.MEMORY_API_KEY;
  if (!apiKey) return false;
  return authHeader === `Bearer ${apiKey}`;
}

export function validateOrchestratorAuth(request: Request): boolean {
  const authHeader = request.headers.get('authorization');
  const secret = process.env.ORCHESTRATOR_SECRET;
  if (!secret) return false;
  return authHeader === `Bearer ${secret}`;
}

export function validateAnyAuth(request: Request): boolean {
  return validateApiKey(request) || validateOrchestratorAuth(request);
}
