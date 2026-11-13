# Verify the operation's required account role

## Why

Successful authentication and administrator access do not establish permission for every signing operation. Developer ID Application certificate creation requires Apple's Account Holder role. Reusing an iOS automation account without checking this role led to an avoidable rejected request.

## How to apply

Before handing off authentication for certificate creation, check the operation's current official role requirements and confirm the selected account's role in the intended team. Record only the nonsecret account and team identifiers. If the user corrects the account, update all dependent steps, including notarization credential setup, and clear inherited authentication variables. Do not revoke certificates or change permissions to address an account-selection error.
