# Navigation Components Quick Reference

## Overview

This guide provides quick examples for using the navigation components in CivicAgent.

---

## Navbar

**Location**: `components/navbar.tsx`

**Description**: Sticky navigation bar with responsive menu, authentication state, and theme toggle.

**Features**:
- Desktop navigation links
- Mobile hamburger menu
- Login/Signup buttons (when logged out)
- User email + Sign Out (when logged in)
- Theme toggle
- Active route highlighting

**Usage**:

The Navbar is already integrated in the main layout. It appears automatically on all pages within the `(main)` route group.

```tsx
// In app/(main)/layout.tsx
import { Navbar } from '@/components/navbar';

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1">{children}</main>
    </div>
  );
}
```

**Customization**:

To add more navigation items, edit the `navItems` array:

```tsx
// In components/navbar.tsx
const navItems = [
  { href: '/', label: 'Home', icon: MapPin },
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/submit', label: 'Submit Issue', icon: FileText },
  { href: '/about', label: 'About', icon: Info }, // Add new item
];
```

---

## Footer

**Location**: `components/footer.tsx`

**Description**: Consistent footer with links and information.

**Features**:
- Quick links section
- About section
- Dynamic copyright year
- Responsive grid layout

**Usage**:

The Footer is already integrated in the main layout. It appears automatically on all pages within the `(main)` route group.

```tsx
// In app/(main)/layout.tsx
import { Footer } from '@/components/footer';

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}
```

**Customization**:

To add more links or sections, edit the footer content:

```tsx
// In components/footer.tsx
<div>
  <h3 className="font-semibold mb-4">Resources</h3>
  <ul className="space-y-2 text-sm">
    <li>
      <Link href="/docs" className="text-muted-foreground hover:text-primary">
        Documentation
      </Link>
    </li>
    {/* Add more links */}
  </ul>
</div>
```

---

## BackButton

**Location**: `components/back-button.tsx`

**Description**: Reusable back navigation button with customizable behavior.

**Props**:

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `href` | `string` (optional) | - | Specific URL to navigate to |
| `label` | `string` (optional) | `"Back"` | Button text |
| `variant` | `"ghost" \| "outline" \| "default"` (optional) | `"ghost"` | Button style variant |

**Usage**:

### Example 1: Navigate to specific page

```tsx
import { BackButton } from '@/components/back-button';

export default function Page() {
  return (
    <div>
      <BackButton href="/dashboard" label="Back to Dashboard" />
      <h1>Complaint Details</h1>
      {/* Page content */}
    </div>
  );
}
```

### Example 2: Use browser history

```tsx
import { BackButton } from '@/components/back-button';

export default function Page() {
  return (
    <div>
      <BackButton /> {/* Uses router.back() */}
      <h1>Page Title</h1>
    </div>
  );
}
```

### Example 3: Custom styling

```tsx
import { BackButton } from '@/components/back-button';

export default function Page() {
  return (
    <div>
      <BackButton 
        href="/submit" 
        label="Return to Form" 
        variant="outline"
      />
      <h1>Preview</h1>
    </div>
  );
}
```

### Example 4: In a card

```tsx
import { BackButton } from '@/components/back-button';
import { Card, CardContent } from '@/components/ui/card';

export default function Page() {
  return (
    <Card>
      <CardContent className="pt-6">
        <BackButton href="/" label="Home" />
        <h2>Details</h2>
        {/* Content */}
      </CardContent>
    </Card>
  );
}
```

---

## Navigation Patterns

### Pattern 1: Standard Page Layout

```tsx
// app/(main)/my-page/page.tsx
import { BackButton } from '@/components/back-button';

export default function MyPage() {
  return (
    <div className="container py-12">
      <BackButton href="/dashboard" label="Back to Dashboard" />
      
      <h1 className="text-3xl font-bold mt-4">Page Title</h1>
      
      <div className="mt-8">
        {/* Page content */}
      </div>
    </div>
  );
}
```

### Pattern 2: Modal/Dialog with Back Action

```tsx
'use client';

import { BackButton } from '@/components/back-button';
import { Dialog, DialogContent } from '@/components/ui/dialog';

export default function ModalPage() {
  return (
    <Dialog open>
      <DialogContent>
        <BackButton />
        <h2>Modal Title</h2>
        {/* Modal content */}
      </DialogContent>
    </Dialog>
  );
}
```

### Pattern 3: Breadcrumb-style Navigation

