"use client"
import Link from "next/link";
import { useForm } from "react-hook-form";
import { yupResolver } from '@hookform/resolvers/yup';
import { authService } from '@/services/auth';
import { createEmailPasswordSchema } from '@/utils/formValidation';
import { useFormSubmission } from '@/hooks/useFormSubmission';
import FormField from './FormField';
import LoadingButton from './LoadingButton';

interface FormData {
   email: string;
   password: string;
}

const LoginForm = () => {
   const { register, handleSubmit, reset, formState: { errors }, } = useForm<FormData>({ resolver: yupResolver(createEmailPasswordSchema()), });

   const { submit: onSubmit, isSubmitting } = useFormSubmission(
      async (data?: FormData) => {
         if (!data) return { success: false, error: 'Invalid form data' };
         return await authService.login({
            email: data.email,
            password: data.password,
         });
      },
      { resetForm: reset }
   );

   return (
      <form onSubmit={handleSubmit(onSubmit)} className="user-form" noValidate>
         <FormField
            id="login_email"
            label="Email terdaftar"
            type="email"
            placeholder="nama@maskom.co.id"
            register={register("email")}
            error={errors.email}
            disabled={isSubmitting}
         />
         <FormField
            id="login_password"
            label="Kata sandi"
            type="password"
            placeholder="Masukkan kata sandi"
            register={register("password")}
            error={errors.password}
            disabled={isSubmitting}
         />
         <div className="form-group">
            <LoadingButton
               className="theme-btn style-one"
               isLoading={isSubmitting}
               loadingText="Masuk..."
            >
               Masuk sekarang
            </LoadingButton>
         </div>
         <div className="form-text text-center">
            <span>Belum punya akun? <Link href="/sign-up">Daftar Maskom</Link></span>
         </div>
       </form>
   )
}

export default LoginForm
