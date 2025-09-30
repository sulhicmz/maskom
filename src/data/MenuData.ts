
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
        title: "Beranda",
        link: "/",
        has_dropdown: false,
    },
    {
        id: 2,
        title: "Solusi",
        link: "/#solusi",
        has_dropdown: false,
    },
    {
        id: 3,
        title: "Pendekatan",
        link: "/#pendekatan",
        has_dropdown: false,
    },
    {
        id: 4,
        title: "Harga",
        link: "/#paket",
        has_dropdown: false,
    },
    {
        id: 5,
        title: "Testimoni",
        link: "/#testimoni",
        has_dropdown: false,
    },
    {
        id: 6,
        has_dropdown: false,
        title: "Kontak",
        link: "/contact",
    },
];

export default menu_data;