```markdown
# code-burger-jb Development Patterns

> Auto-generated skill from repository analysis

## Overview
This skill teaches the core development patterns used in the `code-burger-jb` JavaScript repository. It covers file organization, code style, commit conventions, and testing patterns, providing a clear guide for contributing code that aligns with the project's established standards.

## Coding Conventions

### File Naming
- Use **camelCase** for file names.
  - Example: `orderManager.js`, `userProfile.js`

### Imports
- Use **relative import paths**.
  - Example:
    ```javascript
    import { getOrder } from './orderManager';
    ```

### Exports
- Use **named exports**.
  - Example:
    ```javascript
    // In orderManager.js
    export function getOrder(id) { ... }
    export function createOrder(data) { ... }
    ```

### Commit Messages
- Follow the **Conventional Commits** specification.
- Use the `feat` prefix for new features.
- Commit message length averages around 83 characters.
  - Example:
    ```
    feat: add user authentication to checkout process
    ```

## Workflows

### Feature Development
**Trigger:** When adding a new feature  
**Command:** `/feature-development`

1. Create a new branch for your feature.
2. Implement the feature using camelCase file naming and relative imports.
3. Export functions or components using named exports.
4. Write or update relevant test files (`*.test.*`).
5. Commit your changes using the `feat` prefix and a descriptive message.
6. Open a pull request for review.

### Testing
**Trigger:** When verifying code correctness  
**Command:** `/run-tests`

1. Identify or create test files matching the `*.test.*` pattern.
2. Run the test suite using the project's preferred test runner (framework unknown; check project documentation or scripts).
3. Ensure all tests pass before merging changes.

## Testing Patterns

- Test files use the `*.test.*` naming convention (e.g., `orderManager.test.js`).
- The specific testing framework is **unknown**; refer to project scripts or documentation for details.
- Place test files alongside the code they test or in a dedicated `tests` directory (follow existing patterns).

## Commands
| Command               | Purpose                                      |
|-----------------------|----------------------------------------------|
| /feature-development  | Guide for adding a new feature               |
| /run-tests            | Steps to run the test suite                  |
```
