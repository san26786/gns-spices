/**
 * Kamdhenu Pickles & Spices Ind. Pvt. Ltd. — supplier rate card.
 *
 * This is REFERENCE DATA (a fixed price list issued by the supplier),
 * not partner-editable planning input. It lives in a static module,
 * separate from the Zustand store, so it does not consume localStorage
 * or drift per partner.
 *
 * Data preserved verbatim from the source document dated 15/07/2026.
 * Product names, punctuation and pricing follow the manufacturer's
 * terminology.
 */

export const KAMDHENU_META = {
  company: 'KAMDHENU PICKLES & SPICES IND. PVT. LTD',
  address: '1st Floor, Krishi Bhavan, 1379 Bhawani Peth, Pune-411042',
  website: 'kamdhenupickles.com',
  gstNote: 'Spices · Amla Candy · Papad · Pickles — 5%',
  effectiveDate: '15/07/2026',
  weightsDate: '02-06-2026',
  billing: 'Distributor billing to retailer',
  notice: 'This price list supersedes all previous price lists',
  expiry: 'Distributor is responsible for returning goods before product expiry',
} as const;

export type PriceRow = {
  sr: string;
  product: string;
  size: string;
  sackPack: string;
  coBasicRate: number;
  distLanding: number;
  margin8pct: number;
  retailRate: number;
  tradePerKg: number;
  tradePerUnit: number;
  mrp: number;
  marginPct: string;
};

