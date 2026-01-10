import PageLayout from "@/components/common/PageLayout"
import TeamDetailsArea from "./TeamDetailsArea"
import Skill from "./Skill"

const TeamDetails = () => {
   return (
      <PageLayout breadcrumbTitle="Member Details" breadcrumbSubTitle="Member Details">
         <TeamDetailsArea />
         <Skill />
      </PageLayout>
   )
}

export default TeamDetails
