/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";
import menu_data from "@/data/MenuData";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";

const NavMenu = () => {
    const currentRoute = usePathname();
    const [isBreakpointOn, setIsBreakpointOn] = useState(false);
    const [openSubmenus, setOpenSubmenus] = useState<{ [key: number]: boolean }>({});

    useEffect(() => {
        const handleResize = () => {
            setIsBreakpointOn(window.innerWidth < 1200);
        };

        window.addEventListener("resize", handleResize);
        handleResize();

        return () => {
            window.removeEventListener("resize", handleResize);
        };
    }, []);

    const toggleSubMenu = (id: number) => {
        setOpenSubmenus((prev) => ({
            ...prev,
            [id]: !prev[id],
        }));
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
                        {menu.has_dropdown && <span className="dd-trigger" onClick={() => toggleSubMenu(menu.id)}>
                            <i className="far fa-angle-down"></i>
                        </span>}
                    </Link>

                    {menu.has_dropdown && (
                        <>
                            {menu.sub_menus && (
                                <ul className="submenu" style={{ display: openSubmenus[menu.id] ? "block" : "" }}>
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
