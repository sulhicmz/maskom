
import { MenuItem } from "@/types/data";

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
        title: "Perusahaan",
        link: "#",
        has_dropdown: true,
        sub_menus: [
            { link: "/about", title: "Tentang Kami" },
            { link: "/faq", title: "FAQ" },
            { link: "/login", title: "Portal Pelanggan" },
            { link: "/sign-up", title: "Daftar Layanan" },
        ],
    },
    {
        id: 7,
        has_dropdown: false,
        title: "Kontak",
        link: "/contact",
    },
];

export default menu_data;
