"use client"
import { useForm } from "react-hook-form";
import { yupResolver } from '@hookform/resolvers/yup';
import { useRef } from 'react';
import { emailService } from '@/services/email';
import { createContactFormSchema } from '@/utils/formValidation';
import { useFormSubmission } from '@/hooks/useFormSubmission';

interface FormData {
   user_name: string;
   user_email: string;
   message: string;
}

const ContactForm = () => {

   const { register, handleSubmit, reset, formState: { errors }, } = useForm<FormData>({ resolver: yupResolver(createContactFormSchema()), });

   const form = useRef<HTMLFormElement>(null);

   const { submit: sendEmail, isSubmitting: isSubmittingEmail } = useFormSubmission(
      async () => {
         if (!form.current) {
            throw new Error('Form ref not available');
         }

         const formData = new FormData(form.current);
         const templateParams = {
            user_name: formData.get('user_name') as string,
            user_email: formData.get('user_email') as string,
            message: formData.get('message') as string
         };

         return await emailService.sendEmail({ templateParams });
      },
      { successMessage: 'Pesan berhasil dikirim', resetForm: reset }
   );

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
