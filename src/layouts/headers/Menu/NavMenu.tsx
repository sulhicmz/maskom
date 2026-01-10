"use client";
import menu_data from "@/data/MenuData";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

const NavMenu = () => {
    const currentRoute = usePathname();
    const [openSubmenus, setOpenSubmenus] = useState<{ [key: number]: boolean }>({});

    const toggleSubMenu = (id: number) => {
        setOpenSubmenus((prev) => ({
            ...prev,
            [id]: !prev[id],
        }));
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>, id: number) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            toggleSubMenu(id);
        }
    };

    const isMenuItemActive = (menuLink: string) => {
        return currentRoute === menuLink;
    };

    const isSubMenuItemActive = (subMenuLink: string) => {
        return currentRoute === subMenuLink;
    };

    return (
        <ul>
            {menu_data.map((menu) => (
                <li key={menu.id} className={`has-dropdown ${openSubmenus[menu.id] ? "submenu-open" : ""}`}>
                    <Link href={menu.link} className={`${(isMenuItemActive(menu.link) || (menu.sub_menus && menu.sub_menus.some((sub_m) => sub_m.link && isSubMenuItemActive(sub_m.link)))) ? "active" : ""}`}>
                        {menu.title}
                        {menu.has_dropdown && <button
                            type="button"
                            className="dd-trigger"
                            onClick={() => toggleSubMenu(menu.id)}
                            onKeyDown={(e) => handleKeyDown(e, menu.id)}
                            aria-expanded={openSubmenus[menu.id] || false}
                            aria-label={`Toggle submenu for ${menu.title}`}
                            aria-controls={`submenu-${menu.id}`}
                        >
                            <i className="far fa-angle-down" aria-hidden="true"></i>
                        </button>}
                    </Link>

                    {menu.has_dropdown && (
                        <>
                            {menu.sub_menus && (
                                <ul className="submenu" id={`submenu-${menu.id}`} style={{ display: openSubmenus[menu.id] ? "block" : "" }}>
                                    {menu.sub_menus.map((sub_m, i) => (
                                        <li key={i}>
                                            <Link href={sub_m.link} className={`${sub_m.link && isSubMenuItemActive(sub_m.link) ? "active" : ""}`}>
                                                {sub_m.title}
                                            </Link>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </>
                    )}
                </li>
            ))}
        </ul>
    );
};

export default NavMenu;
