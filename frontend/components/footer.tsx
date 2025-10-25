import Link from 'next/link';
import { MapPin } from 'lucide-react';

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t bg-background">
      <div className="container py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* About Section */}
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <MapPin className="h-5 w-5 text-primary" />
              <span className="font-bold">CivicAgent</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Empowering citizens to report and track civic issues. Building
              transparent and responsive local governance through technology.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  href="/"
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  Home
                </Link>
              </li>
              <li>
                <Link
                  href="/dashboard"
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  View Dashboard
                </Link>
              </li>
              <li>
                <Link
                  href="/submit"
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  Report an Issue
                </Link>
              </li>
            </ul>
          </div>

          {/* About Project */}
          <div>
            <h3 className="font-semibold mb-4">About</h3>
            <p className="text-sm text-muted-foreground">
              CivicAgent uses AI to automatically follow up on civic complaints
              and ensure timely resolution, making local government more
              accountable and responsive.
            </p>
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-8 pt-8 border-t text-center text-sm text-muted-foreground">
          <p>&copy; {currentYear} CivicAgent. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
