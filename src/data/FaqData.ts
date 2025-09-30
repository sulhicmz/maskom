interface DataType {
   id: number;
   page: string;
   quesstion: string;
   answer: string;
}

const faq_data: DataType[] = [
   {
      id: 1,
      page: "home_1",
      quesstion: "Apa saja cakupan layanan Maskom?",
      answer: "Kami menyediakan konektivitas fiber & wireless, managed Wi-Fi dan LAN, SD-WAN, keamanan jaringan, layanan NOC 24/7, hingga direct cloud connect sesuai kebutuhan bisnis Anda.",
   },
   {
      id: 2,
      page: "home_1",
      quesstion: "Seberapa cepat proses instalasi jaringan?",
      answer: "Estimasi instalasi tergantung kesiapan infrastruktur lokasi. Untuk area dengan jaringan Maskom, provisioning dapat selesai dalam 7-10 hari kerja termasuk aktivasi perangkat dan uji kelayakan layanan.",
   },
   {
      id: 3,
      page: "home_1",
      quesstion: "Bagaimana mekanisme dukungan teknis Maskom?",
      answer: "Tim NOC kami memonitor jaringan secara proaktif dan siap menangani insiden melalui helpdesk 24/7. Untuk kasus kritikal, engineer on-site akan dikirim sesuai SLA yang disepakati.",
   },

   // home_2

   {
      id: 1,
      page: "home_2",
      quesstion: "What are The Main Types of AI?",
      answer: "AI refers to the simulation of human intelligence in machines, enabling them to perform tasks that typically require human intelligence, such as learning, problem-solving, and decision-making.",
   },
   {
      id: 2,
      page: "home_2",
      quesstion: "How to Work Image Generator?",
      answer: "AI refers to the simulation of human intelligence in machines, enabling them to perform tasks that typically require human intelligence, such as learning, problem-solving, and decision-making.",
   },
   {
      id: 3,
      page: "home_2",
      quesstion: "Is Image AI Used in Healthcare?",
      answer: "AI refers to the simulation of human intelligence in machines, enabling them to perform tasks that typically require human intelligence, such as learning, problem-solving, and decision-making.",
   },
   {
      id: 4,
      page: "home_2",
      quesstion: "Can Image AI Recognize Faces?",
      answer: "AI refers to the simulation of human intelligence in machines, enabling them to perform tasks that typically require human intelligence, such as learning, problem-solving, and decision-making.",
   },

   // home_2
   {
      id: 1,
      page: "home_3",
      quesstion: "What are The Main Types of AI?",
      answer: "AI refers to the simulation of human intelligence in machines, enabling them to perform tasks that typically require human intelligence, such as learning, problem-solving, and decision-making.",
   },
   {
      id: 2,
      page: "home_3",
      quesstion: "How to Work Image Generator?",
      answer: "AI refers to the simulation of human intelligence in machines, enabling them to perform tasks that typically require human intelligence, such as learning, problem-solving, and decision-making.",
   },
   {
      id: 3,
      page: "home_3",
      quesstion: "Is Image AI Used in Healthcare?",
      answer: "AI refers to the simulation of human intelligence in machines, enabling them to perform tasks that typically require human intelligence, such as learning, problem-solving, and decision-making.",
   },
   {
      id: 4,
      page: "home_3",
      quesstion: "Can Image AI Recognize Faces?",
      answer: "AI refers to the simulation of human intelligence in machines, enabling them to perform tasks that typically require human intelligence, such as learning, problem-solving, and decision-making.",
   },
];

export default faq_data;