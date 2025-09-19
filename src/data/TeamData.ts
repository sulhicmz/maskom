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
      title: "Kigson Jonson",
      designation: "SEO",
   },
   {
      id: 2,
      img: team_2,
      title: "Guy Hawkins",
      designation: "CTO",
   },
   {
      id: 3,
      img: team_3,
      title: "Robert Fox",
      designation: "Team Leader",
   },
   {
      id: 4,
      img: team_4,
      title: "Jacob Jones",
      designation: "Advisor",
   },
   {
      id: 5,
      img: team_5,
      title: "Jenny Wilson",
      designation: "Marketing Manager",
   },
   {
      id: 6,
      img: team_6,
      title: "Albert Flores",
      designation: "HR",
   },
   {
      id: 7,
      img: team_7,
      title: "Bessie Cooper",
      designation: "Support Engineer",
   },
   {
      id: 8,
      img: team_8,
      title: "Eleanor Pena",
      designation: "Developer",
   },
   {
      id: 9,
      img: team_6,
      title: "Albert Flores",
      designation: "HR",
   },
   {
      id: 10,
      img: team_7,
      title: "Bessie Cooper",
      designation: "Support Engineer",
   },
   {
      id: 11,
      img: team_8,
      title: "Eleanor Pena",
      designation: "Developer",
   },
];

export default team_data;