export const MALE_NAMES = [
  "Rajesh", "Amit", "Suresh", "Vikram", "Arjun", "Rohit", "Manoj", "Sanjay",
  "Prakash", "Anil", "Kiran", "Ramesh", "Deepak", "Ashok", "Nikhil", "Sandeep",
  "Alok", "Ravi", "Mahesh", "Ganesh", "Sameer", "Tushar", "Vivek", "Harish",
  "Naveen", "Pankaj", "Dinesh", "Girish", "Satish", "Mohan", "Kunal", "Abhishek",
  "Siddharth", "Gaurav", "Nitin", "Vinay", "Harsha", "Karthik", "Pranav", "Aditya",
];

export const FEMALE_NAMES = [
  "Sunita", "Anita", "Priya", "Kavita", "Meena", "Rekha", "Pooja", "Swati",
  "Neha", "Shalini", "Lakshmi", "Radhika", "Sneha", "Divya", "Anjali", "Ritu",
  "Savita", "Nirmala", "Asha", "Usha", "Geeta", "Seema", "Manisha", "Varsha",
  "Aarti", "Bhavna", "Chitra", "Deepika", "Farah", "Gauri", "Hema", "Ishita",
  "Jyoti", "Kiran", "Madhuri", "Namrata", "Pallavi", "Ranjana", "Saroj", "Tanvi",
];

export const LAST_NAMES = [
  "Sharma", "Verma", "Gupta", "Patel", "Mehta", "Iyer", "Nair", "Reddy",
  "Rao", "Joshi", "Kulkarni", "Deshmukh", "Banerjee", "Chatterjee", "Ghosh", "Das",
  "Mukherjee", "Singh", "Chauhan", "Yadav", "Mishra", "Trivedi", "Bhatt", "Pillai",
  "Menon", "Nambiar", "Hegde", "Naik", "Patil", "Kapoor", "Malhotra", "Chawla",
  "Arora", "Sethi", "Khanna", "Ahuja", "Bose", "Saxena", "Srivastava", "Agarwal",
];

export interface City {
  name: string;
  state: string;
  mult: number;
  metro: boolean;
  electricity: string;
  water: string;
}

export const CITIES: City[] = [
  { name: "Mumbai", state: "Maharashtra", mult: 1.28, metro: true, electricity: "MSECL / Adani Electricity", water: "BMC Water Dept" },
  { name: "Delhi NCR", state: "Delhi", mult: 1.18, metro: true, electricity: "Tata Power Delhi", water: "DJ Jal Board" },
  { name: "Bengaluru", state: "Karnataka", mult: 1.22, metro: true, electricity: "BESCOM", water: "BWSSB" },
  { name: "Hyderabad", state: "Telangana", mult: 1.1, metro: true, electricity: "TSSPDCL", water: "HMWSSB" },
  { name: "Pune", state: "Maharashtra", mult: 1.08, metro: true, electricity: "MSEDCL", water: "Pune MC Water" },
  { name: "Chennai", state: "Tamil Nadu", mult: 1.04, metro: true, electricity: "TANGEDCO", water: "CMWSSB" },
  { name: "Kolkata", state: "West Bengal", mult: 0.95, metro: true, electricity: "WBSEDCL", water: "KMC Water" },
  { name: "Ahmedabad", state: "Gujarat", mult: 0.94, metro: false, electricity: "Torrent Power", water: "AMC Water Works" },
  { name: "Jaipur", state: "Rajasthan", mult: 0.85, metro: false, electricity: "JVVNL", water: "PHED Jaipur" },
  { name: "Lucknow", state: "Uttar Pradesh", mult: 0.8, metro: false, electricity: "UPPCL", water: "Jal Kal Lucknow" },
  { name: "Indore", state: "Madhya Pradesh", mult: 0.8, metro: false, electricity: "MPPKVVCL", water: "IMC Water" },
  { name: "Kochi", state: "Kerala", mult: 0.9, metro: false, electricity: "KSEB", water: "KWA Kerala" },
  { name: "Chandigarh", state: "Chandigarh", mult: 0.95, metro: false, electricity: "UT Electricity", water: "MC Chandigarh" },
  { name: "Coimbatore", state: "Tamil Nadu", mult: 0.84, metro: false, electricity: "TANGEDCO", water: "CMWSSB Coimbatore" },
  { name: "Nagpur", state: "Maharashtra", mult: 0.79, metro: false, electricity: "MSEDCL", water: "NMC Water" },
  { name: "Visakhapatnam", state: "Andhra Pradesh", mult: 0.85, metro: false, electricity: "APEPDCL", water: "GVMC Water" },
  { name: "Surat", state: "Gujarat", mult: 0.9, metro: false, electricity: "Torrent Power", water: "SMC Water" },
  { name: "Bhopal", state: "Madhya Pradesh", mult: 0.78, metro: false, electricity: "MPPKVVCL", water: "BMC Water" },
  { name: "Patna", state: "Bihar", mult: 0.72, metro: false, electricity: "NBPDCL", water: "PHED Patna" },
  { name: "Varanasi", state: "Uttar Pradesh", mult: 0.72, metro: false, electricity: "UPPCL", water: "Jal Sansthan" },
];

