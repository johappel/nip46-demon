# nostrclient Architecture Workspace

This folder contains the incremental migration target for a hexagonal architecture with strategy-based provider adapters.

Goals:
- Keep the current production paths untouched.
- Build new core logic behind contracts and adapters.
- Switch feature-by-feature via flags, not via big-bang replacement.

Initial scope in this folder:
- `shared/adapter-contracts`: explicit contracts and runtime validators.
- `shared/identity-link-core`: provider-neutral identity-link use cases.
- `shared/signer-core`: provider-neutral signer use cases.
- `integrations/wordpress/adapter`: WordPress strategy implementations.
- `apps/identity-link`: nostrclient composition entry point.