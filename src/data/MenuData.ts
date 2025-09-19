
interface MenuItem {
    id: number;
    title: string;
    link: string;
    has_dropdown: boolean;
    sub_menus?: {
        link: string;
        title: string;
    }[];
}

const menu_data: MenuItem[] = [
    {
        id: 1,
        title: "Home",
        link: "#",
        has_dropdown: true,
        sub_menus: [
            { link: "/", title: "Home One" },
            { link: "/home-one-dark", title: "Home One Dark" },
            { link: "/home-two", title: "Home Two" },
            { link: "/home-three", title: "Home Three" },
        ],
    },
    {
        id: 2,
        has_dropdown: false,
        title: "About",
        link: "/about",
    },
    {
        id: 3,
        title: "Use Case",
        link: "#",
        has_dropdown: true,
        sub_menus: [
            { link: "/use-cases", title: "Use Case" },
            { link: "/use-case-details", title: "Use Case Details" },
        ],
    },
    {
        id: 4,
        title: "Pages",
        link: "#",
        has_dropdown: true,
        sub_menus: [
            { link: "/team", title: "Our Team" },
            { link: "/team-details", title: "Team Details" },
            { link: "/pricing", title: "Pricing" },
            { link: "/faq", title: "Faq's" },
            { link: "/login", title: "Login" },
            { link: "/sign-up", title: "Sign Up" },
            { link: "/not-found", title: "404" },
        ],
    },
    {
        id: 5,
        title: "Blog",
        link: "#",
        has_dropdown: true,
        sub_menus: [
            { link: "/blog", title: "Blog" },
            { link: "/blog-details", title: "Blog Single" },
        ],
    },
    {
        id: 6,
        has_dropdown: false,
        title: "Contact",
        link: "/contact",
    },
];

export default menu_data;