export interface Occupation {
  title: string;
  min: number; // monthly gross INR
  max: number;
  kind: "salaried" | "self" | "pension";
  sector: string;
}

export const OCCUPATIONS: Occupation[] = [
  { title: "Software Engineer", min: 45000, max: 140000, kind: "salaried", sector: "IT" },
  { title: "Senior Accountant", min: 35000, max: 80000, kind: "salaried", sector: "Finance" },
  { title: "School Teacher", min: 28000, max: 55000, kind: "salaried", sector: "Education" },
  { title: "Bank Officer", min: 32000, max: 68000, kind: "salaried", sector: "Banking" },
  { title: "HR Executive", min: 30000, max: 70000, kind: "salaried", sector: "IT" },
  { title: "Sales Executive", min: 26000, max: 62000, kind: "salaried", sector: "Retail" },
  { title: "Staff Nurse", min: 28000, max: 52000, kind: "salaried", sector: "Healthcare" },
  { title: "Govt. Clerk", min: 30000, max: 56000, kind: "salaried", sector: "Government" },
  { title: "Marketing Executive", min: 32000, max: 78000, kind: "salaried", sector: "Media" },
  { title: "Operations Analyst", min: 36000, max: 88000, kind: "salaried", sector: "Logistics" },
  { title: "Mechanical Engineer", min: 36000, max: 82000, kind: "salaried", sector: "Manufacturing" },
  { title: "Pharmacist", min: 22000, max: 42000, kind: "salaried", sector: "Healthcare" },
  { title: "Telecom Engineer", min: 34000, max: 74000, kind: "salaried", sector: "Telecom" },
  { title: "Kirana Store Owner", min: 26000, max: 70000, kind: "self", sector: "Retail" },
  { title: "Tuition Teacher", min: 16000, max: 38000, kind: "self", sector: "Education" },
  { title: "Freelance Designer", min: 22000, max: 64000, kind: "self", sector: "Creative" },
  { title: "Small Transport Contractor", min: 30000, max: 75000, kind: "self", sector: "Logistics" },
  { title: "Retired Govt. Employee", min: 14000, max: 34000, kind: "pension", sector: "Pension" },
];

export const EMPLOYERS = [
  "Nimbusoft Technologies Pvt Ltd", "BlueKite IT Solutions", "Shreeji Retail Pvt Ltd",
  "Meridian Business Services", "Sanskriti Public School", "Union Co-operative Bank",
  "LifeCare Multispeciality Hospital", "Zentro Marketing Co", "Ashwini Logistics Ltd",
  "GreenGro Agro Industries", "Prakhar Consulting LLP", "NovaEdge Technologies",
  "Kalpana Textiles Pvt Ltd", "Suryoday Finserv", "Trident Pharma Distributors",
  "Orchid City School", "Vertex Telecom Services", "Satyam Manufacturing Works",
];

