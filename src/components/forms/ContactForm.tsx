"use client"
import { toast } from 'react-toastify';
import * as yup from "yup";
import { useForm } from "react-hook-form";
import { yupResolver } from '@hookform/resolvers/yup';
import { useRef, useState } from 'react';
import { emailService } from '@/services/email';

interface FormData {
   user_name: string;
   user_email: string;
   message: string;
}

const schema = yup
   .object({
      user_name: yup.string().required().label("Nama"),
      user_email: yup.string().required().email().label("Email"),
      message: yup.string().required().label("Pesan"),
   })
   .required();

const ContactForm = () => {

   const { register, handleSubmit, reset, formState: { errors }, } = useForm<FormData>({ resolver: yupResolver(schema), });

   const form = useRef<HTMLFormElement>(null);
   const [isSubmittingEmail, setIsSubmittingEmail] = useState(false);

   const sendEmail = async () => {
      if (!form.current) {
         return;
      }

      setIsSubmittingEmail(true);

      const formData = new FormData(form.current);
      const templateParams = {
         user_name: formData.get('user_name') as string,
         user_email: formData.get('user_email') as string,
         message: formData.get('message') as string
      };

      const result = await emailService.sendEmail({ templateParams });

      setIsSubmittingEmail(false);

      if (result.success) {
         toast.success('Pesan berhasil dikirim', { position: 'top-center' });
         reset();
      } else {
         toast.error('Gagal mengirim pesan. Silakan coba lagi.', { position: 'top-center' });
      }
   };

   return (
      <form ref={form} onSubmit={handleSubmit(sendEmail)} className="contact-form" noValidate>
         <div className="row">
            <div className="col-lg-6">
               <div className="form-group">
                  <label htmlFor="user_name" className="sr-only">Nama lengkap</label>
                  <input
                     type="text"
                     {...register("user_name")}
                     id="user_name"
                     className="form-control"
                     placeholder="Nama lengkap"
                     aria-invalid={!!errors.user_name}
                     aria-describedby="user_name_error"
                  />
                  <p id="user_name_error" className="form_error" role="alert">{errors.user_name?.message}</p>
               </div>
            </div>
            <div className="col-lg-6">
               <div className="form-group">
                  <label htmlFor="user_email" className="sr-only">Email kantor</label>
                  <input
                     type="email"
                     {...register("user_email")}
                     id="user_email"
                     className="form-control"
                     placeholder="Email kantor"
                     aria-invalid={!!errors.user_email}
                     aria-describedby="user_email_error"
                  />
                  <p id="user_email_error" className="form_error" role="alert">{errors.user_email?.message}</p>
               </div>
            </div>
            <div className="col-lg-12">
               <div className="form-group">
                  <label htmlFor="message" className="sr-only">Tuliskan kebutuhan Anda</label>
                  <textarea
                     {...register("message")}
                     id="message"
                     placeholder="Tuliskan kebutuhan Anda"
                     className="form-control"
                     cols={30}
                     rows={8}
                     aria-invalid={!!errors.message}
                     aria-describedby="message_error"
                  ></textarea>
                  <p id="message_error" className="form_error" role="alert">{errors.message?.message}</p>
               </div>
            </div>
            <div className="col-lg-12">
               <div className="form-group">
                  <button
                     type="submit"
                     className="theme-btn gradient-btn"
                     disabled={isSubmittingEmail}
                     aria-live="polite"
                     aria-busy={isSubmittingEmail}
                  >
                     {isSubmittingEmail ? 'Mengirim...' : 'Kirim Pesan'}
                  </button>
               </div>
            </div>
         </div>
      </form>
   )
}

export default ContactForm
