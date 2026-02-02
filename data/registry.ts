import type { RequirementGraph } from "@/lib/planner/types";

import { UCB_CS_REQUIREMENTS } from "@/data/colleges/ucb/ucb_cs";
import { UCB_MECHE_REQUIREMENTS } from "@/data/colleges/ucb/ucb_meche";
import { UCB_EECS_REQUIREMENTS } from "@/data/colleges/ucb/ucb_eecs";
import { UCB_EE_REQUIREMENTS } from "@/data/colleges/ucb/ucb_ee";
// import { UCB_TEST_REQUIREMENTS } from "@/data/colleges/ucberkeley/ucb_test";
import { UCB_BUSINESS_REQUIREMENTS } from "@/data/colleges/ucb/ucb_business";
import { UCB_ECON_REQUIREMENTS } from "@/data/colleges/ucb/ucb_econ";

import { UCLA_CS_REQUIREMENTS } from "@/data/colleges/ucla/ucla_cs";
import { UCLA_EE_REQUIREMENTS } from "@/data/colleges/ucla/ucla_ee";
// import { UCLA_TEST_REQUIREMENTS } from "@/data/colleges/ucla/ucla_test";

import { UCSD_CS_REQUIREMENTS } from "@/data/colleges/ucsd/ucsd_cs";

import { UCD_CS_REQUIREMENTS } from "@/data/colleges/ucd/ucd_cs";

import { UCI_CS_REQUIREMENTS } from "@/data/colleges/uci/uci_cs";

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
      "Computer Science": {
        displayName: "Computer Science",
        requirements: UCB_CS_REQUIREMENTS,
        universityCode: "UCB",
      },
      "Mechanical Engineering": {
        displayName: "Mechanical Engineering",
        requirements: UCB_MECHE_REQUIREMENTS,
        universityCode: "UCB",
      },
      "Electrical Engineering and Computer Science": {
        displayName: "Electrical Engineering and Computer Science",
        requirements: UCB_EECS_REQUIREMENTS,
        universityCode: "UCB",
      },
      "Electrical Engineering": {
        displayName: "Electrical Engineering",
        requirements: UCB_EE_REQUIREMENTS,
        universityCode: "UCB",
      },
      // "Test": {
      //   displayName: "TEST CASE",
      //   requirements: UCB_TEST_REQUIREMENTS,
      //   universityCode: "UCB",
      // },
      "Business Administration": {
        displayName: "Business Administration",
        requirements: UCB_BUSINESS_REQUIREMENTS,
        universityCode: "UCB",
      },
      "Economics": {
        displayName: "Economics",
        requirements: UCB_ECON_REQUIREMENTS,
        universityCode: "UCB",
      },
    },
  },
  "UCLA": {
    displayName: "UCLA",
    majors: {
      "Computer Science": {
        displayName: "Computer Science",
        requirements: UCLA_CS_REQUIREMENTS,
        universityCode: "UCLA",
      },
      "Electrical Engineering": {
        displayName: "Electrical Engineering",
        requirements: UCLA_EE_REQUIREMENTS,
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
      "Computer Science": {
        displayName: "Computer Science",
        requirements: UCSD_CS_REQUIREMENTS,
        universityCode: "UCSD",
      },
    },
  },
  "UC Irvine": {
    displayName: "UC Irvine",
    majors: {
      "Computer Science": {
        displayName: "Computer Science",
        requirements: UCI_CS_REQUIREMENTS,
        universityCode: "UCI",
      },
    },
  },
  "UC Davis": {
    displayName: "UC Davis",
    majors: {
      "Computer Science": {
        displayName: "Computer Science",
        requirements: UCD_CS_REQUIREMENTS,
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