export interface BankInfo {
  name: string;
  short: string;
  ifsc: string;
  accent: string;
}

export const BANKS: BankInfo[] = [
  { name: "HDFC Bank", short: "HDFC", ifsc: "HDFC0001", accent: "#1a4d8f" },
  { name: "ICICI Bank", short: "ICICI", ifsc: "ICIC0003", accent: "#ae2f25" },
  { name: "State Bank of India", short: "SBI", ifsc: "SBIN0007", accent: "#2b6cb0" },
  { name: "Axis Bank", short: "Axis", ifsc: "UTIB0002", accent: "#97144d" },
  { name: "Kotak Mahindra Bank", short: "Kotak", ifsc: "KKBK0000", accent: "#b3261e" },
  { name: "Punjab National Bank", short: "PNB", ifsc: "PUNB0112", accent: "#0f4c81" },
];

export const CARD_PRODUCTS: { bank: string; product: string; prefix: string }[] = [
  { bank: "HDFC Bank", product: "HDFC Millennia", prefix: "5244 87" },
  { bank: "HDFC Bank", product: "Regalia Gold", prefix: "5129 63" },
  { bank: "ICICI Bank", product: "ICICI Coral", prefix: "4155 22" },
  { bank: "ICICI Bank", product: "Amazon Pay ICICI", prefix: "4988 08" },
  { bank: "SBI Card", product: "SBI SimplyCLICK", prefix: "5178 30" },
  { bank: "Axis Bank", product: "Axis Flipkart", prefix: "5241 95" },
  { bank: "Kotak Mahindra", product: "Kotak League", prefix: "4755 17" },
];

export interface LoanType {
  type: string;
  min: number;
  max: number;
  rateMin: number;
  rateMax: number;
  tenureMin: number; // months
  tenureMax: number;
}

export const LOAN_TYPES: LoanType[] = [
  { type: "Home Loan", min: 1500000, max: 5500000, rateMin: 8.3, rateMax: 9.6, tenureMin: 156, tenureMax: 240 },
  { type: "Car Loan", min: 350000, max: 950000, rateMin: 8.7, rateMax: 10.8, tenureMin: 36, tenureMax: 72 },
  { type: "Two-Wheeler Loan", min: 45000, max: 160000, rateMin: 9.2, rateMax: 12.4, tenureMin: 24, tenureMax: 42 },
  { type: "Education Loan", min: 200000, max: 1000000, rateMin: 9.6, rateMax: 12.2, tenureMin: 48, tenureMax: 84 },
  { type: "Personal Loan", min: 60000, max: 500000, rateMin: 11.0, rateMax: 16.5, tenureMin: 12, tenureMax: 48 },
  { type: "Gold Loan", min: 40000, max: 300000, rateMin: 8.9, rateMax: 11.5, tenureMin: 6, tenureMax: 24 },
];

export const LOAN_LENDERS = [
  "State Bank of India", "HDFC Bank", "ICICI Bank", "LIC Housing Finance",
  "Bajaj Finserv", "PNB Housing Finance", "Kotak Mahindra Bank", "Axis Bank",
];

export type TxnCategory =
  | "salary" | "rent" | "grocery" | "utilities" | "mobile" | "internet"
  | "transport" | "food" | "shopping" | "health" | "education" | "entertainment"
  | "sip" | "insurance" | "emi" | "card-payment" | "transfer" | "other" | "income";

