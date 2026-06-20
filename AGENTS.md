<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Agent Guidelines & Repository Constraints

This document outlines the architectural standards, code style, UI constraints, and functional rules that all AI agents working in this repository must follow.

---

## 1. UI Theme & Colors
* **Theme Identity**: Always use standard Tailwind CSS semantic color tokens mapped to the theme variables (e.g., `bg-primary`, `bg-card`, `border-border`, `bg-muted`, `text-foreground`, `text-muted-foreground`).
* **No Ad-hoc Colors**: Do not hardcode specific custom color hex/rgb/hsl values (e.g., red, green, or rose border outlines) from mockups. Let elements adapt automatically to standard project colors.
* **Success & Error Semantic Colors**: For success, confirmation, and approved actions/badges, always use `success` semantic classes (e.g., `bg-success/10`, `text-success`, `hover:bg-success/20`). For error, validation, declination, deletion, and required asterisks, always use `error` semantic classes (e.g., `bg-error/10`, `text-error`, `hover:bg-error/20`). Avoid using ad-hoc classes like `emerald-*`, `green-*`, `rose-*`, or `red-*`.

## 2. Typography & Font Sizes
* **Standard Utility Classes Only**: All font sizing must strictly use standard Tailwind CSS sizing classes (e.g., `text-xs`, `text-sm`, `text-base`, `text-lg`, `text-xl`, `text-2xl`, etc.).
* **No Arbitrary Sizes**: Never use arbitrary font sizes like `text-[9px]`, `text-[10px]`, `text-[11px]`, or `text-[12px]`.
* **Global Font Scaling**: Note that font sizes have been scaled up by 2 levels globally in `src/app/globals.css` (e.g., `text-xs` maps to `1rem`/16px, `text-sm` maps to `1.125rem`/18px, etc.). All UI elements will naturally look larger; do not try to shrink them using arbitrary pixel overrides.

## 3. Form Input Constraints
* **Lecturer Name Lookup**: Lecturer names must not be text input fields. They must be read-only displays (auto-filled text info) dynamically derived from the selected NIP (using a Search Combobox).
* **Proof Files**: Always use textareas for URLs/Links to documents instead of file uploader components.

## 4. Code Modularization & Folder Structure
* **Separation of Concerns**: Keep components and pages separate and clean.
* **Shared Types**: Place global model definitions in `src/types/` (e.g., [rekognisi.ts](file:///D:/code/project/next/apt/src/types/rekognisi.ts)).
* **Shared Mock Data**: Place initial data structures and arrays in `src/dummy-data/` (e.g., [rekognisi.ts](file:///D:/code/project/next/apt/src/dummy-data/rekognisi.ts), [bagikan-form.ts](file:///D:/code/project/next/apt/src/dummy-data/bagikan-form.ts)).
* **Page-Specific Components**: Extract form layouts, cards, and tables into `src/components/dashboard/rekognisi/` (e.g., charts, main tables, sharing cards, dialogs).

## 5. Sharing Links & Submissions ("Bagikan Form")
* **Base URL**: The default base URL for generated sharing forms is `http://localhost:3000/form/rekognisi/`.
* **Link Visual Contrast**: Display generated link URLs by splitting the style: the base URL in muted gray (`text-muted-foreground`) and the kustom identifier in primary bold underlined text (`text-primary underline font-bold`).
* **Click-to-Copy Links**: Ensure the main link URL text on cards is clickable, trigger copying to clipboard immediately on click, and provide temporary visual feedback (e.g., "Tersalin").
* **Cell Button stopPropagation**: In table rows that support detail navigation on row click (e.g., visiting dynamic detail page), all interactive elements in cells (external visit links, copy buttons, Accept/Decline buttons, Edit buttons) must call `e.stopPropagation()` to prevent accidental parent row click events.
* **Form Dialog Width**: Use `sm:max-w-lg` (`32rem`/512px) for popup dialog contents to accommodate custom form fields and calendars without causing horizontal overflow.

## 6. Layout Width
* **Full-Width Pages**: Avoid wrapping content in fixed max-width containers (like `max-w-2xl` on the page wrapper level) for tabular and grid-based dashboards. Utilize `w-full` (fill parent) so that tables, charts, and link cards render across the maximum available screen width.

## 7. Sonner Notification
* **Sonner Notification for Mutative Actions**: Always trigger a `toast.success` or `toast.error` notification (using shadcn's Sonner UI) for mutative operations such as form submissions, deleting records, accepting/declining requests, or saving settings to provide direct feedback to the user.

## 8. Confirmation for Crucial Actions
* **Alert Dialog for Crucial Operations**: Always prompt the user with a confirmation popup (`AlertDialog` component) before executing crucial or destructive actions, such as deleting data records, saving changes/updates, or performing other mutative operations, to prevent accidental actions.

## 9. Skeleton Loader for Async Data
* **Simulated Loading State**: Always implement a simulated loading state (using an `isLoading` state hook set with a short `setTimeout` duration of 600ms - 800ms) on dashboard pages and tab contents that display data fetched dynamically (such as tables, cards, charts, and lists).
* **Skeleton Placeholders**: During the loading state, render matching shadcn `Skeleton` placeholders that mimic the size, shape, and structure of the actual loaded components (e.g. table rows, card headers, or bar charts) to ensure a smooth layout transition.


