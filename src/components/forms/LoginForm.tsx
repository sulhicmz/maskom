"use client"
import Link from "next/link";
import { toast } from 'react-toastify';
import * as yup from "yup";
import { useForm } from "react-hook-form";
import { yupResolver } from '@hookform/resolvers/yup';

interface FormData {
   email: string;
   password: string;
}

const LoginForm = () => {

   const schema = yup
      .object({
         email: yup.string().required().email().label("Email"),
         password: yup.string().required().label("Kata sandi"),
      })
      .required();

   const { register, handleSubmit, reset, formState: { errors }, } = useForm<FormData>({ resolver: yupResolver(schema), });
   const onSubmit = () => {
      const notify = () => toast('Berhasil masuk ke portal', { position: 'top-center' });
      notify();
      reset();
   };

   return (
      <form onSubmit={handleSubmit(onSubmit)} className="user-form" noValidate>
         <div className="form-group">
            <label htmlFor="login_email">Email terdaftar</label>
            <input
               id="login_email"
               {...register("email")}
               type="email"
               className="form-control"
               placeholder="nama@maskom.co.id"
               aria-invalid={!!errors.email}
               aria-describedby="login_email_error"
            />
            <p id="login_email_error" className="form_error" role="alert">{errors.email?.message}</p>
         </div>
           <div className="form-group">
              <label htmlFor="login_password">Kata sandi <button type="button" className="btn-link">Lupa?</button></label>
              <input
                 id="login_password"
                 type="password"
                 {...register("password")}
                 className="form-control"
                 placeholder="Masukkan kata sandi"
                 aria-invalid={!!errors.password}
                 aria-describedby="login_password_error"
              />
              <p id="login_password_error" className="form_error" role="alert">{errors.password?.message}</p>
           </div>
          <div className="form-group">
             <button className="theme-btn style-one">Masuk sekarang</button>
          </div>
          <div className="form-text text-center">
             <span>Belum punya akun? <Link href="/sign-up">Daftar Maskom</Link></span>
          </div>
      </form>
   )
}

export default LoginForm