export const CATEGORY_META: Record<TxnCategory, { label: string; tint: string; text: string }> = {
  salary: { label: "Salary", tint: "rgba(87,224,168,0.14)", text: "#57e0a8" },
  income: { label: "Income", tint: "rgba(87,224,168,0.14)", text: "#57e0a8" },
  rent: { label: "Rent", tint: "rgba(255,209,102,0.13)", text: "#ffd166" },
  grocery: { label: "Groceries", tint: "rgba(255,166,87,0.13)", text: "#ffa657" },
  utilities: { label: "Bills", tint: "rgba(125,190,255,0.13)", text: "#7dbeff" },
  mobile: { label: "Recharge", tint: "rgba(125,190,255,0.13)", text: "#7dbeff" },
  internet: { label: "Broadband", tint: "rgba(125,190,255,0.13)", text: "#7dbeff" },
  transport: { label: "Transport", tint: "rgba(242,246,255,0.08)", text: "#c6d2e8" },
  food: { label: "Food", tint: "rgba(255,122,122,0.12)", text: "#ff9d9d" },
  shopping: { label: "Shopping", tint: "rgba(255,138,196,0.12)", text: "#ff8ac4" },
  health: { label: "Health", tint: "rgba(87,224,168,0.12)", text: "#57e0a8" },
  education: { label: "Education", tint: "rgba(255,209,102,0.13)", text: "#ffd166" },
  entertainment: { label: "Fun", tint: "rgba(255,138,196,0.12)", text: "#ff8ac4" },
  sip: { label: "SIP", tint: "rgba(195,242,77,0.12)", text: "#c3f24d" },
  insurance: { label: "Insurance", tint: "rgba(125,190,255,0.13)", text: "#7dbeff" },
  emi: { label: "EMI", tint: "rgba(255,122,122,0.12)", text: "#ff9d9d" },
  "card-payment": { label: "Card", tint: "rgba(125,190,255,0.13)", text: "#7dbeff" },
  transfer: { label: "Transfer", tint: "rgba(242,246,255,0.08)", text: "#c6d2e8" },
  other: { label: "Other", tint: "rgba(242,246,255,0.08)", text: "#c6d2e8" },
};

export const GROCERY_MERCHANTS = [
  "DMart", "BigBasket", "Reliance Smart", "More Supermarket", "Blinkit",
  "JioMart", "Sharma General Store", "Vishal Mega Mart",
];

export const FOOD_MERCHANTS = [
  "Swiggy", "Zomato", "Domino's Pizza", "Haldiram's", "McDonald's",
  "Cafe Coffee Day", "Barbeque Nation", "Wow! Momo",
];

export const TRANSPORT_MERCHANTS = [
  "Uber India", "Ola Cabs", "Rapido", "Indian Oil Petrol Pump", "HP Fuel Station",
  "Shell Petrol Pump", "IRCTC Rail Ticket",
];

export const SHOPPING_MERCHANTS = [
  "Amazon India", "Flipkart", "Myntra", "Croma", "Reliance Digital", "Ajio",
  "FirstCry", "Decathlon India",
];

export const HEALTH_MERCHANTS = ["Apollo Pharmacy", "MedPlus Mart", "1mg", "Practo Consult", "Local Clinic OPD"];
export const ENTERTAINMENT_MERCHANTS = ["Netflix", "Spotify", "BookMyShow", "PVR Cinemas", "Hotstar Premium", "Sony LIV"];
export const EDUCATION_MERCHANTS = ["DPS School Fees", "Allen Coaching Fees", "Udemy Course", "Byju's Learning", "Feynman Tuition Fees"];
export const SIP_PLATFORMS = ["Zerodha MF SIP", "Groww SIP", "Nippon India MF", "HDFC MF SIP", "Kuvera SIP"];
export const INSURERS = ["LIC of India Premium", "HDFC Ergo Health", "Star Health Insurance", "ICICI Lombard"];
export const LANDLORD_NAMES = ["R. K. Trivedi", "Smt. Nalini Deshpande", "Mohan Estates", "Green View Residency", "S. B. Kulkarni"];
export const MOBILE_PLANS = ["Jio Recharge", "Airtel Prepaid", "Vi Recharge"];
export const NET_PROVIDERS = ["ACT Fibernet", "JioFiber", "Airtel Xstream", "Hathway Broadband"];

export const COMPANY_TAN_PREFIX = ["MUMN", "DELC", "BLRE", "HYDA", "PUNM", "CHNA", "KOLK", "AHMD"];
