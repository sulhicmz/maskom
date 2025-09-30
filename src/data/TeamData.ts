import { StaticImageData } from "next/image";

import team_1 from "@/assets/images/team/team-1.jpg"
import team_2 from "@/assets/images/team/team-2.jpg"
import team_3 from "@/assets/images/team/team-3.jpg"
import team_4 from "@/assets/images/team/team-4.jpg"
import team_5 from "@/assets/images/team/team-5.jpg"
import team_6 from "@/assets/images/team/team-6.jpg"
import team_7 from "@/assets/images/team/team-7.jpg"
import team_8 from "@/assets/images/team/team-8.jpg"

interface DataType {
   id: number;
   img: StaticImageData;
   title: string;
   designation: string;
}

const team_data: DataType[] = [
   {
      id: 1,
      img: team_1,
      title: "Made Surya",
      designation: "Chief Executive Officer",
   },
   {
      id: 2,
      img: team_2,
      title: "Fitria Adelia",
      designation: "Chief Technology Officer",
   },
   {
      id: 3,
      img: team_3,
      title: "Rangga Saputra",
      designation: "Head of Network Engineering",
   },
   {
      id: 4,
      img: team_4,
      title: "Sylvia Nirmala",
      designation: "Service Delivery Director",
   },
   {
      id: 5,
      img: team_5,
      title: "Rizal Fadlan",
      designation: "Lead Solution Architect",
   },
   {
      id: 6,
      img: team_6,
      title: "Angela Mahardika",
      designation: "Customer Success Manager",
   },
   {
      id: 7,
      img: team_7,
      title: "Bayu Wirawan",
      designation: "Senior Network Engineer",
   },
   {
      id: 8,
      img: team_8,
      title: "Kezia Putri",
      designation: "Cybersecurity Specialist",
   },
];

export default team_data;