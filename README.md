Add
```aiignore
{
	"metadata": {
		"role": "{{user.public_metadata.role}}"
	}
}
```
to clerk session token. IMPORTANT!!

These are required env vars:
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=
GOOGLE_SHEETS_WEBHOOK_URL=
GOOGLE_SHEETS_WEBHOOK_SECRET=
