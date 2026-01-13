import { PageBuilder } from '@/components/common/PageBuilder';
import LoginArea from "./LoginArea";

const Login = () => {
  return (
    <PageBuilder 
      title="Masuk Portal Maskom" 
      subTitle="Login"
      headerStyle={true}
      content={<LoginArea />}
    />
  );
};

export default Login;
