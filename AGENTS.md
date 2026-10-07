# Project Architecture Rules

- Homepage service definitions live in one shared data module so the public cards and admin image manager always use identical stable keys.
- Homepage category views reuse the shared service keys, existing descriptions and read-only catalogue data; classify products by specific name before category fallback to avoid cross-category leakage.
- The dedicated Services listing renders only existing active product rows, uses explicit service groups before inferred categories, and refreshes while open without creating static duplicate services.