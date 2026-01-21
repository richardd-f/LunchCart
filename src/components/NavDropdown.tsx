import Link from 'next/link';

interface NavDropdownItem {
  label: string;
  href: string;
}

interface NavDropdownProps {
  label: string;
  items: NavDropdownItem[];
}

export function NavDropdown({ label, items }: NavDropdownProps) {
  return (
    <div className="relative items-center gap-1 cursor-pointer group h-full flex">
      <span className="hover:text-amber-100 transition-colors flex items-center gap-1">
        {label}
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          viewBox="0 0 20 20" 
          fill="currentColor" 
          className="w-4 h-4 transition-transform duration-200 group-hover:rotate-180"
        >
          <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" clipRule="evenodd" />
        </svg>
      </span>

      {/* Dropdown Menu */}
      <div 
        className="absolute top-full right-0 mt-0 w-48 bg-white rounded-md shadow-lg py-1 text-gray-800 transition-all duration-200 ease-out origin-top-right transform opacity-0 scale-95 invisible group-hover:opacity-100 group-hover:scale-100 group-hover:visible"
      >
        {items.map((item, index) => (
          <Link
            key={index}
            href={item.href}
            className="block px-4 py-2 text-sm hover:bg-orange-50 hover:text-[#F97352] transition-colors"
          >
            {item.label}
          </Link>
        ))}
      </div>
    </div>
  );
}
