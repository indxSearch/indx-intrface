# indx-intrface Demo App

A showcase application demonstrating the `@indxsearch/intrface` component library for building powerful search interfaces with [INDX](https://indx.co).

This demo uses the Pokemon dataset to demonstrate various search features including:
- Real-time search with faceted filtering
- Range filters with sliders
- Dynamic filter panels
- Sort functionality
- Search settings customization

## Tech Stack

- **Vite** - Fast build tool and dev server
- **React 19** - UI framework
- **TypeScript** - Type safety
- **@indxsearch/intrface** - Search UI components
- **@indxsearch/systm** - Design system
- **@indxsearch/pixl** - Icon library

## Getting Started

### Prerequisites

- Node.js 18+ and npm

### Installation

From the root of the monorepo:

```bash
npm install
```

### Configuration

Create a `.env.local` file in the `apps/demo` directory:

```env
VITE_INDX_URL=http://your-indx-url.website.com
VITE_INDX_EMAIL=your-email@example.com
VITE_INDX_PASSWORD=your-password
```

**Common URLs:**
- Local INDX Cloud API: `http://localhost:5001`
- Hosted INDX instance: `https://your-indx-url.website.com`

**Note:** These credentials are exposed in the browser. Use read-only search credentials only.

### Development

Start the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the app.

The page will hot-reload as you edit files in `src/`.

### Build

Build the app for production:

```bash
npm run build
```

Preview the production build:

```bash
npm run preview
```

## Project Structure

```
apps/demo/
├── src/
│   ├── main.tsx          # Entry point
│   ├── App.tsx           # Main app component
│   ├── SearchClient.tsx  # Search client wrapper
│   └── globals.css       # Global styles
├── index.html            # HTML template
├── vite.config.ts        # Vite configuration
└── .env.local            # Environment variables (not committed)
```

## Deployment

### Vercel

This app can be deployed to [Vercel](https://vercel.com):

1. From the project root, navigate to the demo app:
   ```bash
   cd apps/demo
   ```

2. Deploy:
   ```bash
   vercel
   ```

3. Add environment variables in the Vercel dashboard:
   - `VITE_INDX_URL`
   - `VITE_INDX_EMAIL`
   - `VITE_INDX_PASSWORD`

The build output is a static site in the `dist/` directory.

## Learn More

- [INDX Documentation](https://indx.co)
- [Vite Documentation](https://vitejs.dev)
- [React Documentation](https://react.dev)

## License

See the root LICENSE file.
