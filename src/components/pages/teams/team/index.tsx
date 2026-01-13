import { PageBuilder } from '@/components/common/PageBuilder';
import TeamArea from "./TeamArea";

const Team = () => {
  return (
    <PageBuilder 
      title="Expert Team Member" 
      subTitle="Team Member"
      content={<TeamArea />}
    />
  );
};

export default Team;
