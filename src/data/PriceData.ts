interface DataType {
   id: number;
   page: string;
   price_details: {
      id: number;
      sub_title: string;
      price: number;
      btn: string;
      feature: string[];
      currency?: string;
      price_label?: string;
      note?: string;
   }[]
}

const price_data: DataType[] = [
   {
      id: 1,
      page: "home_1",
      price_details: [
         {
            id: 1,
            sub_title: "Essential Connect",
            price: 4500000,
            currency: "IDR",
            btn: "Minta Proposal",
            note: "Harga per lokasi per bulan",
            feature: [
               "Internet dedicated hingga 50 Mbps",
               "Monitoring NOC 8x5",
               "Backup link seluler opsional",
               "Laporan performa bulanan",
            ],
         },
         {
            id: 2,
            sub_title: "Growth Network",
            price: 7200000,
            currency: "IDR",
            btn: "Minta Proposal",
            note: "Harga per lokasi per bulan",
            feature: [
               "Internet dedicated hingga 100 Mbps",
               "Managed Wi-Fi & switch",
               "SLA 99,5% dengan response 4 jam",
               "Support engineer on-site",
            ],
         },
         {
            id: 3,
            sub_title: "Secure Enterprise",
            price: 12500000,
            currency: "IDR",
            btn: "Diskusikan Solusi",
            note: "Harga per lokasi per bulan",
            feature: [
               "Bandwidth fleksibel hingga 200 Mbps",
               "Managed firewall & SD-WAN",
               "Incident response 24/7",
               "Reporting dan review kuartalan",
            ],
         },
         {
            id: 4,
            sub_title: "Custom Project",
            price: 0,
            currency: "IDR",
            price_label: "Hubungi Kami",
            btn: "Atur Konsultasi",
            note: "Kebutuhan multi-site & integrasi lanjutan",
            feature: [
               "Arsitektur khusus industri",
               "Hybrid link & direct cloud connect",
               "Service delivery manager dedikasi",
               "Integrasi ke sistem pemantauan Anda",
            ],
         },
      ]
   },
   {
      id: 2,
      page: "home_1",
      price_details: [
         {
            id: 1,
            sub_title: "Essential Connect",
            price: 4200000,
            currency: "IDR",
            btn: "Minta Proposal",
            note: "Harga kontrak 36 bulan",
            feature: [
               "Internet dedicated hingga 50 Mbps",
               "Monitoring NOC 8x5",
               "Backup link seluler opsional",
               "Implementasi tanpa biaya instalasi",
            ],
         },
         {
            id: 2,
            sub_title: "Growth Network",
            price: 6800000,
            currency: "IDR",
            btn: "Minta Proposal",
            note: "Harga kontrak 36 bulan",
            feature: [
               "Internet dedicated hingga 150 Mbps",
               "Managed Wi-Fi & switch",
               "SLA 99,7% dengan response 2 jam",
               "Site survey & instalasi multi cabang",
            ],
         },
         {
            id: 3,
            sub_title: "Secure Enterprise",
            price: 11800000,
            currency: "IDR",
            btn: "Diskusikan Solusi",
            note: "Harga kontrak 36 bulan",
            feature: [
               "Bandwidth fleksibel hingga 300 Mbps",
               "Managed firewall & SD-WAN",
               "Incident response 24/7",
               "Dedicated service delivery manager",
            ],
         },
         {
            id: 4,
            sub_title: "Custom Project",
            price: 0,
            currency: "IDR",
            price_label: "Hubungi Kami",
            btn: "Atur Konsultasi",
            note: "SLA & integrasi menyesuaikan kebutuhan",
            feature: [
               "Desain arsitektur hybrid",
               "Implementasi multi data center",
               "Integrasi ke SOC & ITSM",
               "Governance report custom",
            ],
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