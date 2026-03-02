import type { RequirementGraph } from "@/lib/planner/types";

//UC BERKELEY
import { UCB_AE_REQUIREMENTS } from "@/data/colleges/ucb/ucb_ae";
import { UCB_CS_REQUIREMENTS } from "@/data/colleges/ucb/ucb_cs";
import { UCB_MECHE_REQUIREMENTS } from "@/data/colleges/ucb/ucb_meche";
import { UCB_ECON_REQUIREMENTS } from "@/data/colleges/ucb/ucb_econ";
import { UCB_EECS_REQUIREMENTS } from "@/data/colleges/ucb/ucb_eecs";
import { UCB_DS_REQUIREMENTS } from "@/data/colleges/ucb/ucb_ds";
import { UCB_BUSINESS_REQUIREMENTS } from "@/data/colleges/ucb/ucb_business";
import { UCB_APMATH_REQUIREMENTS } from "@/data/colleges/ucb/ucb_apmath";
import { UCB_STATS_REQUIREMENTS } from "@/data/colleges/ucb/ucb_stats";
// import { UCB_TEST_REQUIREMENTS } from "@/data/colleges/ucb/ucb_test";


//UCLA
import { UCLA_CS_REQUIREMENTS } from "@/data/colleges/ucla/ucla_cs";
import { UCLA_CSE_REQUIREMENTS } from "@/data/colleges/ucla/ucla_cse";
import { UCLA_AE_REQUIREMENTS } from "@/data/colleges/ucla/ucla_ae";
import { UCLA_CE_REQUIREMENTS } from "@/data/colleges/ucla/ucla_ce";
import { UCLA_EE_REQUIREMENTS } from "@/data/colleges/ucla/ucla_ee";
import { UCLA_MECHE_REQUIREMENTS } from "@/data/colleges/ucla/ucla_meche";
import { UCLA_STATS_DS_REQUIREMENTS } from "@/data/colleges/ucla/ucla_stats_ds";
import { UCLA_APMATH_REQUIREMENTS } from "@/data/colleges/ucla/ucla_apmath";
import { UCLA_MATH_REQUIREMENTS } from "@/data/colleges/ucla/ucla_math";
// import { UCLA_TEST_REQUIREMENTS } from "@/data/colleges/ucla/ucla_test";


//UCSD
import { UCSD_CS_REQUIREMENTS } from "@/data/colleges/ucsd/ucsd_cs";
import { UCSD_MATH_CS_REQUIREMENTS } from "@/data/colleges/ucsd/ucsd_math_cs";
import { UCSD_CE_REQUIREMENTS } from "@/data/colleges/ucsd/ucsd_ce";
import { UCSD_EE_REQUIREMENTS } from "@/data/colleges/ucsd/ucsd_ee";
import { UCSD_MECHE_REQUIREMENTS } from "@/data/colleges/ucsd/ucsd_meche";
import { UCSD_AE_REQUIREMENTS } from "@/data/colleges/ucsd/ucsd_ae";
import { UCSD_DS_REQUIREMENTS } from "@/data/colleges/ucsd/ucsd_ds";
import { UCSD_APMATH_REQUIREMENTS } from "@/data/colleges/ucsd/ucsd_apmath";


//UCI
import { UCI_CS_REQUIREMENTS } from "@/data/colleges/uci/uci_cs";
import { UCI_CE_REQUIREMENTS } from "@/data/colleges/uci/uci_ce";
import { UCI_EE_REQUIREMENTS } from "@/data/colleges/uci/uci_ee";
import { UCI_MECHE_REQUIREMENTS } from "@/data/colleges/uci/uci_meche";
import { UCI_SWE_REQUIREMENTS } from "@/data/colleges/uci/uci_swe";
import { UCI_CSE_REQUIREMENTS } from "@/data/colleges/uci/uci_cse";
import { UCI_APMATH_REQUIREMENTS } from "@/data/colleges/uci/uci_apmath";
import { UCI_DS_REQUIREMENTS } from "@/data/colleges/uci/uci_ds";
import { UCI_MATH_REQUIREMENTS } from "@/data/colleges/uci/uci_math";


//UCD
import { UCD_CS_REQUIREMENTS } from "@/data/colleges/ucd/ucd_cs";
import { UCD_CE_REQUIREMENTS } from "@/data/colleges/ucd/ucd_ce";
import { UCD_MECHE_REQUIREMENTS } from "@/data/colleges/ucd/ucd_meche";
import { UCD_AE_REQUIREMENTS } from "@/data/colleges/ucd/ucd_ae";
import { UCD_EE_REQUIREMENTS } from "@/data/colleges/ucd/ucd_ee";
import { UCD_DS_REQUIREMENTS } from "@/data/colleges/ucd/ucd_ds";
import { UCD_APMATH_REQUIREMENTS } from "@/data/colleges/ucd/ucd_apmath";
import { UCD_MATH_REQUIREMENTS } from "@/data/colleges/ucd/ucd_math";


