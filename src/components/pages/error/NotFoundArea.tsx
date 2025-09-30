import Image from "next/image"
import Link from "next/link"

const NotFoundArea = () => {
   return (
      <section className="error-section pt-120 pb-120">
         <div className="container">
            <div className="row justify-content-center">
               <div className="col-lg-6">
                  <div className="error-content text-center wow fadeInUp">
                     <Image src="/assets/images/gallery/404.png" alt="Ilustrasi halaman tidak ditemukan" width={400} height={400} />
                     <h1><span>Maaf!</span><br />
                        Halaman Tidak Ditemukan</h1>
                     <p>Konten yang Anda cari tidak tersedia. Silakan kembali ke beranda atau hubungi tim Maskom untuk mendapatkan bantuan.</p>
                     <Link href="/" className="theme-btn gradient-btn">Kembali ke Beranda</Link>
                  </div>
               </div>
            </div>
         </div>
      </section>
   )
}

export default NotFoundArea
