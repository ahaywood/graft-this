---
description: How to create and use layout components in a Redwood SDK project
---

# Creating Layouts in a Redwood SDK Project

This workflow guides you through creating and implementing layout components in your Redwood SDK project to provide consistent structure across your pages.

## What are Layouts?

In Redwood SDK, layouts are React components that wrap your page content to provide consistent structure and styling. Unlike some frameworks, Redwood SDK layouts are explicitly imported and used in each component where needed.

## Creating a New Layout

1. Create a layouts directory (if it doesn't exist)
   ```bash
   mkdir -p src/app/layouts
   ```

2. Create a new layout component file
   ```bash
   touch src/app/layouts/MainLayout.tsx
   ```

3. Implement the basic layout component structure:
   ```tsx
   // src/app/layouts/MainLayout.tsx
   
   export default function MainLayout({ children }: { children: React.ReactNode }) {
     return (
       <>
         <header>
           {/* Your header content */}
           <nav>
             {/* Navigation links */}
           </nav>
         </header>
         <main>
           {children}
         </main>
         <footer>
           {/* Your footer content */}
         </footer>
       </>
     );
   }
   ```

4. Create Header and Footer components (optional)
   
   For better organization, you can extract header and footer into separate components:
   
   ```bash
   mkdir -p src/app/components/Header
   mkdir -p src/app/components/Footer
   touch src/app/components/Header/Header.tsx
   touch src/app/components/Footer/Footer.tsx
   ```
   
   Header component:
   ```tsx
   // src/app/components/Header/Header.tsx
   
   export default function Header() {
     return (
       <header className="py-4 px-6 bg-gray-100">
         <div className="container mx-auto flex justify-between items-center">
           <h1 className="text-xl font-bold">My App</h1>
           <nav>
             <ul className="flex space-x-4">
               <li><a href="/">Home</a></li>
               <li><a href="/about">About</a></li>
               <li><a href="/contact">Contact</a></li>
             </ul>
           </nav>
         </div>
       </header>
     );
   }
   ```
   
   Footer component:
   ```tsx
   // src/app/components/Footer/Footer.tsx
   
   export default function Footer() {
     return (
       <footer className="py-4 px-6 bg-gray-100 mt-auto">
         <div className="container mx-auto">
           <p className="text-center">© {new Date().getFullYear()} My App. All rights reserved.</p>
         </div>
       </footer>
     );
   }
   ```
   
   Then update your layout to import these components:
   ```tsx
   // src/app/layouts/MainLayout.tsx
   
   import Header from '../components/Header/Header';
   import Footer from '../components/Footer/Footer';
   
   export default function MainLayout({ children }: { children: React.ReactNode }) {
     return (
       <>
         <Header />
         <main className="container mx-auto py-6 px-4 flex-grow">
           {children}
         </main>
         <Footer />
       </>
     );
   }
   ```

## Using the Layout in Pages

1. Import and use the layout in your page components:
   ```tsx
   // src/app/pages/HomePage.tsx
   
   import MainLayout from '../layouts/MainLayout';
   
   export default function HomePage() {
     return (
       <MainLayout>
         <h1 className="text-2xl font-bold mb-4">Welcome to My App</h1>
         <p>This is the home page content.</p>
       </MainLayout>
     );
   }
   ```

## Creating Specialized Layouts

You can create multiple layouts for different sections of your application:

1. Create a specialized layout:
   ```tsx
   // src/app/layouts/DashboardLayout.tsx
   
   import Header from '../components/Header/Header';
   import Sidebar from '../components/Sidebar/Sidebar';
   
   export default function DashboardLayout({ children }: { children: React.ReactNode }) {
     return (
       <>
         <Header />
         <div className="flex">
           <Sidebar />
           <main className="flex-grow p-6">
             {children}
           </main>
         </div>
       </>
     );
   }
   ```

2. Use the specialized layout in relevant pages:
   ```tsx
   // src/app/pages/DashboardPage.tsx
   
   import DashboardLayout from '../layouts/DashboardLayout';
   
   export default function DashboardPage() {
     return (
       <DashboardLayout>
         <h1 className="text-2xl font-bold mb-4">Dashboard</h1>
         <p>Your dashboard content here.</p>
       </DashboardLayout>
     );
   }
   ```

## Tips for Layouts

1. **Nested Layouts**: You can nest layouts for more complex page structures.
   
2. **Responsive Design**: Ensure your layouts work well on different screen sizes.
   
3. **State Management**: If your layouts need to manage state (like sidebar open/closed), consider using React's useState or useContext.
   
4. **Styling**: Layouts work well with CSS frameworks like TailwindCSS (use the `/tailwind` workflow to add it to your project).
   
5. **Organization**: While a dedicated `layouts` directory is recommended, you can organize your layout components however you prefer within your project structure.
