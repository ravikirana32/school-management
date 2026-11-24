/**
 * P411 starter board/curriculum pack metadata.
 * These are configuration aids, NOT official syllabi or board-approved content.
 * Schools must review and localize stages/domains before applying them.
 */
export const boardCurriculumPacks = [
  {
    packId: "IN-CBSE-STARTER",
    boardKey: "CBSE",
    displayName: "CBSE starter framework",
    jurisdiction: { country: "IN", region: null },
    stageKeys: ["PRE_PRIMARY", "PRIMARY", "MIDDLE", "SECONDARY", "SENIOR_SECONDARY"],
    competencyDomains: ["LANGUAGE_AND_COMMUNICATION", "MATHEMATICS", "SCIENCE", "SOCIAL_SCIENCE", "ARTS_AND_CULTURE", "PHYSICAL_WELLBEING", "DIGITAL_LITERACY", "VOCATIONAL_AND_LIFE_SKILLS"],
    configurationGuidance: ["Map locally approved grade/subject outcomes to the school curriculum version.", "Record source references and effective dates for imported syllabus content."],
    provenance: "Starter metadata authored for configuration; not an official CBSE syllabus or outcome list.",
    contentStatus: "STARTER_METADATA"
  },
  {
    packId: "IN-CISCE-ICSE-STARTER",
    boardKey: "CISCE_ICSE",
    displayName: "ICSE starter framework",
    jurisdiction: { country: "IN", region: null },
    stageKeys: ["PRE_PRIMARY", "PRIMARY", "MIDDLE", "SECONDARY"],
    competencyDomains: ["LANGUAGE_AND_LITERATURE", "MATHEMATICS", "SCIENCES", "HUMANITIES", "ARTS", "APPLICATION_AND_SKILLS", "PHYSICAL_EDUCATION"],
    configurationGuidance: ["Map subjects and outcomes to the school-approved ICSE scope.", "Review assessment and subject requirements against current board guidance."],
    provenance: "Starter metadata authored for configuration; not official CISCE curriculum content.",
    contentStatus: "STARTER_METADATA"
  },
  {
    packId: "IN-CISCE-ISC-STARTER",
    boardKey: "CISCE_ISC",
    displayName: "ISC starter framework",
    jurisdiction: { country: "IN", region: null },
    stageKeys: ["SENIOR_SECONDARY"],
    competencyDomains: ["LANGUAGE_AND_LITERATURE", "SCIENCES", "MATHEMATICS", "COMMERCE", "HUMANITIES", "ARTS_AND_APPLICATIONS"],
    configurationGuidance: ["Configure school-offered subject combinations from current ISC guidance.", "Verify prerequisites and assessment scheme before publishing a curriculum version."],
    provenance: "Starter metadata authored for configuration; not official CISCE syllabus content.",
    contentStatus: "STARTER_METADATA"
  },
  {
    packId: "IN-STATE-BOARD-STARTER",
    boardKey: "STATE",
    displayName: "State board configurable starter",
    jurisdiction: { country: "IN", region: "SCHOOL_CONFIGURED" },
    stageKeys: ["PRE_PRIMARY", "PRIMARY", "MIDDLE", "SECONDARY", "SENIOR_SECONDARY"],
    competencyDomains: ["LANGUAGES", "MATHEMATICS", "SCIENCES", "SOCIAL_SCIENCES", "ARTS", "WORK_AND_SKILLS", "HEALTH_AND_PHYSICAL_EDUCATION"],
    configurationGuidance: ["Select the state/region before loading any locally maintained content.", "Do not treat this generic starter as a state-specific syllabus; enter current approved source references."],
    provenance: "Generic starter metadata; state-specific content is intentionally not supplied.",
    contentStatus: "STARTER_METADATA"
  },
  {
    packId: "GLOBAL-IB-STARTER",
    boardKey: "IB",
    displayName: "IB programme starter framework",
    jurisdiction: { country: "CH", region: "GLOBAL" },
    stageKeys: ["PYP", "MYP", "DP", "CP"],
    competencyDomains: ["LANGUAGE_AND_LITERATURE", "LANGUAGE_ACQUISITION", "INDIVIDUALS_AND_SOCIETIES", "SCIENCES", "MATHEMATICS", "ARTS", "DESIGN", "INTERDISCIPLINARY_INQUIRY", "REFLECTION_AND_SERVICE"],
    configurationGuidance: ["Treat programme and subject configuration as school-reviewed metadata.", "Link each mapped outcome to its source document and programme/version."],
    provenance: "Starter metadata authored for configuration; not official IB programme content.",
    contentStatus: "STARTER_METADATA"
  },
  {
    packId: "GLOBAL-IGCSE-STARTER",
    boardKey: "IGCSE",
    displayName: "Cambridge International starter framework",
    jurisdiction: { country: "GB", region: "GLOBAL" },
    stageKeys: ["PRIMARY", "LOWER_SECONDARY", "UPPER_SECONDARY", "ADVANCED"],
    competencyDomains: ["LANGUAGES", "MATHEMATICS", "SCIENCES", "HUMANITIES_AND_SOCIAL_SCIENCES", "CREATIVE_AND_VOCATIONAL", "DIGITAL_AND_APPLIED_SKILLS"],
    configurationGuidance: ["Configure subjects from the school-selected current syllabus codes.", "Track syllabus edition and assessment component separately for each subject."],
    provenance: "Starter metadata authored for configuration; not official Cambridge syllabus content.",
    contentStatus: "STARTER_METADATA"
  },
  {
    packId: "GLOBAL-CUSTOM-STARTER",
    boardKey: "CUSTOM",
    displayName: "Custom curriculum starter",
    jurisdiction: { country: "ZZ", region: "SCHOOL_CONFIGURED" },
    stageKeys: ["CUSTOM"],
    competencyDomains: ["CUSTOM_DOMAIN"],
    configurationGuidance: ["Define locally approved stages, domains, outcomes, subjects, and assessment mappings.", "Keep source references and review dates with custom content."],
    provenance: "Blank configurable starter; no external curriculum content included.",
    contentStatus: "STARTER_METADATA"
  }
] as const;


export function getBoardCurriculumPack(boardKey: string) {
  return boardCurriculumPacks.find(pack => pack.boardKey === boardKey) ?? null;
}