/** Products 1–16 · blended masalas, papads, whole spices. */
export const PRICE_LIST_1_16: PriceRow[] = [
  { sr:'1',  product:'Spl KLM Chatpat',      size:'1 kg',   sackPack:'5',                 coBasicRate:238.10, distLanding:250.00, margin8pct:19.05, retailRate:257.10, tradePerKg:270,    tradePerUnit:270,   mrp:432, marginPct:'60%' },
  { sr:'1',  product:'Spl KLM Chatpat',      size:'500g',   sackPack:'5',                 coBasicRate:239.86, distLanding:251.85, margin8pct:19.19, retailRate:259.00, tradePerKg:272,    tradePerUnit:136,   mrp:218, marginPct:'60%' },
  { sr:'1',  product:'Spl KLM Chatpat',      size:'200g',   sackPack:'5',                 coBasicRate:242.50, distLanding:254.63, margin8pct:19.40, retailRate:261.90, tradePerKg:275,    tradePerUnit:55,    mrp:88,  marginPct:'60%' },
  { sr:'1',  product:'Spl KLM Chatpat',      size:'100g',   sackPack:'5',                 coBasicRate:246.03, distLanding:258.33, margin8pct:19.68, retailRate:265.70, tradePerKg:279,    tradePerUnit:27.90, mrp:45,  marginPct:'61%' },
  { sr:'1',  product:'Spl KLM Chatpat',      size:'50g',    sackPack:'5',                 coBasicRate:248.68, distLanding:261.11, margin8pct:19.89, retailRate:268.60, tradePerKg:282,    tradePerUnit:14.10, mrp:23,  marginPct:'63%' },
  { sr:'1',  product:'Spl KLM Chatpat',      size:'₹10',    sackPack:'₹136 / 6.4kg',      coBasicRate:294.37, distLanding:309.09, margin8pct:29.44, retailRate:323.80, tradePerKg:340,    tradePerUnit:6.80,  mrp:10,  marginPct:'47%' },
  { sr:'1',  product:'Spl KLM Chatpat',      size:'₹5',     sackPack:'₹136 / 6.4kg',      coBasicRate:294.37, distLanding:309.09, margin8pct:29.44, retailRate:323.80, tradePerKg:340,    tradePerUnit:3.40,  mrp:5,   marginPct:'47%' },
  { sr:'2',  product:'Spl Goda Masala',      size:'500g',   sackPack:'5',                 coBasicRate:331.57, distLanding:348.15, margin8pct:26.53, retailRate:358.10, tradePerKg:376,    tradePerUnit:188,   mrp:301, marginPct:'60%' },
  { sr:'2',  product:'Spl Goda Masala',      size:'200g',   sackPack:'5',                 coBasicRate:335.10, distLanding:351.85, margin8pct:26.81, retailRate:361.90, tradePerKg:380,    tradePerUnit:76,    mrp:121, marginPct:'59%' },
  { sr:'2',  product:'Spl Goda Masala',      size:'50g',    sackPack:'5',                 coBasicRate:339.51, distLanding:356.48, margin8pct:27.16, retailRate:366.70, tradePerKg:385,    tradePerUnit:19.25, mrp:31,  marginPct:'61%' },
  { sr:'2',  product:'Spl Goda Masala',      size:'₹5',     sackPack:'₹136 / 4.48kg',     coBasicRate:420.53, distLanding:441.56, margin8pct:42.05, retailRate:462.60, tradePerKg:485.71, tradePerUnit:3.40,  mrp:5,   marginPct:'47%' },
  { sr:'3',  product:'Sunday Masala',        size:'200g',   sackPack:'5',                 coBasicRate:392.42, distLanding:412.04, margin8pct:31.39, retailRate:423.80, tradePerKg:445,    tradePerUnit:89,    mrp:142, marginPct:'60%' },
  { sr:'3',  product:'Sunday Masala',        size:'50g',    sackPack:'5',                 coBasicRate:396.83, distLanding:416.67, margin8pct:31.75, retailRate:428.60, tradePerKg:450,    tradePerUnit:22.50, mrp:36,  marginPct:'60%' },
  { sr:'3',  product:'Sunday Masala',        size:'₹10',    sackPack:'₹136 / 4.5kg',      coBasicRate:420.53, distLanding:441.56, margin8pct:42.05, retailRate:462.60, tradePerKg:485.71, tradePerUnit:6.80,  mrp:10,  marginPct:'47%' },
  { sr:'4',  product:'Pickle Masala',        size:'100g',   sackPack:'5',                 coBasicRate:264.55, distLanding:277.78, margin8pct:21.16, retailRate:285.70, tradePerKg:300,    tradePerUnit:30,    mrp:60,  marginPct:'100%' },
  { sr:'5',  product:'Papad Masala',         size:'100g',   sackPack:'5',                 coBasicRate:330.69, distLanding:347.22, margin8pct:26.46, retailRate:357.10, tradePerKg:375,    tradePerUnit:37.50, mrp:75,  marginPct:'100%' },
  { sr:'6',  product:'Papad Aata',           size:'1kg',    sackPack:'5',                 coBasicRate:164.02, distLanding:172.22, margin8pct:13.12, retailRate:177.10, tradePerKg:186,    tradePerUnit:186,   mrp:298, marginPct:'60%' },
  { sr:'7',  product:'Chiwda Masala',        size:'100g',   sackPack:'5',                 coBasicRate:308.64, distLanding:324.07, margin8pct:24.69, retailRate:333.30, tradePerKg:350,    tradePerUnit:35,    mrp:70,  marginPct:'100%' },
  { sr:'7',  product:'Chiwda Masala',        size:'50g',    sackPack:'5',                 coBasicRate:308.64, distLanding:324.07, margin8pct:24.69, retailRate:333.30, tradePerKg:350,    tradePerUnit:17.50, mrp:35,  marginPct:'100%' },
  { sr:'8',  product:'Super Garam, Sambar',  size:'200g',   sackPack:'5',                 coBasicRate:359.31, distLanding:377.27, margin8pct:35.93, retailRate:395.20, tradePerKg:415,    tradePerUnit:83,    mrp:166, marginPct:'100%' },
  { sr:'9',  product:'Kitchen King, Pav Bhaji, Chhole, Chaat', size:'200g', sackPack:'5', coBasicRate:389.61, distLanding:409.09, margin8pct:38.96, retailRate:428.60, tradePerKg:450,    tradePerUnit:90,    mrp:180, marginPct:'100%' },
  { sr:'10', product:'Garam, Tandoori, Paneer, Chicken, Meat', size:'200g', sackPack:'5', coBasicRate:476.19, distLanding:500.00, margin8pct:47.62, retailRate:523.80, tradePerKg:550,    tradePerUnit:110,   mrp:220, marginPct:'100%' },
  { sr:'11', product:'Shahi Biryani',        size:'200g',   sackPack:'5',                 coBasicRate:735.93, distLanding:772.73, margin8pct:73.59, retailRate:809.50, tradePerKg:850,    tradePerUnit:170,   mrp:340, marginPct:'100%' },
  { sr:'12', product:'Kitchen King, Chicken, Meat', size:'₹5', sackPack:'₹148 / 6kg',    coBasicRate:533.91, distLanding:560.61, margin8pct:53.39, retailRate:587.30, tradePerKg:616.67, tradePerUnit:3.70,  mrp:5,   marginPct:'35%' },
  { sr:'13', product:'Shahi Biryani',        size:'₹10',    sackPack:'₹148 / 4kg',        coBasicRate:800.87, distLanding:840.91, margin8pct:80.09, retailRate:881.00, tradePerKg:925,    tradePerUnit:7.40,  mrp:10,  marginPct:'35%' },
  { sr:'13', product:'Shahi Biryani',        size:'₹5',     sackPack:'₹148 / 4kg',        coBasicRate:800.87, distLanding:840.91, margin8pct:80.09, retailRate:881.00, tradePerKg:925,    tradePerUnit:3.70,  mrp:5,   marginPct:'35%' },
  { sr:'14', product:'Spl. Papad (Udad Moong)', size:'500g', sackPack:'12',               coBasicRate:211.64, distLanding:222.22, margin8pct:16.93, retailRate:228.57, tradePerKg:240,    tradePerUnit:120,   mrp:180, marginPct:'50%' },
  { sr:'14', product:'Spl. Papad (Udad Moong)', size:'200g', sackPack:'12',               coBasicRate:211.64, distLanding:222.22, margin8pct:16.93, retailRate:228.57, tradePerKg:240,    tradePerUnit:48,    mrp:96,  marginPct:'100%' },
  { sr:'14', product:'Spl. Papad',           size:'₹10 / 4"',sackPack:'₹200 / 10kg',      coBasicRate:277.06, distLanding:290.91, margin8pct:27.71, retailRate:304.76, tradePerKg:320,    tradePerUnit:8.00,  mrp:10,  marginPct:'25%' },
  { sr:'—',  product:'Disco Papad',          size:'1kg',    sackPack:'12',                coBasicRate:194.00, distLanding:203.70, margin8pct:15.52, retailRate:210.00, tradePerKg:220,    tradePerUnit:220,   mrp:330, marginPct:'50%' },
  { sr:'—',  product:'Punjabi 7" Masala Papad', size:'1kg', sackPack:'12',                coBasicRate:198.41, distLanding:208.33, margin8pct:15.87, retailRate:214.29, tradePerKg:225,    tradePerUnit:225,   mrp:315, marginPct:'40%' },
  { sr:'15', product:'Best Jeera',           size:'50g',    sackPack:'5',                 coBasicRate:370.37, distLanding:388.89, margin8pct:29.63, retailRate:400.00, tradePerKg:420,    tradePerUnit:21,    mrp:28,  marginPct:'33%' },
  { sr:'15', product:'Best Jeera',           size:'₹10',    sackPack:'₹150 / 4.8kg',      coBasicRate:432.90, distLanding:454.55, margin8pct:43.29, retailRate:476.20, tradePerKg:500,    tradePerUnit:7.50,  mrp:10,  marginPct:'33%' },
  { sr:'16', product:'Khamnni Mustard',      size:'50g',    sackPack:'5',                 coBasicRate:198.41, distLanding:208.33, margin8pct:15.87, retailRate:214.30, tradePerKg:225,    tradePerUnit:11.25, mrp:15,  marginPct:'33%' },
  { sr:'16', product:'Khamnni Mustard',      size:'₹5',     sackPack:'₹75 / 4.16kg',      coBasicRate:249.75, distLanding:262.24, margin8pct:24.98, retailRate:274.70, tradePerKg:288.46, tradePerUnit:3.75,  mrp:5,   marginPct:'33%' },
];

