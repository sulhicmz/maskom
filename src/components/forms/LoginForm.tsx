"use client"
import Link from "next/link";
import { useForm } from "react-hook-form";
import { yupResolver } from '@hookform/resolvers/yup';
import { authService } from '@/services/auth';
import { createEmailPasswordSchema } from '@/utils/formValidation';
import { useFormSubmission } from '@/hooks/useFormSubmission';

interface FormData {
   email: string;
   password: string;
}

const LoginForm = () => {
   const { register, handleSubmit, reset, formState: { errors }, } = useForm<FormData>({ resolver: yupResolver(createEmailPasswordSchema()), });
   
   const { submit: onSubmit, isSubmitting } = useFormSubmission(
      async (data: FormData) => {
         return await authService.login({
            email: data.email,
            password: data.password,
         });
      },
      { resetForm: reset }
   );

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
               disabled={isSubmitting}
            />
            <p id="login_email_error" className="form_error" role="alert">{errors.email?.message}</p>
         </div>
            <div className="form-group">
               <label htmlFor="login_password">Kata sandi</label>
               <input
                  id="login_password"
                  type="password"
                  {...register("password")}
                  className="form-control"
                  placeholder="Masukkan kata sandi"
                  aria-invalid={!!errors.password}
                  aria-describedby="login_password_error"
                  disabled={isSubmitting}
               />
               <p id="login_password_error" className="form_error" role="alert">{errors.password?.message}</p>
            </div>
           <div className="form-group">
              <button type="submit" className="theme-btn style-one" disabled={isSubmitting} aria-live="polite" aria-busy={isSubmitting}>
                 {isSubmitting ? 'Masuk...' : 'Masuk sekarang'}
              </button>
           </div>
           <div className="form-text text-center">
              <span>Belum punya akun? <Link href="/sign-up">Daftar Maskom</Link></span>
           </div>
       </form>
   )
}

export default LoginForm
