"use client"
import { toast } from 'react-toastify';
import * as yup from "yup";
import { useForm } from "react-hook-form";
import { yupResolver } from '@hookform/resolvers/yup';

interface FormData {
   name: string;
   email: string;
   message: string;
}

const schema = yup
   .object({
      name: yup.string().required().label("Nama"),
      email: yup.string().required().email().label("Email"),
      message: yup.string().required().label("Pesan"),
   })
   .required();

const BlogForm = () => {

   const { register, handleSubmit, reset, formState: { errors }, } = useForm<FormData>({ resolver: yupResolver(schema), });
   const onSubmit = () => {
      const notify = () => toast('Komentar berhasil dikirim', { position: 'top-center' });
      notify();
      reset();
   };

   return (
      <form onSubmit={handleSubmit(onSubmit)} className="comment-form" noValidate>
         <div className="row">
            <div className="col-lg-12">
               <div className="form_group">
                  <label htmlFor="blog_name" className="sr-only">Nama lengkap</label>
                  <input type="text" {...register("name")} id="blog_name" className="form-control" placeholder="Nama lengkap" aria-invalid={!!errors.name} aria-describedby="blog_name_error" />
                  <p id="blog_name_error" className="form_error" role="alert">{errors.name?.message}</p>
               </div>
            </div>
            <div className="col-lg-12">
               <div className="form_group">
                  <label htmlFor="blog_email" className="sr-only">Email kantor</label>
                  <input type="email" {...register("email")} id="blog_email" className="form-control" placeholder="Email kantor" aria-invalid={!!errors.email} aria-describedby="blog_email_error" />
                  <p id="blog_email_error" className="form_error" role="alert">{errors.email?.message}</p>
               </div>
            </div>
            <div className="col-lg-12">
               <div className="form_group">
                  <label htmlFor="blog_message" className="sr-only">Tulis komentar Anda</label>
                  <textarea {...register("message")} id="blog_message" className="form-control" rows={4}
                     placeholder="Tulis komentar Anda" aria-invalid={!!errors.message} aria-describedby="blog_message_error"></textarea>
                  <p id="blog_message_error" className="form_error" role="alert">{errors.message?.message}</p>
               </div>
            </div>
            <div className="col-lg-12">
               <div className="form_group">
                  <button type='submit' className="theme-btn gradient-btn">Kirim Komentar</button>
               </div>
            </div>
         </div>
      </form>
   )
}

export default BlogForm