/** Products 17–30 · chilli, turmeric, coriander powders, KPT range, and pickles. */
export const PRICE_LIST_17_30: PriceRow[] = [
  { sr:'17', product:'Deth Kadhleli Mirchi Powder', size:'1kg',   sackPack:'5',            coBasicRate:881.83, distLanding:925.93, margin8pct:70.55, retailRate:952.40, tradePerKg:1000, tradePerUnit:1000, mrp:1400, marginPct:'40%' },
  { sr:'17', product:'Deth Kadhleli Mirchi Powder', size:'200g',  sackPack:'5',            coBasicRate:881.83, distLanding:925.93, margin8pct:70.55, retailRate:952.40, tradePerKg:1000, tradePerUnit:200,  mrp:280,  marginPct:'40%' },
  { sr:'18', product:'Byadgi Mirchi Powder',        size:'1kg',   sackPack:'5',            coBasicRate:661.38, distLanding:694.44, margin8pct:52.91, retailRate:714.30, tradePerKg:750,  tradePerUnit:750,  mrp:1050, marginPct:'40%' },
  { sr:'18', product:'Byadgi Mirchi Powder',        size:'200g',  sackPack:'5',            coBasicRate:661.38, distLanding:694.44, margin8pct:52.91, retailRate:714.30, tradePerKg:750,  tradePerUnit:150,  mrp:210,  marginPct:'40%' },
  { sr:'19', product:'Spl Mirchi Powder',           size:'1kg',   sackPack:'5',            coBasicRate:440.92, distLanding:462.96, margin8pct:35.27, retailRate:476.20, tradePerKg:500,  tradePerUnit:500,  mrp:800,  marginPct:'60%' },
  { sr:'19', product:'Spl Mirchi Powder',           size:'500g',  sackPack:'5',            coBasicRate:440.92, distLanding:462.96, margin8pct:35.27, retailRate:476.20, tradePerKg:500,  tradePerUnit:250,  mrp:400,  marginPct:'60%' },
  { sr:'19', product:'Spl Mirchi Powder',           size:'200g',  sackPack:'5',            coBasicRate:440.92, distLanding:462.96, margin8pct:35.27, retailRate:476.20, tradePerKg:500,  tradePerUnit:100,  mrp:160,  marginPct:'60%' },
  { sr:'19', product:'Spl Mirchi Powder',           size:'₹10',   sackPack:'₹136 / 3.84kg',coBasicRate:490.62, distLanding:515.15, margin8pct:49.06, retailRate:539.70, tradePerKg:567,  tradePerUnit:6.80, mrp:10,   marginPct:'47%' },
  { sr:'19', product:'Spl Mirchi Powder',           size:'₹5',    sackPack:'₹136 / 3.84kg',coBasicRate:490.62, distLanding:515.15, margin8pct:49.06, retailRate:539.70, tradePerKg:567,  tradePerUnit:3.40, mrp:5,    marginPct:'47%' },
  { sr:'20', product:'Agmark Mirchi Powder',        size:'1kg',   sackPack:'5',            coBasicRate:343.92, distLanding:361.11, margin8pct:27.51, retailRate:371.40, tradePerKg:390,  tradePerUnit:390,  mrp:624,  marginPct:'60%' },
  { sr:'20', product:'Agmark Mirchi Powder',        size:'500g',  sackPack:'5',            coBasicRate:343.92, distLanding:361.11, margin8pct:27.51, retailRate:371.40, tradePerKg:390,  tradePerUnit:195,  mrp:312,  marginPct:'60%' },
  { sr:'20', product:'Agmark Mirchi Powder',        size:'200g',  sackPack:'5',            coBasicRate:343.92, distLanding:361.11, margin8pct:27.51, retailRate:371.40, tradePerKg:390,  tradePerUnit:78,   mrp:125,  marginPct:'60%' },
  { sr:'20', product:'Agmark Mirchi Powder',        size:'100g',  sackPack:'5',            coBasicRate:348.32, distLanding:365.74, margin8pct:27.87, retailRate:376.20, tradePerKg:395,  tradePerUnit:39.50,mrp:63,   marginPct:'59%' },
  { sr:'20', product:'Agmark Mirchi Powder',        size:'50g',   sackPack:'5',            coBasicRate:352.73, distLanding:370.37, margin8pct:28.22, retailRate:381.00, tradePerKg:400,  tradePerUnit:20,   mrp:32,   marginPct:'60%' },
  { sr:'21', product:'Spl Halad Powder',            size:'500g',  sackPack:'5',            coBasicRate:330.69, distLanding:347.22, margin8pct:26.46, retailRate:357.00, tradePerKg:375,  tradePerUnit:187.50,mrp:300, marginPct:'60%' },
  { sr:'21', product:'Spl Halad Powder',            size:'200g',  sackPack:'5',            coBasicRate:330.69, distLanding:347.22, margin8pct:26.46, retailRate:357.00, tradePerKg:375,  tradePerUnit:75,   mrp:120,  marginPct:'60%' },
  { sr:'21', product:'Spl Halad Powder',            size:'₹10',   sackPack:'₹136 / 5.12kg',coBasicRate:367.97, distLanding:386.36, margin8pct:36.80, retailRate:404.80, tradePerKg:425,  tradePerUnit:6.80, mrp:10,   marginPct:'47%' },
  { sr:'21', product:'Spl Halad Powder',            size:'₹5',    sackPack:'₹136 / 5.12kg',coBasicRate:367.97, distLanding:386.36, margin8pct:36.80, retailRate:404.80, tradePerKg:425,  tradePerUnit:3.40, mrp:5,    marginPct:'47%' },
  { sr:'22', product:'Agmark Halad Powder',         size:'1kg',   sackPack:'5',            coBasicRate:317.46, distLanding:333.33, margin8pct:25.40, retailRate:342.90, tradePerKg:360,  tradePerUnit:360,  mrp:576,  marginPct:'60%' },
  { sr:'22', product:'Agmark Halad Powder',         size:'200g',  sackPack:'5',            coBasicRate:317.46, distLanding:333.33, margin8pct:25.40, retailRate:342.90, tradePerKg:360,  tradePerUnit:72,   mrp:115,  marginPct:'60%' },
  { sr:'22', product:'Agmark Halad Powder',         size:'100g',  sackPack:'5',            coBasicRate:321.87, distLanding:337.96, margin8pct:25.75, retailRate:347.60, tradePerKg:365,  tradePerUnit:36.50,mrp:58,   marginPct:'59%' },
  { sr:'22', product:'Agmark Halad Powder',         size:'50g',   sackPack:'5',            coBasicRate:326.28, distLanding:342.59, margin8pct:26.10, retailRate:352.40, tradePerKg:370,  tradePerUnit:18.50,mrp:30,   marginPct:'62%' },
  { sr:'23', product:'Spl Dhana Powder',            size:'1kg',   sackPack:'5',            coBasicRate:292.77, distLanding:307.41, margin8pct:23.42, retailRate:316.20, tradePerKg:332,  tradePerUnit:332,  mrp:531,  marginPct:'60%' },
  { sr:'23', product:'Spl Dhana Powder',            size:'500g',  sackPack:'5',            coBasicRate:296.30, distLanding:311.11, margin8pct:23.70, retailRate:320.00, tradePerKg:336,  tradePerUnit:168,  mrp:269,  marginPct:'60%' },
  { sr:'23', product:'Spl Dhana Powder',            size:'200g',  sackPack:'5',            coBasicRate:299.82, distLanding:314.81, margin8pct:23.99, retailRate:323.80, tradePerKg:340,  tradePerUnit:68,   mrp:109,  marginPct:'60%' },
  { sr:'23', product:'Spl Dhana Powder',            size:'100g',  sackPack:'5',            coBasicRate:304.23, distLanding:319.44, margin8pct:24.34, retailRate:328.60, tradePerKg:345,  tradePerUnit:34.50,mrp:55,   marginPct:'59%' },
  { sr:'23', product:'Spl Dhana Powder',            size:'50g',   sackPack:'5',            coBasicRate:308.64, distLanding:324.07, margin8pct:24.69, retailRate:333.30, tradePerKg:350,  tradePerUnit:17.50,mrp:28,   marginPct:'60%' },
  { sr:'23', product:'Spl Dhana Powder',            size:'₹10',   sackPack:'₹136 / 5.76kg',coBasicRate:327.08, distLanding:343.43, margin8pct:32.71, retailRate:359.80, tradePerKg:377.78,tradePerUnit:6.80,mrp:10,   marginPct:'47%' },
  { sr:'23', product:'Spl Dhana Powder',            size:'₹5',    sackPack:'₹136 / 5.76kg',coBasicRate:327.08, distLanding:343.43, margin8pct:32.71, retailRate:359.80, tradePerKg:377.78,tradePerUnit:3.40,mrp:5,    marginPct:'47%' },
  { sr:'24', product:'KPT Mirchi Powder',           size:'1kg',   sackPack:'5',            coBasicRate:308.64, distLanding:324.07, margin8pct:24.69, retailRate:333.30, tradePerKg:350,  tradePerUnit:350,  mrp:560,  marginPct:'60%' },
  { sr:'24', product:'KPT Mirchi Powder',           size:'500g',  sackPack:'5',            coBasicRate:308.64, distLanding:324.07, margin8pct:24.69, retailRate:333.30, tradePerKg:350,  tradePerUnit:175,  mrp:280,  marginPct:'60%' },
  { sr:'24', product:'KPT Mirchi Powder',           size:'200g',  sackPack:'5',            coBasicRate:308.64, distLanding:324.07, margin8pct:24.69, retailRate:333.30, tradePerKg:350,  tradePerUnit:70,   mrp:112,  marginPct:'50%' },
  { sr:'25', product:'KPT Halad Pwdr',              size:'500g',  sackPack:'5',            coBasicRate:299.82, distLanding:314.81, margin8pct:23.99, retailRate:323.80, tradePerKg:340,  tradePerUnit:170,  mrp:272,  marginPct:'60%' },
  { sr:'26', product:'KPT Dhana Pwdr',              size:'500g',  sackPack:'5',            coBasicRate:277.78, distLanding:291.67, margin8pct:22.22, retailRate:300.00, tradePerKg:315,  tradePerUnit:157.50,mrp:252, marginPct:'60%' },
  { sr:'27', product:'Chunda, Murabba, Sweet Mango / Mango, Mix, Lime, etc.', size:'1kg',   sackPack:'12',   coBasicRate:141.09, distLanding:148.15, margin8pct:11.29, retailRate:152.38, tradePerKg:160, tradePerUnit:160, mrp:320, marginPct:'100%' },
  { sr:'27', product:'Same (Chunda, Murabba, Sweet Mango…)', size:'500g',  sackPack:'5',    coBasicRate:167.55, distLanding:175.93, margin8pct:13.40, retailRate:180.95, tradePerKg:190, tradePerUnit:95,  mrp:150, marginPct:'58%' },
  { sr:'27', product:'Same (Chunda, Murabba, Sweet Mango…)', size:'350g',  sackPack:'5.25', coBasicRate:194.00, distLanding:203.70, margin8pct:15.52, retailRate:209.52, tradePerKg:220, tradePerUnit:77,  mrp:108, marginPct:'40%' },
  { sr:'27', product:'Same (Chunda, Murabba, Sweet Mango…)', size:'200g',  sackPack:'3',    coBasicRate:229.28, distLanding:240.74, margin8pct:18.34, retailRate:247.62, tradePerKg:260, tradePerUnit:52,  mrp:73,  marginPct:'40%' },
  { sr:'27', product:'Same (Chunda, Murabba, Sweet Mango…)', size:'100g',  sackPack:'2',    coBasicRate:246.91, distLanding:259.26, margin8pct:19.75, retailRate:266.67, tradePerKg:280, tradePerUnit:28,  mrp:39,  marginPct:'39%' },
  { sr:'28', product:'Mango, Mix',                  size:'5kg',    sackPack:'20',           coBasicRate:68.78,  distLanding:72.22,  margin8pct:5.50,  retailRate:74.29,  tradePerKg:78,  tradePerUnit:390, mrp:585, marginPct:'50%' },
  { sr:'28', product:'Mango, Mix',                  size:'2kg',    sackPack:'18',           coBasicRate:85.98,  distLanding:90.28,  margin8pct:6.88,  retailRate:92.86,  tradePerKg:98,  tradePerUnit:195, mrp:293, marginPct:'50%' },
  { sr:'28', product:'Mango, Mix',                  size:'KP_1kg', sackPack:'12',           coBasicRate:110.23, distLanding:115.74, margin8pct:8.82,  retailRate:119.05, tradePerKg:125, tradePerUnit:125, mrp:250, marginPct:'100%' },
  { sr:'29', product:'Lime, Lime-Chilli, Sweet Lime, Lemon Crush', size:'5kg', sackPack:'20',coBasicRate:77.60,  distLanding:81.48,  margin8pct:6.21,  retailRate:83.81,  tradePerKg:88,  tradePerUnit:440, mrp:660, marginPct:'50%' },
  { sr:'29', product:'Lime, Lime-Chilli, Sweet Lime, Lemon Crush', size:'2kg', sackPack:'18',coBasicRate:88.18,  distLanding:92.59,  margin8pct:7.05,  retailRate:95.24,  tradePerKg:100, tradePerUnit:200, mrp:300, marginPct:'50%' },
  { sr:'30', product:'Chunda, Murabba, Sweet Mango', size:'5kg',   sackPack:'20',           coBasicRate:120.81, distLanding:126.85, margin8pct:9.66,  retailRate:130.48, tradePerKg:137, tradePerUnit:685, mrp:1028,marginPct:'50%' },
  { sr:'30', product:'Chunda, Murabba, Sweet Mango', size:'2kg',   sackPack:'18',           coBasicRate:127.87, distLanding:134.26, margin8pct:10.23, retailRate:138.10, tradePerKg:145, tradePerUnit:290, mrp:435, marginPct:'50%' },
  { sr:'30', product:'Mango & Mix Pouch',            size:'₹10',   sackPack:'₹69 / 10kg',   coBasicRate:149.35, distLanding:156.82, margin8pct:14.94, retailRate:164.30, tradePerKg:172.50, tradePerUnit:6.90, mrp:10, marginPct:'45%' },
  { sr:'30', product:'Mango & Mix Pouch',            size:'₹5',    sackPack:'₹69 / 10kg',   coBasicRate:149.35, distLanding:156.82, margin8pct:14.94, retailRate:164.30, tradePerKg:172.50, tradePerUnit:3.45, mrp:5,  marginPct:'45%' },
];

