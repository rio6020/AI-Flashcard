"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/", label: "ホーム" },
  { href: "/generate", label: "問題生成" },
  { href: "/study", label: "学習" },
  { href: "/dashboard", label: "ダッシュボード" },
];

export default function Navbar() {
  const pathname = usePathname();

  return (
    <nav className="border-b px-6 py-4 flex gap-6">
      {links.map((link) => (
        <Link
          key={link.href}
          href={link.href}
          className={
            pathname === link.href
              ? "font-bold text-blue-500"
              : "text-gray-500 hover:text-black"
          }
        >
          {link.label}
        </Link>
      ))}
    </nav>
  );
}
