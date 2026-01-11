"use client"
import { useForm } from "react-hook-form";
import { yupResolver } from '@hookform/resolvers/yup';
import { createBlogFormSchema } from '@/utils/formValidation';
import { useFormSubmission } from '@/hooks/useFormSubmission';
import FormField from './FormField';
import LoadingButton from './LoadingButton';

interface FormData {
   name: string;
   email: string;
   message: string;
}

const BlogForm = () => {
   const { register, handleSubmit, reset, formState: { errors }, } = useForm<FormData>({ resolver: yupResolver(createBlogFormSchema()), });

    const { submit: onSubmit, isSubmitting } = useFormSubmission(
       async (_data?: void) => {
          return { success: true, message: 'Komentar berhasil dikirim' };
       },
       { successMessage: 'Komentar berhasil dikirim', resetForm: reset }
    );

    return (
       <form onSubmit={handleSubmit(() => onSubmit())} className="comment-form" noValidate>
         <div className="row">
            <div className="col-lg-12">
               <div className="form_group">
                  <FormField
                     id="blog_name"
                     label="Nama lengkap"
                     type="text"
                     placeholder="Nama lengkap"
                     register={register("name")}
                     error={errors.name}
                     disabled={isSubmitting}
                  />
               </div>
            </div>
            <div className="col-lg-12">
               <div className="form_group">
                  <FormField
                     id="blog_email"
                     label="Email kantor"
                     type="email"
                     placeholder="Email kantor"
                     register={register("email")}
                     error={errors.email}
                     disabled={isSubmitting}
                  />
               </div>
            </div>
            <div className="col-lg-12">
               <div className="form_group">
                  <FormField
                     id="blog_message"
                     label="Tulis komentar Anda"
                     type="textarea"
                     placeholder="Tulis komentar Anda"
                     register={register("message")}
                     error={errors.message}
                     disabled={isSubmitting}
                     rows={4}
                  />
               </div>
            </div>
            <div className="col-lg-12">
               <div className="form_group">
                  <LoadingButton
                     className="theme-btn gradient-btn"
                     isLoading={isSubmitting}
                     loadingText="Mengirim..."
                  >
                     Kirim Komentar
                  </LoadingButton>
               </div>
            </div>
         </div>
      </form>
   )
}

export default BlogForm
