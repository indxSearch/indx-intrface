# Getting Started with INDX Search Interface

This guide walks you through setting up the INDX search interface for the first time, from installation to seeing your first search results.

## What You'll Need

- Node.js 18+ installed
- An INDX server (cloud or local)
- Your INDX account email and password

## Step 1: Install the Package

```bash
npm install @indxsearch/intrface
```

This will also install the required peer dependencies (`@indxsearch/systm` and `@indxsearch/pixl`).

## Step 2: Get Your Authentication Token

You need a token to authenticate with your INDX server. Run this command:

```bash
curl -X POST 'https://your-indx-server.com/api/Login?userEmail=your@email.com&userPassWord=yourpassword' \
  -H 'accept: */*' \
  -d ''
```

**For local development:**
```bash
curl -X POST 'http://localhost:38171/api/Login?userEmail=your@email.com&userPassWord=yourpassword' \
  -H 'accept: */*' \
  -d ''
```

You'll get a response like:
```json
{"token":"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."}
```

Copy the token value - you'll need it in the next step.

## Step 3: Create Environment Variables

Create a file named `.env.local` in your project root:

```bash
# Your INDX server URL
NEXT_PUBLIC_INDX_URL=http://localhost:38171

# Your authentication token (from Step 2)
NEXT_PUBLIC_INDX_TOKEN=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Important:** Add `.env.local` to your `.gitignore` file to keep your token secure.

## Step 4: Import the Styles

In your app's main file (e.g., `app/layout.tsx` or `src/index.tsx`):

```typescript
import '@indxsearch/intrface/styles.css';
```

## Step 5: Create a Search Page

Create a new file for your search interface:

```typescript
'use client'; // If using Next.js App Router

import { SearchProvider, SearchInput, SearchResults } from '@indxsearch/intrface';

export default function SearchPage() {
  return (
    <SearchProvider
      url={process.env.NEXT_PUBLIC_INDX_URL!}
      dataset="your-dataset-name"
      token={process.env.NEXT_PUBLIC_INDX_TOKEN!}
    >
      <SearchInput placeholder="Search..." />

      <SearchResults
        fields={['name', 'description']}
        resultsPerPage={10}
      >
        {(item) => (
          <div>
            <h3>{item.name}</h3>
            <p>{item.description}</p>
          </div>
        )}
      </SearchResults>
    </SearchProvider>
  );
}
```

**Note:** Replace `"your-dataset-name"` and the `fields` array with your actual dataset name and field names.

## Step 6: Run Your App

```bash
npm run dev
```

Open your browser and navigate to your search page. You should see a working search interface!

## Verification Checklist

✅ **Check the browser console for:**
- `[Auth] Using provided token` message
- No authentication errors
- Search requests completing successfully

✅ **You should see:**
- A search input field
- Results appearing when you type (if `allowEmptySearch` is enabled, results show immediately)

## Common Issues

### "Authentication required" error

Your environment variables aren't loaded.

**Fix:** Restart your dev server after creating `.env.local`.

### "401 Unauthorized" error

Your token is invalid or expired.

**Fix:** Get a fresh token using the curl command from Step 2, then update `.env.local`.

### No results showing

Your dataset might not be set up yet.

**Fix:** Verify your dataset exists and is indexed:
```bash
curl -X GET 'http://localhost:38171/api/GetUserDataSets' \
  -H 'Authorization: Bearer YOUR_TOKEN'
```

### CORS errors

Your server isn't configured to allow requests from your app's origin.

**Fix:** For local development, ensure your API server is running on `localhost:38171`. For production, contact your server administrator.

## Next Steps

Now that you have a basic search working:

1. **Add filters** - See the [README](packages/indx-intrface/README.md#adding-filters) for filter examples
2. **Customize styling** - Override the CSS or use custom render functions
3. **Configure search behavior** - Adjust `coverageDepth`, `removeDuplicates`, etc.
4. **Add multiple datasets** - Use different `dataset` names on different pages

## Need More Help?

- **Full API Reference:** See [README.md](packages/indx-intrface/README.md)
- **API Documentation:** See [INDX_API_GUIDE.md](INDX_API_GUIDE.md)
- **Issues:** Open an issue on GitHub
- **Questions:** Check our documentation at [docs.indx.co](https://docs.indx.co)

## Quick Reference

### Get Token Command
```bash
curl -X POST 'http://localhost:38171/api/Login?userEmail=YOUR_EMAIL&userPassWord=YOUR_PASSWORD' \
  -H 'accept: */*' \
  -d ''
```

### Environment Variables Template
```bash
NEXT_PUBLIC_INDX_URL=http://localhost:38171
NEXT_PUBLIC_INDX_TOKEN=your-token-here
```

### Minimal Working Example
```typescript
<SearchProvider url={url} dataset="products" token={token}>
  <SearchInput />
  <SearchResults fields={['name']} resultsPerPage={10}>
    {(item) => <div>{item.name}</div>}
  </SearchResults>
</SearchProvider>
```
