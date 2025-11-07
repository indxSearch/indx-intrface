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
- `[Auth] ✅ Token format validated` message
- `[Auth] 📊 Dataset status:` with your dataset info
- `[Auth] ✅ Dataset has X records` message
- `[Auth] ✅ Initialization complete` message
- No red error messages

✅ **You should see:**
- A search input field
- Results appearing when you type (if `allowEmptySearch` is enabled, results show immediately)

**💡 Pro Tip:** The console now provides detailed error messages with emoji indicators:
- ✅ = Success
- 🔍 = Checking something
- ⚠️ = Warning (non-critical issue)
- ❌ = Error (needs fixing)
- 💡 = Helpful suggestion

## Common Issues

**💡 All errors now show helpful messages in the browser console with specific instructions.**

### Missing token / "Authentication token is required"

**Problem:** `NEXT_PUBLIC_INDX_TOKEN` not found

**Console shows:**
```
[Auth] ❌ Missing authentication token
[Auth] 💡 Add NEXT_PUBLIC_INDX_TOKEN to your .env.local file
[Auth] 💡 Get a token with: curl -X POST "http://localhost:38171/api/Login?..."
```

**Fix:**
1. Run the curl command from Step 2 to get a token
2. Add it to `.env.local`
3. Restart your dev server

### "Invalid token format"

**Problem:** Token in `.env.local` is malformed or incomplete

**Console shows:**
```
[Auth] ❌ Invalid token format - JWT tokens should have 3 parts
[Auth] 💡 Your token has X parts. Expected format: header.payload.signature
```

**Fix:** Copy the full token from the Login API response (including all three parts)

### "401 Unauthorized" / "Authentication failed"

**Problem:** Token is expired or invalid

**Console shows:**
```
[Auth] ❌ Authentication failed (401 Unauthorized)
[Auth] 💡 Your token may be expired or invalid
[Auth] 💡 Get a fresh token with: curl -X POST ...
```

**Fix:** Get a fresh token using the curl command from Step 2, then update `.env.local`

### "Dataset not found (404)"

**Problem:** Dataset name doesn't exist on the server

**Console shows:**
```
[Auth] ❌ Dataset "your-dataset-name" not found (404)
[Auth] 💡 Available datasets can be checked with: curl -X GET ...
[Auth] 💡 Make sure you spelled the dataset name correctly
```

**Fix:**
1. Check available datasets with:
```bash
curl -X GET 'http://localhost:38171/api/GetUserDataSets' \
  -H 'Authorization: Bearer YOUR_TOKEN'
```
2. Update the `dataset` prop in your SearchProvider to match an existing dataset

### Empty dataset warning

**Problem:** Dataset exists but has no documents

**Console shows:**
```
[Auth] ⚠️ Dataset "your-dataset-name" is empty (0 records)
[Auth] 💡 Add documents to your dataset before searching
[Auth] 💡 Search will work but return no results
```

**Fix:** Add documents to your dataset before searching

### Dataset not ready

**Problem:** Dataset is still indexing

**Console shows:**
```
[Auth] ⚠️ Dataset is not ready yet. Current state: Indexing
[Auth] 💡 Wait for indexing to complete before searching
```

**Fix:** Wait for indexing to complete, then reload the page

### Network errors / "Failed to connect"

**Problem:** Cannot reach INDX server

**Console shows:**
```
[Auth] ❌ Network error - cannot connect to INDX server
[Auth] 💡 Check if the server is running at: http://localhost:38171
[Auth] 💡 Check your NEXT_PUBLIC_INDX_URL in .env.local
```

**Fix:**
1. Verify your INDX server is running
2. Check the URL in `.env.local` is correct
3. For local development, it should be `http://localhost:38171`

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
