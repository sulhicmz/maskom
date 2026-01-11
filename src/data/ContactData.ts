import { Link } from "next/link";
import { JSX } from "react";

export interface ContactInfoItem {
   id: number;
   icon: string;
   title: string;
   info: JSX.Element;
}

const contact_data: ContactInfoItem[] = [
   {
      id: 1,
      icon: "fas fa-map-marker-alt",
      title: "Kantor Pusat",
      info: (<><p>Maskom Network<br />Jakarta Selatan, DKI Jakarta</p></>),
   },
   {
      id: 2,
      icon: "far fa-envelope-open",
      title: "Email",
      info: (<>
         <p><Link href="mailto:sales@maskom.co.id">sales@maskom.co.id</Link></p>
         <p><Link href="mailto:support@maskom.co.id">support@maskom.co.id</Link></p>
      </>),
   },
   {
      id: 3,
      icon: "fas fa-phone-alt",
      title: "Telepon",
      info: (<><p><Link href="tel:+628170006625">(+62) 817-000-6625</Link></p>
         <p><Link href="https://wa.me/628170006625" target="_blank" rel="noreferrer">WhatsApp Business</Link></p></>),
   },
];

export default contact_data;
