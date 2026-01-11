"use client"
import { useForm } from "react-hook-form";
import { yupResolver } from '@hookform/resolvers/yup';
import { useRef } from 'react';
import { emailService } from '@/services/email';
import { createContactFormSchema } from '@/utils/formValidation';
import { useFormSubmission } from '@/hooks/useFormSubmission';
import type { ServiceResult } from '@/services/common';
import FormField from './FormField';
import LoadingButton from './LoadingButton';

interface FormData {
   user_name: string;
   user_email: string;
   message: string;
}

const ContactForm = () => {

   const { register, handleSubmit, reset, formState: { errors }, } = useForm<FormData>({ resolver: yupResolver(createContactFormSchema()), });

   const form = useRef<HTMLFormElement>(null);

   const { submit: sendEmail, isSubmitting: isSubmittingEmail } = useFormSubmission<void, ServiceResult<{ text: string }>>(
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
       <form ref={form} onSubmit={handleSubmit(() => sendEmail())} className="contact-form" noValidate>
         <div className="row">
            <div className="col-lg-6">
               <FormField
                  id="user_name"
                  label="Nama lengkap"
                  type="text"
                  placeholder="Nama lengkap"
                  register={register("user_name")}
                  error={errors.user_name}
                  disabled={isSubmittingEmail}
               />
            </div>
            <div className="col-lg-6">
               <FormField
                  id="user_email"
                  label="Email kantor"
                  type="email"
                  placeholder="Email kantor"
                  register={register("user_email")}
                  error={errors.user_email}
                  disabled={isSubmittingEmail}
               />
            </div>
            <div className="col-lg-12">
               <FormField
                  id="message"
                  label="Tuliskan kebutuhan Anda"
                  type="textarea"
                  placeholder="Tuliskan kebutuhan Anda"
                  register={register("message")}
                  error={errors.message}
                  disabled={isSubmittingEmail}
                  rows={8}
               />
            </div>
            <div className="col-lg-12">
               <div className="form-group">
                  <LoadingButton
                     className="theme-btn gradient-btn"
                     isLoading={isSubmittingEmail}
                     loadingText="Mengirim..."
                  >
                     Kirim Pesan
                  </LoadingButton>
               </div>
            </div>
         </div>
      </form>
   )
}

export default ContactForm
