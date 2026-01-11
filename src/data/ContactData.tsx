export interface ContactInfoItem {
   id: number;
   icon: string;
   title: string;
   lines: string[];
   links?: Array<{ text: string; href: string; target?: string; rel?: string }>;
}

const contact_data: ContactInfoItem[] = [
   {
      id: 1,
      icon: "fas fa-map-marker-alt",
      title: "Kantor Pusat",
      lines: ["Maskom Network", "Jakarta Selatan, DKI Jakarta"],
   },
   {
      id: 2,
      icon: "far fa-envelope-open",
      title: "Email",
      lines: [],
      links: [
         { text: "sales@maskom.co.id", href: "mailto:sales@maskom.co.id" },
         { text: "support@maskom.co.id", href: "mailto:support@maskom.co.id" },
      ],
   },
   {
      id: 3,
      icon: "fas fa-phone-alt",
      title: "Telepon",
      lines: [],
      links: [
         { text: "(+62) 817-000-6625", href: "tel:+628170006625" },
         { text: "WhatsApp Business", href: "https://wa.me/628170006625", target: "_blank", rel: "noreferrer" },
      ],
   },
];

export default contact_data;
