import Image, { StaticImageData } from "next/image";

import img_1 from "@/assets/images/blog/post-thumb-1.jpg"
import img_2 from "@/assets/images/blog/post-thumb-2.jpg"
import img_3 from "@/assets/images/blog/post-thumb-3.jpg"
import Link from "next/link";

interface DataType {
   id: number;
   img: StaticImageData;
   title: string;
   date: string;
}

const latest_news: DataType[] = [
   {
      id: 1,
      img: img_1,
      title: "AI Could solve Labour Shortage",
      date: "26 Aug, 2023",
   },
   {
      id: 2,
      img: img_2,
      title: "Risks Going too Far, too Soon on AI",
      date: "26 Aug, 2023",
   },
   {
      id: 3,
      img: img_3,
      title: "Can the EU and its Allies Cooperate.",
      date: "26 Aug, 2023",
   },
];

const LatestNews = () => {
   return (
      <div className="sidebar-widget sidebar-recent-widget mb-35 wow fadeInUp">
         <h3 className="widget-title">Latest News</h3>
         <div className="sidebar-widget-content">
            <ul className="recent-post-list">
               {latest_news.map((item) => (
                  <li key={item.id} className="post-thumbnail-content d-flex align-items-center">
                     <Image src={item.img} alt="post thumb" />
                     <div className="post-title-date">
                        <h6><Link href="/blog-details">{item.title}</Link></h6>
                        <span className="posted-on"><Link href="#">{item.date}</Link></span>
                     </div>
                  </li>
               ))}
            </ul>
         </div>
      </div>
   )
}

export default LatestNews
