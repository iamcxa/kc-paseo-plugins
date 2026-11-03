export interface GateIdentityFields {
  workflowDir?: string;
  slug: string;
  stage: string;
  briefingId?: string;
  preparedAt?: string;
}

export function gateKey(gate: GateIdentityFields): string {
  return JSON.stringify(["g", gate.workflowDir ?? "", gate.slug, gate.stage, gate.briefingId ?? gate.preparedAt ?? null]);
}
