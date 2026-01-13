import { PageBuilder } from '@/components/common/PageBuilder';
import SignUpArea from "./SignUpArea";

const SignUp = () => {
  return (
    <PageBuilder 
      title="Buat Akun Maskom" 
      subTitle="Registrasi"
      content={<SignUpArea />}
    />
  );
};

export default SignUp;
