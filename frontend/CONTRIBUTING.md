# Contributing to CivicAgent Frontend

Thank you for considering contributing to CivicAgent! This document provides guidelines and instructions for contributing to the project.

## 🌟 Ways to Contribute

- 🐛 Report bugs
- 💡 Suggest new features
- 📝 Improve documentation
- 🎨 Enhance UI/UX
- 🔧 Fix issues
- ✅ Write tests

## 🚀 Getting Started

### Prerequisites

1. Fork the repository
2. Clone your fork:
   ```bash
   git clone https://github.com/your-username/ByteOrbit-Hackarena2025.git
   cd ByteOrbit-Hackarena2025/frontend
   ```
3. Install dependencies:
   ```bash
   npm install
   ```
4. Set up environment variables (see QUICKSTART.md)
5. Run the development server:
   ```bash
   npm run dev
   ```

### Branch Naming Convention

```
feature/description   - New features
fix/description      - Bug fixes
docs/description     - Documentation updates
refactor/description - Code refactoring
test/description     - Adding tests
```

Example: `feature/add-complaint-filtering`

## 📝 Code Style

### TypeScript

- Use TypeScript for all new files
- Define proper types/interfaces
- Avoid `any` type when possible
- Use meaningful variable names

```typescript
// Good ✅
interface Complaint {
  id: string
  category: string
  status: ComplaintStatus
}

// Bad ❌
const data: any = fetchData()
```

### React Components

- Use functional components with hooks
- Keep components small and focused
- Extract reusable logic into custom hooks
- Use proper prop typing

```typescript
// Good ✅
interface ButtonProps {
  onClick: () => void
  children: React.ReactNode
  variant?: 'primary' | 'secondary'
}

export function Button({ onClick, children, variant = 'primary' }: ButtonProps) {
  return <button onClick={onClick}>{children}</button>
}

// Bad ❌
export function Button(props: any) {
  return <button>{props.children}</button>
}
```

### File Organization

```
components/
├── ui/              # Reusable UI primitives
├── feature-name/    # Feature-specific components (if complex)
└── component.tsx    # General components

lib/
├── hooks/          # Custom React hooks
├── utils/          # Utility functions
└── services/       # API/service functions
```

### CSS/Styling

- Use Tailwind CSS utility classes
- Follow mobile-first approach
- Use CSS variables from theme
- Keep custom CSS minimal

```tsx
// Good ✅
<div className="flex items-center justify-between p-4 md:p-6">
  <h1 className="text-2xl font-bold text-foreground">Title</h1>
</div>

// Avoid ❌
<div style={{ display: 'flex', padding: '16px' }}>
  <h1 style={{ fontSize: '24px' }}>Title</h1>
</div>
```

## 🧪 Testing

### Before Submitting

1. Test your changes manually
2. Check for console errors
3. Test on mobile view
4. Test in both light and dark modes
5. Verify accessibility (keyboard navigation, screen readers)

### Running Linter

```bash
npm run lint
```

Fix any linting errors before committing.

## 📤 Submitting Changes

### Commit Messages

Follow conventional commits format:

```
type(scope): description

[optional body]

[optional footer]
```

Types:
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `test`: Adding tests
- `chore`: Maintenance tasks

Examples:
```
feat(complaint-form): add image compression before upload
fix(dashboard): correct marker color for escalated status
docs(readme): update installation instructions
```

### Pull Request Process

1. **Create a new branch** from `main`
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make your changes** and commit them
   ```bash
   git add .
   git commit -m "feat(scope): description"
   ```

3. **Push to your fork**
   ```bash
   git push origin feature/your-feature-name
   ```

4. **Open a Pull Request**
   - Go to the original repository
   - Click "New Pull Request"
   - Select your branch
   - Fill in the PR template

5. **PR Description Template**
   ```markdown
   ## Description
   Brief description of changes

   ## Type of Change
   - [ ] Bug fix
   - [ ] New feature
   - [ ] Documentation update
   - [ ] Code refactor

   ## Testing
   - [ ] Tested locally
   - [ ] Tested on mobile
   - [ ] Tested in dark mode
   - [ ] No console errors

   ## Screenshots (if applicable)
   Add screenshots here

   ## Additional Notes
   Any additional information
   ```

## 🐛 Reporting Bugs

### Before Reporting

1. Check if the issue already exists
2. Verify it's not a local environment issue
3. Test in a clean browser session

### Bug Report Template

```markdown
**Describe the bug**
A clear description of what the bug is.

**To Reproduce**
Steps to reproduce:
1. Go to '...'
2. Click on '...'
3. Scroll down to '...'
4. See error

**Expected behavior**
What you expected to happen.

**Screenshots**
If applicable, add screenshots.

**Environment:**
 - OS: [e.g. Windows 11]
 - Browser: [e.g. Chrome 120]
 - Node version: [e.g. 18.17.0]

**Additional context**
Any other relevant information.
```

## 💡 Suggesting Features

### Feature Request Template

```markdown
**Is your feature request related to a problem?**
A clear description of the problem.

**Describe the solution you'd like**
A clear description of what you want to happen.

**Describe alternatives you've considered**
Other solutions or features you've considered.

**Additional context**
Mockups, examples, or other context.
```

## 📚 Documentation

### When to Update Docs

- Adding a new feature
- Changing existing functionality
- Adding new dependencies
- Changing configuration

### Documentation Locations

- `README.md` - Main documentation
- `QUICKSTART.md` - Setup guide
- `PROJECT_OVERVIEW.md` - Architecture and design
- `CONTRIBUTING.md` - This file
- Code comments - Complex logic

## 🎨 UI/UX Guidelines

### Accessibility

- Use semantic HTML
- Include proper ARIA labels
- Ensure keyboard navigation works
- Maintain good color contrast
- Test with screen readers

### Design Principles

1. **Consistency** - Use existing components and patterns
2. **Simplicity** - Keep interfaces clean and intuitive
3. **Responsiveness** - Mobile-first design
4. **Feedback** - Provide clear feedback for user actions
5. **Performance** - Optimize images and lazy load when possible

### Component Checklist

- [ ] Responsive on all screen sizes
- [ ] Works in light and dark modes
- [ ] Has proper loading states
- [ ] Has error states
- [ ] Keyboard accessible
- [ ] Has proper TypeScript types
- [ ] Follows existing patterns

## 🔄 Development Workflow

1. Check issues or create new one
2. Discuss approach if it's a major change
3. Fork and create branch
4. Make changes
5. Test thoroughly
6. Submit PR
7. Address review feedback
8. Merge when approved

## ⚡ Quick Tips

- **Use Git Bash** for all terminal commands on Windows
- **Install ESLint extension** in VS Code for real-time linting
- **Use Prettier** for code formatting
- **Check Supabase Dashboard** for database issues
- **Use React DevTools** for debugging components
- **Test in incognito mode** to avoid cache issues

## 🎓 Resources

- [Next.js Docs](https://nextjs.org/docs)
- [React Docs](https://react.dev)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Tailwind CSS Docs](https://tailwindcss.com/docs)
- [Supabase Docs](https://supabase.com/docs)

## 🤝 Code of Conduct

- Be respectful and inclusive
- Provide constructive feedback
- Focus on what is best for the community
- Show empathy towards others

## 📧 Questions?

- Open an issue with the "question" label
- Check existing issues and discussions
- Reach out to maintainers

---

Thank you for contributing to making civic engagement better! 🎉
