interface DataType {
   id: number;
   page: string;
   price_details: {
      id: number;
      sub_title: string;
      price: number;
      btn: string;
      feature: string[];
   }[]
}

const price_data: DataType[] = [
   {
      id: 1,
      page: "home_1",
      price_details: [
         {
            id: 1,
            sub_title: "Personal",
            price: 5,
            btn: "Start Free Trial",
            feature: ["10,000 Monthly Word Limit", "10+ Templates", "All types of content", "10+ Languages"],
         },
         {
            id: 2,
            sub_title: "Business",
            price: 68,
            btn: "Start Free Trial",
            feature: ["10,000 Monthly Word Limit", "10+ Templates", "All types of content", "10+ Languages"],
         },
         {
            id: 3,
            sub_title: "Pro",
            price: 78,
            btn: "Start Free Trial",
            feature: ["10,000 Monthly Word Limit", "10+ Templates", "All types of content", "10+ Languages"],
         },
         {
            id: 4,
            sub_title: "Unlimited",
            price: 99,
            btn: "Start Free Trial",
            feature: ["10,000 Monthly Word Limit", "10+ Templates", "All types of content", "10+ Languages"],
         },
      ]
   },
   {
      id: 2,
      page: "home_1",
      price_details: [
         {
            id: 1,
            sub_title: "Personal",
            price: 10,
            btn: "Start Free Trial",
            feature: ["10,000 Monthly Word Limit", "10+ Templates", "All types of content", "10+ Languages"],
         },
         {
            id: 2,
            sub_title: "Business",
            price: 70,
            btn: "Start Free Trial",
            feature: ["10,000 Monthly Word Limit", "10+ Templates", "All types of content", "10+ Languages"],
         },
         {
            id: 3,
            sub_title: "Pro",
            price: 80,
            btn: "Start Free Trial",
            feature: ["10,000 Monthly Word Limit", "10+ Templates", "All types of content", "10+ Languages"],
         },
         {
            id: 4,
            sub_title: "Unlimited",
            price: 99,
            btn: "Start Free Trial",
            feature: ["10,000 Monthly Word Limit", "10+ Templates", "All types of content", "10+ Languages"],
         },
      ]
   },

   // home_2

   {
      id: 1,
      page: "home_2",
      price_details: [
         {
            id: 1,
            sub_title: "Personal",
            price: 5,
            btn: "Start Free Trial",
            feature: ["10,000 Monthly Word Limit", "10+ Templates", "All types of content", "10+ Languages"],
         },
         {
            id: 2,
            sub_title: "Basic Plan",
            price: 68,
            btn: "Start Free Trial",
            feature: ["10,000 Monthly Word Limit", "10+ Templates", "All types of content", "10+ Languages"],
         },
         {
            id: 3,
            sub_title: "Silver Plan",
            price: 78,
            btn: "Start Free Trial",
            feature: ["10,000 Monthly Word Limit", "10+ Templates", "All types of content", "10+ Languages"],
         },
         {
            id: 4,
            sub_title: "Golden Plan",
            price: 99,
            btn: "Start Free Trial",
            feature: ["10,000 Monthly Word Limit", "10+ Templates", "All types of content", "10+ Languages"],
         },
      ]
   },
   {
      id: 2,
      page: "home_2",
      price_details: [
         {
            id: 1,
            sub_title: "Personal",
            price: 10,
            btn: "Start Free Trial",
            feature: ["10,000 Monthly Word Limit", "10+ Templates", "All types of content", "10+ Languages"],
         },
         {
            id: 2,
            sub_title: "Basic Plan",
            price: 70,
            btn: "Start Free Trial",
            feature: ["10,000 Monthly Word Limit", "10+ Templates", "All types of content", "10+ Languages"],
         },
         {
            id: 3,
            sub_title: "Silver Plan",
            price: 80,
            btn: "Start Free Trial",
            feature: ["10,000 Monthly Word Limit", "10+ Templates", "All types of content", "10+ Languages"],
         },
         {
            id: 4,
            sub_title: "Golden Plan",
            price: 99,
            btn: "Start Free Trial",
            feature: ["10,000 Monthly Word Limit", "10+ Templates", "All types of content", "10+ Languages"],
         },
      ]
   },

   // inner_page

   {
      id: 1,
      page: "inner_page",
      price_details: [
         {
            id: 1,
            sub_title: "Personal",
            price: 5,
            btn: "Start Free Trial",
            feature: ["10,000 Monthly Word Limit", "10+ Templates", "All types of content", "10+ Languages"],
         },
         {
            id: 2,
            sub_title: "Business",
            price: 68,
            btn: "Start Free Trial",
            feature: ["10,000 Monthly Word Limit", "10+ Templates", "All types of content", "10+ Languages"],
         },
         {
            id: 3,
            sub_title: "Pro",
            price: 78,
            btn: "Start Free Trial",
            feature: ["10,000 Monthly Word Limit", "10+ Templates", "All types of content", "10+ Languages"],
         },
         {
            id: 4,
            sub_title: "Unlimited",
            price: 99,
            btn: "Start Free Trial",
            feature: ["10,000 Monthly Word Limit", "10+ Templates", "All types of content", "10+ Languages"],
         },
      ]
   },
   {
      id: 2,
      page: "inner_page",
      price_details: [
         {
            id: 1,
            sub_title: "Personal",
            price: 10,
            btn: "Start Free Trial",
            feature: ["10,000 Monthly Word Limit", "10+ Templates", "All types of content", "10+ Languages"],
         },
         {
            id: 2,
            sub_title: "Business",
            price: 70,
            btn: "Start Free Trial",
            feature: ["10,000 Monthly Word Limit", "10+ Templates", "All types of content", "10+ Languages"],
         },
         {
            id: 3,
            sub_title: "Pro",
            price: 80,
            btn: "Start Free Trial",
            feature: ["10,000 Monthly Word Limit", "10+ Templates", "All types of content", "10+ Languages"],
         },
         {
            id: 4,
            sub_title: "Unlimited",
            price: 99,
            btn: "Start Free Trial",
            feature: ["10,000 Monthly Word Limit", "10+ Templates", "All types of content", "10+ Languages"],
         },
      ]
   },
   {
      id: 3,
      page: "inner_page",
      price_details: [
         {
            id: 1,
            sub_title: "Silver Plan",
            price: 145,
            btn: "Start Free Trial",
            feature: ["10,000 Monthly Word Limit", "10+ Templates", "All types of content", "10+ Languages"],
         },
         {
            id: 2,
            sub_title: "Golden Plan",
            price: 185,
            btn: "Start Free Trial",
            feature: ["10,000 Monthly Word Limit", "10+ Templates", "All types of content", "10+ Languages"],
         },
         {
            id: 3,
            sub_title: "Diamond Plan",
            price: 220,
            btn: "Start Free Trial",
            feature: ["10,000 Monthly Word Limit", "10+ Templates", "All types of content", "10+ Languages"],
         },
         {
            id: 4,
            sub_title: "Ultra Pro",
            price: 250,
            btn: "Start Free Trial",
            feature: ["10,000 Monthly Word Limit", "10+ Templates", "All types of content", "10+ Languages"],
         },
      ]
   },
   {
      id: 4,
      page: "inner_page",
      price_details: [
         {
            id: 1,
            sub_title: "Silver Plan",
            price: 165,
            btn: "Start Free Trial",
            feature: ["10,000 Monthly Word Limit", "10+ Templates", "All types of content", "10+ Languages"],
         },
         {
            id: 2,
            sub_title: "Golden Plan",
            price: 225,
            btn: "Start Free Trial",
            feature: ["10,000 Monthly Word Limit", "10+ Templates", "All types of content", "10+ Languages"],
         },
         {
            id: 3,
            sub_title: "Diamond Plan",
            price: 250,
            btn: "Start Free Trial",
            feature: ["10,000 Monthly Word Limit", "10+ Templates", "All types of content", "10+ Languages"],
         },
         {
            id: 4,
            sub_title: "Ultra Pro",
            price: 350,
            btn: "Start Free Trial",
            feature: ["10,000 Monthly Word Limit", "10+ Templates", "All types of content", "10+ Languages"],
         },
      ]
   },
];

export default price_data;