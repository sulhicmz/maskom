"use client";
import { useForm } from "react-hook-form";
import { yupResolver } from '@hookform/resolvers/yup';
import { useRef, useEffect } from 'react';
import { createNewsletterFormSchema } from '@/utils/formValidation';
import { useFormSubmission } from '@/hooks/useFormSubmission';
import type { ServiceResult } from '@/types/common';

interface FormData {
   email: string;
}

interface NewsletterFormProps {
   className?: string;
   buttonClassName?: string;
}

const NewsletterForm = ({ className = "", buttonClassName = "gradient-btn" }: NewsletterFormProps) => {
   const { register, handleSubmit, reset, formState: { errors } } = useForm<FormData>({ 
      resolver: yupResolver(createNewsletterFormSchema()),
   });

   const form = useRef<HTMLFormElement>(null);
   const successMessageRef = useRef<HTMLParagraphElement>(null);

   const { submit: subscribe, isSubmitting: isSubscribing, isSuccess } = useFormSubmission<void, ServiceResult<{ message: string }>>(
      async () => {
         if (!form.current) {
            throw new Error('Form ref not available');
         }

         const formData = new FormData(form.current);
         const email = formData.get('email') as string;

         return await new Promise((resolve) => {
            setTimeout(() => {
               resolve({
                  success: true,
                  message: 'Newsletter subscription successful',
                  data: { message: email }
               });
            }, 1000);
         });
      },
      { successMessage: 'Berhasil berlangganan newsletter!', resetForm: reset }
   );

   useEffect(() => {
      if (isSuccess && successMessageRef.current) {
         successMessageRef.current.focus();
      }
   }, [isSuccess]);

   const emailError = errors.email;
   const errorId = "footer_email_error";
   const descriptionId = "footer_email_description";

   return (
      <form 
         ref={form} 
         onSubmit={handleSubmit(() => subscribe())} 
         className={`form-group mb-30 ${className}`}
         noValidate
         aria-label="Newsletter subscription form"
      >
         <label 
            htmlFor="footer_email" 
            className="sr-only"
            id={descriptionId}
         >
            Email address for newsletter
         </label>
         <input
            id="footer_email"
            type="email"
            placeholder="Masukkan email Anda"
            required
            aria-label="Email untuk newsletter"
            aria-describedby={`${descriptionId} ${emailError ? errorId : ''}`.trim() || undefined}
            aria-invalid={!!emailError}
            aria-required="true"
            {...register("email")}
            disabled={isSubscribing}
         />
         <button
            type="submit"
            className={`theme-btn ${buttonClassName}`}
            aria-label="Subscribe ke newsletter"
            aria-busy={isSubscribing}
            disabled={isSubscribing}
         >
            {isSubscribing ? 'Mengirim...' : 'Subscribe'}
         </button>
         {emailError && (
            <p 
               id={errorId} 
               className="form_error mt-2" 
               role="alert" 
               aria-live="polite"
            >
               {emailError.message}
            </p>
         )}
         {isSuccess && (
            <p 
               ref={successMessageRef}
               className="form_success mt-2" 
               role="status" 
               aria-live="polite"
               tabIndex={-1}
            >
               Berhasil berlangganan newsletter!
            </p>
         )}
      </form>
   );
};

NewsletterForm.displayName = "NewsletterForm";

export default NewsletterForm;