```tsx
import { BackButton } from '@/components/back-button';
import Link from 'next/link';

export default function DetailPage() {
  return (
    <div className="container py-8">
      <nav className="flex items-center gap-2 text-sm text-muted-foreground">
        <Link href="/">Home</Link>
        <span>/</span>
        <Link href="/dashboard">Dashboard</Link>
        <span>/</span>
        <span className="text-foreground">Complaint #123</span>
      </nav>
      
      <BackButton className="mt-4" />
      
      <div className="mt-8">
        {/* Page content */}
      </div>
    </div>
  );
}
```

---

## Router Navigation (Next.js)

For programmatic navigation in your components:

### Using useRouter

```tsx
'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';

export function MyComponent() {
  const router = useRouter();
  
  const handleClick = () => {
    // Navigate to a page
    router.push('/dashboard');
    
    // Or go back
    router.back();
    
    // Or go forward
    router.forward();
    
    // Or refresh
    router.refresh();
  };
  
  return <Button onClick={handleClick}>Navigate</Button>;
}
```

### Using Link (Preferred for static links)

```tsx
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export function MyComponent() {
  return (
    <Link href="/dashboard">
      <Button>Go to Dashboard</Button>
    </Link>
  );
}
```

---

## Active Route Highlighting

To highlight the current active route in your custom navigation:

```tsx
'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';

export function CustomNav() {
  const pathname = usePathname();
  
  const navItems = [
    { href: '/', label: 'Home' },
    { href: '/dashboard', label: 'Dashboard' },
  ];
  
  return (
    <nav className="flex gap-4">
      {navItems.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className={`px-3 py-2 rounded ${
            pathname === item.href
              ? 'bg-primary text-primary-foreground'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          {item.label}
        </Link>
      ))}
    </nav>
  );
}
```

---

## Best Practices

### 1. Use Link for Static Navigation

```tsx
// ✅ Good
<Link href="/dashboard">
  <Button>Dashboard</Button>
</Link>

// ❌ Avoid
<Button onClick={() => router.push('/dashboard')}>Dashboard</Button>
```

**Why?** Next.js prefetches `Link` destinations on hover, making navigation faster.

### 2. Use router.push() for Dynamic Navigation

```tsx
// ✅ Good - when route depends on data
const handleSubmit = async (data) => {
  const id = await createComplaint(data);
  router.push(`/complaint/${id}`);
};

// ❌ Avoid - for static routes
<Link href={`/complaint/${id}`}>View</Link>
```

### 3. Always Provide href for BackButton When Possible

```tsx
// ✅ Good - predictable behavior
<BackButton href="/dashboard" label="Back to Dashboard" />

// ⚠️ Use sparingly - depends on browser history
<BackButton />
```

**Why?** Explicit hrefs are more predictable and work even if user navigates directly to the page.

### 4. Use Appropriate Button Variants

```tsx
// In page header
<BackButton variant="ghost" />

// In card/modal
<BackButton variant="outline" />

// In alert/error state
<BackButton variant="default" />
```

---

## Testing Navigation

### Test Browser Back/Forward

1. Navigate: Home → Dashboard → Submit
2. Click browser back button
3. Should return to Dashboard
4. Click forward button
5. Should go to Submit

### Test Direct URL Access

1. Open browser
2. Navigate to: `http://localhost:3000/complaint/123`
3. Should load page directly
4. Click BackButton
5. Should navigate to specified href or home

### Test Mobile Menu

1. Resize browser to mobile width (< 768px)
2. Hamburger menu should appear
3. Click to open menu
4. Click any link
5. Menu should close and navigate

---

## Troubleshooting

### BackButton Not Working

**Problem**: Button clicks but nothing happens

**Solution**:
- Ensure component is marked `'use client'`
- Check href is valid
- Verify router is imported from `next/navigation`

### Active Route Not Highlighting

**Problem**: Current page link doesn't show as active

**Solution**:
- Check `pathname === item.href` comparison
- Use `pathname.startsWith(item.href)` for nested routes
- Ensure `usePathname()` is called in client component

### Navigation Causes Full Page Reload

**Problem**: Page refreshes on navigation instead of client-side transition

**Solution**:
- Use `<Link>` from `next/link`, not `<a>`
- Ensure href doesn't include domain (use `/path` not `https://...`)
- Check Next.js is running in development mode

---

## Examples in Codebase

See these files for real implementations:

- **Navbar Integration**: `app/(main)/layout.tsx`
- **BackButton Usage**: `app/(main)/complaint/[id]/page.tsx`
- **Custom Navigation**: `components/navbar.tsx`
- **Active Highlighting**: `components/navbar.tsx` (line 50-55)

---

**Quick Reference Complete!** 🚀

For more details, see `DOCUMENTATION.md`.
