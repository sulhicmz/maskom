"use client"
import React, { useMemo } from "react"
import dynamic from "next/dynamic"
import team_data from "@/data/TeamData"
import Image from "next/image"
import { usePagination } from "@/hooks/usePagination"

const ReactPaginate = dynamic(() => import("react-paginate"), {
  ssr: false,
  loading: () => <div className="ac-pagination text-center mt-30 wow fadeInUp"><nav><div className="text-muted">Memuat halaman...</div></nav></div>
})

const TeamAreaComponent = React.memo(() => {

   const team = useMemo(() => team_data, []);
   const itemsPerPage = 8;

   const { currentItems, pageCount, handlePageClick } = usePagination({
      data: team,
      itemsPerPage,
   });

   const handleShare = (platform: string, memberName: string) => {
      const url = typeof window !== 'undefined' ? window.location.href : 'https://maskom.co.id';
      const text = `Check out ${memberName} from our team!`;
      const encodedUrl = encodeURIComponent(url);
      const encodedText = encodeURIComponent(text);

      let shareUrl = '';
      switch (platform) {
         case 'facebook':
            shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`;
            break;
         case 'twitter':
            shareUrl = `https://twitter.com/intent/tweet?text=${encodedText}&url=${encodedUrl}`;
            break;
         case 'linkedin':
            shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`;
            break;
         case 'instagram':
            shareUrl = 'https://www.instagram.com/';
            break;
      }

      if (shareUrl) {
         window.open(shareUrl, '_blank', 'noopener,noreferrer,width=600,height=400');
      }
   };

   return (
      <section className="team-section pt-120 pb-120">
         <div className="container">
            <div className="row">
               {currentItems.map((item) => (
                  <div key={item.id} className="col-xl-3 col-md-6 col-sm-12">
                     <div className="team-item style-one mb-30 wow fadeInUp">
                          <div className="member-image">
                             <Image src={item.img} alt={`Foto profil ${item.title} - ${item.designation}`} loading="lazy" />
                          </div>
                        <div className="member-info">
                           <div className="content">
                              <h4><a href="team-details.html">{item.title}</a></h4>
                              <span className="position">{item.designation}</span>
                           </div>
                              <div className="share-button">
                                 <div className="icon">
                                    <i className="flaticon-plus-positive-add-mathematical-symbol" aria-hidden="true"></i>
                                 </div>
                                  <ul className="social-link">
                                     <li><button type="button" aria-label="Share on Facebook" onClick={() => handleShare('facebook', item.title)}><i className="fab fa-facebook-f" aria-hidden="true"></i></button></li>
                                     <li><button type="button" aria-label="Share on Twitter" onClick={() => handleShare('twitter', item.title)}><i className="fab fa-twitter" aria-hidden="true"></i></button></li>
                                     <li><button type="button" aria-label="Share on LinkedIn" onClick={() => handleShare('linkedin', item.title)}><i className="fab fa-linkedin-in" aria-hidden="true"></i></button></li>
                                     <li><button type="button" aria-label="Share on Instagram" onClick={() => handleShare('instagram', item.title)}><i className="fab fa-instagram" aria-hidden="true"></i></button></li>
                                  </ul>
                              </div>
                          </div>
                       </div>
                    </div>
                 ))}
            </div>
            <div className="row">
               <div className="col-lg-12">
                  <div className="ac-pagination text-center mt-30 wow fadeInUp">
                     <nav>
                        <ReactPaginate
                           breakLabel="..."
                           nextLabel={<i className="far fa-angle-right"></i>}
                           onPageChange={handlePageClick}
                           pageRangeDisplayed={3}
                           pageCount={pageCount}
                           previousLabel={<i className="far fa-angle-left"></i>}
                           renderOnZeroPageCount={null}
                        />
                     </nav>
                  </div>
               </div>
            </div>
         </div>
      </section>
    )
});

TeamAreaComponent.displayName = "TeamAreaComponent"

export default TeamAreaComponent
