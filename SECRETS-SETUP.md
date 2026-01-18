# Secrets Setup Guide

This guide explains how to create and manage secrets for production deployment.

## Required Secret Files

Create the following files in the `secrets/` directory before deploying to production:

### `jwt_secret.txt`
```
YOUR_SUPER_SECRET_JWT_KEY_MINIMUM_256_BITS_LONG
```
**Requirements:**
- Minimum 256 characters
- Random string
- Never commit to version control

### `mongo_root_username.txt`
```
admin
```
**Requirements:**
- MongoDB root username
- Default: `admin`

### `mongo_root_password.txt`
```
YOUR_SECURE_MONGO_ROOT_PASSWORD
```
**Requirements:**
- Strong password (minimum 12 characters)
- Mix of letters, numbers, and special characters
- Never commit to version control

### `mongo_app_password.txt`
```
YOUR_SECURE_MONGO_APP_PASSWORD
```
**Requirements:**
- Strong password (minimum 12 characters)
- Mix of letters, numbers, and special characters
- Different from root password
- Never commit to version control

## Security Notes

- **Never commit** these files to version control
- **Never share** these files publicly
- **Use different passwords** for root and app users
- **Rotate passwords** regularly
- **Store backups** securely

## Quick Setup Commands

```bash
# Create secrets directory
mkdir -p secrets

# Create JWT secret
openssl rand -base64 32 > secrets/jwt_secret.txt

# Create MongoDB credentials
echo "admin" > secrets/mongo_root_username.txt
openssl rand -base64 12 > secrets/mongo_root_password.txt
openssl rand -base64 12 > secrets/mongo_app_password.txt

# Set proper permissions
chmod 600 secrets/*
```

## Verification

Before deployment, verify all files exist:
```bash
ls -la secrets/
```

Expected output:
```
-rw------- 1 user user 45 Jan 1 12:00 jwt_secret.txt
-rw------- 1 user user 6 Jan 1 12:00 mongo_root_username.txt
-rw------- 1 user user 16 Jan 1 12:00 mongo_root_password.txt
-rw------- 1 user user 16 Jan 1 12:00 mongo_app_password.txt
```

## EC2 Deployment Steps

1. Create secrets directory on EC2:
```bash
ssh -i deal-pipeline.pem ec2-user@<INSTANCE-IP>
mkdir -p /home/ec2-user/app/secrets
```

2. Copy secret files to EC2:
```bash
scp -i deal-pipeline.pem secrets/* ec2-user@<INSTANCE-IP>:/home/ec2-user/app/secrets/
```

3. Set proper permissions:
```bash
ssh -i deal-pipeline.pem ec2-user@<INSTANCE-IP>
chmod 600 /home/ec2-user/app/secrets/*
```

## Environment Variables

Update `.env.production` with your values:
```bash
CORS_ALLOWED_ORIGINS=http://<INSTANCE-IP>,https://yourdomain.com
```

## Troubleshooting

If deployment fails due to missing secrets:
1. Check all 4 files exist in `secrets/` directory
2. Verify file permissions (600)
3. Check file contents are not empty
4. Ensure `.env.production` exists and is properly configured
