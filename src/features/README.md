# Feature Modules

Sprint 1 establishes feature-based architecture only. Product behavior remains in the original Figma-generated screen components until each feature sprint migrates it behind typed hooks, services, and focused components.

Each feature should use this shape:

```txt
feature-name/
  components/
  hooks/
  services/
  types.ts
```

Do not add CRUD, database, authentication, or AI logic here until the relevant sprint begins.
