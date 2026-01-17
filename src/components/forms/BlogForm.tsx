"use client"
import { useForm } from "react-hook-form";
import { yupResolver } from '@hookform/resolvers/yup';
import { createBlogFormSchema } from '@/utils/formValidation';
import { useFormSubmission } from '@/hooks/useFormSubmission';
import { useAutoSave } from '@/hooks/useAutoSave';
import FormField from './FormField';
import LoadingButton from './LoadingButton';
import AutoSaveIndicator from '@/components/common/AutoSaveIndicator';
import ClearDraftButton from '@/components/common/ClearDraftButton';

interface BlogCommentFormData {
   name: string;
   email: string;
   message: string;
}

const BlogForm = () => {
    const { register, handleSubmit, reset, formState: { errors }, trigger, watch } = useForm<BlogCommentFormData>({
      resolver: yupResolver(createBlogFormSchema()),
   });

   const formData = watch();

   const { submit: onSubmit, isSubmitting } = useFormSubmission(
      async () => {
         return { success: true, message: 'Komentar berhasil dikirim' };
      },
      { successMessage: 'Komentar berhasil dikirim', resetForm: reset }
   );

     const {
        isAutoSaving,
        lastSavedAt,
        clearDraft,
        hasDraft
     } = useAutoSave<BlogCommentFormData>({
       formId: 'blog_comment',
       data: formData,
       enabled: !isSubmitting,
       debounceMs: 1000,
       autoSaveInterval: 30000
   });

   const handleSubmitForm = async () => {
      await onSubmit();
      clearDraft();
   };

   const handleClearDraft = () => {
      clearDraft();
      reset();
   };

   const handleRestoreDraft = () => {
      const draft = localStorage.getItem('draft_blog_comment');
      if (draft) {
         try {
            const parsedDraft = JSON.parse(draft);
            if (parsedDraft.data) {
               reset(parsedDraft.data);
            }
         } catch (error) {
            console.error('Failed to restore draft:', error);
         }
      }
   };

      return (
         <div className="blog-form-wrapper">
            <AutoSaveIndicator lastSavedAt={lastSavedAt} isAutoSaving={isAutoSaving} />
            <div className="draft-actions">
               {hasDraft && (
                  <button
                     type="button"
                     onClick={handleRestoreDraft}
                     className="restore-draft-btn"
                     disabled={isSubmitting}
                  >
                     🔄 Pulihkan Draft
                  </button>
               )}
               <ClearDraftButton
                  hasDraft={hasDraft}
                  onClearDraft={handleClearDraft}
                  disabled={isSubmitting}
               />
            </div>
            <form onSubmit={handleSubmit(handleSubmitForm)} className="comment-form" noValidate>
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
                      trigger={trigger}
                      debounceMs={300}
                      ariaLive="polite"
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
                      trigger={trigger}
                      debounceMs={300}
                      ariaLive="polite"
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
                      trigger={trigger}
                      debounceMs={300}
                      ariaLive="polite"
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
            </div>
     )
 }

export default BlogForm
