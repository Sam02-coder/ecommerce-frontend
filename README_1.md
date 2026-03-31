# ShopZen — Frontend

A production-ready React e-commerce frontend built with Vite, TailwindCSS, TanStack Query, Zustand, and Razorpay.

---

## Tech Stack

| Layer | Library |
|---|---|
| UI framework | React 18 + Vite 5 |
| Routing | React Router v6 |
| Server state | TanStack Query v5 |
| Client state | Zustand v4 (with persist) |
| Styling | TailwindCSS v3 |
| HTTP client | Axios (with JWT refresh interceptor) |
| Notifications | react-hot-toast |
| Forms | react-hook-form (available) |
| Animations | framer-motion + CSS keyframes |
| Payment | Razorpay checkout.js |
| Icons | lucide-react |

---

## Project Structure

```
src/
├── components/
│   ├── common/
│   │   ├── ConfirmDialog.jsx      # Replaces browser confirm()
│   │   ├── ErrorBoundary.jsx      # React error boundary
│   │   ├── NavigationProgress.jsx # Top-of-page loading bar
│   │   ├── ProtectedRoute.jsx     # Route guards (re-exports from Skeleton)
│   │   ├── Skeleton.jsx           # Loading skeletons + route guards
│   │   └── StarRating.jsx         # Interactive/read-only star rating
│   ├── layout/
│   │   ├── Navbar.jsx
│   │   └── Footer.jsx
│   └── product/
│       └── ProductCard.jsx        # Memoized product card
├── hooks/
│   ├── useApi.js                  # Imperative API calls + abort support
│   ├── useMeta.js                 # usePageMeta + useScrollToTop
│   └── useRazorpay.js             # Razorpay integration hook
├── pages/
│   ├── HomePage.jsx
│   ├── ProductsPage.jsx
│   ├── ProductDetailPage.jsx
│   ├── CartPage.jsx
│   ├── CheckoutPage.jsx
│   ├── OrdersPage.jsx
│   ├── AccountPage.jsx
│   ├── AdminPage.jsx
│   ├── AuthPages.jsx              # LoginPage + RegisterPage
│   └── ErrorPages.jsx             # NotFoundPage + ErrorPage + OfflinePage
├── services/
│   └── api.js                     # Axios instance + all API methods
├── store/
│   ├── authStore.js               # Auth state (persisted)
│   └── cartStore.js               # Cart state (optimistic updates)
└── utils/
    ├── helpers.js                 # formatCurrency, formatDate, validators…
    └── notify.js                  # Toast wrapper (notify.success / .error…)
```

---

## Getting Started

### Prerequisites
- Node.js 20+
- Backend running at `http://localhost:8080` (or configure `VITE_API_BASE_URL`)

### Install & run

```bash
# Install dependencies
npm install

# Start dev server (proxies /api → localhost:8080)
npm run dev

# Build for production
npm run build

# Preview the production build locally
npm run preview

# Lint
npm run lint
```

---

## Environment Variables

Copy `.env.example` to `.env.local` and fill in values:

```bash
cp .env.example .env.local
```

| Variable | Description | Default |
|---|---|---|
| `VITE_API_BASE_URL` | Backend API base URL | `/api` (dev proxy) |
| `VITE_APP_NAME` | App display name | `ShopZen` |
| `VITE_APP_ENV` | Environment name | `development` |

In **production**, set `VITE_API_BASE_URL` to your deployed backend, e.g.:
```
VITE_API_BASE_URL=https://api.shopzen.in/api
```

---

## Docker Deployment

### Build the image

```bash
docker build \
  --build-arg VITE_API_BASE_URL=https://api.shopzen.in/api \
  -t shopzen-frontend:latest .
```

### Run

```bash
docker run -p 80:80 shopzen-frontend:latest
```

### Docker Compose (with backend)

```yaml
version: '3.8'
services:
  frontend:
    build:
      context: .
      args:
        VITE_API_BASE_URL: https://api.shopzen.in/api
    ports:
      - "80:80"
    depends_on:
      - backend

  backend:
    image: shopzen-backend:latest
    ports:
      - "8080:8080"
    environment:
      SPRING_PROFILES_ACTIVE: prod
```

---

## API Integration

All API calls go through `src/services/api.js`, which:

- Attaches JWT from `localStorage` to every request
- Silently refreshes expired tokens via `POST /auth/refresh`
- Queues concurrent requests that arrive during token refresh
- Redirects to `/login?expired=1` if refresh fails
- Shows appropriate toasts for 403, 429, 5xx errors

### Adding a new API endpoint

```js
// In src/services/api.js
export const productAPI = {
  // ... existing methods
  getByCategory: (categoryId, params) =>
    api.get(`/products/category/${categoryId}`, { params }),
}
```

---

## State Management

### Auth (`useAuthStore`)
- Persisted to `localStorage` via Zustand persist middleware
- `isHydrated` flag prevents the "flash to login" bug on page reload
- `updateTokens()` called by the Axios interceptor after a silent refresh

### Cart (`useCartStore`)
- **Optimistic updates** for `updateItem` and `removeItem`:
  1. UI updates instantly
  2. API fires in background
  3. On failure, UI rolls back + error toast shown

---

## Production Checklist

Before going live, make sure:

- [ ] `VITE_API_BASE_URL` set to production backend
- [ ] Remove demo credentials from `LoginPage` (search for `admin@ecommerce.com`)
- [ ] Configure Razorpay with your live key (backend sets `keyId`)
- [ ] Uncomment and configure the `Content-Security-Policy` header in `nginx.conf`
- [ ] Set `sourcemap: true` in `vite.config.js` if using Sentry for error tracking
- [ ] Add your real domain to `og:url` in `index.html`
- [ ] Create a real `og-image.png` (1200×630px) for social sharing
- [ ] Verify `robots.txt` exists at the domain root
- [ ] Enable HTTPS (handle at load balancer / Nginx upstream level)

---

## Key Patterns

### Per-page SEO
Every page sets its own title + meta description via the `usePageMeta` hook:

```js
usePageMeta({
  title: 'Product Name',
  description: 'Buy this product at the best price on ShopZen.',
})
```

### Accessible confirm dialogs
Replace `window.confirm()` with the `ConfirmDialog` component:

```jsx
const [dialog, setDialog] = useState(null)

<ConfirmDialog
  open={!!dialog}
  title="Delete item?"
  message="This cannot be undone."
  variant="danger"
  onConfirm={() => { doDelete(); setDialog(null) }}
  onCancel={() => setDialog(null)}
/>
```

### Toast notifications
Use `notify` instead of calling `toast` directly:

```js
import notify from '../utils/notify'

notify.success('Order placed!')
notify.error('Payment failed')
notify.promise(apiCall(), { loading: 'Saving…', success: 'Saved!', error: 'Failed' })
```

### Image error handling
All `<img>` tags use `onError` with a local SVG fallback (no `via.placeholder.com`):

```jsx
const FALLBACK = `data:image/svg+xml,...`
<img src={imgError ? FALLBACK : product.image} onError={() => setImgError(true)} />
```

---

## License

Private — ShopZen. All rights reserved.
