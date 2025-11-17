# How to Remove Secrets from Git History (and Unblock GitHub Push)

GitHub is blocking your push because secrets (API keys, OAuth credentials) were committed in a previous commit. Removing them from the file is not enough—they must be purged from your git history.

---

## Option 1: BFG Repo-Cleaner (Recommended)
(See previous instructions above.)

---

## Option 2: Use `git filter-branch` (No extra install needed)

### 1. Backup Your Repo
```sh
cp -r . ../uniconnect-learningHub-backup
```

### 2. Remove the File from All History
```sh
git filter-branch --force --index-filter "git rm --cached --ignore-unmatch k8s/backend-env-secret.yaml" --prune-empty --tag-name-filter cat -- --all
```

### 3. Remove Sensitive Data from All Commits (if you know the secret value)
If you know the secret value, you can use:
```sh
git filter-branch --force --tree-filter "grep -rl 'YOUR_SECRET_VALUE' . | xargs git rm --cached --ignore-unmatch" --prune-empty --tag-name-filter cat -- --all
```
Replace `YOUR_SECRET_VALUE` with the actual secret string.

### 4. Clean and Prune Your Repo
```sh
git reflog expire --expire=now --all
git gc --prune=now --aggressive
```

### 5. Force Push the Cleaned Repo
```sh
git push --force
```

### 6. Verify on GitHub
- Go to your repo's Security > Secret Scanning to confirm secrets are gone.

---

**Important:**  
- After cleaning, all collaborators must re-clone the repo to avoid reintroducing secrets.
- Never commit secrets to git. Use .gitignore and environment variables.

For more details:  
https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/removing-sensitive-data-from-a-repository
