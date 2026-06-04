import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-gray-900 dark:bg-black text-gray-400 mt-20">
      <div className="container-custom py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* About */}
          <div>
            <h3 className="text-white font-bold text-lg mb-4">WC2026</h3>
            <p className="text-sm">
              Your complete guide to the 2026 FIFA World Cup hosted by USA, Canada, and Mexico.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white font-bold text-lg mb-4">Quick Links</h3>
            <ul className="space-y-2 text-sm">
              <li><Link href="/schedule" className="hover:text-white transition">Schedule</Link></li>
              <li><Link href="/teams" className="hover:text-white transition">Teams</Link></li>
              <li><Link href="/venues" className="hover:text-white transition">Venues</Link></li>
              <li><Link href="/bracket" className="hover:text-white transition">Bracket</Link></li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h3 className="text-white font-bold text-lg mb-4">Resources</h3>
            <ul className="space-y-2 text-sm">
              <li><a href="#" className="hover:text-white transition">FIFA Official Site</a></li>
              <li><a href="#" className="hover:text-white transition">Ticket Information</a></li>
              <li><a href="#" className="hover:text-white transition">Travel Guide</a></li>
            </ul>
          </div>

          {/* Follow Us */}
          <div>
            <h3 className="text-white font-bold text-lg mb-4">Follow</h3>
            <div className="flex space-x-4">
              <a href="#" className="hover:text-white transition">Twitter</a>
              <a href="#" className="hover:text-white transition">Instagram</a>
              <a href="#" className="hover:text-white transition">Facebook</a>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm">
          <p>© 2026 World Cup 2026. By Wise254TSai. Not affiliated with FIFA. All data provided for informational purposes.</p>
        </div>
      </div>
    </footer>
  );
}