export type WeightRow = {
  product: string;
  value: string;
  pouchWeight: string;
  pouchesPerHanger: string;
  hangerWeight: string;
  hangersPerSack: string;
  sackWeight: string;
  tradePerPouch: string;
  tradePerHanger: string;
};

/** ₹5 & ₹10 packaging reference · effective 02-06-2026. */
export const WEIGHTS_TABLE: WeightRow[] = [
  { product:'KLM ₹5',                                        value:'₹5',  pouchWeight:'10g', pouchesPerHanger:'40', hangerWeight:'400g', hangersPerSack:'16 H', sackWeight:'6.40kg', tradePerPouch:'₹3.40', tradePerHanger:'₹136' },
  { product:'KLM ₹10',                                       value:'₹10', pouchWeight:'20g', pouchesPerHanger:'20', hangerWeight:'400g', hangersPerSack:'16 H', sackWeight:'6.40kg', tradePerPouch:'₹6.80', tradePerHanger:'₹136' },
  { product:'Chatpat ₹5',                                    value:'₹5',  pouchWeight:'10g', pouchesPerHanger:'40', hangerWeight:'400g', hangersPerSack:'16 H', sackWeight:'6.40kg', tradePerPouch:'₹3.40', tradePerHanger:'₹136' },
  { product:'Chatpat ₹10',                                   value:'₹10', pouchWeight:'20g', pouchesPerHanger:'20', hangerWeight:'400g', hangersPerSack:'16 H', sackWeight:'6.40kg', tradePerPouch:'₹6.80', tradePerHanger:'₹136' },
  { product:'Spl Goda ₹5',                                   value:'₹5',  pouchWeight:'7g',  pouchesPerHanger:'40', hangerWeight:'280g', hangersPerSack:'16 H', sackWeight:'4.48kg', tradePerPouch:'₹3.40', tradePerHanger:'₹136' },
  { product:'Sunday ₹10',                                    value:'₹10', pouchWeight:'14g', pouchesPerHanger:'20', hangerWeight:'280g', hangersPerSack:'16 H', sackWeight:'4.48kg', tradePerPouch:'₹6.80', tradePerHanger:'₹136' },
  { product:'Spl Chilli ₹5',                                 value:'₹5',  pouchWeight:'6g',  pouchesPerHanger:'40', hangerWeight:'240g', hangersPerSack:'16 H', sackWeight:'3.84kg', tradePerPouch:'₹3.40', tradePerHanger:'₹136' },
  { product:'Spl Chilli ₹10',                                value:'₹10', pouchWeight:'12g', pouchesPerHanger:'20', hangerWeight:'240g', hangersPerSack:'16 H', sackWeight:'3.84kg', tradePerPouch:'₹6.80', tradePerHanger:'₹136' },
  { product:'Spl Haldi ₹5',                                  value:'₹5',  pouchWeight:'8g',  pouchesPerHanger:'40', hangerWeight:'320g', hangersPerSack:'16 H', sackWeight:'5.12kg', tradePerPouch:'₹3.40', tradePerHanger:'₹136' },
  { product:'Spl Haldi ₹10',                                 value:'₹10', pouchWeight:'16g', pouchesPerHanger:'20', hangerWeight:'320g', hangersPerSack:'16 H', sackWeight:'5.12kg', tradePerPouch:'₹6.80', tradePerHanger:'₹136' },
  { product:'Spl Dhana ₹5',                                  value:'₹5',  pouchWeight:'9g',  pouchesPerHanger:'40', hangerWeight:'360g', hangersPerSack:'16 H', sackWeight:'5.76kg', tradePerPouch:'₹3.40', tradePerHanger:'₹136' },
  { product:'Spl Dhana ₹10',                                 value:'₹10', pouchWeight:'18g', pouchesPerHanger:'20', hangerWeight:'360g', hangersPerSack:'16 H', sackWeight:'5.76kg', tradePerPouch:'₹6.80', tradePerHanger:'₹136' },
  { product:'Kitchen King / Pav Bhaji / Chaat / Chhole ₹5',  value:'₹5',  pouchWeight:'6g',  pouchesPerHanger:'40', hangerWeight:'240g', hangersPerSack:'25 H', sackWeight:'6.00kg', tradePerPouch:'₹3.70', tradePerHanger:'₹148' },
  { product:'Chicken / Mutton / Garam / Paneer / Tandoori ₹5',value:'₹5',pouchWeight:'6g',  pouchesPerHanger:'40', hangerWeight:'240g', hangersPerSack:'25 H', sackWeight:'6.00kg', tradePerPouch:'₹3.70', tradePerHanger:'₹148' },
  { product:'Briyani ₹5',                                    value:'₹5',  pouchWeight:'4g',  pouchesPerHanger:'40', hangerWeight:'160g', hangersPerSack:'25 H', sackWeight:'4.00kg', tradePerPouch:'₹3.70', tradePerHanger:'₹148' },
  { product:'Briyani ₹10',                                   value:'₹10', pouchWeight:'8g',  pouchesPerHanger:'20', hangerWeight:'160g', hangersPerSack:'25 H', sackWeight:'4.00kg', tradePerPouch:'₹7.40', tradePerHanger:'₹148' },
  { product:'Mango Pickle ₹5',                               value:'₹5',  pouchWeight:'20g', pouchesPerHanger:'20', hangerWeight:'400g', hangersPerSack:'25 B', sackWeight:'10.00kg',tradePerPouch:'₹3.45', tradePerHanger:'₹69'  },
  { product:'Mango Pickle ₹10',                              value:'₹10', pouchWeight:'40g', pouchesPerHanger:'20', hangerWeight:'800g', hangersPerSack:'12.5 B',sackWeight:'10.00kg',tradePerPouch:'₹6.90', tradePerHanger:'₹138' },
  { product:'Mix Pickle ₹5',                                 value:'₹5',  pouchWeight:'20g', pouchesPerHanger:'20', hangerWeight:'400g', hangersPerSack:'25 B', sackWeight:'10.00kg',tradePerPouch:'₹3.45', tradePerHanger:'₹69'  },
  { product:'Spl Papad ₹10',                                 value:'₹10', pouchWeight:'25g', pouchesPerHanger:'25', hangerWeight:'625g', hangersPerSack:'16 H', sackWeight:'10.00kg',tradePerPouch:'₹8.00', tradePerHanger:'₹200' },
  { product:'Jeera ₹10',                                     value:'₹10', pouchWeight:'15g', pouchesPerHanger:'20', hangerWeight:'300g', hangersPerSack:'16 H', sackWeight:'4.80kg', tradePerPouch:'₹7.50', tradePerHanger:'₹150' },
  { product:'Mohri ₹5',                                      value:'₹5',  pouchWeight:'13g', pouchesPerHanger:'20', hangerWeight:'260g', hangersPerSack:'16 H', sackWeight:'4.16kg', tradePerPouch:'₹3.75', tradePerHanger:'₹75'  },
];
