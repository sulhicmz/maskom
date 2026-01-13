import { PageBuilder } from '@/components/common/PageBuilder';
import NotFoundArea from "./NotFoundArea";

const NotFound = () => {
  return (
    <PageBuilder 
      title="Page Not Found" 
      subTitle="404"
      headerStyle={true}
      content={<NotFoundArea />}
    />
  );
};

export default NotFound;