//UCSB
import { UCSB_CS_REQUIREMENTS } from "@/data/colleges/ucsb/ucsb_cs";


export interface MajorEntry {
  displayName: string;
  requirements: RequirementGraph;
  universityCode: string;
}

export interface UniversityEntry {
  displayName: string;
  majors: Record<string, MajorEntry>;
}

/**
 * The Central Registry
 * We use the EXACT Display Names as the keys so lookups are instant.
 */
const REGISTRY: Record<string, UniversityEntry> = {
  "UC Berkeley": {
    displayName: "UC Berkeley",
    majors: {
      "Aerospace Engineering": {
        displayName: "Aerospace Engineering",
        requirements: UCB_AE_REQUIREMENTS,
        universityCode: "UCB",
      },
      "Business Administration": {
        displayName: "Business Administration",
        requirements: UCB_BUSINESS_REQUIREMENTS,
        universityCode: "UCB",
      },
      "Computer Science": {
        displayName: "Computer Science",
        requirements: UCB_CS_REQUIREMENTS,
        universityCode: "UCB",
      },
      "Data Science": {
        displayName: "Data Science",
        requirements: UCB_DS_REQUIREMENTS,
        universityCode: "UCB",
      },
      "Economics": {
        displayName: "Economics",
        requirements: UCB_ECON_REQUIREMENTS,
        universityCode: "UCB",
      },
      "Electrical Engineering and Computer Science": {
        displayName: "Electrical Engineering and Computer Science",
        requirements: UCB_EECS_REQUIREMENTS,
        universityCode: "UCB",
      },
      "Mathematics/Applied Mathematics": {
        displayName: "Mathematics/Applied Mathematics",
        requirements: UCB_APMATH_REQUIREMENTS,
        universityCode: "UCB",
      },
      "Mechanical Engineering": {
        displayName: "Mechanical Engineering",
        requirements: UCB_MECHE_REQUIREMENTS,
        universityCode: "UCB",
      },
      "Introduction to Statistics": {
        displayName: "Introduction to Statistics",
        requirements: UCB_STATS_REQUIREMENTS,
        universityCode: "UCB",
      },
  
      // "Test": {
      //   displayName: "TEST CASE",
      //   requirements: UCB_TEST_REQUIREMENTS,
      //   universityCode: "UCB",
      // },

    },
  },
  "UCLA": {
    displayName: "UCLA",
    majors: {
      "Aerospace Engineering": {
        displayName: "Aerospace Engineering",
        requirements: UCLA_AE_REQUIREMENTS,
        universityCode: "UCLA",
      },
      "Applied Mathematics": {
        displayName: "Applied Mathematics",
        requirements: UCLA_APMATH_REQUIREMENTS,
        universityCode: "UCLA",
      },
      "Computer Engineering": {
        displayName: "Computer Engineering",
        requirements: UCLA_CE_REQUIREMENTS,
        universityCode: "UCLA",
      },
      "Computer Science": {
        displayName: "Computer Science",
        requirements: UCLA_CS_REQUIREMENTS,
        universityCode: "UCLA",
      },
      "Computer Science and Engineering": {
        displayName: "Computer Science and Engineering",
        requirements: UCLA_CSE_REQUIREMENTS,
        universityCode: "UCLA",
      },
      "Electrical Engineering": {
        displayName: "Electrical Engineering",
        requirements: UCLA_EE_REQUIREMENTS,
        universityCode: "UCLA",
      },
      "Mathematics": {
        displayName: "Mathematics",
        requirements: UCLA_MATH_REQUIREMENTS,
        universityCode: "UCLA",
      },
      "Mechanical Engineering": {
        displayName: "Mechanical Engineering",
        requirements: UCLA_MECHE_REQUIREMENTS,
        universityCode: "UCLA",
      },
      "Statistics and Data Science": {
        displayName: "Statistics and Data Science",
        requirements: UCLA_STATS_DS_REQUIREMENTS,
        universityCode: "UCLA",
      },
      // "Test": {
      //   displayName: "TEST CASE",
      //   requirements: UCLA_TEST_REQUIREMENTS,
      //   universityCode: "UCLA",
      // },
    },
  },
  "UC San Diego": {
    displayName: "UC San Diego",
    majors: {
      "Aerospace Engineering": {
        displayName: "Aerospace Engineering",
        requirements: UCSD_AE_REQUIREMENTS,
        universityCode: "UCSD",
      },
      "Applied Mathematics": {
        displayName: "Applied Mathematics",
        requirements: UCSD_APMATH_REQUIREMENTS,
        universityCode: "UCSD",
      },
      "Computer Engineering": {
        displayName: "Computer Engineering",
        requirements: UCSD_CE_REQUIREMENTS,
        universityCode: "UCSD",
      },
      "Computer Science": {
        displayName: "Computer Science",
        requirements: UCSD_CS_REQUIREMENTS,
        universityCode: "UCSD",
      },
      "Data Science": {
        displayName: "Data Science",
        requirements: UCSD_DS_REQUIREMENTS,
        universityCode: "UCSD",
      },
      "Electrical Engineering": {
        displayName: "Electrical Engineering",
        requirements: UCSD_EE_REQUIREMENTS,
        universityCode: "UCSD",
      },
      "Mathematics/Computer Science": {
        displayName: "Mathematics/Computer Science",
        requirements: UCSD_MATH_CS_REQUIREMENTS,
        universityCode: "UCSD",
      },
      "Mechanical Engineering": {
        displayName: "Mechanical Engineering",
        requirements: UCSD_MECHE_REQUIREMENTS,
        universityCode: "UCSD",
      },
    },
  },
  "UC Irvine": {
    displayName: "UC Irvine",
    majors: {
      "Applied and Computational Mathematics": {
        displayName: "Applied and Computational Mathematics",
        requirements: UCI_APMATH_REQUIREMENTS,
        universityCode: "UCI",
      },
      "Computer Engineering": {
        displayName: "Computer Engineering",
        requirements: UCI_CE_REQUIREMENTS,
        universityCode: "UCI",
      },
      "Computer Science": {
        displayName: "Computer Science",
        requirements: UCI_CS_REQUIREMENTS,
        universityCode: "UCI",
      },
      "Computer Science and Engineering": {
        displayName: "Computer Science and Engineering",
        requirements: UCI_CSE_REQUIREMENTS,
        universityCode: "UCI",
      },
      "Data Science": {
        displayName: "Data Science",
        requirements: UCI_DS_REQUIREMENTS,
        universityCode: "UCI",
      },
      "Electrical Engineering": {
        displayName: "Electrical Engineering",
        requirements: UCI_EE_REQUIREMENTS,
        universityCode: "UCI",
      },
      "Mathematics": {
        displayName: "Mathematics",
        requirements: UCI_MATH_REQUIREMENTS,
        universityCode: "UCI",
      },
      "Mechanical Engineering": {
        displayName: "Mechanical Engineering",
        requirements: UCI_MECHE_REQUIREMENTS,
        universityCode: "UCI",
      },
       "Software Engineering": {
        displayName: "Software Engineering",
        requirements: UCI_SWE_REQUIREMENTS,
        universityCode: "UCI",
      },
    },
  },
  "UC Davis": {
    displayName: "UC Davis",
    majors: {
      "Aerospace Engineering": {
        displayName: "Aerospace Engineering",
        requirements: UCD_AE_REQUIREMENTS,
        universityCode: "UCD",
      },
      "Applied Mathematics": {
        displayName: "Applied Mathematics",
        requirements: UCD_APMATH_REQUIREMENTS,
        universityCode: "UCD",
      },
      "Computer Engineering": {
        displayName: "Computer Engineering",
        requirements: UCD_CE_REQUIREMENTS,
        universityCode: "UCD",
      },
      "Computer Science": {
        displayName: "Computer Science",
        requirements: UCD_CS_REQUIREMENTS,
        universityCode: "UCD",
      },
      "Data Science": {
        displayName: "Data Science",
        requirements: UCD_DS_REQUIREMENTS,
        universityCode: "UCD",
      },
      "Electrical Engineering": {
        displayName: "Electrical Engineering",
        requirements: UCD_EE_REQUIREMENTS,
        universityCode: "UCD",
      },
      "Mathematics": {
        displayName: "Mathematics",
        requirements: UCD_MATH_REQUIREMENTS,
        universityCode: "UCD",
      },
      "Mechanical Engineering": {
        displayName: "Mechanical Engineering",
        requirements: UCD_MECHE_REQUIREMENTS,
        universityCode: "UCD",
      },
    },
  },
  "UC Santa Barbra": {
    displayName: "UC Santa Barbra",
    majors: {
      "Computer Science": {
        displayName: "Computer Science",
        requirements: UCSB_CS_REQUIREMENTS,
        universityCode: "UCSB",
      },
    },
  },
};

// --- API FUNCTIONS ---

/**
 * Direct lookup using exact strings from your dropdown.
 * No normalization, no loops, no ifs.
 */
export function getRequirements(
  university: string,
  major: string,
): RequirementGraph | null {
  return REGISTRY[university]?.majors[major]?.requirements || null;
}

export function getUniversityCode(
  university: string,
  major: string,
): string | null {
  return REGISTRY[university]?.majors[major]?.universityCode || null;
}

export function getAllUniversities(): string[] {
  return Object.keys(REGISTRY);
}

export function getMajorsForUniversity(university: string): string[] {
  const uni = REGISTRY[university];
  return uni ? Object.keys(uni.majors) : [];
}

export function isSupported(university: string, major: string): boolean {
  return !!REGISTRY[university]?.majors[major];
}
