# Getting Started with INDX Search Interface

This guide walks you through setting up the INDX search interface for the first time, from installation to seeing your first search results.

## What You'll Need

- Node.js 18+ installed
- An INDX server (cloud or local)
- Your INDX account email and password

## Step 1: Install the Package

```bash
npm install @indxsearch/intrface @indxsearch/systm @indxsearch/pixl
```

This will install the search interface library and its required dependencies.

## Step 2: Create Environment Variables

Create a file named `.env.local` in your project root:

```bash
# INDX Server Configuration
VITE_INDX_URL=http://localhost:38171

# Authentication Credentials
VITE_INDX_EMAIL=your@email.com
VITE_INDX_PASSWORD=yourpassword
```

**For production:**
```bash
VITE_INDX_URL=https://your-indx-server.com
VITE_INDX_EMAIL=your@email.com
VITE_INDX_PASSWORD=yourpassword
```

**Important:**
- Add `.env.local` to your `.gitignore` file to keep your credentials secure
- The library automatically logs in when your app initializes
- A fresh session token is obtained on every app load
- No need to manually manage tokens

**Note:** If you're using a different bundler (Next.js, Create React App, etc.), adjust the environment variable prefix:
- Vite: `VITE_*`
- Next.js: `NEXT_PUBLIC_*`
- Create React App: `REACT_APP_*`

## Step 3: Import the Styles

In your app's main file (e.g., `src/main.tsx` or `src/index.tsx`):

```typescript
import '@indxsearch/intrface/styles.css';
```

## Step 4: Create a Search Page

Create a new file for your search interface:

```typescript
import { SearchProvider, SearchInput, SearchResults } from '@indxsearch/intrface';

export default function SearchPage() {
  return (
    <SearchProvider
      url={import.meta.env.VITE_INDX_URL}
      email={import.meta.env.VITE_INDX_EMAIL}
      password={import.meta.env.VITE_INDX_PASSWORD}
      dataset="your-dataset-name"
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

## Step 5: Run Your App

```bash
npm run dev
```

Open your browser and navigate to your search page. You should see a working search interface!

## Verification Checklist

✅ **Check the browser console for:**
- `[Auth] ✅ Login successful` message
- `[Auth] 📊 Dataset status:` with your dataset info
- `[Auth] ✅ Dataset has X records` message
- `[Auth] ✅ Initialization complete` message
- No red error messages

✅ **You should see:**
- A search input field
- Results appearing when you type (if `allowEmptySearch` is enabled, results show immediately)

**💡 Pro Tip:** The console provides detailed error messages with emoji indicators:
- ✅ = Success
- 🔍 = Checking something
- ⚠️ = Warning (non-critical issue)
- ❌ = Error (needs fixing)
- 💡 = Helpful suggestion

## Common Issues

**💡 All errors show helpful messages in the browser console with specific instructions.**

### "Login failed" / Authentication errors

**Problem:** Email or password is incorrect

**Console shows:**
```
[Auth] ❌ Login failed - invalid credentials
[Auth] 💡 Check your VITE_INDX_EMAIL and VITE_INDX_PASSWORD in .env.local
[Auth] 💡 Verify your credentials match your INDX account
```

**Fix:**
1. Verify your email and password are correct
2. Check that the credentials match your INDX account
3. Ensure the INDX server URL is correct
4. Restart your dev server after updating `.env.local`

### "401 Unauthorized" errors

**Problem:** Authentication failed or session expired

**Console shows:**
```
[Auth] ❌ Authentication failed (401 Unauthorized)
[Auth] 💡 Your credentials may be invalid
[Auth] 💡 Check VITE_INDX_EMAIL and VITE_INDX_PASSWORD
```

**Fix:**
1. Verify your credentials in `.env.local`
2. Refresh the page to get a new session token (automatic login)
3. Check if the server is running and accessible

### "Dataset not found (404)"

**Problem:** Dataset name doesn't exist on the server

**Console shows:**
```
[Auth] ❌ Dataset "your-dataset-name" not found (404)
[Auth] 💡 Make sure you spelled the dataset name correctly
```

**Fix:**
1. Verify the dataset name matches exactly (case-sensitive)
2. Check your INDX server to confirm the dataset exists
3. Update the `dataset` prop in your SearchProvider to match an existing dataset

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
[Auth] 💡 Check your VITE_INDX_URL in .env.local
```

**Fix:**
1. Verify your INDX server is running
2. Check the URL in `.env.local` is correct
3. For local development, it should be `http://localhost:38171`

### Missing credentials

**Problem:** Environment variables not found

**Console shows:**
```
[Auth] ❌ Missing email or password
[Auth] 💡 Add VITE_INDX_EMAIL and VITE_INDX_PASSWORD to your .env.local file
```

**Fix:**
1. Create `.env.local` file in project root
2. Add your INDX credentials
3. Restart your dev server

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

### Environment Variables Template
```bash
VITE_INDX_URL=http://localhost:38171
VITE_INDX_EMAIL=your@email.com
VITE_INDX_PASSWORD=yourpassword
```

### Minimal Working Example
```typescript
<SearchProvider
  url={import.meta.env.VITE_INDX_URL}
  email={import.meta.env.VITE_INDX_EMAIL}
  password={import.meta.env.VITE_INDX_PASSWORD}
  dataset="products"
>
  <SearchInput />
  <SearchResults fields={['name']} resultsPerPage={10}>
    {(item) => <div>{item.name}</div>}
  </SearchResults>
</SearchProvider>
```

### Using with Different Bundlers

**Vite:**
```typescript
url={import.meta.env.VITE_INDX_URL}
email={import.meta.env.VITE_INDX_EMAIL}
password={import.meta.env.VITE_INDX_PASSWORD}
```

**Next.js:**
```typescript
url={process.env.NEXT_PUBLIC_INDX_URL}
email={process.env.NEXT_PUBLIC_INDX_EMAIL}
password={process.env.NEXT_PUBLIC_INDX_PASSWORD}
```

**Create React App:**
```typescript
url={process.env.REACT_APP_INDX_URL}
email={process.env.REACT_APP_INDX_EMAIL}
password={process.env.REACT_APP_INDX_PASSWORD}
```
