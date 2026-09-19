# ShopSphere frontend

The customer catalogue, category browser, inventory view and product/category admin screens are built with React, Vite and Tailwind CSS 4. Tailwind is bundled into the app using the Vite plugin. Custom page styles live in `src/App.css`; shared defaults and Tailwind's import are in `src/index.css`.

## Run locally

This frontend expects the existing ShopSphere backend at `http://localhost:5000`. Start the backend and MySQL as usual. In a separate terminal, from this `frontend` folder:

```powershell
npm ci
npm run dev
```

Open `http://localhost:5173`. If you already have an older Vite process open, restart it after installing the new dependencies.

## Check changes

```powershell
npm run lint
npm run build
```

Pages: `/` (products), `/categories`, `/inventory`, `/admin` (product management), `/admin/products/new`, `/admin/products/:id/edit`, `/admin/categories`. The category cards link back to the product catalogue with a selected category. Public product cards open a details dialog. Admin changes still use the existing backend API.

The delivered ZIP contains source and the npm lockfile. `node_modules`, `dist`, local environment settings and backend files are excluded. Copy the `frontend` folder over your existing project's `frontend` folder after making a backup of any additional local changes. Do not replace the backend.
