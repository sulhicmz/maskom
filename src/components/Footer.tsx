
import Link from 'next/link';

const Footer = () => {
  return (
    <footer className="bg-gray-800 text-white py-8">
      <div className="container mx-auto px-4">
        <div className="flex flex-wrap justify-between items-center">
          <div className="w-full md:w-1/3 text-center md:text-left mb-4 md:mb-0">
            <p>&copy; {new Date().getFullYear()} Maskom Network. All rights reserved.</p>
          </div>
          <div className="w-full md:w-1/3 text-center mb-4 md:mb-0">
            <ul className="flex justify-center md:justify-center space-x-4">
              <li><Link href="/privacy-policy" className="hover:text-gray-400">Kebijakan Privasi</Link></li>
              <li><Link href="/terms-of-service" className="hover:text-gray-400">Syarat & Ketentuan</Link></li>
            </ul>
          </div>
          <div className="w-full md:w-1/3 text-center md:text-right">
            <ul className="flex justify-center md:justify-end space-x-4">
              <li><a href="https://facebook.com/maskom" target="_blank" rel="noopener noreferrer" className="hover:text-gray-400">Facebook</a></li>
              <li><a href="https://twitter.com/maskom" target="_blank" rel="noopener noreferrer" className="hover:text-gray-400">Twitter</a></li>
              <li><a href="https://instagram.com/maskom" target="_blank" rel="noopener noreferrer" className="hover:text-gray-400">Instagram</a></li>
            </ul>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
