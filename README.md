# Studio 201

A comprehensive digital platform for **Studio 201**, an art space dedicated to showcasing contemporary art, managing exhibitions, and fostering a community of artists and art enthusiasts.

This application serves as both the public face of the gallery and the internal management system for its operations.

## Features

### 🏛 Public Gallery

- **Exhibitions**: Showcase "Now on View" and upcoming exhibitions with rich visual details.
- **Artists**: profiles for featured artists with portfolios.
- **Events**: Calendar for artist talks, opening nights, workshops, and symposiums.
- **Archive**: A digital repository of past exhibitions and artworks.

### ⚙️ Admin Dashboard

- Manage content for exhibitions, artists, and events.
- Handle submissions (implied).

## Tech Stack

- **Framework**: [Next.js 14+](https://nextjs.org/) (App Router)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Backend/Auth**: [Supabase](https://supabase.com/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Validation**: [Zod](https://zod.dev/)

## Getting Started

### Prerequisites

- Node.js (v18 or later recommended)
- npm or yarn

### Installation

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd studio_201
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Configure Environment Variables**
   Copy the example environment file:

   ```bash
   cp .env.example .env
   ```

   Open `.env` and populate the required Supabase keys:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`

4. **Run the Development Server**

   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000) to view the application.

## Project Structure

- `src/app/(public)`: Public-facing routes (Home, Artists, Exhibitions, etc.)
- `src/app/(admin)`: Admin dashboard routes.
- `src/features`: Feature-based logic grouping components, hooks, and types by domain (e.g., `artists`, `exhibitions`).
- `src/components`: Shared UI components.

## License

[MIT](LICENSE)
