export const boardCatalogue = [
  { key: "CBSE", name: "Central Board of Secondary Education", country: "IN", regions: ["IN"], grades: ["PRE_PRIMARY","PRIMARY","MIDDLE","SECONDARY","SENIOR_SECONDARY"] },
  { key: "CISCE_ICSE", name: "Council for the Indian School Certificate Examinations (ICSE)", country: "IN", regions: ["IN"], grades: ["PRE_PRIMARY","PRIMARY","MIDDLE","SECONDARY"] },
  { key: "CISCE_ISC", name: "Council for the Indian School Certificate Examinations (ISC)", country: "IN", regions: ["IN"], grades: ["SENIOR_SECONDARY"] },
  { key: "STATE", name: "State Board (school-configured)", country: "IN", regions: ["IN"], grades: ["PRE_PRIMARY","PRIMARY","MIDDLE","SECONDARY","SENIOR_SECONDARY"] },
  { key: "IB", name: "International Baccalaureate", country: "CH", regions: ["GLOBAL"], grades: ["PYP","MYP","DP","CP"] },
  { key: "IGCSE", name: "Cambridge International (IGCSE)", country: "GB", regions: ["GLOBAL"], grades: ["PRIMARY","LOWER_SECONDARY","UPPER_SECONDARY","ADVANCED"] },
  { key: "CUSTOM", name: "Custom / Other curriculum", country: "ZZ", regions: ["GLOBAL"], grades: ["CUSTOM"] }
] as const;

export const gradeStageCatalogue = [
  { key: "PRE_PRIMARY", label: "Pre-primary" },
  { key: "PRIMARY", label: "Primary" },
  { key: "MIDDLE", label: "Middle" },
  { key: "SECONDARY", label: "Secondary" },
  { key: "SENIOR_SECONDARY", label: "Senior secondary" },
  { key: "PYP", label: "Primary Years Programme" },
  { key: "MYP", label: "Middle Years Programme" },
  { key: "DP", label: "Diploma Programme" },
  { key: "CP", label: "Career-related Programme" },
  { key: "LOWER_SECONDARY", label: "Lower secondary" },
  { key: "UPPER_SECONDARY", label: "Upper secondary" },
  { key: "ADVANCED", label: "Advanced level" },
  { key: "CUSTOM", label: "Custom stage" }
] as const;
