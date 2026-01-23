"use client";
import menu_data from "@/data/MenuData";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, memo, useRef, useEffect } from "react";

const NavMenu = memo(() => {
    const currentRoute = usePathname();
    const [openSubmenus, setOpenSubmenus] = useState<{ [key: number]: boolean }>({});
    const dropdownRefs = useRef<{ [key: number]: HTMLUListElement | null }>({});

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

    const handleMenuKeyDown = (e: React.KeyboardEvent<HTMLUListElement>, menuId: number) => {
        if (e.key === 'Escape' && openSubmenus[menuId]) {
            e.preventDefault();
            setOpenSubmenus((prev) => ({ ...prev, [menuId]: false }));
        }
    };

    useEffect(() => {
        const openMenuId = Object.keys(openSubmenus).find(id => openSubmenus[id as unknown as number]);
        if (openMenuId !== undefined && dropdownRefs.current[openMenuId as unknown as number]) {
            const firstLink = dropdownRefs.current[openMenuId as unknown as number]?.querySelector<HTMLAnchorElement>('a[href]');
            firstLink?.focus();
        }
    }, [openSubmenus]);

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
                    <Link href={menu.link} className={`${(isMenuItemActive(menu.link) || (menu.sub_menus && menu.sub_menus.some((sub_m) => sub_m.link && isSubMenuItemActive(sub_m.link)))) ? "active" : ""}`} aria-current={isMenuItemActive(menu.link) ? "page" : undefined}>
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
                                <ul
                                    className="submenu"
                                    id={`submenu-${menu.id}`}
                                    ref={(el: HTMLUListElement | null) => { dropdownRefs.current[menu.id] = el; }}
                                    style={{ display: openSubmenus[menu.id] ? "block" : "" }}
                                    onKeyDown={(e) => handleMenuKeyDown(e, menu.id)}
                                >
                                    {menu.sub_menus.map((sub_m, i) => (
                                        <li key={i}>
                                            <Link href={sub_m.link} className={`${sub_m.link && isSubMenuItemActive(sub_m.link) ? "active" : ""}`} aria-current={sub_m.link && isSubMenuItemActive(sub_m.link) ? "page" : undefined}>
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
});

NavMenu.displayName = "NavMenu";

export default NavMenu;
