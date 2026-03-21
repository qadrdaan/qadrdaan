# Qadrdaan AI Rules & Tech Stack

This document outlines the technical standards and library preferences for the Qadrdaan platform.

## Tech Stack

- **Frontend Framework**: React 18 with Vite for fast development and builds.
- **Language**: TypeScript for type safety and better developer experience.
- **Styling**: Tailwind CSS for utility-first styling and responsive design.
- **UI Components**: shadcn/ui (built on Radix UI) for accessible, unstyled components.
- **Backend & Auth**: Supabase for database (PostgreSQL), authentication, and file storage.
- **Data Fetching**: TanStack Query (React Query) for efficient server state management and caching.
- **Routing**: React Router DOM for client-side navigation.
- **Animations**: Framer Motion for smooth transitions and interactive elements.
- **Forms**: React Hook Form combined with Zod for schema-based validation.
- **Icons**: Lucide React for a consistent and lightweight icon set.

## Library Usage Rules

### UI & Styling
- **shadcn/ui**: Always check `src/components/ui` before creating a new base component. Use these as the building blocks for all complex UI.
- **Tailwind CSS**: Use utility classes for all layout and spacing. Avoid writing custom CSS unless absolutely necessary.
- **Lucide React**: Use this for all icons. Do not import icons from other libraries.
- **Framer Motion**: Use for page transitions, hover effects, and complex layout animations.

### State & Data
- **Supabase**: Use the generated client in `src/integrations/supabase/client.ts` for all backend interactions.
- **React Query**: Wrap all Supabase fetches in `useQuery` or `useMutation` hooks to handle loading, error states, and caching.
- **useAuth Hook**: Use the custom `useAuth` hook in `src/hooks/useAuth.tsx` to access the current user session and profile data.

### Forms & Validation
- **React Hook Form**: Use for all form state management.
- **Zod**: Define schemas for form validation to ensure data integrity before submission.

### Notifications & Feedback
- **Sonner**: Use `toast` from `sonner` for most user notifications and alerts.
- **shadcn Toast**: Use for more complex, persistent notifications if needed.

### Utilities
- **date-fns**: Use for all date formatting and manipulation.
- **tailwind-merge / clsx**: Use the `cn` utility in `src/lib/utils.ts` for merging Tailwind classes conditionally.

## Coding Standards
- **Component Creation**: Create a new file for every component in `src/components/`. Keep components focused and under 100 lines when possible.
- **Directory Naming**: Keep directory names lowercase (e.g., `src/pages`, `src/components`).
- **Responsive Design**: Always utilize Tailwind's responsive prefixes (`sm:`, `md:`, `lg:`, `xl:`) to ensure the app works on all devices.