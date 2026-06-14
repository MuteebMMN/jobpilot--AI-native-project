import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";
import type { ProfileData } from "@/components/profile/ProfileForm";
import type { GeneratedResume } from "@/agent/resume-generator";

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontFamily: "Helvetica",
    fontSize: 10,
    color: "#1a1a1a",
    lineHeight: 1.4,
  },
  header: {
    marginBottom: 16,
  },
  name: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 3,
  },
  subtitle: {
    fontSize: 11,
    color: "#444444",
    marginBottom: 4,
  },
  contact: {
    fontSize: 9,
    color: "#666666",
  },
  divider: {
    margin: "8 0",
    borderBottom: "1 solid #cccccc",
  },
  section: {
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 10,
    fontWeight: "bold",
    textTransform: "uppercase" as const,
    letterSpacing: 1,
    color: "#333333",
    marginBottom: 5,
    paddingBottom: 2,
    borderBottom: "0.5 solid #dddddd",
  },
  summaryText: {
    fontSize: 10,
    color: "#333333",
    lineHeight: 1.5,
  },
  skillsText: {
    fontSize: 10,
    color: "#333333",
    lineHeight: 1.5,
  },
  jobHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 3,
  },
  jobTitle: {
    fontSize: 10,
    fontWeight: "bold",
  },
  jobCompany: {
    fontSize: 10,
    color: "#555555",
  },
  jobPeriod: {
    fontSize: 9,
    color: "#777777",
  },
  bullet: {
    flexDirection: "row",
    marginBottom: 2,
    paddingLeft: 4,
  },
  bulletDot: {
    fontSize: 10,
    marginRight: 5,
    color: "#333333",
  },
  bulletText: {
    fontSize: 10,
    color: "#333333",
    lineHeight: 1.4,
    flex: 1,
  },
  jobEntry: {
    marginBottom: 10,
  },
  educationRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  educationLeft: {
    fontSize: 10,
    fontWeight: "bold",
  },
  educationRight: {
    fontSize: 10,
    color: "#555555",
  },
  educationSub: {
    fontSize: 9,
    color: "#666666",
    marginTop: 1,
  },
});

type Props = {
  profile: ProfileData;
  generated: GeneratedResume;
};

function contactLine(profile: ProfileData): string {
  return [
    profile.email,
    profile.phone,
    profile.location,
    profile.linkedin_url,
    profile.portfolio_url,
  ]
    .filter(Boolean)
    .join("  ·  ");
}

export function ResumePDF({ profile, generated }: Props) {
  const subtitle = [profile.current_title, profile.location]
    .filter(Boolean)
    .join("  —  ");

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.name}>{profile.full_name}</Text>
          {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
          <Text style={styles.contact}>{contactLine(profile)}</Text>
        </View>

        <View style={styles.divider} />

        {/* Summary */}
        {generated.summary ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Summary</Text>
            <Text style={styles.summaryText}>{generated.summary}</Text>
          </View>
        ) : null}

        {/* Skills */}
        {(profile.skills ?? []).length > 0 ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Skills</Text>
            <Text style={styles.skillsText}>
              {(profile.skills ?? []).join("  ·  ")}
            </Text>
          </View>
        ) : null}

        {/* Work Experience */}
        {generated.workExperience.length > 0 ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Work Experience</Text>
            {generated.workExperience.map((job, i) => (
              <View key={i} style={styles.jobEntry}>
                <View style={styles.jobHeader}>
                  <View>
                    <Text style={styles.jobTitle}>{job.title}</Text>
                    <Text style={styles.jobCompany}>{job.company}</Text>
                  </View>
                  <Text style={styles.jobPeriod}>{job.period}</Text>
                </View>
                {job.bullets.map((bullet, j) => (
                  <View key={j} style={styles.bullet}>
                    <Text style={styles.bulletDot}>•</Text>
                    <Text style={styles.bulletText}>{bullet}</Text>
                  </View>
                ))}
              </View>
            ))}
          </View>
        ) : null}

        {/* Education */}
        {profile.institution ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Education</Text>
            <View style={styles.educationRow}>
              <Text style={styles.educationLeft}>
                {profile.highest_degree}
                {profile.field_of_study ? ` in ${profile.field_of_study}` : ""}
              </Text>
              <Text style={styles.educationRight}>
                {profile.graduation_year}
              </Text>
            </View>
            <Text style={styles.educationSub}>{profile.institution}</Text>
          </View>
        ) : null}
      </Page>
    </Document>
  );
}
