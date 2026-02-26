"use client";

import {
  Document,
  Page,
  View,
  Text,
  StyleSheet,
} from "@react-pdf/renderer";
import type { Semester } from "@/lib/planner/types";

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontSize: 10,
    fontFamily: "Helvetica",
  },
  title: {
    fontSize: 18,
    marginBottom: 8,
    fontWeight: "bold",
  },
  subtitle: {
    fontSize: 12,
    marginBottom: 16,
    color: "#374151",
  },
  section: {
    marginBottom: 12,
  },
  row: {
    flexDirection: "row",
    marginBottom: 4,
  },
  label: {
    width: 100,
    fontWeight: "bold",
  },
  value: {
    flex: 1,
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#f3f4f6",
    borderBottomWidth: 1,
    borderBottomColor: "#d1d5db",
    paddingVertical: 6,
    paddingHorizontal: 4,
    fontWeight: "bold",
  },
  tableRow: {
    flexDirection: "row",
    borderBottomWidth: 0.5,
    borderBottomColor: "#e5e7eb",
    paddingVertical: 4,
    paddingHorizontal: 4,
  },
  colSemester: { width: "22%" },
  colCode: { width: "14%" },
  colTitle: { width: "40%" },
  colUnits: { width: "10%" },
  colStatus: { width: "14%" },
  footer: {
    marginTop: 24,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#e5e7eb",
    fontSize: 9,
    color: "#6b7280",
  },
});

export interface CounselorViewPDFProps {
  dbUser: {
    firstName: string | null;
    lastName: string | null;
    currentCollege: string | null;
    startSeason: string | null;
    startYear: number | null;
  };
  semesters: Semester[];
  completedSemesters: Set<string>;
  targetUniversities: { name: string; code: string }[];
}

export default function CounselorViewPDF({
  dbUser,
  semesters,
  completedSemesters,
  targetUniversities,
}: CounselorViewPDFProps) {
  const firstName = dbUser.firstName ?? "Student";
  const lastName = dbUser.lastName ?? "";
  const fullName = [firstName, lastName].filter(Boolean).join(" ");
  const currentCollege = dbUser.currentCollege ?? "—";
  const startTerm =
    dbUser.startSeason && dbUser.startYear
      ? `${String(dbUser.startSeason).charAt(0).toUpperCase()}${String(dbUser.startSeason).slice(1)} ${dbUser.startYear}`
      : "—";
  const targets =
    targetUniversities.length > 0
      ? targetUniversities.map((t) => t.name).join(", ")
      : "—";

  const rows = semesters.flatMap((semester) =>
    semester.courses.map((course) => ({
      semester: semester.name,
      code: course.localCode,
      title: course.title,
      units: String(course.units),
      status: completedSemesters.has(semester.name) ? "Completed" : "Planned",
    }))
  );

  const totalUnits = rows.reduce((sum, r) => sum + Number(r.units), 0);

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <Text style={styles.title}>Transfer Plan – Counselor View</Text>
        <Text style={styles.subtitle}>
          Generated for {fullName}
        </Text>

        <View style={styles.section}>
          <View style={styles.row}>
            <Text style={styles.label}>Student</Text>
            <Text style={styles.value}>{fullName}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Current college</Text>
            <Text style={styles.value}>{currentCollege}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Target university(ies)</Text>
            <Text style={styles.value}>{targets}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Start term</Text>
            <Text style={styles.value}>{startTerm}</Text>
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.tableHeader}>
            <Text style={styles.colSemester}>Semester</Text>
            <Text style={styles.colCode}>Course Code</Text>
            <Text style={styles.colTitle}>Course Title</Text>
            <Text style={styles.colUnits}>Units</Text>
            <Text style={styles.colStatus}>Status</Text>
          </View>
          {rows.length === 0 ? (
            <View style={styles.tableRow}>
              <Text style={styles.colTitle}>No courses planned</Text>
            </View>
          ) : (
            rows.map((row, idx) => (
              <View key={idx} style={styles.tableRow}>
                <Text style={styles.colSemester}>{row.semester}</Text>
                <Text style={styles.colCode}>{row.code}</Text>
                <Text style={styles.colTitle}>{row.title}</Text>
                <Text style={styles.colUnits}>{row.units}</Text>
                <Text style={styles.colStatus}>{row.status}</Text>
              </View>
            ))
          )}
        </View>

        <View style={styles.footer}>
          <Text>Total units: {totalUnits}</Text>
        </View>
      </Page>
    </Document>
  );
}
