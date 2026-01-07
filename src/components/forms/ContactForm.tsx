"use client"
import { toast } from 'react-toastify';
import * as yup from "yup";
import { useForm } from "react-hook-form";
import { yupResolver } from '@hookform/resolvers/yup';
import { useRef } from 'react';
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

   const sendEmail = async () => {
      if (!form.current) {
         return;
      }

      const formData = new FormData(form.current);
      const templateParams = {
         user_name: formData.get('user_name') as string,
         user_email: formData.get('user_email') as string,
         message: formData.get('message') as string
      };

      const result = await emailService.sendEmail({ templateParams });

      if (result.success) {
         toast.success('Pesan berhasil dikirim', { position: 'top-center' });
         reset();
      } else {
         toast.error('Gagal mengirim pesan. Silakan coba lagi.', { position: 'top-center' });
      }
   };

   return (
      <form ref={form} onSubmit={handleSubmit(sendEmail)} className="contact-form">
         <div className="row">
            <div className="col-lg-6">
               <div className="form-group">
                  <input type="text" {...register("user_name")} className="form-control" placeholder="Nama lengkap" />
                  <p className="form_error">{errors.user_name?.message}</p>
               </div>
            </div>
            <div className="col-lg-6">
               <div className="form-group">
                  <input type="email" {...register("user_email")} className="form-control" placeholder="Email kantor" />
                  <p className="form_error">{errors.user_email?.message}</p>
               </div>
            </div>
            <div className="col-lg-12">
               <div className="form-group">
                  <textarea {...register("message")} placeholder="Tuliskan kebutuhan Anda"
                     className="form-control" cols={30} rows={8}></textarea>
                  <p className="form_error">{errors.message?.message}</p>
               </div>
            </div>
            <div className="col-lg-12">
               <div className="form-group">
                  <button className="theme-btn gradient-btn">Kirim Pesan</button>
               </div>
            </div>
         </div>
      </form>
   )
}

export default ContactForm
