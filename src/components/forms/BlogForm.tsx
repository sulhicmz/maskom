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
      <form onSubmit={handleSubmit(onSubmit)} className="comment-form">
         <div className="row">
            <div className="col-lg-12">
               <div className="form_group">
                  <input type="text" {...register("name")} className="form-control" placeholder="Nama lengkap" />
                  <p className="form_error">{errors.name?.message}</p>
               </div>
            </div>
            <div className="col-lg-12">
               <div className="form_group">
                  <input type="email" {...register("email")} className="form-control" placeholder="Email kantor" />
                  <p className="form_error">{errors.email?.message}</p>
               </div>
            </div>
            <div className="col-lg-12">
               <div className="form_group">
                  <textarea {...register("message")} className="form-control" rows={4}
                     placeholder="Tulis komentar Anda"></textarea>
                  <p className="form_error">{errors.message?.message}</p>
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
